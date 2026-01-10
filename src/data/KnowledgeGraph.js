/**
 * KnowledgeGraph.js
 * Core data structure for the AI Cube Multi-Lens Debugger
 * All lenses read from this unified data model
 */

export const productData = {
    // Entity Core
    entity: {
        type: 'Product',
        id: 'CDJ3000x',
        name: 'AlphaTheta CDJ-3000X Professional DJ Media Player',
        brand: {
            name: 'AlphaTheta',
            logo: 'https://media.sweetwater.com/api/i/f-webp__ha-9c685a4054770a35__hmac-27389aee76ee4498ab689cb5d825fc9cd375f0fb/images/manufacturer-logos/alphatheta.png.auto.webp'
        },
        seller: {
            name: 'Sweetwater',
            logo: 'https://media.sweetwater.com/m/header/logo/sweetwater-logo.png?width=190&quality=90&ha=f35d4f4cc2e223d4'
        },
        image: 'https://media.sweetwater.com/m/products/image/4474de8bbdr2B1sLxYfZKR8NKmPTM5ElQbXVUbit.jpg?quality=82&ha=4474de8bbde83766',
        description: 'DJ Media Player with 10.1" Touchscreen, NFC Touchpoint, Wi-Fi, Gate Cue, Smart Cue, Single Sign-on, Pro DJ Link, Cloud Support, and Complete rekordbox Integration'
    },

    // Pricing & Availability
    commerce: {
        price: {
            value: 2999.00,
            currency: 'USD',
            formatted: '$2,999.00'
        },
        financing: {
            monthly: 84,
            term: 36,
            formatted: '$84/month with 36 month financing'
        },
        availability: 'InStock',
        availabilityText: 'In Stock'
    },

    // Key Features (marketing copy)
    features: [
        'Next-gen CDJ with expansive hardware and software upgrades',
        'Front-mounted NFC touchpoint for instant rekordbox library access via smartphone',
        'Expanded 10.1-inch capacitive touchscreen for detailed interactivity',
        'Gate Cue and Smart Cue for inventive mixing and performance possibilities',
        'USB-C ports for fast connections and data transfer',
        'State-of-the-art ESS Technology DAC for high-fidelity, detailed sound',
        'Pro DJ Link for synchronizing with other compatible hardware'
    ],

    // Technical Specifications
    specifications: {
        'Number of Decks': '1',
        'Display': '10.1" Touchscreen',
        'Compatible Media': 'USB Media, Dropbox, Google Drive',
        'Compatible Files': 'MP3, AAC, WAV, AIFF, ALAC, FLAC',
        'Jog Wheels': '1 x Jog Wheel with Display',
        'Analog Outputs': '1 x Dual RCA Stereo',
        'Digital Outputs': '1 x Coaxial RCA (S/PDIF)',
        'USB': '1 x Type A, 2 x USB-C',
        'Wi-Fi': '2.4GHz/5GHz',
        'Software': 'Rekordbox',
        'Height': '5.12"',
        'Width': '13.56"',
        'Depth': '19.3"',
        'Weight': '13.22 lbs'
    },

    // Intent Scopes (for Action Lens)
    intents: [
        {
            type: 'purchase',
            action: 'add-to-cart',
            label: 'Add to Cart',
            itemId: 'CDJ3000x',
            confidence: 1.0
        },
        {
            type: 'inquiry',
            action: 'contact-sales',
            label: 'Contact Sales Engineer',
            confidence: 0.85
        },
        {
            type: 'financing',
            action: 'apply-financing',
            label: 'Apply for Financing',
            confidence: 0.9
        }
    ],

    // Persona Relevance Scores (for Persona Lens)
    personaRelevance: {
        'Semi-Pro DJ': {
            overallScore: 0.95,
            sections: {
                'features': { score: 1.0, reason: 'Pro-level features for serious DJs' },
                'specifications.Display': { score: 0.9, reason: 'Large touchscreen for performance' },
                'specifications.Compatible Files': { score: 0.85, reason: 'Supports pro audio formats' },
                'commerce.financing': { score: 0.7, reason: 'Makes pro gear accessible' },
                'features[0]': { score: 0.5, reason: 'Marketing fluff, less relevant' }
            },
            highlights: [
                'Gate Cue and Smart Cue for inventive mixing',
                'Pro DJ Link for synchronizing with other compatible hardware',
                'ESS Technology DAC for high-fidelity sound'
            ]
        }
    },

    // Semantic Structure (for Browser Agent Lens)
    semanticStructure: {
        landmarks: ['header', 'main', 'aside'],
        headings: [
            { level: 1, text: 'AlphaTheta CDJ-3000X Professional DJ Media Player' },
            { level: 2, text: 'Purchase Information', hidden: true },
            { level: 2, text: 'Key Features' },
            { level: 2, text: 'Tech Specs' }
        ],
        interactiveElements: [
            { type: 'button', label: 'Add to Cart', action: 'add-to-cart' }
        ],
        dataAttributes: [
            'data-product-id',
            'data-price',
            'data-availability',
            'data-action',
            'data-intent-scope'
        ]
    }
};

