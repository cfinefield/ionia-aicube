import * as THREE from 'three';

export class LiquidBackground {
    constructor(renderer, scene) {
        this.renderer = renderer;
        this.scene = scene;

        this.colors = {
            color1: new THREE.Color(0xFFFFFF),
            color2: new THREE.Color(0x1E10C5),
            color3: new THREE.Color(0x9089E2),
            color4: new THREE.Color(0x0E2DCB),
            color5: new THREE.Color(0x0017E9),
            color6: new THREE.Color(0x4743EF),
            color7: new THREE.Color(0x0B06FC),
            color8: new THREE.Color(0x010128), // Background base
        };

        this.createBackground();
    }

    createBackground() {
        // Full-screen quad with shader material
        const geometry = new THREE.PlaneGeometry(2, 2);

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uColor1: { value: this.colors.color2 },
                uColor2: { value: this.colors.color3 },
                uColor3: { value: this.colors.color5 },
                uColor4: { value: this.colors.color6 },
                uColor5: { value: this.colors.color7 },
                uColorBg: { value: this.colors.color8 },
            },
            vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec3 uColor4;
        uniform vec3 uColor5;
        uniform vec3 uColorBg;
        
        varying vec2 vUv;
        
        // Simplex noise functions
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                              -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                           + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                                  dot(x12.zw,x12.zw)), 0.0);
          m = m*m;
          m = m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }
        
        // Fractal Brownian Motion
        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          
          for (int i = 0; i < 5; i++) {
            value += amplitude * snoise(p * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
          }
          
          return value;
        }
        
        void main() {
          vec2 uv = vUv;
          vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
          vec2 p = uv * aspect;
          
          // Slow time for dreamy movement
          float time = uTime * 0.15;
          
          // Multiple noise layers for liquid effect
          float n1 = fbm(p * 1.5 + time * 0.3);
          float n2 = fbm(p * 2.0 - time * 0.2 + 10.0);
          float n3 = fbm(p * 0.8 + time * 0.1 + vec2(n1, n2) * 0.5);
          
          // Combine noises
          float noise = (n1 + n2 + n3) / 3.0;
          noise = noise * 0.5 + 0.5; // Normalize to 0-1
          
          // Create flowing color gradients
          float gradient1 = smoothstep(0.0, 0.5, noise + sin(time * 0.5) * 0.2);
          float gradient2 = smoothstep(0.3, 0.8, noise + cos(time * 0.3) * 0.2);
          float gradient3 = smoothstep(0.5, 1.0, noise + sin(time * 0.7) * 0.15);
          
          // Radial vignette - darker at edges
          float vignette = 1.0 - length(uv - 0.5) * 0.8;
          vignette = smoothstep(0.2, 1.0, vignette);
          
          // Mix colors based on gradients
          vec3 color = uColorBg;
          color = mix(color, uColor1, gradient1 * 0.4);
          color = mix(color, uColor2, gradient2 * 0.35);
          color = mix(color, uColor3, gradient3 * 0.25);
          
          // Add subtle bright spots
          float spots = snoise(p * 3.0 + time * 0.5);
          spots = smoothstep(0.6, 0.9, spots) * 0.15;
          color = mix(color, uColor4, spots);
          
          // Apply vignette
          color *= vignette * 0.8 + 0.2;
          
          // Very subtle grain
          float grain = snoise(uv * 500.0 + uTime * 10.0) * 0.02;
          color += grain;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
            depthWrite: false,
            depthTest: false,
        });

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.renderOrder = -1; // Render first, behind everything
        this.mesh.frustumCulled = false;

        this.scene.add(this.mesh);
    }

    update(elapsed) {
        this.material.uniforms.uTime.value = elapsed;
    }

    onResize(width, height) {
        this.material.uniforms.uResolution.value.set(width, height);
    }
}
