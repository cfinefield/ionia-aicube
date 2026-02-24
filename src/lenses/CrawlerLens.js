/**
 * CrawlerLens.js
 * Renders Markdown representation for LLM crawlers
 * Tier 3: Markdown (.md) format
 */

export class CrawlerLens {
    renderHTML(data, personaMode = 'generic') {
        const specs = data.specifications ? Object.entries(data.specifications).slice(0, 5) : [];
        const specsHTML = specs.length > 0 ? specs.map(([key, value]) =>
            `<div class="spec-row" data-highlight-intent data-lens-label="Spec: ${key}">| ${key} | ${value} |</div>`
        ).join('') : '';

        const features = data.features && data.features.length > 0 ? data.features.slice(0, 4).map(f =>
            `<div class="md-list-item" data-highlight-intent data-lens-label="Content Feature">- ${f.substring(0, 50)}${f.length > 50 ? '...' : ''}</div>`
        ).join('') : '';

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
                    <h1 class="md-h1" ${getPersonaAttr('Title H1')}># ${data.entity.name}</h1>
                    <p class="md-italic">*${(data.entity.description || '').substring(0, 60)}...*</p>
                    
                    ${(data.commerce.price.formatted || data.commerce.availability || (data.entity.brand && data.entity.brand.name) || (data.entity.id && data.entity.id !== data.entity.name)) ? `
                    <div class="md-frontmatter">
                        <div class="md-line">---</div>
                        ${data.entity.brand && data.entity.brand.name ? `<div class="md-meta" ${getPersonaAttr('Brand Meta')}>brand: ${data.entity.brand.name}</div>` : ''}
                        ${data.entity.id && data.entity.id !== data.entity.name ? `<div class="md-meta">sku: ${data.entity.id}</div>` : ''}
                        ${data.commerce.price && data.commerce.price.formatted ? `<div class="md-meta" ${getPersonaAttr('Price Meta')}>price: ${data.commerce.price.formatted}</div>` : ''}
                        ${data.commerce.availability ? `<div class="md-meta" ${getPersonaAttr('Status Meta')}>status: ${data.commerce.availability}</div>` : ''}
                        <div class="md-line">---</div>
                    </div>` : ''}

                ${data.markdown ?
                `<div class="md-content-raw" style="white-space: pre-wrap; font-family: monospace; color: #a0a0a0;">${data.markdown}</div>` :
                (features || specsHTML ? `
                        ${features ? `<h2 class="md-h2">## Key Features</h2><div class="md-list">${features}</div>` : ''}
                        ${specsHTML ? `<h2 class="md-h2">## Specifications</h2><div class="md-table">${specsHTML}</div>` : ''}
                        ` : '')
            }
                    
                    <div class="token-count">~450 tokens | 2.1kb</div>
                </div>
                
                <div class="lens-label lens-label--dark">📚 CRAWLER VIEW</div>
            </div>
        `;
    }
}
