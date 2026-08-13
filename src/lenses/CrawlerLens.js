/**
 * CrawlerLens.js
 * Renders only an observed native Markdown response. Missing native Markdown
 * is a readiness failure; this lens must never synthesize a replacement.
 */

export class CrawlerLens {
    renderHTML(data, personaMode = 'generic') {
        const nativeMarkdown = data.hasNativeMarkdown === true;
        // Helper to conditionally add attributes
        const getPersonaAttr = (label) => {
            if (personaMode === 'targeted') {
                return `data-highlight-persona data-lens-label="${label}"`;
            }
            return '';
        };

        return `
            <div class="lens lens--crawler">
                <div class="md-content">
                    <h1 class="md-h1" ${getPersonaAttr('Title H1')}>${nativeMarkdown ? '# Native Markdown' : 'Native Markdown missing'}</h1>
                    <p class="md-italic">${nativeMarkdown ? 'Verified public Markdown response.' : 'FAIL — The audited site did not publish a native Markdown representation.'}</p>
                    <p class="md-italic">/llms.txt: ${data.hasLlmsTxt ? 'verified' : 'not verified'}</p>
                    ${nativeMarkdown && (data.commerce.price.formatted || data.commerce.availability || (data.entity.brand && data.entity.brand.name) || (data.entity.id && data.entity.id !== data.entity.name)) ? `
                    <div class="md-frontmatter">
                        <div class="md-line">---</div>
                        ${data.entity.brand && data.entity.brand.name ? `<div class="md-meta" ${getPersonaAttr('Brand Meta')}>brand: ${data.entity.brand.name}</div>` : ''}
                        ${data.entity.id && data.entity.id !== data.entity.name ? `<div class="md-meta">sku: ${data.entity.id}</div>` : ''}
                        ${data.commerce.price && data.commerce.price.formatted ? `<div class="md-meta" ${getPersonaAttr('Price Meta')}>price: ${data.commerce.price.formatted}</div>` : ''}
                        ${data.commerce.availability ? `<div class="md-meta" ${getPersonaAttr('Status Meta')}>status: ${data.commerce.availability}</div>` : ''}
                        <div class="md-line">---</div>
                    </div>` : ''}

                ${nativeMarkdown && data.markdown
                    ? `<div class="md-content-raw" style="white-space: pre-wrap; font-family: monospace; color: #a0a0a0;">${data.markdown}</div>`
                    : `<div class="status-result">
                        No Markdown content is shown because none was served by the site.
                        Publish a native Markdown representation through content negotiation,
                        then rerun this audit.
                    </div>`}
                    
                    <div class="token-count">${nativeMarkdown ? 'Native Markdown verified' : 'FAILED · native Markdown unavailable'}</div>
                </div>
                
                <div class="lens-label lens-label--dark">${nativeMarkdown ? '📚 NATIVE MARKDOWN' : '❌ MARKDOWN MISSING'}</div>
            </div>
        `;
    }
}
