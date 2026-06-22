// Camera.js — Cinematic Spline Camera System with Photo Mode (V3.0)

import * as THREE from 'three';
import { AppState } from '../core/AppState.js';
import { bus } from '../core/EventBus.js';

// 6 waypoints: one per section
const WAYPOINTS = [
  // Hero – high above looking down the continuous city grid
  { pos: new THREE.Vector3(0, 4, 12), target: new THREE.Vector3(0, 1, 0), fov: 60 },
  // About – lower, next to holographic lab doors
  { pos: new THREE.Vector3(-3.2, 2.2, 6.2), target: new THREE.Vector3(2.5, 0.8, -8), fov: 55 },
  // Skills – viewing orbital skills constellation network
  { pos: new THREE.Vector3(3.2, 2.5, -4.5), target: new THREE.Vector3(0, 1.2, -18), fov: 65 },
  // Projects – command screens console desk center
  { pos: new THREE.Vector3(0, 1.4, -20.5), target: new THREE.Vector3(0, 1.2, -30), fov: 68 },
  // Experience – tunnel/corridor feel walking past data nodes
  { pos: new THREE.Vector3(-1.8, 1.1, -31.5), target: new THREE.Vector3(0, 0.8, -42), fov: 72 },
  // Contact – wide open transmission tower looking up
  { pos: new THREE.Vector3(2.8, 2.6, -45.5), target: new THREE.Vector3(0, 10, -56), fov: 58 },
];

