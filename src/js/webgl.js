import * as THREE from 'three';

class WebGLScene {
  constructor() {
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.lastTime = performance.now();
    this.elapsedTime = 0;

    this.scrollPercent = 0;
    this.targetScrollPercent = 0;

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;

    this.grid = null;
    this.grid2 = null;
    this.particles = null;
    
    this.onLoadProgress = null;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // 1. Create Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x04010a, 0.07);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 3, 10);
    this.camera.lookAt(0, 1, 0);

    // 2. Create Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x04010a, 1);
    this.container.appendChild(this.renderer.domElement);

    // 3. Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00e5ff, 1.5);
    dirLight1.position.set(5, 10, 7);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xbd5af7, 1.5);
    dirLight2.position.set(-5, 5, -5);
    this.scene.add(dirLight2);

    // 4. Create Cyberpunk Grid
    const gridSize = 120;
    const gridDivisions = 60;
    
    this.grid = new THREE.GridHelper(gridSize, gridDivisions, 0xbd5af7, 0xbd5af7);
    this.grid.position.y = -1.5;
    this.grid.material.opacity = 0.35;
    this.grid.material.transparent = true;
    this.scene.add(this.grid);

    this.grid2 = new THREE.GridHelper(gridSize, gridDivisions, 0x00e5ff, 0x00e5ff);
    this.grid2.position.y = -1.52;
    this.grid2.rotation.y = Math.PI / 4;
    this.grid2.material.opacity = 0.2;
    this.grid2.material.transparent = true;
    this.scene.add(this.grid2);

    // 5. Create Cyber Particles (Starfield / Digital Dust)
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0xbd5af7); // Purple
    const color2 = new THREE.Color(0x00e5ff); // Cyan
    const color3 = new THREE.Color(0xff2a85); // Pink

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Position
      positions[i] = (Math.random() - 0.5) * 60;
      positions[i + 1] = Math.random() * 25 - 5;
      positions[i + 2] = (Math.random() - 0.5) * 60;

      // Color
      const r = Math.random();
      let pColor = color1;
      if (r > 0.66) pColor = color2;
      else if (r > 0.33) pColor = color3;

      colors[i] = pColor.r;
      colors[i + 1] = pColor.g;
      colors[i + 2] = pColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 16;
    pCanvas.height = 16;
    const pCtx = pCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 16, 16);
    const pTexture = new THREE.CanvasTexture(pCanvas);

    const material = new THREE.PointsMaterial({
      size: 0.3,
      map: pTexture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    // 6. Bind events
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));

    // Complete loading immediately (simulated 100% loaded)
    setTimeout(() => {
      if (this.onLoadProgress) {
        this.onLoadProgress(100);
      }
    }, 150);

    // Bind animate loop
    this._boundAnimate = this.animate.bind(this);
    this.animate();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(e) {
    this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  setScrollPercent(percent) {
    this.targetScrollPercent = percent;
  }

  animate() {
    requestAnimationFrame(this._boundAnimate);

    const now = performance.now();
    const delta = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.elapsedTime += delta;
    const time = this.elapsedTime;

    // 1. Lerp scroll percentage for smooth camera transit
    this.scrollPercent += (this.targetScrollPercent - this.scrollPercent) * 0.08;

    // 2. Lerp mouse tracking for camera parallax
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // 3. Scroll-driven camera movement
    const pathZ = 12 - this.scrollPercent * 40;
    const pathY = 3.5 - this.scrollPercent * 2;
    
    this.camera.position.x = this.mouseX * 1.5;
    this.camera.position.y = pathY - this.mouseY * 0.8;
    this.camera.position.z = pathZ;

    // Make camera look forward
    this.camera.lookAt(0, 1 - this.scrollPercent * 2, -30);

    // 4. Animate Grid & Particles
    if (this.grid) {
      this.grid.position.z = (time * 1.5) % 2;
      this.grid2.position.z = (time * 0.85) % 2;
    }

    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      const count = positions.length;
      for (let i = 1; i < count; i += 3) {
        positions[i] += delta * 0.25;
        if (positions[i] > 18) {
          positions[i] = -5;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
      this.particles.rotation.y = time * 0.015;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

export const webGLScene = new WebGLScene();
