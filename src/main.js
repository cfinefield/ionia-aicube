import './style.css';
import * as THREE from 'three';
import { Cube } from './Cube.js';
import { LiquidBackground } from './LiquidBackground.js';
import { CubeController } from './CubeController.js';
import { DesignManager } from './DesignManager.js';

class App {
  constructor() {
    this.canvas = document.getElementById('cube-canvas');
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    this.setupCamera();
    this.setupRenderer();
    this.setupLights();
    this.setupBackground();
    this.setupCube();
    this.setupController();
    this.setupDesigns();
    this.setupLensPanel();

    window.addEventListener('resize', this.onResize.bind(this));
    this.onResize();

    this.animate();
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;
    this.baseZoom = 5;
    this.zoomedZoom = 2.2;
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  setupLights() {
    // Ambient light for base illumination
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);

    // Key light - main illumination
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 5, 5);
    this.scene.add(keyLight);

    // Fill light - soften shadows
    const fillLight = new THREE.DirectionalLight(0x9089E2, 0.5);
    fillLight.position.set(-5, 2, 3);
    this.scene.add(fillLight);

    // Rim light - edge highlight
    const rimLight = new THREE.DirectionalLight(0x4743EF, 0.8);
    rimLight.position.set(0, -5, -5);
    this.scene.add(rimLight);

    // Top accent light
    const topLight = new THREE.PointLight(0x0017E9, 0.6, 10);
    topLight.position.set(0, 4, 0);
    this.scene.add(topLight);
  }

  setupBackground() {
    this.background = new LiquidBackground(this.renderer, this.scene);
  }

  setupCube() {
    this.cube = new Cube();
    this.scene.add(this.cube.group);
  }

  setupController() {
    this.controller = new CubeController(this.cube, this.camera, this);
  }

  setupDesigns() {
    this.designManager = new DesignManager(this.cube);

    // Wire up lens change notifications
    this.designManager.onLensChange = (faceIndex) => {
      this.updateLensPanel(faceIndex);
    };

    this.designManager.loadInitialDesigns();
  }

  setupLensPanel() {
    // Cache panel elements
    this.panelElements = {
      icon: document.getElementById('lens-icon'),
      title: document.getElementById('lens-title'),
      tier: document.getElementById('lens-tier'),
      format: document.getElementById('lens-format'),
      description: document.getElementById('lens-description'),
      thoughtsList: document.getElementById('agent-thoughts-list')
    };
  }

  updateLensPanel(faceIndex) {
    const metadata = this.designManager.getLensMetadata(faceIndex);
    if (!metadata) return;

    const { icon, title, tier, format, description, thoughtsList } = this.panelElements;

    // Update panel content
    if (icon) icon.textContent = metadata.icon;
    if (title) title.textContent = metadata.name;
    if (tier) tier.textContent = typeof metadata.tier === 'number' ? `Tier ${metadata.tier}` : metadata.tier;
    if (format) format.textContent = metadata.format;
    if (description) description.textContent = metadata.description;

    // Update agent thoughts
    if (thoughtsList && metadata.agentThoughts) {
      thoughtsList.innerHTML = metadata.agentThoughts
        .map(thought => `<li>${thought}</li>`)
        .join('');
    }
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);

    if (this.background) {
      this.background.onResize(width, height);
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // Update background
    if (this.background) {
      this.background.update(elapsed);
    }

    // Update cube
    if (this.cube) {
      this.cube.update(elapsed, delta);
    }

    // Update controller animations
    if (this.controller) {
      this.controller.update(delta);
    }

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  updateFaceIndicator(index) {
    const dots = document.querySelectorAll('.face-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    // Also update the lens panel
    this.updateLensPanel(index);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
