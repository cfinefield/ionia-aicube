/**
 * HumanLens.js
 * Renders the visual product page as humans see it
 * Tier 1: Full Visual HTML/CSS/JS experience
 */

export class HumanLens {
    render(ctx, width, height, data) {
        // Background - clean white with subtle gradient
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, '#ffffff');
        bgGradient.addColorStop(1, '#f8fafc');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // Header bar
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, 50);

        // Brand logo placeholder
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillText('SWEETWATER', 20, 32);

        // Cart icon
        ctx.fillStyle = '#4743EF';
        ctx.beginPath();
        ctx.arc(width - 35, 25, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('🛒', width - 42, 30);

        // Product image area
        const imgX = 25;
        const imgY = 70;
        const imgW = width - 50;
        const imgH = 160;

        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgW, imgH, 12);
        ctx.fill();

        // Product image placeholder with DJ icon
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '60px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎧', width / 2, imgY + imgH / 2 + 20);
        ctx.textAlign = 'left';

        // Product title
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 16px Inter, sans-serif';
        const title = data.entity.name.length > 35
            ? data.entity.name.substring(0, 32) + '...'
            : data.entity.name;
        ctx.fillText(title, 25, 260);

        // Brand name
        ctx.fillStyle = '#64748b';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(data.entity.brand.name, 25, 280);

        // Price
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.fillText(data.commerce.price.formatted, 25, 320);

        // Financing
        ctx.fillStyle = '#64748b';
        ctx.font = '11px Inter, sans-serif';
        ctx.fillText(`Or ${data.commerce.financing.formatted}`, 25, 340);

        // Availability badge
        ctx.fillStyle = '#dcfce7';
        ctx.beginPath();
        ctx.roundRect(25, 355, 80, 24, 12);
        ctx.fill();
        ctx.fillStyle = '#166534';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.fillText('✓ In Stock', 35, 371);

        // Add to Cart button
        const btnY = 395;
        ctx.fillStyle = '#4743EF';
        ctx.beginPath();
        ctx.roundRect(25, btnY, width - 50, 45, 10);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Add to Cart', width / 2, btnY + 28);
        ctx.textAlign = 'left';

        // Features preview
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText('• 10.1" Touchscreen • NFC • Pro DJ Link', 25, 465);

        // Lens label
        this.drawLensLabel(ctx, width, height, '👤 HUMAN VIEW');
    }

    drawLensLabel(ctx, width, height, label) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.beginPath();
        ctx.roundRect(10, height - 30, 100, 22, 6);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '600 9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, 18, height - 15);
    }
}
