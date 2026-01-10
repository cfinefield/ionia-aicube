/**
 * PersonaLens.js
 * Renders content filtered for specific user profile
 * Diagnostic: Persona relevance highlighting
 */

export class PersonaLens {
    render(ctx, width, height, data) {
        // Background with subtle persona tint
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, '#faf5ff');
        bgGradient.addColorStop(1, '#f3e8ff');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        const persona = data.personaRelevance['Semi-Pro DJ'];

        // Persona header
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(0, 0, width, 55);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText('🎧 PERSONA: Semi-Pro DJ', 15, 25);

        // Score badge
        ctx.fillStyle = '#a78bfa';
        ctx.beginPath();
        ctx.roundRect(width - 70, 10, 55, 35, 8);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Inter, sans-serif';
        ctx.fillText(`${Math.round(persona.overallScore * 100)}%`, width - 58, 35);
        ctx.font = '8px Inter, sans-serif';
        ctx.fillText('MATCH', width - 55, 48);

        let y = 75;
        const margin = 15;

        // High relevance section
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('HIGH RELEVANCE', margin, y);
        y += 18;

        // Highlighted features
        persona.highlights.forEach(highlight => {
            ctx.fillStyle = 'rgba(5, 150, 105, 0.15)';
            ctx.beginPath();
            ctx.roundRect(margin, y - 12, width - margin * 2, 22, 6);
            ctx.fill();

            ctx.fillStyle = '#047857';
            ctx.font = '10px Inter, sans-serif';
            ctx.fillText('★ ' + highlight.substring(0, 45), margin + 8, y + 2);
            y += 28;
        });

        y += 10;

        // Medium relevance
        ctx.fillStyle = '#d97706';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('MEDIUM RELEVANCE', margin, y);
        y += 18;

        const mediumItems = [
            'Financing options available',
            'USB-C connectivity'
        ];

        mediumItems.forEach(item => {
            ctx.fillStyle = 'rgba(217, 119, 6, 0.1)';
            ctx.beginPath();
            ctx.roundRect(margin, y - 12, width - margin * 2, 22, 6);
            ctx.fill();

            ctx.fillStyle = '#b45309';
            ctx.font = '10px Inter, sans-serif';
            ctx.fillText('◐ ' + item, margin + 8, y + 2);
            y += 28;
        });

        y += 10;

        // Low relevance (dimmed)
        ctx.fillStyle = '#9ca3af';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('LOW RELEVANCE (dimmed)', margin, y);
        y += 18;

        const lowItems = [
            'Next-gen CDJ with hardware upgrades',
            'General marketing description'
        ];

        lowItems.forEach(item => {
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = '#6b7280';
            ctx.font = '10px Inter, sans-serif';
            ctx.fillText('○ ' + item, margin + 8, y + 2);
            y += 22;
        });
        ctx.globalAlpha = 1;

        // Lens label
        this.drawLensLabel(ctx, width, height, '🎧 PERSONA LENS');
    }

    drawLensLabel(ctx, width, height, label) {
        ctx.fillStyle = 'rgba(124, 58, 237, 0.9)';
        ctx.beginPath();
        ctx.roundRect(width - 115, height - 35, 105, 22, 6);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '600 9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, width - 107, height - 20);
    }
}
