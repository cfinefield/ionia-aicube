/**
 * LensManager.js
 * Orchestrates rendering of all lens views to cube faces
 */

import { productData, lensMetadata } from '../data/KnowledgeGraph.js';
import { HumanLens } from './HumanLens.js';
import { BrowserAgentLens } from './BrowserAgentLens.js';
import { CrawlerLens } from './CrawlerLens.js';
import { TransactionLens } from './TransactionLens.js';
import { PersonaLens } from './PersonaLens.js';
import { ActionLens } from './ActionLens.js';

export class LensManager {
    constructor() {
        this.lenses = {
            0: new HumanLens(),
            1: new BrowserAgentLens(),
            2: new CrawlerLens(),
            3: new TransactionLens(),
            4: new PersonaLens(),
            5: new ActionLens()
        };

        this.metadata = lensMetadata;
        this.data = productData;
    }

    /**
     * Render a specific lens to a canvas context
     */
    renderLens(faceIndex, ctx, width, height) {
        const lens = this.lenses[faceIndex];
        if (lens) {
            lens.render(ctx, width, height, this.data);
        }
    }

    /**
     * Get metadata for a specific lens (for UI panel)
     */
    getLensMetadata(faceIndex) {
        return this.metadata[faceIndex] || null;
    }

    /**
     * Get all lens names for UI
     */
    getAllLensNames() {
        return Object.values(this.metadata).map(m => ({
            id: m.id,
            name: m.name,
            icon: m.icon
        }));
    }
}
