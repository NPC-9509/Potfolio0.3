// Environment.js — Upgraded Continuous Cyberpunk 3D World (V3.0)

import * as THREE from 'three';
import { AppState } from '../core/AppState.js';
import { bus } from '../core/EventBus.js';

export class Environment {
  constructor(scene, qualityLevel = 'high') {
    this.scene = scene;
    this.quality = qualityLevel;
    this.zoneGroups = [];
    this.skylineGroup = null;
    this.animatables = [];
    this.time = 0;

    // Time of Day state
    this.currentTimeOfDay = 'neon'; // morning | sunset | night | neon

    // Weather state
    this.currentWeather = 'rain'; // none | rain | fog | dust | digital | snow
    this.weatherSystem = null;
    this.weatherPoints = null;

    // Lights
    this.ambientLight = null;
    this.pointLights = [];

    // Interactive meshes cache for raycasting
    this.interactiveMeshes = [];

    this._build();

    // Listen to theme and graphics changes
    bus.on('graphics:quality-changed', q => this.handleQualityChange(q));
    bus.on('settings:timeofday', mode => this.setTimeOfDay(mode));
    bus.on('settings:weather', mode => this.setWeather(mode));
  }

  _build() {
    // 1. Initialize Zone Groups
    for (let i = 0; i < 6; i++) {
      const group = new THREE.Group();
      group.name = `zone-${i}`;
      this.scene.add(group);
      this.zoneGroups.push(group);
    }

    // 2. Build ambient lights
    this._buildLights();

    // 3. Build global grid floors
    this._buildGrid();

    // 4. Build continuous cityscape (skyline)
    this._buildSkyline();

    // 5. Build Connective Corridors between zones
    this._buildCorridors();

    // 6. Build Zones
    this._buildZone0_Hero();
    this._buildZone1_About();
    this._buildZone2_Skills();
    this._buildZone3_Projects();
    this._buildZone4_Experience();
    this._buildZone5_Contact();

    // 7. Build Weather/Particles
    this._buildWeather();

    // Set initial Time of Day lights
    this.setTimeOfDay(this.currentTimeOfDay);
  }

  /* ─── LIGHTS ─────────────────────────────── */
  _buildLights() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(this.ambientLight);

    const cyan = new THREE.PointLight(0x00e5ff, 3, 80);
    cyan.position.set(5, 10, 5);
    this.scene.add(cyan);
    this.pointLights.push({ light: cyan, color: 0x00e5ff });
    this.animatables.push({ light: cyan, type: 'flicker', phase: 0 });

    const purple = new THREE.PointLight(0xbd5af7, 3, 80);
    purple.position.set(-5, 6, -5);
    this.scene.add(purple);
    this.pointLights.push({ light: purple, color: 0xbd5af7 });
    this.animatables.push({ light: purple, type: 'pulse', phase: Math.PI });

