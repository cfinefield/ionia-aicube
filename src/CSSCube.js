/**
 * CSSCube.js
 * Lightweight CSS 3D cube using transform-style: preserve-3d
 * With pinch-to-zoom expanded view and toggleable lens overlays
 */

import Hammer from 'hammerjs';
import { LensManager } from './lenses/LensManager.js';
import { lensMetadata } from './data/KnowledgeGraph.js';

export class CSSCube {
    constructor(container) {
        this.container = container;
        this.currentFace = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.isAnimating = false;
        this.isZoomed = false;
        this.loadedProductId = 'sweetwater';
        this.personaMode = 'generic'; // Default to generic

        // Lens overlay state
        this.overlays = {
            persona: false,
            intent: false
        };

        this.lensManager = new LensManager();

        // Only 4 horizontal faces (no top/bottom)
        this.faceRotations = [
            { x: 0, y: 0 },        // Front (0) - Human Visitor
            { x: 0, y: -90 },      // Right (1) - Browser Agent
            { x: 0, y: -180 },     // Back (2) - Crawler/Learner
            { x: 0, y: 90 },       // Left (3) - Transaction API
        ];

        // Metadata for the 4 content tiers
        this.contentTiers = [
            { id: 'human', name: 'Human Visitor', format: 'Full HTML/CSS/JS', icon: '👤' },
            { id: 'browser-agent', name: 'Browser Agent', format: 'Semantic HTML', icon: '🤖' },
            { id: 'crawler', name: 'Crawler Readiness', format: 'Native Markdown evidence', icon: '📚' },
            { id: 'transaction', name: 'Transactional Agent', format: 'JSON API', icon: '💳' },
        ];

        this.onFaceChange = null;
        this.onOverlayChange = null;

        this.createCube();
        this.createExpandedView();
        this.setupInteraction();
        this.renderAllFaces();
        this.updateRotation();
    }

    setPersonaMode(mode) {
        if (mode === 'generic' || mode === 'targeted') {
            this.personaMode = mode;
            this.renderAllFaces();
        }
    }

    setupCube() {
        // Create scene (perspective container)
        this.scene = document.createElement('div');
        this.scene.className = 'cube-scene';

        // Create cube
        this.cube = document.createElement('div');
        this.cube.className = 'cube';

        // Create only 4 faces (horizontal)
        const faceNames = ['front', 'right', 'back', 'left'];
        this.faces = [];

        faceNames.forEach((name, index) => {
            const face = document.createElement('div');
            face.className = `cube__face cube__face--${name}`;
            face.dataset.lens = index;
            // Handle potentially undefined contentTiers if not yet fully inited, though usually it is
            if (this.contentTiers && this.contentTiers[index]) {
                face.dataset.tier = this.contentTiers[index].id;
            }

            // Inner content wrapper
            const content = document.createElement('div');
            content.className = 'lens-content';
            face.appendChild(content);

            this.faces.push({ element: face, content });
            this.cube.appendChild(face);
        });

        this.scene.appendChild(this.cube);
        this.container.appendChild(this.scene);
    }

    createCube() {
        this.setupCube();
    }

    createExpandedView() {
        // Create expanded overlay for zoomed-in view
        this.expandedOverlay = document.createElement('div');
        this.expandedOverlay.className = 'expanded-overlay';
        this.expandedOverlay.innerHTML = `
            <div class="expanded-container">
                <div class="expanded-header">
                    <span class="expanded-title"></span>
                    <button class="expanded-close">✕</button>
                </div>
                <div class="expanded-content"></div>
            </div>
        `;

        this.container.appendChild(this.expandedOverlay);

        // Close button handler
        this.expandedOverlay.querySelector('.expanded-close').addEventListener('click', () => {
            this.zoomOut();
        });

        // Click outside to close
        this.expandedOverlay.addEventListener('click', (e) => {
            if (e.target === this.expandedOverlay) {
                this.zoomOut();
            }
        });
    }

    renderAllFaces() {
        this.faces.forEach((face, index) => {
            const html = this.lensManager.renderLens(index, this.personaMode);
            face.content.innerHTML = html;
        });

        // Re-apply overlays if active
        this.applyOverlays();
    }

