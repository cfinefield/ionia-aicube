import assert from 'node:assert/strict';
import test from 'node:test';

import { CognitivePipeline } from '../src/pipelines/CognitivePipeline.js';
import { ContentPipeline } from '../src/pipelines/ContentPipeline.js';
import { DataPipeline } from '../src/pipelines/DataPipeline.js';
import { StructurePipeline } from '../src/pipelines/StructurePipeline.js';
import { extractUrl } from '../src/index.js';

const withMockFetch = async (mock, callback) => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock;
    try {
        return await callback();
    } finally {
        globalThis.fetch = originalFetch;
    }
};

test('content pipeline returns the HTML and an honest success stage', async () => {
    const result = await withMockFetch(
        async () => new Response(
            '<html><body><nav>Skip</nav><main><h1>Useful content</h1></main></body></html>',
            { status: 200 }
        ),
        () => ContentPipeline.run('https://example.com', {})
    );

    assert.match(result.content, /Useful content/);
    assert.doesNotMatch(result.content, /Skip/);
    assert.equal(result._pipeline.stage, 'content');
    assert.equal(result._pipeline.status, 'ok');
});

test('content pipeline does not turn a failed fetch into model input', async () => {
    const result = await withMockFetch(
        async () => new Response('Unavailable', { status: 503 }),
        () => ContentPipeline.run('https://example.com', {})
    );

    assert.equal(result.content, '');
    assert.equal(result._pipeline.status, 'error');
    assert.match(result._pipeline.warnings[0], /503/);
});

test('data pipeline includes fetch-stage evidence', async () => {
    const result = await withMockFetch(
        async () => new Response(
            '<html><head><title>Example Co</title><meta name="description" content="Example description"></head></html>',
            { status: 200 }
        ),
        () => DataPipeline.run('https://example.com', {})
    );

    assert.equal(result.entity.name, 'Example Co');
    assert.equal(result.entity.description, 'Example description');
    assert.deepEqual(result._pipeline, {
        stage: 'fetch',
        status: 'ok',
        httpStatus: 200
    });
});

test('structure fallback uses the snapshot contract and reports a skipped render', async () => {
    const result = await StructurePipeline.run(
        'https://example.com',
        {},
        { render_js: false }
    );

    assert.ok(result.snapshot);
    assert.equal(result._pipeline.stage, 'render');
    assert.equal(result._pipeline.status, 'skipped');
});

test('cognitive pipeline sends extracted HTML to lens_analysis', async () => {
    let requestBody = null;
    const result = await withMockFetch(
        async (_url, init) => {
            requestBody = JSON.parse(init.body);
            return Response.json({
                output: {
                    features: ['Useful content'],
                    suggestions: []
                }
            });
        },
        () => CognitivePipeline.run(
            '<h1>Useful content</h1>',
            {
                AI_PRIMARY_BASE_URL: 'https://ai.example.test',
                AI_PRIMARY_SERVICE_TOKEN: 'test-token'
            },
            'Local customer'
        )
    );

    assert.equal(requestBody.task_type, 'lens_analysis');
    assert.equal(requestBody.input.persona, 'Local customer');
    assert.match(requestBody.input.content_html, /Useful content/);
    assert.equal(result._pipeline.status, 'ok');
});

test('cognitive pipeline honors an explicit remote timeout override', async () => {
    let observedSignal = null;
    const result = await withMockFetch(
        async (_url, init) => {
            observedSignal = init.signal;
            return Response.json({
                output: {
                    features: ['Observed capability'],
                    suggestions: []
                }
            });
        },
        () => CognitivePipeline.run(
            '<p>Content</p>',
            {
                AI_PRIMARY_BASE_URL: 'https://ai.example.test',
                AI_PRIMARY_SERVICE_TOKEN: 'test-token',
                AI_PRIMARY_TIMEOUT_MS: '45000'
            }
        )
    );

    assert.ok(observedSignal instanceof AbortSignal);
    assert.equal(observedSignal.aborted, false);
    assert.equal(result._pipeline.status, 'ok');
});

test('cognitive pipeline downgrades an empty provider envelope', async () => {
    const result = await withMockFetch(
        async () => Response.json({
            output: {
                features: [],
                suggestions: [],
                intents: {},
                specifications: {},
                personaRelevance: { reason: '', features: 0, price: 0 }
            }
        }),
        () => CognitivePipeline.run(
            '<p>Content</p>',
            {
                AI_PRIMARY_BASE_URL: 'https://ai.example.test',
                AI_PRIMARY_SERVICE_TOKEN: 'test-token'
            }
        )
    );

    assert.equal(result._pipeline.status, 'warning');
    assert.match(result._pipeline.warnings[0], /no substantive analysis/i);
});

test('extractUrl carries page content and stage evidence through the complete contract', async () => {
    let inferenceBody = null;
    const siteHtml = [
        '<html><head>',
        '<title>Example Co</title>',
        '<meta name="description" content="A useful local service">',
        '</head><body><main><h1>Useful local service</h1></main></body></html>'
    ].join('');

    const result = await withMockFetch(
        async (input, init = {}) => {
            const url = String(input);
            if (url === 'https://ai.example.test/infer') {
                inferenceBody = JSON.parse(init.body);
                return Response.json({
                    output: {
                        features: ['Useful local service'],
                        specifications: {},
                        personaRelevance: { reason: 'Relevant' },
                        intents: [],
                        suggestions: []
                    }
                });
            }
            if (url === 'https://example.com/llms.txt') {
                return new Response('Not found', { status: 404 });
            }
            return new Response(siteHtml, {
                status: 200,
                headers: { 'content-type': 'text/html' }
            });
        },
        () => extractUrl(
            'https://example.com',
            'audit',
            { render_js: false, persona: 'Local customer' },
            {
                AI_PRIMARY_BASE_URL: 'https://ai.example.test',
                AI_PRIMARY_SERVICE_TOKEN: 'test-token'
            },
            { waitUntil() {} }
        )
    );

    assert.match(result.rawContent, /Useful local service/);
    assert.match(inferenceBody.input.content_html, /Useful local service/);
    assert.equal(result.pipelineStatus.fetch.status, 'ok');
    assert.equal(result.pipelineStatus.render.status, 'skipped');
    assert.equal(result.pipelineStatus.content.status, 'ok');
    assert.equal(result.pipelineStatus.ai.status, 'ok');
    assert.equal(result.meta.overallStatus, 'degraded');
});
