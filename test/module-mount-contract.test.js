import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { TransactionLens } from '../src/lenses/TransactionLens.js';

test('extraction resolves from the document base when mounted below a proxy path', async () => {
    const source = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');

    assert.match(source, /new URL\('extract', document\.baseURI\)/);
    assert.doesNotMatch(source, /fetch\('\/extract'/);
});

test('protocol icons remain relative to the module mount path', () => {
    const html = new TransactionLens().renderHTML({
        entity: { id: 'example', name: 'Example', brand: { name: 'Example' } },
        commerce: { price: { value: 1, currency: 'USD' } },
    });

    for (const protocol of ['ucp', 'acp', 'mcp', 'prime']) {
        assert.match(html, new RegExp(`src="logos/${protocol}\\.png"`));
        assert.doesNotMatch(html, new RegExp(`src="/logos/${protocol}\\.png"`));
    }
});

test('cube geometry is bounded by viewport width and height', async () => {
    const css = await readFile(new URL('../src/style.css', import.meta.url), 'utf8');

    assert.match(css, /--cube-size:\s*min\(640px,\s*52vw,\s*58vh\)/);
    assert.match(css, /--cube-depth:\s*calc\(var\(--cube-size\)\s*\/\s*2\)/);
    assert.match(css, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s*280px/);
    assert.match(css, /@media \(max-width: 900px\)/);
});
