/**
 * BrowserAgentLens.js
 * Renders semantic DOM structure for browser automation agents
 * Tier 2: Semantic HTML (Simplified)
 */

export class BrowserAgentLens {
    renderHTML(data) {
        // Check for dynamic nodes from LensCrafter
        const nodes = data.semanticStructure?.nodes || [
            { level: 0, tag: 'html', type: 'root' },
            { level: 1, tag: 'head', type: 'meta' },
            { level: 1, tag: 'body', type: 'landmark' },
            { level: 2, tag: 'header', type: 'landmark', label: 'Brand + Cart', highlight: 'intent' },
            { level: 2, tag: 'main', type: 'landmark' },
            { level: 3, tag: 'article', type: 'content', attr: `data-product-id="${data.entity.id}"`, highlight: 'persona' },
            { level: 4, tag: 'h1', type: 'heading', text: data.entity.name.substring(0, 25) + '...', highlight: 'persona' },
            { level: 4, tag: 'img', type: 'media', attr: 'alt="Product Image"', highlight: 'persona' },
            { level: 4, tag: 'section', type: 'content', label: 'Purchase', highlight: 'intent' },
            { level: 5, tag: 'span', type: 'data', attr: `data-price="${data.commerce.price.value?.toFixed(2) || '0.00'}"`, highlight: 'persona' },
            { level: 5, tag: 'button', type: 'interactive', attr: 'data-action="add-to-cart"', highlight: 'intent' },
            { level: 4, tag: 'section', type: 'content', label: 'Features', highlight: 'persona' },
            { level: 5, tag: 'ul', type: 'list', label: '7 items' },
            { level: 4, tag: 'section', type: 'content', label: 'Specs' },
            { level: 5, tag: 'dl', type: 'data', label: '14 entries' },
        ];

        const nodesHTML = nodes.map(node => {
            let content = `<span class="tag tag--${node.type}" style="margin-left: ${node.level * 16}px">&lt;${node.tag}&gt;</span>`;

            if (node.attr) {
                content += `<span class="attr">${node.attr}</span>`;
            } else if (node.label) {
                content += `<span class="comment">// ${node.label}</span>`;
            } else if (node.text) {
                content += `<span class="text">"${node.text}"</span>`;
            }

            let attributes = '';
            // Use node.label if available, otherwise generic
            const label = node.label ? node.label : (node.highlight === 'persona' ? 'Semantic Data' : 'Interactive');

            if (node.highlight === 'persona') attributes = `data-highlight-persona data-lens-label="${label}"`;
            if (node.highlight === 'intent') attributes = `data-highlight-intent data-lens-label="${label}"`;

            return `<div class="tree-node" ${attributes}>${content}</div>`;
        }).join('');

        return `
            <div class="lens lens--browser-agent">
                <div class="terminal-header" data-highlight-persona data-lens-label="Semantic Structure">
                    <span class="title">DOM Tree</span>
                </div>
                
                <div class="tree-view">
                    ${nodesHTML}
                </div>
                
                <div class="agent-status">
                    <div class="status-line">🤖 Agent Status: READY</div>
                    ${nodes.length > 0 ? `<div class="status-result">Nodes: ${nodes.length}</div>` : ''}
                </div>
                
                <div class="lens-label lens-label--cyan">🤖 BROWSER AGENT</div>
            </div>
        `;
    }
}
