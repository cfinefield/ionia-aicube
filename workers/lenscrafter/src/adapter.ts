/**
 * LensCrafterAdapter.ts
 * Adapts raw LensCrafter Worker JSON output into the AI Cube KnowledgeGraph format
 * Ported from src/data/LensCrafterAdapter.js
 */

export interface LensCrafterOutput {
    entity: any;
    commerce: any;
    features: string[];
    specifications: any;
    semanticStructure: any;
    meta: any;
}

export const LensCrafterAdapter = {
    adapt(rawJson: LensCrafterOutput) {
        return {
            entity: {
                ...rawJson.entity,
                schemaType: rawJson.entity.type === 'Product' ? 'Product' : 'Content',
                brand: {
                    name: rawJson.commerce?.brand || 'Unknown',
                    logo: 'https://placehold.co/100x50?text=Brand'
                },
                seller: {
                    name: 'LensCrafter Live',
                    logo: 'https://placehold.co/100x50?text=LensCrafter'
                },
                image: rawJson.entity.image || 'https://placehold.co/600x400?text=No+Image',
                id: 'lenscrafter-live'
            },
            commerce: {
                price: {
                    value: rawJson.commerce?.price || 0,
                    formatted: rawJson.commerce?.price ? `$${rawJson.commerce.price}` : 'N/A'
                },
                availability: rawJson.commerce?.availability || 'Unknown',
                availabilityText: rawJson.commerce?.availability || 'Check Site',
                financing: { formatted: 'Financing info not extracted' },
                ...rawJson.commerce
            },
            features: rawJson.features || [],
            specifications: rawJson.specifications || {},

            semanticStructure: {
                nodes: this.flattenTree(rawJson.semanticStructure)
            },

            agentThoughts: this.generateThoughts(rawJson)
        };
    },

    generateThoughts(rawJson: LensCrafterOutput) {
        const thoughts = [
            `Extracted from: ${rawJson.entity.url}`,
            `Mode: ${rawJson.meta.mode}`,
            `Crawled At: ${rawJson.meta.crawledAt}`
        ];

        // Schema Health Check
        const missing: string[] = [];
        if (!rawJson.entity.image) missing.push('og:image');
        if (!rawJson.commerce?.brand) missing.push('brand');
        if (!rawJson.commerce?.price) missing.push('price');

        if (missing.length > 0) {
            thoughts.push(`⚠️ Missing Schema: ${missing.join(', ')}`);
        } else {
            thoughts.push('✅ Schema Health: Excellent');
        }

        thoughts.push(`Found ${rawJson.semanticStructure?.children?.length || 0} top-level nodes`);
        return thoughts;
    },

    flattenTree(root: any, level = 0, flatList: any[] = []): any[] {
        if (!root) return flatList;

        const typeMap: Record<string, string> = {
            'RootWebArea': 'root',
            'link': 'interactive',
            'button': 'interactive',
            'heading': 'heading',
            'image': 'media',
            'textbox': 'input',
            'combobox': 'input',
            'article': 'content',
            'section': 'content'
        };

        const node = {
            level: level,
            tag: this.guessTag(root.role),
            type: typeMap[root.role] || 'landmark',
            label: root.name,
            text: root.value,
            highlight: root.role === 'link' || root.role === 'button' ? 'intent' : null
        };

        flatList.push(node);

        if (root.children) {
            root.children.forEach((child: any) => {
                this.flattenTree(child, level + 1, flatList);
            });
        }

        return flatList;
    },

    guessTag(role: string): string {
        const roleToTag: Record<string, string> = {
            'RootWebArea': 'html',
            'heading': 'h1',
            'link': 'a',
            'button': 'button',
            'image': 'img',
            'textbox': 'input',
            'combobox': 'select',
            'list': 'ul',
            'listitem': 'li'
        };
        return roleToTag[role] || 'div';
    }
};
