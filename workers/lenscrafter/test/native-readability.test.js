import assert from 'node:assert/strict';
import test from 'node:test';
import { probeNativeAiReadability } from '../src/index.js';

const response = (body, { contentType, url, status = 200 }) => {
    const value = new Response(body, {
        status,
        headers: { 'content-type': contentType }
    });
    Object.defineProperty(value, 'url', { value: url });
    return value;
};

const canonicalHtml = (url) => response('<!doctype html><html><body>Homepage</body></html>', {
    contentType: 'text/html',
    url
});

test('HTML extraction never counts as native Markdown', async () => {
    const page = 'https://www.eberleorthodontics.com/';
    let call = 0;
    const result = await probeNativeAiReadability(page, async (url) => {
        call += 1;
        return call === 1
            ? canonicalHtml(url)
            : response('<!doctype html><html><body><main>Real page content</main></body></html>', {
                contentType: 'text/html',
                url
            });
    });
    assert.deepEqual(result, {
        hasMarkdown: false,
        hasNativeMarkdown: false,
        hasGeneratedCrawlerProjection: false,
        markdownSource: 'none',
        nativeMarkdownContent: '',
        hasLlmsTxt: false
    });
});

test('redirected or HTML llms responses fail closed', async () => {
    const page = 'https://www.eberleorthodontics.com/';
    let call = 0;
    const result = await probeNativeAiReadability(page, async (url) => {
        call += 1;
        if (call === 1) return canonicalHtml(url);
        if (url.endsWith('/llms.txt')) {
            return response('Useful looking words that must not count after a redirect elsewhere.', {
                contentType: 'text/plain',
                url: 'https://www.eberleorthodontics.comllms.txt/'
            });
        }
        return response('<html><body>Homepage</body></html>', {
            contentType: 'text/html',
            url
        });
    });
    assert.equal(result.hasNativeMarkdown, false);
    assert.equal(result.markdownSource, 'none');
    assert.equal(result.hasLlmsTxt, false);
});

test('exact meaningful Markdown and llms endpoints are verified', async () => {
    const page = 'https://example.com/';
    let call = 0;
    const markdown = '# Example\n\nA useful native page with enough distinct words for retrieval and indexing.';
    const result = await probeNativeAiReadability(page, async (url) => {
        call += 1;
        return call === 1
            ? canonicalHtml(url)
            : response(markdown, {
            contentType: url.endsWith('/llms.txt') ? 'text/plain' : 'text/markdown',
            url
        });
    });
    assert.equal(result.hasMarkdown, true);
    assert.equal(result.hasNativeMarkdown, true);
    assert.equal(result.markdownSource, 'native');
    assert.equal(result.nativeMarkdownContent, markdown);
    assert.equal(result.hasLlmsTxt, true);
});

test('canonical www redirect is established before exact endpoint checks', async () => {
    const requested = 'https://example.com/';
    const canonical = 'https://www.example.com/';
    const seen = [];
    const result = await probeNativeAiReadability(requested, async (url) => {
        seen.push(url);
        if (seen.length === 1) return canonicalHtml(canonical);
        return response('# Canonical\n\nDistinct useful native markdown words describe this canonical public page clearly.', {
            contentType: url.endsWith('/llms.txt') ? 'text/plain' : 'text/markdown',
            url
        });
    });
    assert.deepEqual(seen, [requested, canonical, 'https://www.example.com/llms.txt']);
    assert.equal(result.hasNativeMarkdown, true);
    assert.equal(result.hasLlmsTxt, true);
});
