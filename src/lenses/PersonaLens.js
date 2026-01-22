/**
 * PersonaLens.js
 * Renders content filtered for specific user profile
 * Diagnostic: Persona relevance highlighting
 */

export class PersonaLens {
    renderHTML(data, personaMode = 'generic') {
        // Mode handling: generic vs targeted
        let personaKey;
        let persona;

        if (personaMode === 'generic') {
            personaKey = 'General Shopper';
            persona = {
                overallScore: 0.85,
                highlights: [
                    'Standard Features',
                    'Reliability',
                    'Brand Reputation'
                ]
            };
        } else {
            // Pick the first available specific persona
            personaKey = Object.keys(data.personaRelevance)[0];
            persona = data.personaRelevance[personaKey];
        }

        const score = Math.round(persona.overallScore * 100);

        // Render highlights based on selected persona
        const highlightsHTML = persona.highlights.map(h => `
            <div class="relevance-item relevance-item--high lens-highlight lens-highlight--persona" data-lens-label="High Match">
                <div class="relevance-icon">★</div>
                <div class="relevance-text">${h}</div>
                <div class="relevance-bar">
                    <div class="relevance-bar-fill relevance-bar-fill--high" style="width: 100%"></div>
                </div>
            </div>
        `).join('');

        // Medium relevance features (Generic placeholders if generic mode)
        const mediumItems = personaMode === 'generic' ?
            [{ text: 'Price point', score: 60 }, { text: 'Availability', score: 80 }] :
            [{ text: 'Financing options available', score: 70 }, { text: 'Standard connectivity', score: 65 }];

        const mediumHTML = mediumItems.map(item => `
            <div class="relevance-item relevance-item--medium">
                <div class="relevance-icon">◐</div>
                <div class="relevance-text">${item.text}</div>
                <div class="relevance-bar">
                    <div class="relevance-bar-fill relevance-bar-fill--medium" style="width: ${item.score}%"></div>
                </div>
            </div>
        `).join('');

        // Low relevance
        const lowItems = [
            { text: 'Generic marketing copy', score: 30 },
            { text: 'Legal disclaimer', score: 20 }
        ];
        const lowHTML = lowItems.map(item => `
            <div class="relevance-item relevance-item--low">
                <div class="relevance-icon">○</div>
                <div class="relevance-text">${item.text}</div>
                <div class="relevance-bar">
                    <div class="relevance-bar-fill relevance-bar-fill--low" style="width: ${item.score}%"></div>
                </div>
            </div>
        `).join('');

        return `
            <div class="lens lens--persona">
                <header class="persona-header">
                    <div class="persona-info">
                        <span class="persona-icon">${personaMode === 'generic' ? '👤' : '🎧'}</span>
                        <div class="persona-details">
                            <span class="persona-title">PERSONA: ${personaKey}</span>
                            <span class="persona-subtitle">${personaMode === 'generic' ? 'Baseline Analysis' : 'Targeted Profile Analysis'}</span>
                        </div>
                    </div>
                    <div class="score-badge lens-highlight lens-highlight--persona" data-lens-label="Overall Score">
                        <span class="score-value">${score}%</span>
                        <span class="score-label">MATCH</span>
                    </div>
                </header>
                
                <div class="relevance-sections">
                    <section class="relevance-section">
                        <h3 class="section-title section-title--high">
                            <span class="section-icon">✓</span> HIGH RELEVANCE
                        </h3>
                        ${highlightsHTML}
                    </section>
                    
                    <section class="relevance-section">
                        <h3 class="section-title section-title--medium">
                            <span class="section-icon">◐</span> MEDIUM RELEVANCE
                        </h3>
                        ${mediumHTML}
                    </section>
                    
                    <section class="relevance-section">
                        <h3 class="section-title section-title--low">
                            <span class="section-icon">○</span> LOW RELEVANCE (dimmed)
                        </h3>
                        ${lowHTML}
                    </section>
                </div>
                
                <div class="lens-label lens-label--purple">🎧 PERSONA LENS</div>
            </div>
        `;
    }
}

