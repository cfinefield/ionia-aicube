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
        const priceIntentAttr = 'data-highlight-intent';

        // Check for specific Loading State
        if (data.entity.id === 'loading') {
            return `
                <div class="lens lens--human lens--loading">
                    <style>
                        @keyframes scan {
                            0% { transform: translateY(0); opacity: 0; }
                            50% { opacity: 1; }
                            100% { transform: translateY(100px); opacity: 0; }
                        }
                        .scanning-line {
                            width: 100%;
                            height: 2px;
                            background: linear-gradient(90deg, transparent, #00ff9d, transparent);
                            animation: scan 2s infinite ease-in-out;
                            position: absolute;
                            top: 0;
                        }
                        .loading-container {
                            position: relative;
                            padding: 2rem;
                            text-align: center;
                            overflow: hidden;
                        }
                        .loading-pulse {
                            animation: pulse 1.5s infinite;
                        }
                    </style>
                    <div class="content-hero">
                        <div class="hero-content loading-container">
                            <div class="scanning-line"></div>
                            <h1 class="hero-title loading-pulse" style="color: #00ff9d;">${data.entity.name}</h1>
                            <p class="hero-desc" style="opacity: 0.7;">${data.entity.description}</p>
                        </div>
                    </div>
                    <div class="lens-label">🔄 SYSTEM ANALYZING</div>
                </div>
            `;
        }

        // Determine if we have a URL to iframe
        const iframeUrl = data.entity.url;

        // Browser Chrome Component
        const browserChrome = `
            <div class="browser-chrome">
                <div class="traffic-lights">
                    <span class="light red"></span>
                    <span class="light yellow"></span>
                    <span class="light green"></span>
                </div>
                <div class="address-bar">
                    <span class="lock-icon">🔒</span>
                    <span class="address-text">${iframeUrl || 'browse.ai-rail.io'}</span>
                </div>
                <div class="browser-actions">
                    <span class="chrome-menu">⋮</span>
                </div>
            </div>
            <style>
                .browser-chrome {
                    background: #1e1e1e;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    border-bottom: 1px solid #333;
                }
                .traffic-lights { display: flex; gap: 6px; }
                .light { width: 10px; height: 10px; border-radius: 50%; }
                .light.red { background: #ff5f56; }
                .light.yellow { background: #ffbd2e; }
                .light.green { background: #27c93f; }
                .address-bar {
                    flex: 1;
                    background: #2d2d2d;
                    border-radius: 6px;
                    padding: 4px 12px;
                    font-size: 11px;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
                }
                .lock-icon { font-size: 10px; }
                .address-text { opacity: 0.8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .chrome-menu { color: #888; cursor: pointer; }
                
                .browser-viewport {
                    flex: 1;
                    position: relative;
                    background: #fff;
                    overflow: hidden;
                }
                .site-iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                .fallback-view {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
                    color: #fff;
                    padding: 24px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }
                .fallback-header {
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .fallback-title {
                    font-size: 24px;
                    font-weight: 700;
                    background: linear-gradient(90deg, #fff, #94a3b8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 8px;
                }
                .fallback-desc {
                    color: #94a3b8;
                    line-height: 1.5;
                    font-size: 13px;
                }
                .fallback-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .fallback-card {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 16px;
                }
                .fallback-card-title {
                    font-size: 11px;
                    text-transform: uppercase;
                    color: #64748b;
                    margin-bottom: 8px;
                    letter-spacing: 0.5px;
                }
                .fallback-price {
                    font-size: 24px;
                    font-weight: 700;
                    color: #fff;
                }
                .fallback-btn {
                    width: 100%;
                    background: #4f46e5;
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 8px;
                    font-weight: 600;
                    margin-top: 16px;
                    cursor: pointer;
                }
                .fallback-features {
                    margin-top: 24px;
                }
                .fallback-feature-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    font-size: 12px;
                    color: #cbd5e1;
                }
                .iframe-error-overlay {
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    background: rgba(17, 24, 39, 0.95);
                    color: white;
                    padding: 12px;
                    font-size: 11px;
                    text-align: center;
                    display: none; /* Show specific error handling if needed */
                }
            </style>
        `;

        // If we have a URL, try to render iframe first, fallback to visual data
        // For local demo/Airail, we might not have a URL, so use fallback

        const fallbackContent = `
            <div class="fallback-view">
                <div class="fallback-header">
                    <h1 class="fallback-title" ${getPersonaAttr('Product Name')}>${data.entity.name}</h1>
                    <p class="fallback-desc">${data.entity.description || 'No description available.'}</p>
                </div>
                
                <div class="fallback-grid">
                    ${data.commerce.price.value ? `
                    <div class="fallback-card" ${priceIntentAttr}>
                        <div class="fallback-card-title">Price</div>
                        <div class="fallback-price">${data.commerce.price.formatted}</div>
                        ${data.commerce.availabilityText ? `<div style="color: #4ade80; font-size: 11px; margin-top: 4px;">● ${data.commerce.availabilityText}</div>` : ''}
                    </div>` : ''}
                    
                    ${data.entity.seller ? `
                    <div class="fallback-card">
                        <div class="fallback-card-title">Seller</div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            ${data.entity.seller.logo ? `<img src="${data.entity.seller.logo}" style="height:20px;">` : ''}
                            <span style="font-weight:600; font-size: 13px;">${data.entity.seller.name}</span>
                        </div>
                    </div>` : ''}
                </div>

                ${features.length > 0 ? `
                <div class="fallback-features" ${getPersonaAttr('Key Features')}>
                    <div class="fallback-card-title">Key Features</div>
                    ${features.map(f => `
                        <div class="fallback-feature-item">
                            <span style="color: #4ade80;">✓</span> ${f}
                        </div>
                    `).join('')}
                </div>` : ''}

                <button class="fallback-btn" data-highlight-intent data-lens-label="Primary CTA">View Details</button>
            </div>
        `;

        // Logic check: do we try iframe?
        const canTryIframe = !!iframeUrl && !iframeUrl.includes('localhost'); // simple check

        return `
            <div class="lens lens--human" style="display: flex; flex-direction: column; overflow: hidden; background: #000;">
                ${browserChrome}
                <div class="browser-viewport">
                    ${canTryIframe ? `
                        <iframe src="${iframeUrl}" class="site-iframe" sandbox="allow-same-origin allow-scripts allow-forms" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"></iframe>
                        <div class="fallback-wrapper" style="display:none; width:100%; height:100%;">
                            ${fallbackContent}
                        </div>
                        <!-- Note: iframe onerror doesn't fire for X-Frame-Options blocks reliably, so we might see a broken page. 
                             Ideally we'd have a toggle or timeout. For now we try. -->
                    ` : fallbackContent}
                </div>
                <div class="lens-label">👤 HUMAN VISITOR</div>
            </div>
        `;
    }
}
