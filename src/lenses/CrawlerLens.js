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
                    <h1 class="md-h1" ${getPersonaAttr('Title H1')}>${nativeMarkdown ? '# Crawler-optimized content' : 'Crawler optimization incomplete'}</h1>
                    <p class="md-italic">${nativeMarkdown ? 'This page serves a verified Markdown experience for AI crawlers.' : 'This page is not serving crawler-optimized Markdown content.'}</p>
                    <p class="md-italic">llms.txt guidance: ${data.hasLlmsTxt ? 'available' : 'not found'}</p>
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
                        AI crawlers can reach this page, but a dedicated Markdown experience
                        was not detected.
                    </div>`}
                    
                    <div class="token-count">${nativeMarkdown ? 'Crawler-optimized Markdown available' : 'NEEDS IMPROVEMENT · Markdown unavailable'}</div>
                </div>
                
                <div class="lens-label lens-label--dark">${nativeMarkdown ? '📚 CRAWLER OPTIMIZED' : '📚 CRAWLER EXPERIENCE LIMITED'}</div>
            </div>
        `;
    }
}
