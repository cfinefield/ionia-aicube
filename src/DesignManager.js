/**
 * DesignManager.js
 * Manages rendering of AI Rail lens views to cube faces
 */

import { LensManager } from './lenses/LensManager.js';

export class DesignManager {
    constructor(cube) {
        this.cube = cube;
        this.lensManager = new LensManager();
        this.loadingOverlay = document.getElementById('loading-overlay');

        // Event emitter for lens changes
        this.onLensChange = null;
    }

    async loadInitialDesigns() {
        // Show loading state
        this.showLoading();

        // Simulate brief loading
        await this.delay(500);

        // Render all 6 lenses to cube faces
        for (let i = 0; i < 6; i++) {
            this.renderLensToFace(i);
        }

        this.hideLoading();

        // Notify initial lens
        if (this.onLensChange) {
            this.onLensChange(0);
        }
    }

    renderLensToFace(faceIndex) {
        const ctx = this.cube.getFaceContext(faceIndex);
        if (!ctx) return;

        const canvas = this.cube.getFaceCanvas(faceIndex);
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Render the lens
        this.lensManager.renderLens(faceIndex, ctx, width, height);

        // Update texture
        this.cube.refreshFaceTexture(faceIndex);
    }

    /**
     * Get metadata for current lens (for UI panel)
     */
    getLensMetadata(faceIndex) {
        return this.lensManager.getLensMetadata(faceIndex);
    }

    /**
     * Notify when face changes (called by CubeController)
     */
    onFaceChanged(faceIndex) {
        if (this.onLensChange) {
            this.onLensChange(faceIndex);
        }
    }

    showLoading() {
        this.loadingOverlay?.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingOverlay?.classList.add('hidden');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public method to regenerate all lenses
    async regenerateDesigns() {
        await this.loadInitialDesigns();
    }
}
