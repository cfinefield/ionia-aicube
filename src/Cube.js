import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export class Cube {
    constructor() {
        this.group = new THREE.Group();
        this.currentFaceIndex = 0;
        this.faceRotations = [
            { x: 0, y: 0 },           // Front face (0)
            { x: 0, y: Math.PI / 2 }, // Right face (1)
            { x: 0, y: Math.PI },     // Back face (2)
            { x: 0, y: -Math.PI / 2 },// Left face (3)
            { x: -Math.PI / 2, y: 0 },// Top face (4)
            { x: Math.PI / 2, y: 0 }, // Bottom face (5)
        ];

        this.createCube();
        this.createInnerGlow();
        this.createEdgeHighlights();
    }

    createCube() {
        // Outer glossy cube with rounded edges
        const geometry = new RoundedBoxGeometry(2, 2, 2, 6, 0.15);

        // Glass-like physical material
        this.material = new THREE.MeshPhysicalMaterial({
            color: 0x1a1a3e,
            metalness: 0.1,
            roughness: 0.05,
            transmission: 0.6,
            thickness: 0.5,
            ior: 1.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            reflectivity: 1,
            envMapIntensity: 1.5,
            transparent: true,
            opacity: 0.9,
            side: THREE.FrontSide,
        });

        this.outerMesh = new THREE.Mesh(geometry, this.material);
        this.group.add(this.outerMesh);

        // Create face textures (will be updated with designs)
        this.faceTextures = [];
        this.faceMaterials = [];

        this.createFacePlanes();
    }

    createFacePlanes() {
        // Create 6 planes positioned on cube faces for content
        const planeGeometry = new THREE.PlaneGeometry(1.7, 1.7);

        const faceConfigs = [
            { position: [0, 0, 1.01], rotation: [0, 0, 0] },        // Front
            { position: [1.01, 0, 0], rotation: [0, Math.PI / 2, 0] }, // Right
            { position: [0, 0, -1.01], rotation: [0, Math.PI, 0] },    // Back
            { position: [-1.01, 0, 0], rotation: [0, -Math.PI / 2, 0] }, // Left
            { position: [0, 1.01, 0], rotation: [-Math.PI / 2, 0, 0] }, // Top
            { position: [0, -1.01, 0], rotation: [Math.PI / 2, 0, 0] }, // Bottom
        ];

        this.facePlanes = [];

        faceConfigs.forEach((config, index) => {
            // Create canvas for dynamic content
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');

            // Initial gradient background
            this.drawPlaceholderDesign(ctx, index);

            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;

            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0.95,
                side: THREE.DoubleSide,
            });

            const plane = new THREE.Mesh(planeGeometry, material);
            plane.position.set(...config.position);
            plane.rotation.set(...config.rotation);

            this.facePlanes.push({
                mesh: plane,
                canvas,
                ctx,
                texture,
                material,
            });

            this.group.add(plane);
        });
    }

    drawPlaceholderDesign(ctx, index) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        // Create a gradient background
        const gradients = [
            ['#1E10C5', '#4743EF'],
            ['#0E2DCB', '#9089E2'],
            ['#0017E9', '#7D7BF4'],
            ['#290ECB', '#B6BAF6'],
            ['#1403DE', '#C1BEEB'],
            ['#3F4CC0', '#C5C1EA'],
        ];

        const [color1, color2] = gradients[index % gradients.length];
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add design number
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.font = 'bold 180px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${index + 1}`, width / 2, height / 2);

        // Add "Design" label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '500 24px Inter, sans-serif';
        ctx.fillText(`Design ${index + 1}`, width / 2, height - 60);
    }

    createInnerGlow() {
        // Inner cube with aurora gradient - emissive glow effect
        const innerGeometry = new RoundedBoxGeometry(1.9, 1.9, 1.9, 4, 0.1);

        // Custom shader material for aurora effect
        this.innerMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor1: { value: new THREE.Color(0x1E10C5) },
                uColor2: { value: new THREE.Color(0x4743EF) },
                uColor3: { value: new THREE.Color(0x9089E2) },
            },
            vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          // Fresnel effect for edge glow
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.0);
          
          // Animated color gradient
          float t = sin(uTime * 0.5 + vPosition.y * 2.0) * 0.5 + 0.5;
          float t2 = sin(uTime * 0.3 + vPosition.x * 1.5) * 0.5 + 0.5;
          
          vec3 color = mix(uColor1, uColor2, t);
          color = mix(color, uColor3, t2 * 0.5);
          
          float alpha = fresnel * 0.4 + 0.1;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
        });

        this.innerMesh = new THREE.Mesh(innerGeometry, this.innerMaterial);
        this.group.add(this.innerMesh);
    }

    createEdgeHighlights() {
        // Edge lines for that glossy beveled look
        const edgesGeometry = new THREE.EdgesGeometry(
            new THREE.BoxGeometry(2.01, 2.01, 2.01),
            15
        );

        this.edgesMaterial = new THREE.LineBasicMaterial({
            color: 0x4743EF,
            transparent: true,
            opacity: 0.3,
        });

        this.edges = new THREE.LineSegments(edgesGeometry, this.edgesMaterial);
        this.group.add(this.edges);
    }

    update(elapsed, delta) {
        // Update inner glow animation
        if (this.innerMaterial) {
            this.innerMaterial.uniforms.uTime.value = elapsed;
        }

        // Subtle idle animation - gentle floating
        this.group.position.y = Math.sin(elapsed * 0.5) * 0.03;
    }

    updateFaceTexture(faceIndex, canvas) {
        if (this.facePlanes[faceIndex]) {
            const face = this.facePlanes[faceIndex];
            const ctx = face.ctx;

            // Clear and draw new content
            ctx.clearRect(0, 0, face.canvas.width, face.canvas.height);
            ctx.drawImage(canvas, 0, 0, face.canvas.width, face.canvas.height);

            face.texture.needsUpdate = true;
        }
    }

    getFaceCanvas(faceIndex) {
        return this.facePlanes[faceIndex]?.canvas;
    }

    getFaceContext(faceIndex) {
        return this.facePlanes[faceIndex]?.ctx;
    }

    refreshFaceTexture(faceIndex) {
        if (this.facePlanes[faceIndex]) {
            this.facePlanes[faceIndex].texture.needsUpdate = true;
        }
    }
}