    const pink = new THREE.PointLight(0xff2a85, 2, 60);
    pink.position.set(0, 5, -20);
    this.scene.add(pink);
    this.pointLights.push({ light: pink, color: 0xff2a85 });
  }

  /* ─── GRID FLOOR ─────────────────────────── */
  _buildGrid() {
    const size = 200, div = 100;
    const g1 = new THREE.GridHelper(size, div, 0xbd5af7, 0xbd5af7);
    g1.position.y = -1.5;
    g1.material.opacity = 0.35;
    g1.material.transparent = true;
    this.scene.add(g1);
    this.animatables.push({ mesh: g1, type: 'gridScroll', speed: 1.5 });

    const g2 = new THREE.GridHelper(size, div, 0x00e5ff, 0x00e5ff);
    g2.position.y = -1.52;
    g2.rotation.y = Math.PI / 4;
    g2.material.opacity = 0.18;
    g2.material.transparent = true;
    this.scene.add(g2);
    this.animatables.push({ mesh: g2, type: 'gridScroll', speed: 0.85 });
  }

  /* ─── CONTINUOUS SKYLINE (Phase 1) ───────── */
  _buildSkyline() {
    this.skylineGroup = new THREE.Group();
    this.skylineGroup.name = 'skyline';
    this.scene.add(this.skylineGroup);

    const bCount = this.quality === 'low' ? 12 : 28;
    const bGeo = new THREE.BoxGeometry(1, 1, 1);
    const bMat = new THREE.MeshBasicMaterial({ color: 0x04010a, wireframe: true });

    // Place wireframe skyscrapers along the Z path
    for (let i = 0; i < bCount; i++) {
      const height = 15 + Math.random() * 25;
      const width = 4 + Math.random() * 6;
      const depth = 4 + Math.random() * 6;

      const mesh = new THREE.Mesh(bGeo, bMat);
      mesh.scale.set(width, height, depth);

      const side = Math.random() > 0.5 ? 1 : -1;
      const posX = side * (12 + Math.random() * 20);
      const posZ = 30 - i * 6;

      mesh.position.set(posX, height / 2 - 1.5, posZ);

      // Add a neon accent line/edge to building
      const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(width, height, depth));
      const edgeMat = new THREE.LineBasicMaterial({
        color: Math.random() > 0.5 ? 0x00e5ff : 0xff2a85,
        transparent: true,
        opacity: 0.35
      });
      const edge = new THREE.LineSegments(edgeGeo, edgeMat);
      edge.position.copy(mesh.position);
      this.skylineGroup.add(edge);
      this.skylineGroup.add(mesh);
    }
  }

  /* ─── CONNECTIVE CORRIDORS ───────────────── */
  _buildCorridors() {
    // Add neon pipes/tubes running down the Z center axis to connect zones
    const group = new THREE.Group();
    this.scene.add(group);

    const pipeMat = new THREE.LineBasicMaterial({ color: 0xbd5af7, transparent: true, opacity: 0.3 });
    const positions = [
      new THREE.Vector3(-1.8, -1.4, 15),
      new THREE.Vector3(-1.8, -1.4, -60),
      new THREE.Vector3(1.8, -1.4, 15),
      new THREE.Vector3(1.8, -1.4, -60)
    ];

    positions.forEach(pos => {
      const geo = new THREE.BufferGeometry().setFromPoints([pos, new THREE.Vector3(pos.x, pos.y, -65)]);
      const line = new THREE.Line(geo, pipeMat);
      group.add(line);
    });
  }

  /* ─── ZONE 0: HERO (Futuristic Streets) ──── */
  _buildZone0_Hero() {
    const group = this.zoneGroups[0];

    // Neon arch gateway
    const archMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true });
    const arch = new THREE.TorusGeometry(4, 0.04, 6, 40, Math.PI);
    const archMesh = new THREE.Mesh(arch, archMat);
    archMesh.position.set(0, 2, 3);
    archMesh.rotation.z = Math.PI;
    group.add(archMesh);
    this.animatables.push({ mesh: archMesh, type: 'rotateY', speed: 0.002 });

    // Floating title hologram pillars
    for (let i = -2; i <= 2; i += 2) {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 4, 0.06),
        new THREE.MeshBasicMaterial({ color: 0xbd5af7, transparent: true, opacity: 0.6 })
      );
      pillar.position.set(i * 3, 0, 2);
      group.add(pillar);
      this.animatables.push({ mesh: pillar, type: 'pulse', phase: i });
    }
  }

  /* ─── ZONE 1: ABOUT (Holographic Lab) ───── */
  _buildZone1_About() {
    const group = this.zoneGroups[1];
    const zOffset = -8;

    // Holographic panel
    const panelGeo = new THREE.PlaneGeometry(5, 3);
    const panelMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.06, side: THREE.DoubleSide });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(-2, 2, zOffset);
    panel.rotation.y = 0.3;
    group.add(panel);
    this.animatables.push({ mesh: panel, type: 'floatY', amp: 0.15, phase: 0 });

    const borderGeo = new THREE.EdgesGeometry(panelGeo);
    const borderMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.7 });
    const border = new THREE.LineSegments(borderGeo, borderMat);
    border.position.copy(panel.position);
    border.rotation.copy(panel.rotation);
    group.add(border);
    this.animatables.push({ mesh: border, type: 'floatY', amp: 0.15, phase: 0 });

    // 3D Cyber-Door (Interactive)
    const doorGeo = new THREE.BoxGeometry(1.6, 2.5, 0.1);
    const doorMat = new THREE.MeshBasicMaterial({ color: 0xff2a85, wireframe: true });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(3, 1, zOffset);
    door.userData = { action: 'modal-about', name: 'Classified Logs' };
    group.add(door);
    this.interactiveMeshes.push(door);
    this.animatables.push({ mesh: door, type: 'floatY', amp: 0.1, phase: 1.5 });
  }

  /* ─── ZONE 2: SKILLS (Neural Constellation) */
  _buildZone2_Skills() {
    const group = this.zoneGroups[2];
    const zOffset = -18;

    // Interactive Hologram Projector base (Hologram display)
    const baseGeo = new THREE.CylinderGeometry(0.8, 1.0, 0.3, 12);
    const baseMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0, -1.35, zOffset);
    group.add(base);

    const baseRing = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 4, 16), new THREE.MeshBasicMaterial({ color: 0x00e5ff }));
    baseRing.position.copy(base.position);
    baseRing.position.y += 0.16;
    baseRing.rotation.x = Math.PI / 2;
    group.add(baseRing);

    // Group technologies into 3 main clusters:
    // 1. Frontend Galaxy (React, JS, CSS)
    // 2. Backend Cluster (Node, Python)
    // 3. Marketing & Design Tools (Figma, Photoshop, Git)
    const skills = [
      { name: 'React', cluster: 'Frontend', pos: new THREE.Vector3(-1.8, 1.5, zOffset - 1), color: 0x00e5ff },
      { name: 'JS', cluster: 'Frontend', pos: new THREE.Vector3(-1.2, 0.8, zOffset - 0.5), color: 0xffe600 },
      { name: 'CSS', cluster: 'Frontend', pos: new THREE.Vector3(-2.2, 0.6, zOffset - 1.2), color: 0xbd5af7 },
      
      { name: 'Node', cluster: 'Backend', pos: new THREE.Vector3(1.8, 1.6, zOffset - 1), color: 0x00ff66 },
      { name: 'Python', cluster: 'Backend', pos: new THREE.Vector3(2.2, 0.7, zOffset - 0.5), color: 0xffe600 },
      
      { name: 'Figma', cluster: 'Tools', pos: new THREE.Vector3(0, 2.5, zOffset + 1), color: 0xff2a85 },
      { name: 'PS', cluster: 'Tools', pos: new THREE.Vector3(-0.6, 2.8, zOffset + 0.8), color: 0x00e5ff },
      { name: 'Git', cluster: 'Tools', pos: new THREE.Vector3(0.6, 2.7, zOffset + 1.2), color: 0xbd5af7 }
    ];

    const meshMap = {};
    skills.forEach((s, idx) => {
      const size = 0.18 + Math.random() * 0.08;
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(size, 12, 12),
        new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0.9 })
      );
      orb.position.copy(s.pos);
      orb.userData = { action: 'modal-skills', skill: s.name, name: `Skill: ${s.name}` };
      group.add(orb);
      this.interactiveMeshes.push(orb);
      meshMap[s.name] = orb;

      this.animatables.push({ mesh: orb, type: 'floatY', amp: 0.18, phase: idx * 0.8 });
    });

    // Draw Constellation Connection Lines
    const connections = [
      ['React', 'JS'], ['JS', 'CSS'], ['React', 'CSS'],
      ['Node', 'Python'],
      ['Figma', 'PS'], ['Figma', 'Git'], ['PS', 'Git'],
      ['React', 'Node'], ['Node', 'Figma'] // bridge lines
    ];

    connections.forEach(([n1, n2]) => {
      const o1 = meshMap[n1];
      const o2 = meshMap[n2];
      if (o1 && o2) {
        const points = [o1.position, o2.position];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(
          lineGeo,
          new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 })
        );
        group.add(line);
      }
    });

    // Central core holographic skill orb (Holographic display)
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.5, 1),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.45 })
    );
    core.position.set(0, 1.2, zOffset);
    core.userData = { action: 'modal-skills', name: 'Holographic Skills Console' };
    group.add(core);
    this.interactiveMeshes.push(core);
    this.animatables.push({ mesh: core, type: 'rotateY', speed: 0.02 });
  }

  /* ─── ZONE 3: PROJECTS (Command Center) ─── */
  _buildZone3_Projects() {
    const group = this.zoneGroups[3];
    const zOffset = -30;

    // Projected screens
    const screenPositions = [[-3, 2.5, zOffset], [0, 3, zOffset - 1], [3, 2.5, zOffset]];
    const screenColors    = [0x00e5ff, 0xbd5af7, 0xff2a85];

    screenPositions.forEach(([x, y, z], i) => {
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 1.4),
        new THREE.MeshBasicMaterial({ color: screenColors[i], transparent: true, opacity: 0.08, side: THREE.DoubleSide })
      );
      screen.position.set(x, y, z);
      screen.rotation.y = (i - 1) * 0.25;
      group.add(screen);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.2, 1.4)),
        new THREE.LineBasicMaterial({ color: screenColors[i], transparent: true, opacity: 0.7 })
      );
      edges.position.copy(screen.position);
      edges.rotation.copy(screen.rotation);
      group.add(edges);
      this.animatables.push({ mesh: edges, type: 'pulse', phase: i * Math.PI / 3 });
    });

    // Console desk geometry
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.12, 2),
      new THREE.MeshBasicMaterial({ color: 0x111111 })
    );
    desk.position.set(0, 0.3, zOffset + 2);
    group.add(desk);

    // Interactive Laptop Mesh placed on desk
    const laptop = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.1, 0.5),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true })
    );
    laptop.position.set(0, 0.42, zOffset + 1.8);
    laptop.userData = { action: 'modal-projects', name: 'Console Laptop' };
    group.add(laptop);
    this.interactiveMeshes.push(laptop);
    this.animatables.push({ mesh: laptop, type: 'pulse', phase: 0 });
  }

  /* ─── ZONE 4: EXPERIENCE (Chronicle Room) ─ */
  _buildZone4_Experience() {
    const group = this.zoneGroups[4];
    const zOffset = -42;

    const timelineMat = new THREE.LineBasicMaterial({ color: 0x00ff66, transparent: true, opacity: 0.6 });
    const tlPoints = [new THREE.Vector3(0, 0, zOffset + 4), new THREE.Vector3(0, 0, zOffset - 6)];
    const timeline = new THREE.Line(new THREE.BufferGeometry().setFromPoints(tlPoints), timelineMat);
    group.add(timeline);

    // Timeline event nodes
    const events = [0, 1, 2];
    events.forEach(i => {
      const node = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.2),
        new THREE.MeshBasicMaterial({ color: 0x00ff66, transparent: true, opacity: 0.9 })
      );
      node.position.set(0, 0.3, zOffset + 2 - i * 3.5);
      group.add(node);
      this.animatables.push({ mesh: node, type: 'rotateY', speed: 0.02 });

      // Horizontal rays from node
      const rayGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2, 0, 0), new THREE.Vector3(2, 0, 0)]);
      const ray = new THREE.Line(rayGeo, new THREE.LineBasicMaterial({ color: 0x00ff66, transparent: true, opacity: 0.25 }));
      ray.position.copy(node.position);
      group.add(ray);
    });

    // 3D Terminal Console Node (Interactive database terminal)
    const consoleBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.2, 0.6),
      new THREE.MeshBasicMaterial({ color: 0x00ff66, wireframe: true })
    );
    consoleBox.position.set(-2, 0.1, zOffset + 3);
    consoleBox.userData = { action: 'modal-experience', name: 'Database Terminal' };
    group.add(consoleBox);
    this.interactiveMeshes.push(consoleBox);
  }

  /* ─── ZONE 5: CONTACT (Transmitter Tower) ── */
  _buildZone5_Contact() {
    const group = this.zoneGroups[5];
    const zOffset = -56;

    // Vertical beam
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 20, 8),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.7 })
    );
    beam.position.set(0, 8, zOffset);
    group.add(beam);
    this.animatables.push({ mesh: beam, type: 'pulse', phase: 0 });

    // Energy rings rising up the beam
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.5 + i * 0.3, 0.03, 6, 24),
        new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.6 - i * 0.1 })
      );
      ring.position.set(0, 1 + i * 2.5, zOffset);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
      this.animatables.push({ mesh: ring, type: 'ringRise', baseY: 1 + i * 2.5, speed: 0.4 + i * 0.1, phase: i * 0.5 });
    }

    // Satellite dish (Interactive antenna)
    const dish = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.45 })
    );
    dish.position.set(0, 18, zOffset);
    dish.rotation.x = Math.PI;
    dish.userData = { action: 'focus-contact', name: 'Transmitter dish' };
    group.add(dish);
    this.interactiveMeshes.push(dish);
  }

  /* ─── WEATHER SYSTEM / PARTICLES (Phase 2 & 5) */
  _buildWeather() {
    // Clean up any existing weather meshes (dispose textures to prevent memory leak)
    if (this.weatherSystem) {
      this.scene.remove(this.weatherSystem);
      if (this.weatherSystem.material) {
        if (this.weatherSystem.material.map) this.weatherSystem.material.map.dispose();
        this.weatherSystem.material.dispose();
      }
      if (this.weatherSystem.geometry) this.weatherSystem.geometry.dispose();
    }

    if (this.currentWeather === 'none') {
      this.weatherSystem = null;
      this.weatherPoints = null;
      return;
    }

    const count = this.quality === 'low' ? 80 : this.quality === 'medium' ? 250 : 550;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const rainColors = [0x00e5ff, 0xbd5af7, 0xff2a85];

    for (let i = 0; i < count * 3; i += 3) {
      // Span across the continuous world
      pos[i] = (Math.random() - 0.5) * 55;
      pos[i + 1] = Math.random() * 32;
      pos[i + 2] = 20 - Math.random() * 85;

      const c = new THREE.Color(rainColors[Math.floor(Math.random() * 3)]);
      col[i] = c.r;
      col[i + 1] = c.g;
      col[i + 2] = c.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    // Custom Canvas textures for particles based on weather type
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);

    if (this.currentWeather === 'snow') {
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.7)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
    } else if (this.currentWeather === 'digital') {
      // Digital square blocks
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(2, 2, 12, 12);
    } else {
      // Rain/Dust circle
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.4, 'rgba(255,255,255,0.4)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
    }

    if (this.currentWeather !== 'digital') {
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }

    const size = this.currentWeather === 'rain' ? 0.08 : this.currentWeather === 'snow' ? 0.35 : 0.22;
    const mat = new THREE.PointsMaterial({
      size,
      map: new THREE.CanvasTexture(canvas),
      vertexColors: this.currentWeather === 'rain' || this.currentWeather === 'digital',
      color: this.currentWeather === 'snow' ? 0xffffff : 0xffffff,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.weatherSystem = new THREE.Points(geo, mat);
    this.scene.add(this.weatherSystem);
    this.weatherPoints = pos;
  }

  /* ─── TIME OF DAY DYNAMIC LIGHTS (Phase 12) ─ */
  setTimeOfDay(mode) {
    this.currentTimeOfDay = mode;
    AppState.state.currentTimeOfDay = mode;

    let bg, fogCol, fogDensity = 0.04, ambientVal = 0.15;
    const isMobile = AppState.state.isMobile;

    switch (mode) {
      case 'morning':
        bg = new THREE.Color(0x382c16); // Golden brown sunrise
        fogCol = 0x382c16;
        ambientVal = 0.35;
        fogDensity = isMobile ? 0.025 : 0.035;
        this.pointLights.forEach(p => { p.light.intensity = 1.0; });
        break;
      case 'sunset':
        bg = new THREE.Color(0x280e32); // Deep magenta sunset
        fogCol = 0x280e32;
        ambientVal = 0.22;
        fogDensity = isMobile ? 0.03 : 0.04;
        this.pointLights.forEach(p => { p.light.intensity = 1.8; });
        break;
      case 'night':
        bg = new THREE.Color(0x020005); // True dark
        fogCol = 0x020005;
        ambientVal = 0.08;
        fogDensity = isMobile ? 0.035 : 0.05;
        this.pointLights.forEach(p => { p.light.intensity = 2.5; });
        break;
      case 'neon':
      default:
        bg = new THREE.Color(0x04010a); // Cyberpunk dark violet
        fogCol = 0x04010a;
        ambientVal = 0.15;
        fogDensity = isMobile ? 0.035 : 0.045;
        this.pointLights.forEach(p => { p.light.intensity = 3.0; });
        break;
    }

    this.scene.background = bg;
    if (this.scene.fog) {
      this.scene.fog.color = new THREE.Color(fogCol);
      this.scene.fog.density = fogDensity;
    }

    if (this.ambientLight) {
      this.ambientLight.intensity = ambientVal;
    }
  }

  setWeather(mode) {
    this.currentWeather = mode;
    AppState.state.currentWeather = mode;
    this._buildWeather();
  }

  handleQualityChange(quality) {
    this.quality = quality;
    // Re-trigger building parts that depend on quality (weather count, skyscraper complexity)
    this._buildWeather();
    if (this.skylineGroup) {
      this.scene.remove(this.skylineGroup);
      this._buildSkyline();
    }
  }

  /* ─── ANIMATION LOOP ─────────────────────── */
  update(delta, cameraZ = 12) {
    this.time += delta;
    const t = this.time;

    // ─── 1. ZONE STREAMING (Phase 3) ───
    // Load and show adjacent zones, hide distant zones to prioritize rendering budget
    this.zoneGroups.forEach((group, idx) => {
      // Approx Z location of zone:
      // Hero: 3, About: -8, Skills: -18, Projects: -30, Experience: -42, Contact: -56
      const zLocations = [3, -8, -18, -30, -42, -56];
      const distance = Math.abs(cameraZ - zLocations[idx]);

      // Hide if more than 22 units away from current camera focus
      if (distance > 22 && idx !== AppState.state.currentSection) {
        group.visible = false;
      } else {
        group.visible = true;
      }
    });

    // ─── 2. WEATHER PARTICLES ANIMATION ───
    if (this.weatherSystem && this.weatherPoints) {
      const pos = this.weatherSystem.geometry.attributes.position.array;
      const count = pos.length;

      for (let i = 0; i < count; i += 3) {
        if (this.currentWeather === 'rain') {
          pos[i + 1] -= delta * 9; // fall fast
          pos[i] += Math.sin(t + i) * 0.02; // slight wind sway
          if (pos[i + 1] < -2) pos[i + 1] = 30; // recycle
        } else if (this.currentWeather === 'snow') {
          pos[i + 1] -= delta * 1.5; // fall slow
          pos[i] += Math.sin(t * 1.2 + i) * 0.05; // sway
          if (pos[i + 1] < -2) pos[i + 1] = 30;
        } else if (this.currentWeather === 'digital') {
          pos[i + 1] += delta * 2.5; // fly upwards
          if (pos[i + 1] > 30) pos[i + 1] = -2;
        } else if (this.currentWeather === 'dust' || this.currentWeather === 'fog') {
          // Slow ambient drift
          pos[i] += Math.sin(t * 0.5 + i) * 0.005;
          pos[i + 1] += Math.cos(t * 0.5 + i) * 0.005;
          pos[i + 2] += Math.sin(t * 0.3 + i) * 0.005;
        }
      }
      this.weatherSystem.geometry.attributes.position.needsUpdate = true;
    }

    // ─── 3. PER-OBJECT ANIMATIONS ───
    this.animatables.forEach(obj => {
      // Check if mesh is in an active zone group before running loops
      if (obj.mesh && obj.mesh.parent && !obj.mesh.parent.visible) return;

      if (!obj.mesh && !obj.light) return;

      switch (obj.type) {
        case 'gridScroll':
          obj.mesh.position.z = (t * obj.speed) % 2;
          break;
        case 'rotateY':
          obj.mesh.rotation.y += obj.speed;
          break;
        case 'floatY':
          obj.mesh.position.y += Math.sin(t + (obj.phase || 0)) * 0.0015;
          break;
        case 'pulse': {
          const scale = 1 + Math.sin(t * 2 + (obj.phase || 0)) * 0.05;
          if (obj.mesh) { obj.mesh.scale.setScalar(scale); }
          if (obj.light) { obj.light.intensity = 2.5 + Math.sin(t * 3 + (obj.phase || 0)) * 0.8; }
          break;
        }
        case 'flicker':
          if (obj.light) { obj.light.intensity = 2.5 + (Math.random() < 0.02 ? -1.5 : 0); }
          break;
        case 'ringRise':
          obj.mesh.position.y = obj.baseY + ((t * obj.speed + obj.phase) % (obj.speed * 15));
          obj.mesh.material.opacity = 0.6 * (1 - (obj.mesh.position.y - obj.baseY) / (obj.speed * 15));
          break;
      }
    });
  }
}
