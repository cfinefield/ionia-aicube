/**
 * LoadingState.js
 * Placeholder "product" to display while the Worker is analyzing a site.
 */

export const loadingState = {
    entity: {
        type: 'Product',
        id: 'loading',
        name: 'Analyzing Target Site...',
        brand: {
            name: 'AI Cube',
            logo: 'https://placehold.co/100x50?text=Lens'
        },
        seller: {
            name: 'LensCrafter',
            logo: 'https://placehold.co/100x50?text=Scan'
        },
        image: 'https://placehold.co/600x400?text=Analyzing+Site+Structure...',
        description: 'Please wait while the LensCrafter worker extracts semantic structure, commerce data, and cognitive insights from the target URL.'
    },
    commerce: {
        price: { value: null },
        availability: null,
        availabilityText: null,
        financing: { formatted: null }
    },
    features: [
        'Extracting DOM Structure...',
        'Identifying Commerce Intents...',
        'Running Cognitive Analysis...'
    ],
    specifications: {
        'Status': 'Running',
        'Mode': 'Analysis'
    },
    intents: [],
    personaRelevance: {},
    semanticStructure: {
        landmarks: [],
        headings: [{ level: 1, text: 'Analyzing...' }],
        interactiveElements: []
    },
    agentThoughts: [
        'Initializing Request...',
        'Waiting for Worker Response...',
        'This may take 5-10 seconds...'
    ]
};
