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

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Ionia-Proxy, X-Ionia-Request-Id, X-Ionia-Module-Id, X-Ionia-Tenant',
};

const MODULE_META = {
    id: 'aicube',
    name: 'AI Cube',
    description: 'Interactive multi-lens site analysis and extraction workspace.',
    tags: ['analysis', 'crawler', 'content', 'insights'],
    version: '0.1.0',
    authMode: 'none',
};

const jsonResponse = (payload, status = 200, extraHeaders = {}) =>
    new Response(JSON.stringify(payload, null, 2), {
        status,
        headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json;charset=UTF-8',
            'Cache-Control': 'no-store',
            ...extraHeaders,
        },
    });

const buildModuleManifest = (origin) => ({
    id: MODULE_META.id,
    name: MODULE_META.name,
    description: MODULE_META.description,
    app_url: `${origin}/`,
    embed_url: `${origin}/embed`,
    health_url: `${origin}/health`,
    api_base_url: origin,
    version: MODULE_META.version,
    auth_mode: MODULE_META.authMode,
    tags: MODULE_META.tags,
});

const assetRequestForPath = (request, path) => new Request(new URL(path, 'https://assets.local'), request);

const withLoaderBaseTag = async (request, response) => {
    const proxyPrefix = request.headers.get('x-ionia-proxy-prefix');
    const contentType = response.headers.get('content-type') || '';

    if (!proxyPrefix || !contentType.includes('text/html')) {
        return response;
    }

    const normalizedPrefix = proxyPrefix.endsWith('/') ? proxyPrefix : `${proxyPrefix}/`;
    const html = await response.text();
    const withBase = html.includes('<base ')
        ? html
        : html.replace(/<head([^>]*)>/i, `<head$1>\n  <base href="${normalizedPrefix}">`);

    const headers = new Headers(response.headers);
    headers.set('cache-control', 'no-store');

    return new Response(withBase, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
};

const serveApp = async (request, env, pathname) => {
    if (!env.ASSETS || typeof env.ASSETS.fetch !== 'function') {
        return jsonResponse(
            {
                error: 'assets_unavailable',
                details: 'Static cube assets are not bound on this deployment.',
            },
            503
        );
    }

    const assetPath =
        pathname === '/' ||
        pathname === '/embed' ||
        pathname === '/index.html'
            ? '/'
            : pathname;

    const response = await env.ASSETS.fetch(assetRequestForPath(request, assetPath));
    return withLoaderBaseTag(request, response);
};

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
    const cognitive = await CognitivePipeline.run(content.content || '', env, options.persona);

    const pipelineStatus = {
        fetch: data._pipeline || { stage: 'fetch', status: 'unknown' },
        render: structure._pipeline || { stage: 'render', status: 'unknown' },
        content: content._pipeline || { stage: 'content', status: 'unknown' },
        ai: cognitive._pipeline || { stage: 'ai', status: 'unknown' }
    };

    const warnings = Object.values(pipelineStatus)
        .flatMap((stage) => stage.warnings || [])
        .filter(Boolean);

    const aiReadability = {
        hasMarkdown: Boolean(content.content && content.content.trim().length > 0),
        hasLlmsTxt: false,
        crawlerAccessOk: ['ok', 'warning'].includes(pipelineStatus.fetch.status)
    };

    try {
        const llmsUrl = new URL('/llms.txt', targetUrl).toString();
        const llmsResponse = await fetch(llmsUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; LensCrafter/1.0; +https://app.ionia.sh)',
                'Accept': 'text/plain,text/markdown;q=0.9,*/*;q=0.8'
            }
        });
        if (llmsResponse.ok) {
            const llmsText = await llmsResponse.text();
            aiReadability.hasLlmsTxt = Boolean(llmsText.trim());
        }
    } catch (error) {
        console.warn('llms.txt probe failed', error);
    }

    const overallStatus = pipelineStatus.fetch.status === 'error'
        ? 'error'
        : Object.values(pipelineStatus).some((stage) => stage.status === 'error')
            ? 'partial'
            : Object.values(pipelineStatus).some((stage) => stage.status === 'warning' || stage.status === 'skipped')
                ? 'degraded'
                : 'ok';

    // 4. Assemble Knowledge Graph
    const knowledgeGraph = {
        entity: data.entity,
        commerce: data.commerce,
        intents: { ...data.intents, ...cognitive.intents },
        features: cognitive.features,
        specifications: cognitive.specifications,
        aiReadability,
        semanticMarkup: data.semanticMarkup || {
            hasJsonLd: false,
            hasSchemaOrg: false,
            types: []
        },
        semanticStructure: structure.snapshot,
        personaRelevance: cognitive.personaRelevance,
        suggestions: cognitive.suggestions || [],
        rawContent: content.content,
        pipelineStatus,
        warnings,
        meta: {
            crawledAt: new Date().toISOString(),
            mode,
            source: 'LensCrafter v1',
            overallStatus
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

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: CORS_HEADERS });
        }

        if (request.method === 'GET' && url.pathname === '/.well-known/airail-module.json') {
            return jsonResponse(buildModuleManifest(url.origin));
        }

        if (request.method === 'GET' && url.pathname === '/health') {
            return jsonResponse({
                status: 'ok',
                module_id: MODULE_META.id,
                module_name: MODULE_META.name,
                version: MODULE_META.version,
                auth_mode: MODULE_META.authMode,
                ui: 'available',
                api: ['/extract', '/patch', '/mcp/messages'],
                checked_at: new Date().toISOString(),
            });
        }

        if (
            (request.method === 'GET' || request.method === 'HEAD') &&
            (
                url.pathname === '/' ||
                url.pathname === '/embed' ||
                url.pathname === '/index.html' ||
                url.pathname === '/vite.svg' ||
                url.pathname === '/connect.html' ||
                url.pathname.startsWith('/assets/') ||
                url.pathname.startsWith('/logos/')
            )
        ) {
            return serveApp(request, env, url.pathname);
        }

        // --- REST API ROUTER ---

        // POST /extract
        if (request.method === 'POST' && url.pathname === '/extract') {
            try {
                const body = await request.json();
                const { url: targetUrl, mode = 'audit', options = {} } = body;

                if (!targetUrl) {
                    return new Response('Missing URL', { status: 400, headers: CORS_HEADERS });
                }

                const knowledgeGraph = await extractUrl(targetUrl, mode, options, env, ctx);

                return new Response(JSON.stringify(knowledgeGraph), {
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            } catch (e) {
                return new Response(JSON.stringify({ error: e.message, stack: e.stack }), {
                    status: 500,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            }
        }

        // POST /patch (Managed Mode Only)
        if (request.method === 'POST' && url.pathname === '/patch') {
            try {
                const body = await request.json();
                const { url: targetUrl, instructions, auth_context } = body;
                const result = await GeneratorPipeline.run(targetUrl, instructions, auth_context, env);
                return new Response(JSON.stringify(result), {
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
            } catch (e) {
                return new Response(JSON.stringify({ error: e.message }), {
                    status: 500,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                });
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
                }), { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
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
                        const visUrl = `${url.origin}/?url=${encodeURIComponent(cleanUrl)}`;

                        return new Response(JSON.stringify({
                            jsonrpc: "2.0",
                            id: message.id,
                            result: {
                                content: [{ type: "text", text: `Success.\n${thoughts}\n\nView Visualization:\n${visUrl}` }]
                            }
                        }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
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
                        }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
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
                    }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
                }

                return new Response(
                    JSON.stringify({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: "Method not found" } }),
                    { status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
                );
            }

            return new Response("MCP Endpoint Live - Use mcp-remote to connect", { status: 200, headers: CORS_HEADERS });
        }

        return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
    }
};
