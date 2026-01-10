/**
 * TransactionLens.js
 * Renders JSON API data for transactional agents
 * Tier 4: JSON API (AP2/MCP) format
 */

export class TransactionLens {
    render(ctx, width, height, data) {
        // Dark code editor background
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, width, height);

        // Line numbers gutter
        ctx.fillStyle = '#2d2d2d';
        ctx.fillRect(0, 0, 35, height);

        let y = 25;
        let lineNum = 1;
        const margin = 45;
        const lineHeight = 14;

        const jsonLines = [
            { text: '{', color: '#d4d4d4' },
            { text: '  "@context": "https://schema.org",', color: '#ce9178' },
            { text: '  "@type": "Product",', color: '#ce9178' },
            { text: `  "name": "${data.entity.name.substring(0, 30)}...",`, color: '#ce9178' },
            { text: `  "sku": "${data.entity.id}",`, color: '#ce9178' },
            { text: '  "brand": {', color: '#d4d4d4' },
            { text: '    "@type": "Brand",', color: '#ce9178' },
            { text: `    "name": "${data.entity.brand.name}"`, color: '#ce9178' },
            { text: '  },', color: '#d4d4d4' },
            { text: '  "offers": {', color: '#d4d4d4' },
            { text: '    "@type": "Offer",', color: '#ce9178' },
            { text: `    "price": ${data.commerce.price.value},`, color: '#b5cea8' },
            { text: `    "priceCurrency": "${data.commerce.price.currency}",`, color: '#ce9178' },
            { text: `    "availability": "InStock",`, color: '#ce9178' },
            { text: '    "seller": {', color: '#d4d4d4' },
            { text: '      "@type": "Organization",', color: '#ce9178' },
            { text: `      "name": "${data.entity.seller.name}"`, color: '#ce9178' },
            { text: '    }', color: '#d4d4d4' },
            { text: '  },', color: '#d4d4d4' },
            { text: '  "actions": [{', color: '#4ec9b0' },
            { text: '    "type": "add-to-cart",', color: '#4ec9b0' },
            { text: '    "endpoint": "/api/cart",', color: '#4ec9b0' },
            { text: '    "method": "POST"', color: '#4ec9b0' },
            { text: '  }]', color: '#d4d4d4' },
            { text: '}', color: '#d4d4d4' }
        ];

        jsonLines.forEach(line => {
            // Line number
            ctx.fillStyle = '#5a5a5a';
            ctx.font = '10px "SF Mono", monospace';
            ctx.textAlign = 'right';
            ctx.fillText(lineNum.toString(), 28, y);
            ctx.textAlign = 'left';

            // Code
            ctx.fillStyle = line.color;
            ctx.font = '10px "SF Mono", monospace';

            // Syntax highlighting for keys
            const text = line.text;
            if (text.includes(':')) {
                const parts = text.split(':');
                const keyPart = parts[0];
                const valuePart = ':' + parts.slice(1).join(':');

                // Key color (property names)
                ctx.fillStyle = '#9cdcfe';
                ctx.fillText(keyPart, margin, y);

                // Value color
                ctx.fillStyle = line.color;
                ctx.fillText(valuePart, margin + ctx.measureText(keyPart).width, y);
            } else {
                ctx.fillText(text, margin, y);
            }

            y += lineHeight;
            lineNum++;
        });

        // Status bar
        ctx.fillStyle = '#007acc';
        ctx.fillRect(0, height - 25, width, 25);

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText('JSON-LD • Schema.org/Product', 10, height - 8);

        ctx.textAlign = 'right';
        ctx.fillText('API Ready ✓', width - 10, height - 8);
        ctx.textAlign = 'left';

        // Lens label
        this.drawLensLabel(ctx, width, height - 30, '💳 TRANSACTION API');
    }

    drawLensLabel(ctx, width, height, label) {
        ctx.fillStyle = 'rgba(0, 122, 204, 0.9)';
        ctx.beginPath();
        ctx.roundRect(width - 135, height - 35, 125, 22, 6);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '600 9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, width - 127, height - 20);
    }
}