export class CinematicCamera {
  constructor(renderer) {
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Create Splines for positions and targets
    this.posSpline = new THREE.CatmullRomCurve3(WAYPOINTS.map(w => w.pos));
    this.targetSpline = new THREE.CatmullRomCurve3(WAYPOINTS.map(w => w.target));

    this.camera.position.copy(WAYPOINTS[0].pos);
    this.camera.lookAt(WAYPOINTS[0].target);

    this.scrollPercent = 0;
    this.targetScrollPercent = 0;

    this.mouseX = 0; this.mouseY = 0;
    this.targetMouseX = 0; this.targetMouseY = 0;

    // Shake & Handheld state
    this._shakeMagnitude = 0;
    this._shakeDuration  = 0;
    this._shakeTime      = 0;
    this.time = 0;

    // Photo Mode Orbital properties
    this.isDragging = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.orbitX = 0;
    this.orbitY = 0;

    window.addEventListener('resize', () => this._onResize());
    window.addEventListener('mousemove', e => this._onMouseMove(e));
    window.addEventListener('mousedown', e => this._onMouseDown(e));
    window.addEventListener('mouseup', () => this._onMouseUp());
    window.addEventListener('touchstart', e => this._onTouchStart(e), { passive: false });
    window.addEventListener('touchmove', e => this._onTouchMove(e), { passive: false });
    window.addEventListener('touchend', () => this._onTouchEnd());

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', e => this._onDeviceOrientation(e));
    }
  }

  setScrollPercent(pct) {
    this.targetScrollPercent = pct;
  }

  shake(magnitude = 0.15, duration = 0.3) {
    this._shakeMagnitude = magnitude;
    this._shakeDuration  = duration;
    this._shakeTime      = 0;
  }

  update(delta, qualityLevel = 'high') {
    this.time += delta;

    // Check if reduced motion is enabled via accessibility
    const motionIntensity = AppState.state.motionIntensity !== undefined ? AppState.state.motionIntensity : 1.0;

    // ─── 1. PHOTO MODE ORBITAL CAMERA OVERRIDE ───
    if (AppState.state.photoModeActive) {
      // Camera orbits around the current active section's target
      const wp = WAYPOINTS[AppState.state.currentSection];
      const radius = 6.0;

      const targetPos = new THREE.Vector3(
        wp.target.x + radius * Math.sin(this.orbitX) * Math.cos(this.orbitY),
        wp.target.y + radius * Math.sin(this.orbitY),
        wp.target.z + radius * Math.cos(this.orbitX) * Math.cos(this.orbitY)
      );

      this.camera.position.lerp(targetPos, 0.08);
      this.camera.lookAt(wp.target);
      return;
    }

    // ─── 2. NORMAL SPLINE CAMERA INTERPOLATION ───
    // Lerp scroll progress with inertia
    this.scrollPercent += (this.targetScrollPercent - this.scrollPercent) * 0.055;
    this.scrollPercent = THREE.MathUtils.clamp(this.scrollPercent, 0, 1.0);

    // Sample positions from splines
    const targetPos = this.posSpline.getPointAt(this.scrollPercent);
    let targetLAt = this.targetSpline.getPointAt(this.scrollPercent);

    // Look-ahead Target Blending: look slightly ahead along the lookAt spline
    if (this.scrollPercent < 0.95) {
      const lookAheadPct = THREE.MathUtils.clamp(this.scrollPercent + 0.04, 0, 1.0);
      const lookAheadTarget = this.targetSpline.getPointAt(lookAheadPct);
      targetLAt.lerp(lookAheadTarget, 0.3); // blend lookahead
    }

    // Sampe FOV
    const total = WAYPOINTS.length - 1;
    const raw = this.scrollPercent * total;
    const idxA = Math.min(Math.floor(raw), total - 1);
    const idxB = idxA + 1;
    const t = raw - idxA;
    const wpA = WAYPOINTS[idxA];
    const wpB = WAYPOINTS[idxB];
    const targetFOV = wpA.fov + (wpB.fov - wpA.fov) * t;

    // Parallax sway
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

    targetPos.x += this.mouseX * 1.5 * motionIntensity;
    targetPos.y -= this.mouseY * 0.8 * motionIntensity;

    // Handheld camera noise drift when stationary to simulate floating drone
    const isStationary = Math.abs(this.targetScrollPercent - this.scrollPercent) < 0.002;
    if (isStationary && motionIntensity > 0.1) {
      targetPos.x += Math.sin(this.time * 0.8) * 0.08 * motionIntensity;
      targetPos.y += Math.cos(this.time * 0.6) * 0.06 * motionIntensity;
      targetPos.z += Math.sin(this.time * 0.4) * 0.04 * motionIntensity;
    }

    // Camera shake
    if (this._shakeDuration > 0) {
      this._shakeTime += delta;
      const progress = this._shakeTime / this._shakeDuration;
      if (progress < 1) {
        const decay = 1 - progress;
        targetPos.x += (Math.random() - 0.5) * this._shakeMagnitude * decay * motionIntensity;
        targetPos.y += (Math.random() - 0.5) * this._shakeMagnitude * decay * motionIntensity;
      } else {
        this._shakeDuration = 0;
      }
    }

    // Apply adjustments
    this.camera.position.lerp(targetPos, 0.075);
    this.camera.lookAt(targetLAt);

    this.camera.fov += (targetFOV - this.camera.fov) * 0.05;
    this.camera.updateProjectionMatrix();
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  _onMouseMove(e) {
    if (AppState.state.photoModeActive && this.isDragging) {
      const deltaX = e.clientX - this.prevMouseX;
      const deltaY = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      this.orbitX -= deltaX * 0.007;
      this.orbitY = THREE.MathUtils.clamp(this.orbitY + deltaY * 0.007, -Math.PI / 3, Math.PI / 3);
    } else {
      this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }
  }

  _onMouseDown(e) {
    if (AppState.state.photoModeActive) {
      this.isDragging = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    }
  }

  _onMouseUp() {
    this.isDragging = false;
  }

  _onTouchStart(e) {
    if (AppState.state.photoModeActive) {
      this.isDragging = true;
      const t = e.touches[0];
      this.prevMouseX = t.clientX;
      this.prevMouseY = t.clientY;
    }
  }

  _onTouchMove(e) {
    if (AppState.state.photoModeActive && this.isDragging) {
      const t = e.touches[0];
      const deltaX = t.clientX - this.prevMouseX;
      const deltaY = t.clientY - this.prevMouseY;
      this.prevMouseX = t.clientX;
      this.prevMouseY = t.clientY;
      this.orbitX -= deltaX * 0.007;
      this.orbitY = THREE.MathUtils.clamp(this.orbitY + deltaY * 0.007, -Math.PI / 3, Math.PI / 3);
    } else if (!AppState.state.photoModeActive) {
      const t = e.touches[0];
      this.targetMouseX = (t.clientX / window.innerWidth - 0.5) * 2;
      this.targetMouseY = (t.clientY / window.innerHeight - 0.5) * 2;
    }
  }

  _onTouchEnd() {
    this.isDragging = false;
  }

  _onDeviceOrientation(e) {
    if (AppState.state.photoModeActive) return;
    if (e.gamma !== null) this.targetMouseX = THREE.MathUtils.clamp(e.gamma / 45, -1, 1);
    if (e.beta  !== null) this.targetMouseY = THREE.MathUtils.clamp((e.beta - 45) / 45, -1, 1);
  }
}
