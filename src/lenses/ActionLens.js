/**
 * ActionLens.js
 * Renders intent-scopes and actionable elements
 * Diagnostic: Action/Intent scope visualization
 */

export class ActionLens {
    render(ctx, width, height, data) {
        // Dark background with grid
        ctx.fillStyle = '#0c4a6e';
        ctx.fillRect(0, 0, width, height);

        // Grid pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }
        for (let i = 0; i < height; i += 20) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }

        // Header
        ctx.fillStyle = '#0ea5e9';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillText('⚡ Intent-Scope Analysis', 15, 30);

        let y = 60;
        const margin = 15;

        // Intent cards
        data.intents.forEach((intent, index) => {
            const cardHeight = 70;
            const confidence = intent.confidence;

            // Card background
            ctx.fillStyle = 'rgba(14, 165, 233, 0.1)';
            ctx.beginPath();
            ctx.roundRect(margin, y, width - margin * 2, cardHeight, 10);
            ctx.fill();

            // Left border color based on confidence
            const borderColor = confidence >= 0.9 ? '#22c55e' : confidence >= 0.7 ? '#eab308' : '#f97316';
            ctx.fillStyle = borderColor;
            ctx.fillRect(margin, y, 4, cardHeight);

            // Intent type badge
            ctx.fillStyle = borderColor;
            ctx.beginPath();
            ctx.roundRect(margin + 15, y + 10, 80, 20, 10);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px Inter, sans-serif';
            ctx.fillText(intent.type.toUpperCase(), margin + 25, y + 23);

            // Action label
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.fillText(intent.label, margin + 15, y + 48);

            // Action attribute
            ctx.fillStyle = '#7dd3fc';
            ctx.font = '9px "SF Mono", monospace';
            ctx.fillText(`data-action="${intent.action}"`, margin + 15, y + 62);

            // Confidence meter
            const meterX = width - 70;
            const meterWidth = 50;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.roundRect(meterX, y + 25, meterWidth, 8, 4);
            ctx.fill();

            ctx.fillStyle = borderColor;
            ctx.beginPath();
            ctx.roundRect(meterX, y + 25, meterWidth * confidence, 8, 4);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`${Math.round(confidence * 100)}%`, width - margin - 5, y + 55);
            ctx.textAlign = 'left';

            y += cardHeight + 10;
        });

        // Suggestions section
        y += 10;
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('💡 OPTIMIZATION SUGGESTIONS', margin, y);
        y += 20;

        const suggestions = [
            'Add data-intent-scope="financing" to loan CTA',
            'Consider aria-label for icon-only buttons',
            'Add structured confirmation flow'
        ];

        suggestions.forEach(suggestion => {
            ctx.fillStyle = 'rgba(251, 191, 36, 0.1)';
            ctx.beginPath();
            ctx.roundRect(margin, y - 10, width - margin * 2, 20, 5);
            ctx.fill();

            ctx.fillStyle = '#fde68a';
            ctx.font = '9px Inter, sans-serif';
            ctx.fillText('→ ' + suggestion.substring(0, 40), margin + 8, y + 2);
            y += 26;
        });

        // Lens label
        this.drawLensLabel(ctx, width, height, '⚡ ACTION LENS');
    }

    drawLensLabel(ctx, width, height, label) {
        ctx.fillStyle = 'rgba(14, 165, 233, 0.9)';
        ctx.beginPath();
        ctx.roundRect(width - 110, height - 35, 100, 22, 6);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '600 9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, width - 102, height - 20);
    }
}