    loadProduct(productData, productId) {
        this.loadedProductId = productId;
        this.lensManager.setData(productData);
        this.renderAllFaces();

        // Update expanded view if open
        if (this.isZoomed) {
            const expandedContent = this.expandedOverlay.querySelector('.expanded-content');
            const currentFace = this.faces[this.currentFace];
            expandedContent.innerHTML = currentFace.content.innerHTML;
            this.applyOverlays();
        }
    }

    setupInteraction() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Escape to close expanded view
            if (e.key === 'Escape' && this.isZoomed) {
                this.zoomOut();
                return;
            }

            // Spacebar to toggle zoom
            if (e.key === ' ') {
                e.preventDefault();
                this.toggleZoom();
                return;
            }

            if (this.isAnimating) return;

            switch (e.key) {
                case 'ArrowRight':
                    if (!this.isZoomed) this.navigate('right');
                    break;
                case 'ArrowLeft':
                    if (!this.isZoomed) this.navigate('left');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.toggleOverlay('persona');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.toggleOverlay('intent');
                    break;
            }
        });

        // Touch/swipe and pinch support via Hammer.js
        this.setupGestures();

        // Mouse wheel for zoom
        this.setupMouseWheel();

        // Mouse drag for rotation
        this.setupMouseDrag();
    }

    setupGestures() {
        this.hammer = new Hammer(this.scene);

        // Enable pinch
        this.hammer.get('pinch').set({ enable: true });

        // Swipe for navigation (only left/right)
        this.hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });

        this.hammer.on('swipeleft', () => {
            if (!this.isAnimating && !this.isZoomed) this.navigate('right');
        });

        this.hammer.on('swiperight', () => {
            if (!this.isAnimating && !this.isZoomed) this.navigate('left');
        });

        // Pinch for zoom
        let startScale = 1;

        this.hammer.on('pinchstart', () => {
            startScale = this.isZoomed ? 0.5 : 1;
        });

        this.hammer.on('pinch', (e) => {
            if (e.scale > 1.3 * startScale && !this.isZoomed) {
                this.zoomIn();
            } else if (e.scale < 0.7 * startScale && this.isZoomed) {
                this.zoomOut();
            }
        });

        // Double tap to toggle zoom
        this.hammer.on('doubletap', () => {
            this.toggleZoom();
        });
    }

    setupMouseWheel() {
        this.scene.addEventListener('wheel', (e) => {
            e.preventDefault();

            // Scroll down = zoom in, scroll up = zoom out
            if (e.deltaY > 30 && !this.isZoomed) {
                this.zoomIn();
            } else if (e.deltaY < -30 && this.isZoomed) {
                this.zoomOut();
            }
        }, { passive: false });
    }

    setupMouseDrag() {
        let isDragging = false;
        let lastX = 0;

        this.scene.addEventListener('mousedown', (e) => {
            if (this.isZoomed) return;
            isDragging = true;
            lastX = e.clientX;
            this.scene.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging || this.isZoomed) return;

            const deltaX = e.clientX - lastX;

            // Only horizontal rotation
            this.rotationY -= deltaX * 0.5;

            this.cube.style.transform = `rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg)`;

            lastX = e.clientX;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.scene.style.cursor = 'grab';
                this.snapToNearestFace();
            }
        });
    }

    // Lens overlay toggle
    toggleOverlay(overlayType) {
        if (overlayType === 'persona' || overlayType === 'intent') {
            this.overlays[overlayType] = !this.overlays[overlayType];
            this.applyOverlays();

            if (this.onOverlayChange) {
                this.onOverlayChange(this.overlays);
            }
        }
    }

    setOverlay(overlayType, active) {
        if (overlayType === 'persona' || overlayType === 'intent') {
            this.overlays[overlayType] = active;
            this.applyOverlays();

            if (this.onOverlayChange) {
                this.onOverlayChange(this.overlays);
            }
        }
    }

    applyOverlays() {
        // Apply overlay classes to all faces
        this.faces.forEach((face) => {
            const content = face.content;

            // Find all highlightable elements
            const personaElements = content.querySelectorAll('[data-highlight-persona]');
            const intentElements = content.querySelectorAll('[data-highlight-intent]');

            // Toggle persona highlights
            personaElements.forEach(el => {
                if (this.overlays.persona) {
                    if (!el.hasAttribute('data-lens-label')) {
                        el.setAttribute('data-lens-label', 'Relevance');
                    }
                    el.classList.add('lens-highlight', 'lens-highlight--persona');
                } else {
                    el.classList.remove('lens-highlight', 'lens-highlight--persona');
                }
            });

            // Toggle intent highlights
            intentElements.forEach(el => {
                if (this.overlays.intent) {
                    if (!el.hasAttribute('data-lens-label')) {
                        el.setAttribute('data-lens-label', 'Action');
                    }
                    el.classList.add('lens-highlight', 'lens-highlight--action');
                } else {
                    el.classList.remove('lens-highlight', 'lens-highlight--action');
                }
            });
        });

        // Also apply to expanded view if open
        if (this.isZoomed) {
            const expandedContent = this.expandedOverlay.querySelector('.expanded-content');
            const personaElements = expandedContent.querySelectorAll('[data-highlight-persona]');
            const intentElements = expandedContent.querySelectorAll('[data-highlight-intent]');

            personaElements.forEach(el => {
                if (this.overlays.persona) {
                    el.classList.add('lens-highlight', 'lens-highlight--persona');
                } else {
                    el.classList.remove('lens-highlight', 'lens-highlight--persona');
                }
            });

            intentElements.forEach(el => {
                if (this.overlays.intent) {
                    el.classList.add('lens-highlight', 'lens-highlight--action');
                } else {
                    el.classList.remove('lens-highlight', 'lens-highlight--action');
                }
            });
        }

        // Update body classes for global styling
        document.body.classList.toggle('overlay-persona-active', this.overlays.persona);
        document.body.classList.toggle('overlay-intent-active', this.overlays.intent);
    }

    toggleZoom() {
        if (this.isZoomed) {
            this.zoomOut();
        } else {
            this.zoomIn();
        }
    }

    zoomIn() {
        if (this.isZoomed) return;

        this.isZoomed = true;

        // Get current face content and tier info
        const currentFace = this.faces[this.currentFace];
        const tier = this.contentTiers[this.currentFace];

        // Populate expanded view
        const expandedTitle = this.expandedOverlay.querySelector('.expanded-title');
        const expandedContent = this.expandedOverlay.querySelector('.expanded-content');

        expandedTitle.textContent = `${tier.icon} ${tier.name}`;
        expandedContent.innerHTML = currentFace.content.innerHTML;

        // Show expanded overlay
        this.expandedOverlay.classList.add('active');
        document.body.classList.add('zoomed-in');

        // Reapply overlays to expanded content
        this.applyOverlays();
    }

    zoomOut() {
        if (!this.isZoomed) return;

        this.isZoomed = false;
        this.expandedOverlay.classList.remove('active');
        document.body.classList.remove('zoomed-in');
    }

    navigate(direction) {
        if (this.isZoomed) return;

        // Simple horizontal navigation between 4 faces
        const transitions = {
            0: { right: 1, left: 3 },    // Front → Right or Left
            1: { right: 2, left: 0 },    // Right → Back or Front
            2: { right: 3, left: 1 },    // Back → Left or Right
            3: { right: 0, left: 2 },    // Left → Front or Back
        };

        const nextFace = transitions[this.currentFace]?.[direction];
        if (nextFace !== undefined) {
            this.goToFace(nextFace);
        }
    }

    goToFace(faceIndex) {
        if (faceIndex === this.currentFace || this.isAnimating) return;

        this.isAnimating = true;
        this.currentFace = faceIndex;

        const target = this.faceRotations[faceIndex];
        this.rotationX = target.x;
        this.rotationY = target.y;

        this.updateRotation();

        // Trigger face change callback
        if (this.onFaceChange) {
            this.onFaceChange(faceIndex);
        }

        // Update face indicator dots
        this.updateFaceIndicator(faceIndex);

        setTimeout(() => {
            this.isAnimating = false;
        }, 600);
    }

    snapToNearestFace() {
        // Find the closest face based on current rotation
        let closestFace = 0;
        let closestDistance = Infinity;

        this.faceRotations.forEach((rot, index) => {
            const dy = ((this.rotationY - rot.y + 180) % 360) - 180;
            const distance = Math.abs(dy);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestFace = index;
            }
        });

        this.goToFace(closestFace);
    }

    updateRotation() {
        this.cube.style.transform = `rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg)`;
    }

    updateFaceIndicator(index) {
        const dots = document.querySelectorAll('.face-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    getContentTier(faceIndex) {
        return this.contentTiers[faceIndex] || null;
    }

    getOverlayState() {
        return { ...this.overlays };
    }
}
