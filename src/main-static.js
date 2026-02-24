import { CSSCube } from './CSSCube.js';
import { lensMetadata, products } from './data/KnowledgeGraph.js';

class App {
  constructor() {
    this.container = document.getElementById('app');
    this.setupCube();
    this.setupLensPanel();
    this.setupFaceIndicatorClicks();
    this.setupOverlayToggles();
    this.setupProductToggles();
    this.setupPersonaToggles();

    // State tracking
    this.currentProductId = 'sweetwater';
    this.currentFace = 0;

    // Initial panel update
    this.updateLensPanel(0);
  }

  setupCube() {
    this.cube = new CSSCube(this.container);

    // Wire up face change events
    this.cube.onFaceChange = (faceIndex) => {
      this.currentFace = faceIndex;
      this.updateLensPanel(faceIndex);
    };

    // Wire up overlay change events
    this.cube.onOverlayChange = (overlays) => {
      this.updateOverlayIndicators(overlays);
    };

    // Expose switchProduct for testing/demo
    window.switchProduct = (productId) => {
      if (products[productId]) {
        this.currentProductId = productId;
        console.log(`Switching to product: ${productId}`);
        this.cube.loadProduct(products[productId], productId);
        this.updateLensPanel(this.currentFace);
      } else {
        console.error(`Product not found: ${productId}. Available: ${Object.keys(products).join(', ')}`);
      }
    };
  }

  setupLensPanel() {
    this.panelElements = {
      icon: document.getElementById('lens-icon'),
      title: document.getElementById('lens-title'),
      tier: document.getElementById('lens-tier'),
      format: document.getElementById('lens-format'),
      description: document.getElementById('lens-description'),
      thoughtsList: document.getElementById('agent-thoughts-list'),
      personaState: document.getElementById('persona-state'),
      intentState: document.getElementById('intent-state')
    };
  }

  setupFaceIndicatorClicks() {
    const dots = document.querySelectorAll('.face-dot');
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.cube.goToFace(index);
      });
    });
  }

  setupOverlayToggles() {
    // Make overlay toggles clickable
    const personaToggle = document.getElementById('persona-toggle');
    const intentToggle = document.getElementById('intent-toggle');

    if (personaToggle) {
      personaToggle.addEventListener('click', () => {
        this.cube.toggleOverlay('persona');
      });
    }

    if (intentToggle) {
      intentToggle.addEventListener('click', () => {
        this.cube.toggleOverlay('intent');
      });
    }
  }

  setupProductToggles() {
    const toggles = document.querySelectorAll('.product-btn');
    toggles.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.dataset.product;
        if (!products[productId]) return;

        // Update active state
        toggles.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');

        // Switch data
        this.currentProductId = productId;
        console.log(`Switching to product: ${productId}`);
        this.cube.loadProduct(products[productId], productId);
        this.updateLensPanel(this.currentFace);
      });
    });
  }

  setupPersonaToggles() {
    const toggles = document.querySelectorAll('.persona-btn');
    toggles.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.target.dataset.mode;

        // Update active state
        toggles.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');

        // Switch persona mode
        console.log(`Switching persona mode to: ${mode}`);
        this.cube.setPersonaMode(mode);
      });
    });
  }

  updateLensPanel(faceIndex) {
    // Use the content tier info from the cube
    const tier = this.cube.getContentTier(faceIndex);
    if (!tier) return;

    // Also get the lens metadata for agent thoughts
    const metadata = lensMetadata[faceIndex];

    const { icon, title, tier: tierEl, format, description, thoughtsList } = this.panelElements;

    if (icon) icon.textContent = tier.icon;
    if (title) title.textContent = tier.name;
    if (tierEl) tierEl.textContent = tier.format;
    if (format) format.textContent = tier.format;

    // Description based on tier
    const descriptions = {
      'human': 'Gets the full, rich, visually designed website for persuasion and branding.',
      'browser-agent': 'Gets a simplified but interactive page for reliable navigation and form filling.',
      'crawler': 'Gets a lightweight, narrative file to efficiently understand and index content.',
      'transaction': 'Interacts with a pure data API to perform actions with 100% precision.'
    };
    if (description) description.textContent = descriptions[tier.id] || '';

    if (thoughtsList && metadata && metadata.agentThoughts) {
      // Handle both array (legacy/generic) and object (product-specific) formats
      const thoughts = Array.isArray(metadata.agentThoughts)
        ? metadata.agentThoughts
        : metadata.agentThoughts[this.currentProductId] || metadata.agentThoughts['sweetwater'];

      thoughtsList.innerHTML = thoughts
        .map(thought => `<li>${thought}</li>`)
        .join('');
    }
  }

  updateOverlayIndicators(overlays) {
    const { personaState, intentState } = this.panelElements;

    if (personaState) {
      personaState.textContent = overlays.persona ? 'ON' : 'OFF';
      personaState.classList.toggle('active', overlays.persona);
    }

    if (intentState) {
      intentState.textContent = overlays.intent ? 'ON' : 'OFF';
      intentState.classList.toggle('active', overlays.intent);
    }

    // Also update sidebar toggle styling
    const personaToggle = document.getElementById('persona-toggle');
    const intentToggle = document.getElementById('intent-toggle');

    if (personaToggle) personaToggle.classList.toggle('active', overlays.persona);
    if (intentToggle) intentToggle.classList.toggle('active', overlays.intent);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
