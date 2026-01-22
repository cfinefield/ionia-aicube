/**
 * HumanLens.js
 * Renders the visual product page as humans see it
 * Tier 1: Full Visual HTML/CSS/JS experience
 * 
 * Elements are tagged with data-highlight-* attributes for overlay highlighting:
 * - data-highlight-persona: Elements relevant to persona analysis
 * - data-highlight-intent: Actionable elements for intent analysis
 */

export class HumanLens {
    renderHTML(data, personaMode = 'generic') {
        const features = data.features.slice(0, 4); // Show first 4 features

        // Helper to conditionally add attributes
        const getPersonaAttr = (label) => {
            if (personaMode === 'targeted') {
                return `data-highlight-persona data-lens-label="${label}"`;
            }
            return '';
        };

        // Reuse intent attr logic
        const cartIntentAttr = 'data-highlight-intent data-lens-label="Cart Action"';
        const priceIntentAttr = 'data-highlight-intent';

        return `
            <div class="lens lens--human">
                <header class="human-header">
                    <div class="header-left">
                        <img src="${data.entity.seller.logo}" 
                             alt="${data.entity.seller.name}" 
                             class="seller-logo" 
                             onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
                        <span class="seller-name-fallback" style="display:none">${data.entity.seller.name}</span>
                    </div>
                    <div class="cart-icon" ${cartIntentAttr}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </div>
                </header>
                
                <div class="product-hero">
                    <div class="brand-badge" ${getPersonaAttr('Brand')}>
                        <img src="${data.entity.brand.logo}" 
                             alt="${data.entity.brand.name}"
                             class="brand-logo-img"
                             onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
                        <span class="brand-name-fallback" style="display:none">${data.entity.brand.name}</span>
                    </div>
                    <div class="product-image-container" ${getPersonaAttr('Product Image')}>
                        <img src="${data.entity.image}" 
                             alt="${data.entity.name}"
                             class="product-image-actual"
                             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                        <div class="product-image-fallback" style="display:none">
                            <span class="product-emoji">🎧</span>
                        </div>
                    </div>
                </div>
                
                <div class="product-info">
                    <h1 class="product-title" ${getPersonaAttr('Product Name')}>${data.entity.name}</h1>
                    <p class="product-description">${data.entity.description}</p>
                    
                    <div class="price-section" ${priceIntentAttr} ${getPersonaAttr('Pricing')}>
                        <span class="price">${data.commerce.price.formatted}</span>
                        <span class="availability-badge">✓ ${data.commerce.availabilityText}</span>
                    </div>
                    <span class="financing" ${priceIntentAttr} data-lens-label="Financing">${data.commerce.financing.formatted}</span>
                    
                    <button class="add-to-cart-btn" data-highlight-intent data-lens-label="Primary CTA">Add to Cart</button>
                    
                    <div class="features-list" ${getPersonaAttr('Key Features')}>
                        <h3 class="features-heading">Key Features</h3>
                        <ul>
                            ${features.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="lens-label">👤 HUMAN VISITOR</div>
            </div>
        `;
    }
}
