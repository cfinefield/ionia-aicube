
// Import Pipelines
import { StructurePipeline } from './pipelines/StructurePipeline.js';
import { DataPipeline } from './pipelines/DataPipeline.js';
import { ContentPipeline } from './pipelines/ContentPipeline.js';
import { CognitivePipeline } from './pipelines/CognitivePipeline.js';
import { GeneratorPipeline } from './pipelines/GeneratorPipeline.js';
import { LensCrafterAdapter } from './adapter.ts';

// Import MCP
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
    CallToolRequestSchema,
    ErrorCode,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
    McpError
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Shared Logic
async function extractUrl(targetUrl, mode, options, env, ctx) {
    // 1. Check Cache (if Managed Mode)
    if (mode === 'managed' && env.LENS_CACHE) {
        const cached = await env.LENS_CACHE.get(targetUrl);
        if (cached) {
            return JSON.parse(cached);
        }
    }

    // 2. Run Parallel Extraction Pipelines
    const [structure, data, content] = await Promise.all([
        StructurePipeline.run(targetUrl, env, options),
        DataPipeline.run(targetUrl, env),
        ContentPipeline.run(targetUrl, env)
    ]);

    // 3. Run Cognitive Pipeline (Needs Content)
    const cognitive = await CognitivePipeline.run(content, env, options.persona);

    // 4. Assemble Knowledge Graph
    const knowledgeGraph = {
        entity: data.entity,
        commerce: data.commerce,
        intents: { ...data.intents, ...cognitive.intents },
        features: cognitive.features,
        specifications: cognitive.specifications,
        semanticStructure: structure,
        personaRelevance: cognitive.personaRelevance,
        suggestions: cognitive.suggestions || [],
        rawContent: content, // Expose cleaned HTML for the frontend adapter to convert
        meta: {
            crawledAt: new Date().toISOString(),
            mode,
            source: 'LensCrafter v1'
        }
    };

    // 5. Store Cache (if Managed Mode)
    if (mode === 'managed' && env.LENS_CACHE) {
        ctx.waitUntil(env.LENS_CACHE.put(targetUrl, JSON.stringify(knowledgeGraph), { expirationTtl: 86400 }));
    }

    return knowledgeGraph;
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // CORS Headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // --- REST API ROUTER ---

        // POST /extract
        if (request.method === 'POST' && url.pathname === '/extract') {
            try {
                const body = await request.json();
                const { url: targetUrl, mode = 'audit', options = {} } = body;

                if (!targetUrl) return new Response('Missing URL', { status: 400, headers: corsHeaders });

                const knowledgeGraph = await extractUrl(targetUrl, mode, options, env, ctx);

                return new Response(JSON.stringify(knowledgeGraph), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

            } catch (e) {
                return new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: corsHeaders });
            }
        }

        // POST /patch (Managed Mode Only)
        if (request.method === 'POST' && url.pathname === '/patch') {
            try {
                const body = await request.json();
                const { url: targetUrl, instructions, auth_context } = body;
                const result = await GeneratorPipeline.run(targetUrl, instructions, auth_context, env);
                return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            } catch (e) {
                return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
            }
        }

        // --- MCP ROUTER (SSE) ---
        if (url.pathname === '/mcp/messages') {
            // AUTHENTICATION GATE
            const apiKey = url.searchParams.get('apiKey');
            const requiredKey = env.MCP_API_KEY;

            if (requiredKey && apiKey !== requiredKey) {
                return new Response(JSON.stringify({
                    jsonrpc: "2.0",
                    error: { code: -32000, message: "Unauthorized: Invalid API Key" }
                }), { status: 401, headers: corsHeaders });
            }

            const server = new Server({
                name: "lenscrafter-worker",
                version: "1.0.0",
            }, {
                capabilities: {
                    resources: {},
                    tools: {},
                },
            });

            // Tools
            server.setRequestHandler(ListToolsRequestSchema, async () => {
                return {
                    tools: [{
                        name: "extract_site",
                        description: "Extract structured data/schema from a website using LensCrafter.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                url: { type: "string" },
                                render_js: { type: "boolean" }
                            },
                            required: ["url"]
                        }
                    }]
                };
            });

            server.setRequestHandler(CallToolRequestSchema, async (request) => {
                if (request.params.name === "extract_site") {
                    const args = request.params.arguments;
                    const result = await extractUrl(args.url, 'audit', { render_js: args.render_js }, env, ctx);

                    // Use Adapter to generate "Thoughts"
                    const adapted = LensCrafterAdapter.adapt(result);
                    const thoughts = adapted.agentThoughts.join('\n');

                    // Store result in KV for "latest" resource
                    if (env.LENS_CACHE) {
                        await env.LENS_CACHE.put('latest_extraction', JSON.stringify(result));
                    }

                    return {
                        content: [{ type: "text", text: `Success.\n${thoughts}` }]
                    };
                }
                throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
            });

            // Resources
            server.setRequestHandler(ListResourcesRequestSchema, async () => {
                return {
                    resources: [{
                        uri: "lenscrafter://latest",
                        name: "Latest Extraction",
                        mimeType: "application/json"
                    }]
                };
            });

            server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
                if (request.params.uri === "lenscrafter://latest") {
                    const cached = await env.LENS_CACHE.get('latest_extraction');
                    if (!cached) throw new McpError(ErrorCode.InvalidRequest, "No recent extraction found.");
                    return {
                        contents: [{
                            uri: request.params.uri,
                            mimeType: "application/json",
                            text: cached
                        }]
                    };
                }
                throw new McpError(ErrorCode.InvalidRequest, "Resource not found");
            });

            // Handle Message
            if (request.method === 'POST') {
                const message = await request.json();

                // Simple JSON-RPC Handler
                if (message.method === 'tools/call') {
                    const { name, arguments: args } = message.params;
                    if (name === 'extract_site') {
                        const result = await extractUrl(args.url, 'audit', { render_js: args.render_js }, env, ctx);
                        const adapted = LensCrafterAdapter.adapt(result);
                        const thoughts = adapted.agentThoughts.join('\n');
                        if (env.LENS_CACHE) await env.LENS_CACHE.put('latest_extraction', JSON.stringify(result));

                        // Create cleaner URL for display (strip protocol)
                        const cleanUrl = args.url.replace(/^https?:\/\//, '');
                        const visUrl = `http://localhost:5173/?url=${encodeURIComponent(cleanUrl)}`;

                        return new Response(JSON.stringify({
                            jsonrpc: "2.0",
                            id: message.id,
                            result: {
                                content: [{ type: "text", text: `Success.\n${thoughts}\n\nView Visualization:\n${visUrl}` }]
                            }
                        }), { headers: { 'Content-Type': 'application/json' } });
                    }
                }

                // Resources Helper
                if (message.method === 'resources/read') {
                    if (message.params.uri === 'lenscrafter://latest') {
                        const cached = await env.LENS_CACHE.get('latest_extraction');
                        return new Response(JSON.stringify({
                            jsonrpc: "2.0",
                            id: message.id,
                            result: {
                                contents: [{ uri: message.params.uri, mimeType: "application/json", text: cached || "{}" }]
                            }
                        }), { headers: { 'Content-Type': 'application/json' } });
                    }
                }

                // Discovery
                if (message.method === 'tools/list') {
                    return new Response(JSON.stringify({
                        jsonrpc: "2.0",
                        id: message.id,
                        result: {
                            tools: [{
                                name: "extract_site",
                                description: "Extract structured data/schema from a website using LensCrafter.",
                                inputSchema: {
                                    type: "object",
                                    properties: { url: { type: "string" }, render_js: { type: "boolean" } },
                                    required: ["url"]
                                }
                            }]
                        }
                    }), { headers: { 'Content-Type': 'application/json' } });
                }

                return new Response(JSON.stringify({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: "Method not found" } }), { status: 404 });
            }

            return new Response("MCP Endpoint Live - Use mcp-remote to connect", { status: 200 });
        }


        return new Response('Not Found', { status: 404, headers: corsHeaders });
    }
};
