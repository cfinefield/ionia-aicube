import { CSSCube } from './CSSCube.js';
import { lensMetadata, products } from './data/KnowledgeGraph.js';
import { airailLive } from './data/AirailLive.js';
import { LensCrafterAdapter } from './data/LensCrafterAdapter.js';
import { loadingState } from './data/LoadingState.js';

// Inject live data
products['airail_live'] = airailLive;

class App {
  constructor() {
    this.container = document.getElementById('app');
    this.setupCube();
    this.setupLensPanel();
    this.setupFaceIndicatorClicks();
    this.setupOverlayToggles();
    this.setupProductToggles();
    this.setupPersonaToggles();
    this.setupSearch();

    // State tracking
    this.currentProductId = 'airail_live';
    this.currentFace = 0;

    // Check for query params (URL Analysis Mode)
    const urlParams = new URLSearchParams(window.location.search);
    const targetUrl = urlParams.get('url');

    if (targetUrl) {
      // Normalize URL (ensure protocol) so we can support cleaner ?url=domain.com
      const fullUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
      this.loadDynamicUrl(fullUrl);
    } else {
      // Initial load (default)
      this.cube.loadProduct(products[this.currentProductId], this.currentProductId);
      this.updateLensPanel(0);
    }
  }

  async loadDynamicUrl(url) {
    console.log(`Analyzing: ${url}`);
    try {
      // Show loading state
      // Show loading state
      document.getElementById('lens-description').textContent = "Analyzing site structure...";

      // Load visual loading state into the Cube
      this.cube.loadProduct(loadingState, 'loading');
      this.updateLensPanel(this.currentFace); // update panel to show "Analyzing..." thoughts


      // Call Worker
      const response = await fetch('https://lenscrafter.ai-rail-account.workers.dev/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store', // Force fresh fetch
        body: JSON.stringify({ url, mode: 'audit', options: { render_js: true } }) // simplified options
      });

      if (!response.ok) throw new Error('Extraction failed');

      const data = await response.json();

      // Adapt using the same adapter logic (we'd need equality in JS/Worker)
      // For now, assume data relies on LensCrafterAdapter.js in src/data being compatible
      // But wait, the Worker returns 'knowledgeGraph' already structured?
      // Let's check LensCrafterAdapter.js locally. It expects raw worker output?
      // The worker NOW returns the KnowledgeGraph directly (via extractUrl).
      // So we might not need local adaptation if the worker does it.
      // BUT `AirailLive.js` uses `LensCrafterAdapter.adapt(rawData)`.
      // If the worker returns the *Adapted* KnowledgeGraph, we can use it directly.
      // Looking at worker index.js: `extractUrl` returns `knowledgeGraph`.
      // Looking at `LensCrafterAdapter.js`: `adapt(rawJson)`...

      // Let's assume the worker output is close enough or use the adapter if needed.
      // For safety, let's just use the data returned as-is if it matches the shape, 
      // or run it through the local adapter if it's "raw".
      // The worker returns `knowledgeGraph` which has `entity`, `commerce`, `features` etc.
      // This IS the adapted format the Cube expects.

      // Adapt raw worker output to internal KnowledgeGraph format
      const adaptedData = LensCrafterAdapter.adapt(data);
      adaptedData.entity.url = url; // Store URL for Human Lens iframe
      products['airail_live'] = adaptedData;

      // Enforce Schema Type for correct view
      products['airail_live'].entity.schemaType = data.entity.type === 'Product' ? 'Product' : 'Content';

      this.cube.loadProduct(products['airail_live'], 'airail_live');
      this.updateLensPanel(0);

      // Update UI to show we are on Airail Live
      // Update UI to show we are on Airail Live
      const productBtn = document.querySelector('[data-product="airail_live"]');
      if (productBtn) productBtn.click();

    } catch (e) {
      console.error(e);
      document.getElementById('lens-description').textContent = 'Analysis Error: ' + e.message;

      // Load error state into cube so we see something
      const errorState = { ...loadingState };
      errorState.entity = {
        ...loadingState.entity,
        id: 'error',
        name: 'Analysis Failed',
        description: `Could not analyze ${url}. Error: ${e.message}`,
        url: url // Pass URL so we can maybe show the browser view with error
      };
      // Ensure we have features to prevent crashes
      if (!errorState.features) errorState.features = [];

      this.cube.loadProduct(errorState, 'error');
      // alert('Failed to analyze URL: ' + e.message); // Disable alert, rely on UI
    }
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

  setupSearch() {
    const input = document.getElementById('url-input');
    const btn = document.getElementById('url-submit');

    if (btn && input) {
      const handleSearch = () => {
        const url = input.value.trim();
        if (url) {
          // Add protocol if missing
          const fullUrl = url.startsWith('http') ? url : `https://${url}`;
          // Update URL param without reload
          const newUrl = new URL(window.location);
          newUrl.searchParams.set('url', url);
          window.history.pushState({}, '', newUrl);

          this.loadDynamicUrl(fullUrl);
        }
      };

      btn.addEventListener('click', handleSearch);

      // Allow Enter key
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleSearch();
        }
      });
    }
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

    if (thoughtsList) {
      let thoughts = [];

      // 1. Check for Dynamic Thoughts on the Product itself (High Priority)
      const currentProduct = products[this.currentProductId];
      if (currentProduct && currentProduct.agentThoughts && Array.isArray(currentProduct.agentThoughts)) {
        thoughts = currentProduct.agentThoughts;
      }
      // 2. Fallback to Static Metadata (Lens-specific)
      else if (metadata && metadata.agentThoughts) {
        thoughts = Array.isArray(metadata.agentThoughts)
          ? metadata.agentThoughts
          : metadata.agentThoughts[this.currentProductId] || metadata.agentThoughts['sweetwater'];
      }

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

// Initialize app robustly
function initApp() {
  // Check if window.app is missing OR if it's just the HTML element (id="app")
  if (!window.app || window.app instanceof Element) {
    window.app = new App();
    console.log('App initialized');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
