/**
 * BrowserAgentLens.js
 * Renders semantic DOM structure for browser automation agents
 * Tier 2: Semantic HTML (Simplified)
 */

export class BrowserAgentLens {
    render(ctx, width, height, data) {
        // Dark terminal-like background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Title
        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 14px "SF Mono", monospace';
        ctx.fillText('DOM Tree', 20, 30);

        // Semantic structure visualization
        let y = 55;
        const indent = 20;
        const lineHeight = 22;

        const nodes = [
            { level: 0, tag: 'html', type: 'root' },
            { level: 1, tag: 'head', type: 'meta' },
            { level: 1, tag: 'body', type: 'landmark' },
            { level: 2, tag: 'header', type: 'landmark', label: 'Brand + Cart' },
            { level: 2, tag: 'main', type: 'landmark' },
            { level: 3, tag: 'article', type: 'content', attr: 'data-product-id="CDJ3000x"' },
            { level: 4, tag: 'h1', type: 'heading', text: data.entity.name.substring(0, 25) + '...' },
            { level: 4, tag: 'img', type: 'media', attr: 'alt="Product Image"' },
            { level: 4, tag: 'section', type: 'content', label: 'Purchase' },
            { level: 5, tag: 'span', type: 'data', attr: 'data-price="2999.00"' },
            { level: 5, tag: 'button', type: 'interactive', attr: 'data-action="add-to-cart"', highlight: true },
            { level: 4, tag: 'section', type: 'content', label: 'Features' },
            { level: 5, tag: 'ul', type: 'list', label: '7 items' },
            { level: 4, tag: 'section', type: 'content', label: 'Specs' },
            { level: 5, tag: 'dl', type: 'data', label: '14 entries' },
        ];

        nodes.forEach(node => {
            const x = 15 + node.level * indent;

            // Tree connector lines
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - 10, y);
            ctx.lineTo(x - 5, y);
            ctx.stroke();

            if (node.level > 0) {
                ctx.beginPath();
                ctx.moveTo(x - 10, y - lineHeight);
                ctx.lineTo(x - 10, y);
                ctx.stroke();
            }

            // Tag name
            if (node.highlight) {
                ctx.fillStyle = '#22c55e';
                ctx.font = 'bold 11px "SF Mono", monospace';
            } else {
                ctx.fillStyle = this.getTagColor(node.type);
                ctx.font = '11px "SF Mono", monospace';
            }
            ctx.fillText(`<${node.tag}>`, x, y);

            // Attributes or labels
            if (node.attr) {
                ctx.fillStyle = '#fbbf24';
                ctx.font = '9px "SF Mono", monospace';
                const attrText = node.attr.length > 25 ? node.attr.substring(0, 22) + '...' : node.attr;
                ctx.fillText(attrText, x + 60, y);
            } else if (node.label) {
                ctx.fillStyle = '#64748b';
                ctx.font = '9px "SF Mono", monospace';
                ctx.fillText(`// ${node.label}`, x + 60, y);
            } else if (node.text) {
                ctx.fillStyle = '#94a3b8';
                ctx.font = '9px "SF Mono", monospace';
                ctx.fillText(`"${node.text}"`, x + 40, y);
            }

            y += lineHeight;
        });

        // Agent status bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, height - 50, width, 50);

        ctx.fillStyle = '#22d3ee';
        ctx.font = '600 10px Inter, sans-serif';
        ctx.fillText('🤖 Agent Status: READY', 15, height - 30);

        ctx.fillStyle = '#4ade80';
        ctx.font = '10px "SF Mono", monospace';
        ctx.fillText('Found: 1 interactive button', 15, height - 12);

        // Lens label
        this.drawLensLabel(ctx, width, height, '🤖 BROWSER AGENT');
    }

    getTagColor(type) {
        const colors = {
            root: '#f472b6',
            meta: '#a78bfa',
            landmark: '#22d3ee',
            content: '#38bdf8',
            heading: '#fbbf24',
            media: '#fb923c',
            data: '#4ade80',
            interactive: '#22c55e',
            list: '#94a3b8'
        };
        return colors[type] || '#94a3b8';
    }

    drawLensLabel(ctx, width, height, label) {
        ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
        ctx.beginPath();
        ctx.roundRect(width - 130, height - 48, 120, 22, 6);
        ctx.fill();

        ctx.fillStyle = '#22d3ee';
        ctx.font = '600 9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, width - 122, height - 33);
    }
}