// Lens metadata for UI panel
export const lensMetadata = {
    0: {
        id: 'human',
        name: 'Human View',
        icon: '👤',
        tier: 1,
        format: 'Full Visual HTML/CSS/JS',
        purpose: 'Persuasion, branding, and manual UX',
        description: 'The full visual experience designed for human visitors. Rich styling, images, and marketing copy.',
        agentThoughts: [
            'Detected product page with hero image',
            'Price displayed prominently: $2,999.00',
            'Primary CTA: "Add to Cart" button'
        ]
    },
    1: {
        id: 'browser-agent',
        name: 'Browser Agent',
        icon: '🤖',
        tier: 2,
        format: 'Semantic HTML (Simplified)',
        purpose: 'Reliable navigation for tools like Project Mariner',
        description: 'Semantic structure for browser automation agents. Clean DOM tree with labeled elements.',
        agentThoughts: [
            'Scanning for semantic landmarks...',
            'Found: header, main, 1 interactive button',
            'Button labeled "Add to Cart" with data-action attribute',
            'Intent-scope: purchase confirmed'
        ]
    },
    2: {
        id: 'crawler',
        name: 'Crawler / LLM',
        icon: '📚',
        tier: 3,
        format: 'Markdown (.md)',
        purpose: 'Efficient indexing and high-context training',
        description: 'Markdown representation optimized for LLM crawlers and search indexing.',
        agentThoughts: [
            'Converting to markdown format...',
            'Extracted 14 specification fields',
            'Identified 7 key features',
            'Structured for RAG retrieval'
        ]
    },
    3: {
        id: 'transaction',
        name: 'Transaction API',
        icon: '💳',
        tier: 4,
        format: 'JSON API (AP2/MCP)',
        purpose: '100% precise data for automated purchases',
        description: 'Structured JSON data for transactional agents performing automated actions.',
        agentThoughts: [
            'Parsing structured data attributes...',
            'Price: 2999.00 USD (verified)',
            'SKU: CDJ3000x',
            'Availability: InStock',
            'Ready for automated checkout'
        ]
    },
    4: {
        id: 'persona',
        name: 'Persona Lens',
        icon: '🎧',
        tier: 'Diagnostic',
        format: 'Filtered View',
        purpose: 'Content curated for specific user profiles',
        description: 'Filters and highlights content based on "Semi-Pro DJ" persona. Dims low-relevance marketing fluff.',
        agentThoughts: [
            'Active persona: Semi-Pro DJ',
            'Overall relevance score: 95%',
            'High relevance: Pro DJ Link, Gate Cue',
            'Low relevance: Generic marketing copy',
            'Highlighting technical specs...'
        ]
    },
    5: {
        id: 'action',
        name: 'Action Lens',
        icon: '⚡',
        tier: 'Diagnostic',
        format: 'Intent-Scope Map',
        purpose: 'Identify actionable elements for agents',
        description: 'Scans for intent-scopes and actionable elements. Flags ambiguous CTAs and suggests enrichments.',
        agentThoughts: [
            'Scanning for intent-scopes...',
            'Found 3 actionable intents:',
            '  ✓ add-to-cart (confidence: 100%)',
            '  ✓ apply-financing (confidence: 90%)',
            '  ✓ contact-sales (confidence: 85%)',
            'Suggestion: Add data-intent-scope to financing CTA'
        ]
    }
};
