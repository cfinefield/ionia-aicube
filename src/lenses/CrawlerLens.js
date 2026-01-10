/**
 * CrawlerLens.js
 * Renders Markdown representation for LLM crawlers
 * Tier 3: Markdown (.md) format
 */

export class CrawlerLens {
    render(ctx, width, height, data) {
        // Light paper-like background
        ctx.fillStyle = '#fefefe';
        ctx.fillRect(0, 0, width, height);

        // Subtle paper texture line
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 40; i < height; i += 20) {
            ctx.beginPath();
            ctx.moveTo(60, i);
            ctx.lineTo(width - 20, i);
            ctx.stroke();
        }

        let y = 35;
        const margin = 25;

        // Title (H1)
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 16px "Georgia", serif';
        ctx.fillText('# ' + data.entity.name.substring(0, 28), margin, y);
        y += 28;

        // Subtitle
        ctx.fillStyle = '#6b7280';
        ctx.font = 'italic 11px "Georgia", serif';
        ctx.fillText(`*${data.entity.description.substring(0, 45)}...*`, margin, y);
        y += 25;

        // Metadata block
        ctx.fillStyle = '#374151';
        ctx.font = '11px "SF Mono", monospace';
        ctx.fillText('---', margin, y);
        y += 18;
        ctx.fillText(`brand: ${data.entity.brand.name}`, margin, y);
        y += 15;
        ctx.fillText(`sku: ${data.entity.id}`, margin, y);
        y += 15;
        ctx.fillText(`price: ${data.commerce.price.formatted}`, margin, y);
        y += 15;
        ctx.fillText(`status: ${data.commerce.availability}`, margin, y);
        y += 15;
        ctx.fillText('---', margin, y);
        y += 25;

        // Features section (H2)
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 13px "Georgia", serif';
        ctx.fillText('## Key Features', margin, y);
        y += 20;

        // Feature list
        ctx.fillStyle = '#4b5563';
        ctx.font = '10px "Georgia", serif';
        data.features.slice(0, 4).forEach(feature => {
            const truncated = feature.length > 45 ? feature.substring(0, 42) + '...' : feature;
            ctx.fillText('- ' + truncated, margin, y);
            y += 16;
        });
        y += 10;

        // Specs section (H2)
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 13px "Georgia", serif';
        ctx.fillText('## Specifications', margin, y);
        y += 20;

        // Spec table
        ctx.fillStyle = '#4b5563';
        ctx.font = '10px "SF Mono", monospace';
        const specs = Object.entries(data.specifications).slice(0, 5);
        specs.forEach(([key, value]) => {
            ctx.fillText(`| ${key.padEnd(12)} | ${value} |`, margin, y);
            y += 14;
        });

        // Word count indicator
        ctx.fillStyle = '#9ca3af';
        ctx.font = '9px "SF Mono", monospace';
        ctx.fillText('~450 tokens | 2.1kb', margin, height - 20);

        // Lens label
        this.drawLensLabel(ctx, width, height, '📚 CRAWLER VIEW');
    }

    drawLensLabel(ctx, width, height, label) {
        ctx.fillStyle = 'rgba(31, 41, 55, 0.8)';
        ctx.beginPath();
        ctx.roundRect(width - 120, height - 35, 110, 22, 6);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '600 9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, width - 112, height - 20);
    }
}
