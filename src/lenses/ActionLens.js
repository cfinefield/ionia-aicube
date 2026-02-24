/**
 * ActionLens.js
 * Renders intent-scopes and actionable elements
 * Diagnostic: Action/Intent scope visualization
 */

export class ActionLens {
    renderHTML(data) {
        console.log('ActionLens received data:', data);
        console.log('Suggestions:', data.suggestions);

        const intentsHTML = data.intents.map((intent, index) => {
            const confidence = intent.confidence;
            const pct = Math.round(confidence * 100);
            const level = confidence >= 0.9 ? 'high' : confidence >= 0.7 ? 'medium' : 'low';
            const isHighlighted = intent.action === 'add-to-cart';

            return `
                <div class="intent-card intent-card--${level} ${isHighlighted ? 'lens-highlight lens-highlight--action' : ''}" 
                     ${isHighlighted ? 'data-lens-label="Primary CTA"' : ''}>
                    <div class="intent-card-header">
                        <div class="intent-badge">${intent.type.toUpperCase()}</div>
                        <div class="intent-confidence-badge intent-confidence-badge--${level}">
                            ${pct}%
                        </div>
                    </div>
                    <div class="intent-label">${intent.label}</div>
                    <div class="intent-attr">
                        <span class="attr-key">data-action</span>=<span class="attr-value">"${intent.action}"</span>
                    </div>
                    <div class="confidence-meter">
                        <div class="confidence-fill" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        }).join('');

        const suggestions = (data.suggestions && data.suggestions.length > 0)
            ? data.suggestions
            : [
                { text: 'No specific improvements detected', priority: 'low' }
            ];

        const suggestionsHTML = suggestions.map(s => `
            <div class="suggestion-item suggestion-item--${s.priority}">
                <span class="suggestion-arrow">→</span>
                <span class="suggestion-text">${s.text}</span>
            </div>
        `).join('');

        return `
            <div class="lens lens--action">
                <div class="action-grid"></div>
                
                <header class="action-header">
                    <div class="action-header-content">
                        <span class="action-icon">⚡</span>
                        <div class="action-header-text">
                            <span class="action-title">Intent-Scope Analysis</span>
                            <span class="action-subtitle">Detected ${data.intents.length} actionable intents</span>
                        </div>
                    </div>
                </header>
                
                <div class="intents-list">
                    ${intentsHTML}
                </div>
                
                <section class="suggestions-section">
                    <h3 class="suggestions-title">
                        <span>💡</span> OPTIMIZATION SUGGESTIONS
                    </h3>
                    ${suggestionsHTML}
                </section>
                
                <div class="lens-label lens-label--sky">⚡ ACTION LENS</div>
            </div>
        `;
    }
}

