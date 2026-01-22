/**
 * TransactionLens.js
 * Renders JSON API data for transactional agents
 * Tier 4: JSON API (AP2/MCP) format
 */

export class TransactionLens {
    renderHTML(data) {
        const jsonLines = [
            { text: '{', type: 'bracket' },
            { text: '  "@context": "https://schema.org",', type: 'string' },
            { text: '  "@type": "Product",', type: 'string' },
            { text: `  "name": "${data.entity.name.substring(0, 28)}...",`, type: 'string', highlight: 'persona', label: 'Entity Name' },
            { text: `  "sku": "${data.entity.id}",`, type: 'string' },
            { text: '  "brand": {', type: 'bracket' },
            { text: '    "@type": "Brand",', type: 'string' },
            { text: `    "name": "${data.entity.brand.name}"`, type: 'string', highlight: 'persona', label: 'Brand Entity' },
            { text: '  },', type: 'bracket' },
            { text: '  "offers": {', type: 'bracket' },
            { text: '    "@type": "Offer",', type: 'string' },
            { text: `    "price": ${data.commerce.price.value},`, type: 'number', highlight: 'persona', label: 'Price Value' },
            { text: `    "priceCurrency": "${data.commerce.price.currency}",`, type: 'string' },
            { text: '    "availability": "InStock"', type: 'string', highlight: 'persona', label: 'Stock Status' },
            { text: '  },', type: 'bracket' },
            { text: '  "actions": [{', type: 'action', highlight: 'intent', label: 'Action Schema' },
            { text: '    "type": "add-to-cart",', type: 'action', highlight: 'intent', label: 'Action Type' },
            { text: '    "endpoint": "/api/cart"', type: 'action', highlight: 'intent', label: 'API Endpoint' },
            { text: '  }]', type: 'bracket', highlight: 'intent', label: 'Action Block' },
            { text: '}', type: 'bracket' }
        ];

        const linesHTML = jsonLines.map((line, i) => {
            const lineNum = (i + 1).toString().padStart(2, ' ');
            let attributes = '';
            if (line.highlight === 'persona') attributes = `data-highlight-persona data-lens-label="${line.label || 'Relevance'}"`;
            if (line.highlight === 'intent') attributes = `data-highlight-intent data-lens-label="${line.label || 'Action'}"`;

            return `
                <div class="code-line" ${attributes}>
                    <span class="line-num">${lineNum}</span>
                    <span class="code code--${line.type}">${this.escapeHTML(line.text)}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="lens lens--transaction">
                <div class="connectivity-status-bar">
                    <div class="status-item status-success" data-tooltip="Universal Commerce Protocol detected. Ready for Google Gemini & Search.">
                        <div class="status-icon-img">
                            <img src="/logos/ucp.png" alt="UCP">
                        </div>
                        <span class="status-dot"></span>
                    </div>
                    <div class="status-item status-success" data-tooltip="Agent Commerce Protocol detected. Ready for ChatGPT & Instant Checkout.">
                        <div class="status-icon-img">
                            <img src="/logos/acp.png" alt="ACP">
                        </div>
                        <span class="status-dot"></span>
                    </div>
                    <div class="status-item status-partial" data-tooltip="Model Context Protocol detected. Ready for Claude & RAG engines.">
                        <div class="status-icon-img">
                            <img src="/logos/mcp.png" alt="MCP">
                        </div>
                        <span class="status-dot"></span>
                    </div>
                    <div class="status-item status-missing" data-tooltip="Buy with Prime widget detected. Ready for Amazon Alexa & Shopping.">
                        <div class="status-icon-img">
                            <img src="/logos/prime.png" alt="Prime">
                        </div>
                        <span class="status-dot"></span>
                    </div>
                </div>

                <div class="code-editor">
                    <div class="gutter"></div>
                    <div class="code-content">
                        ${linesHTML}
                    </div>
                </div>
                
                <div class="status-bar">
                    <span>JSON-LD • Schema.org/Product</span>
                    <span>API Ready ✓</span>
                </div>
                
                <div class="lens-label lens-label--blue">💳 TRANSACTION API</div>
            </div>
        `;
    }

    escapeHTML(str) {
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
}
