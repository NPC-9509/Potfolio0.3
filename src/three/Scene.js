// Scene.js — Upgraded Main Three.js Scene & Raycasting Manager (V3.0)

import * as THREE from 'three';
import { CinematicCamera } from './Camera.js';
import { Environment } from './Environment.js';
import { bus } from '../core/EventBus.js';
import { AppState } from '../core/AppState.js';
import { audioEngine } from '../audio/AudioEngine.js';

// Post-processing imports
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

class Scene {
  constructor() {
    this.container = null;
    this.scene = null;
    this.renderer = null;
    this.cineCam = null;
    this.environment = null;
    this.lastTime = performance.now();
    this.elapsedTime = 0;
    this.onLoadProgress = null;
    this._animFrameId = null;
    this._boundAnimate = this.animate.bind(this);

    // Raycasting for interactive meshes
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredMesh = null;

    // Post processing
    this.composer = null;
    this.bloomPass = null;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const q = AppState.state.qualityLevel;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x04010a, 0.045);
    this.scene.background = new THREE.Color(0x04010a);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: q !== 'low',
      alpha: false,
      powerPreference: q === 'low' ? 'low-power' : 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(q === 'low' ? 1.0 : Math.min(window.devicePixelRatio, q === 'medium' ? 1.5 : 2.0));
    this.renderer.setClearColor(0x04010a, 1);
    this.container.appendChild(this.renderer.domElement);

    // Camera
    this.cineCam = new CinematicCamera(this.renderer);

    // Environment (Continuous World with Skyline + Weather)
    this.environment = new Environment(this.scene, q);

    // Setup Post-processing if requested and supported
    this._setupPostProcessing(q);

    // Resize
    window.addEventListener('resize', () => this._onResize());

    // Mouse events for Raycasting
    window.addEventListener('mousemove', e => this._onMouseMove(e));
    window.addEventListener('click', e => this._onClick(e));

    // Pause rendering when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { this._stopLoop(); }
      else { this._startLoop(); }
    });

    // Notify loader complete (scene init is synchronous)
    if (this.onLoadProgress) this.onLoadProgress(100);

    // Camera shake on section entries
    bus.on('section:change', () => {
      const activeQ = AppState.state.qualityLevel;
      if (this.cineCam && activeQ !== 'low' && activeQ !== 'battery-saver') {
        this.cineCam.shake(0.08, 0.25);
      }
    });

    // Quality changes dynamic handler
    bus.on('graphics:quality-changed', q => {
      this.renderer.setPixelRatio(q === 'low' ? 1.0 : Math.min(window.devicePixelRatio, q === 'medium' ? 1.5 : 2.0));
      this._setupPostProcessing(q);
    });

    this._startLoop();
  }

  _setupPostProcessing(quality) {
    // Enable bloom on high/ultra quality tiers
    const enableBloom = (quality === 'ultra' || quality === 'high');

    if (enableBloom) {
      const renderPass = new RenderPass(this.scene, this.cineCam.camera);
      
      // UnrealBloomPass: resolution, strength, radius, threshold
      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        quality === 'ultra' ? 1.25 : 0.8, // bloom strength
        0.4, // radius
        0.18 // threshold
      );

      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(renderPass);
      this.composer.addPass(this.bloomPass);
    } else {
      this.composer = null;
      this.bloomPass = null;
    }
  }

  setScrollPercent(pct) {
    if (this.cineCam) this.cineCam.setScrollPercent(pct);
  }

  _startLoop() {
    if (this._animFrameId) return;
    this.lastTime = performance.now();
    this._boundAnimate = this.animate.bind(this);
    this._animFrameId = requestAnimationFrame(this._boundAnimate);
  }

  _stopLoop() {
    if (this._animFrameId) { cancelAnimationFrame(this._animFrameId); this._animFrameId = null; }
  }

  animate() {
    this._animFrameId = requestAnimationFrame(this._boundAnimate);

    const now   = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.05); // cap at 50ms
    this.lastTime    = now;
    this.elapsedTime += delta;

    // Skip animation updates if user prefers reduced motion
    if (!AppState.state.prefersReducedMotion) {
      this.cineCam?.update(delta, AppState.state.qualityLevel);
      
      // Pass the camera Z position to environment for loading/streaming zones
      const camZ = this.cineCam ? this.cineCam.camera.position.z : 12;
      this.environment?.update(delta, camZ);
    }

    // Render using either Composer (Bloom) or normal renderer
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.cineCam.camera);
    }
  }

  _onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    if (this.composer) {
      this.composer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  _onMouseMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (!this.scene || !this.cineCam || !this.environment) return;

    // Perform Raycasting against interactive meshes
    this.raycaster.setFromCamera(this.mouse, this.cineCam.camera);
    const intersects = this.raycaster.intersectObjects(this.environment.interactiveMeshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (this.hoveredMesh !== hit) {
        // Reset old hover
        this._clearHover();

        this.hoveredMesh = hit;
        
        // Visual indicator on hover: highlight color or scale
        if (this.hoveredMesh.material) {
          this.hoveredMesh.userData.originalColor = this.hoveredMesh.material.color.getHex();
          this.hoveredMesh.material.color.setHex(0xffffff); // glow white
        }

        // Change cursor
        document.body.style.cursor = 'pointer';
        const cursor = document.getElementById('custom-cursor');
        if (cursor) cursor.style.backgroundColor = 'rgba(0, 229, 255, 0.6)';

        // Play sound stinger
        audioEngine.playClick();
      }
    } else {
      this._clearHover();
    }
  }

  _clearHover() {
    if (this.hoveredMesh) {
      if (this.hoveredMesh.material && this.hoveredMesh.userData.originalColor !== undefined) {
        this.hoveredMesh.material.color.setHex(this.hoveredMesh.userData.originalColor);
      }
      this.hoveredMesh = null;
      document.body.style.cursor = 'default';
      const cursor = document.getElementById('custom-cursor');
      if (cursor) cursor.style.backgroundColor = '#ffffff';
    }
  }

  _onClick(e) {
    if (this.hoveredMesh) {
      const action = this.hoveredMesh.userData.action;
      if (action) {
        audioEngine.playClick();
        
        if (action.startsWith('modal-')) {
          bus.emit('modal:open', action);
        } else if (action === 'focus-contact') {
          // Navigate to contact and focus form
          navigateToSection(5);
          setTimeout(() => {
            const input = document.getElementById('form-name');
            input?.focus();
          }, 600);
        }
      }
    }
  }
}

// Global helper to navigate section (imported in HUD but declared here dynamically if HUD is not loaded)
function navigateToSection(idx) {
  const target = document.getElementById(`sec-${idx}`);
  const scrollContainer = document.getElementById('scroll-container');
  if (target && scrollContainer) {
    scrollContainer.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
    AppState.set('currentSection', idx);
    bus.emit('section:change', idx);
  }
}

export const webGLScene = new Scene();
export { navigateToSection };
