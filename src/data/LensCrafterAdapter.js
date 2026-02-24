/**
 * LensCrafterAdapter.js
 * Adapts raw LensCrafter Worker JSON output into the AI Cube KnowledgeGraph format
 */

export const LensCrafterAdapter = {
    adapt(rawJson) {
        return {
            entity: {
                ...rawJson.entity,
                schemaType: rawJson.entity.type === 'Product' ? 'Product' : 'Content',
                // Ensure required fields exist for HumanLens
                brand: {
                    name: rawJson.commerce?.brand || null,
                    logo: 'https://placehold.co/100x50?text=Brand'
                },
                seller: {
                    name: 'LensCrafter Live',
                    logo: 'https://placehold.co/100x50?text=LensCrafter'
                },
                image: rawJson.entity.image || null,
                id: rawJson.entity.id || null
            },
            commerce: {
                price: {
                    value: rawJson.commerce?.price || null,
                    formatted: rawJson.commerce?.price ? `$${rawJson.commerce.price}` : null
                },
                availability: (rawJson.commerce?.availability && rawJson.commerce.availability !== 'Unknown') ? rawJson.commerce.availability : null,
                availabilityText: (rawJson.commerce?.availability && rawJson.commerce.availability !== 'Unknown') ? rawJson.commerce.availability : null,
                financing: { formatted: null },
                ...rawJson.commerce
            },
            features: rawJson.features || [],
            specifications: rawJson.specifications || {},

            // Transform the recursive tree into the flat list expected by BrowserAgentLens
            semanticStructure: {
                nodes: this.flattenTree(rawJson.semanticStructure)
            },

            // Pass through meta + Schema Audit for thoughts
            agentThoughts: this.generateThoughts(rawJson),

            // Content for Crawler Lens
            markdown: this.convertHtmlToMarkdown(rawJson.rawContent || '')
        };
    },

    generateThoughts(rawJson) {
        const thoughts = [
            `Extracted from: ${rawJson.entity.url}`,
            `Mode: ${rawJson.meta.mode}`,
            `Crawled At: ${rawJson.meta.crawledAt}`
        ];

        // Schema Health Check
        const missing = [];
        if (!rawJson.entity.image) missing.push('og:image');
        if (!rawJson.commerce?.brand) missing.push('brand');
        if (!rawJson.commerce?.price) missing.push('price');

        if (missing.length > 0) {
            thoughts.push(`⚠️ Missing Schema: ${missing.join(', ')}`);
        } else {
            thoughts.push('✅ Schema Health: Excellent');
        }

        thoughts.push(`Found ${rawJson.semanticStructure?.children?.length || 0} top-level nodes`);

        // Append AI Suggestions from Worker
        if (rawJson.suggestions && Array.isArray(rawJson.suggestions)) {
            rawJson.suggestions.forEach(s => thoughts.push(`💡 ${s}`));
        }

        return thoughts;
    },

    flattenTree(root, level = 0, flatList = []) {
        if (!root) return flatList;

        // Map LensCrafter roles to Cube types
        const typeMap = {
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

        // Create node
        const node = {
            level: level,
            tag: this.guessTag(root.role, { level: root.level }),
            type: typeMap[root.role] || 'landmark',
            label: root.name,
            text: root.value, // for inputs
            highlight: root.role === 'link' || root.role === 'button' ? 'intent' : null
        };

        flatList.push(node);

        if (root.children) {
            root.children.forEach(child => {
                this.flattenTree(child, level + 1, flatList);
            });
        }

        return flatList;
    },

    guessTag(role, args = {}) {
        const roleToTag = {
            'RootWebArea': 'html',
            'heading': args.level ? `h${args.level}` : 'h2',
            'link': 'a',
            'button': 'button',
            'image': 'img',
            'textbox': 'input',
            'combobox': 'select',
            'list': 'ul',
            'listitem': 'li'
        };
        return roleToTag[role] || 'div';
    },

    convertHtmlToMarkdown(html) {
        if (!html) return '';
        // Basic conversion to avoid heavy dependencies in frontend
        let md = html
            .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
            .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
            .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
            .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
            .replace(/<ul[^>]*>/gi, '')
            .replace(/<\/ul>/gi, '')
            .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
            .replace(/<a[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
            .replace(/<[^>]+>/g, '') // Strip remaining tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
        return md.trim();
    }
};
