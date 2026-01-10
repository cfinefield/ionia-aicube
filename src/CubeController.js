import Hammer from 'hammerjs';

export class CubeController {
    constructor(cube, camera, app) {
        this.cube = cube;
        this.camera = camera;
        this.app = app;

        // Rotation state
        this.targetRotation = { x: 0, y: 0 };
        this.currentRotation = { x: 0, y: 0 };
        this.isAnimating = false;
        this.rotationQueue = [];

        // Zoom state
        this.isZoomed = false;
        this.targetZoom = app.baseZoom;
        this.currentZoom = app.baseZoom;
        this.zoomAnimating = false;

        // Face tracking - all 6 faces for AI Rail lenses
        this.activeFaceIndex = 0;
        this.totalFaces = 6;

        // Animation settings
        this.rotationDuration = 600; // ms
        this.zoomDuration = 400; // ms
        this.rotationStartTime = 0;
        this.zoomStartTime = 0;

        // Easing functions
        this.easeOutBack = (t) => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        };

        this.easeInOutCubic = (t) => {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        this.setupKeyboard();
        this.setupGestures();
        this.setupMouseWheel();
    }

    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (this.isAnimating) {
                // Queue rotation if already animating
                this.rotationQueue.push(e.key);
                return;
            }

            switch (e.key) {
                case 'ArrowLeft':
                    this.rotateY(-1);
                    break;
                case 'ArrowRight':
                    this.rotateY(1);
                    break;
                case 'ArrowUp':
                    this.rotateX(-1);
                    break;
                case 'ArrowDown':
                    this.rotateX(1);
                    break;
                case ' ': // Spacebar to toggle zoom
                    e.preventDefault();
                    this.toggleZoom();
                    break;
            }
        });
    }

    setupGestures() {
        const canvas = document.getElementById('cube-canvas');
        this.hammer = new Hammer(canvas);

        // Enable pinch gesture
        this.hammer.get('pinch').set({ enable: true });

        // Swipe for navigation on mobile
        this.hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

        this.hammer.on('swipeleft', () => {
            if (!this.isAnimating) this.rotateY(1);
        });

        this.hammer.on('swiperight', () => {
            if (!this.isAnimating) this.rotateY(-1);
        });

        this.hammer.on('swipeup', () => {
            if (!this.isAnimating) this.rotateX(-1);
        });

        this.hammer.on('swipedown', () => {
            if (!this.isAnimating) this.rotateX(1);
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
        const canvas = document.getElementById('cube-canvas');

        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();

            if (this.zoomAnimating) return;

            // Scroll down = zoom in, scroll up = zoom out
            if (e.deltaY > 30 && !this.isZoomed) {
                this.zoomIn();
            } else if (e.deltaY < -30 && this.isZoomed) {
                this.zoomOut();
            }
        }, { passive: false });
    }

    rotateY(direction) {
        this.isAnimating = true;
        this.rotationStartTime = performance.now();

        this.startRotation = { ...this.currentRotation };
        this.targetRotation.y = this.currentRotation.y + (Math.PI / 2) * direction;

        // Update active face index for indicator
        this.updateActiveFace(direction, 'y');
    }

    rotateX(direction) {
        this.isAnimating = true;
        this.rotationStartTime = performance.now();

        this.startRotation = { ...this.currentRotation };
        this.targetRotation.x = this.currentRotation.x + (Math.PI / 2) * direction;

        this.updateActiveFace(direction, 'x');
    }

    updateActiveFace(direction, axis) {
        // Track which face is currently visible
        // Y-axis rotation cycles through: Front(0) -> Right(1) -> Back(2) -> Left(3)
        // X-axis rotation shows: Top(4) or Bottom(5)
        if (axis === 'y') {
            // Horizontal rotation - cycle through faces 0-3
            const horizontalFaces = [0, 1, 2, 3];
            let currentHIdx = horizontalFaces.indexOf(this.activeFaceIndex);
            if (currentHIdx === -1) currentHIdx = 0;
            currentHIdx = (currentHIdx + direction + 4) % 4;
            this.activeFaceIndex = horizontalFaces[currentHIdx];
        } else if (axis === 'x') {
            // Vertical rotation
            if (direction < 0) {
                // Rotating up - show top face
                this.activeFaceIndex = 4;
            } else {
                // Rotating down - show bottom face  
                this.activeFaceIndex = 5;
            }
        }

        this.app.updateFaceIndicator(this.activeFaceIndex);
    }

    toggleZoom() {
        if (this.isZoomed) {
            this.zoomOut();
        } else {
            this.zoomIn();
        }
    }

    zoomIn() {
        if (this.zoomAnimating || this.isZoomed) return;

        this.isZoomed = true;
        this.zoomAnimating = true;
        this.zoomStartTime = performance.now();
        this.startZoom = this.currentZoom;
        this.targetZoom = this.app.zoomedZoom;

        document.body.classList.add('zoomed-in');
    }

    zoomOut() {
        if (this.zoomAnimating || !this.isZoomed) return;

        this.isZoomed = false;
        this.zoomAnimating = true;
        this.zoomStartTime = performance.now();
        this.startZoom = this.currentZoom;
        this.targetZoom = this.app.baseZoom;

        document.body.classList.remove('zoomed-in');
    }

    update(delta) {
        const now = performance.now();

        // Update rotation animation
        if (this.isAnimating) {
            const elapsed = now - this.rotationStartTime;
            const progress = Math.min(elapsed / this.rotationDuration, 1);
            const eased = this.easeOutBack(progress);

            this.currentRotation.x = this.startRotation.x +
                (this.targetRotation.x - this.startRotation.x) * eased;
            this.currentRotation.y = this.startRotation.y +
                (this.targetRotation.y - this.startRotation.y) * eased;

            this.cube.group.rotation.x = this.currentRotation.x;
            this.cube.group.rotation.y = this.currentRotation.y;

            if (progress >= 1) {
                this.isAnimating = false;
                this.currentRotation.x = this.targetRotation.x;
                this.currentRotation.y = this.targetRotation.y;

                // Process queued rotations
                if (this.rotationQueue.length > 0) {
                    const nextKey = this.rotationQueue.shift();
                    window.dispatchEvent(new KeyboardEvent('keydown', { key: nextKey }));
                }
            }
        }

        // Update zoom animation
        if (this.zoomAnimating) {
            const elapsed = now - this.zoomStartTime;
            const progress = Math.min(elapsed / this.zoomDuration, 1);
            const eased = this.easeInOutCubic(progress);

            this.currentZoom = this.startZoom + (this.targetZoom - this.startZoom) * eased;
            this.camera.position.z = this.currentZoom;

            if (progress >= 1) {
                this.zoomAnimating = false;
                this.currentZoom = this.targetZoom;
            }
        }
    }
}
