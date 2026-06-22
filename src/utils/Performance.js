// Performance.js — Dynamic Performance Engine (Phase 12)

import { bus } from '../core/EventBus.js';
import { AppState } from '../core/AppState.js';

class PerformanceManager {
  constructor() {
    this.fps = 60;
    this.frameTimes = [];
    this.lastFrameTime = performance.now();
    this.monitoring = false;
    this.checkCount = 0;
    this.preset = 'auto'; // auto | ultra | high | medium | low | battery-saver
  }

  init() {
    // Restore preset preference
    const savedPreset = localStorage.getItem('mv-graphics-preset');
    this.preset = savedPreset || 'auto';
    AppState.state.graphicsPreset = this.preset;

    if (this.preset === 'auto') {
      this.detectHardware();
    } else {
      this.applyPreset(this.preset);
    }

    // Start FPS tracking loop
    this.startFPSMonitor();
  }

  detectHardware() {
    const isMobile = AppState.state.isMobile;
    const isTablet = AppState.state.isTablet;

    // Detect basic capabilities
    let detectedPreset = 'high';
    if (isMobile) {
      detectedPreset = 'low';
    } else if (isTablet) {
      detectedPreset = 'medium';
    } else {
      // Test canvas capability or high-refresh support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_ID_WEBGL) || '';
          const lowEndGpus = /intel|hd graphics|uhd|iris|mobile/i;
          const highEndGpus = /nvidia|rtx|gtx|amd|radeon/i;

          if (lowEndGpus.test(renderer)) {
            detectedPreset = 'medium';
          } else if (highEndGpus.test(renderer)) {
            detectedPreset = 'ultra';
          }
        }
      }
    }

    this.applyPreset(detectedPreset, false); // apply without saving preset key
    AppState.set('qualityLevel', detectedPreset);
  }

  applyPreset(preset, savePreference = true) {
    if (savePreference) {
      this.preset = preset;
      AppState.state.graphicsPreset = preset;
      localStorage.setItem('mv-graphics-preset', preset);
    }

    let quality = preset;
    if (preset === 'auto') {
      this.detectHardware();
      return;
    }

    AppState.set('qualityLevel', quality);

    // Dynamic config overrides based on preset
    const config = {
      ultra: { particles: 500, bloom: true, weather: 'full', shadow: true, animDensity: 'full' },
      high: { particles: 350, bloom: true, weather: 'full', shadow: true, animDensity: 'high' },
      medium: { particles: 200, bloom: false, weather: 'medium', shadow: false, animDensity: 'medium' },
      low: { particles: 80, bloom: false, weather: 'low', shadow: false, animDensity: 'low' },
      'battery-saver': { particles: 30, bloom: false, weather: 'none', shadow: false, animDensity: 'none' }
    };

    AppState.state.graphicsConfig = config[quality] || config.high;
    bus.emit('graphics:quality-changed', quality);
  }

  startFPSMonitor() {
    this.monitoring = true;
    this.lastFrameTime = performance.now();
    this.frameTimes = [];
    this.tick();
  }

  tick() {
    if (!this.monitoring) return;

    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Track frame rate over last 60 frames
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }

    const avgTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.fps = Math.round(1000 / avgTime);
    AppState.state.fps = this.fps;

    // Adaptive scaling loop: if FPS is low under auto preset
    if (this.preset === 'auto') {
      this.checkCount++;
      if (this.checkCount > 180) { // check every ~3 seconds at 60fps
        this.checkCount = 0;
        this.runAdaptiveAdjustment();
      }
    }

    requestAnimationFrame(() => this.tick());
  }

  runAdaptiveAdjustment() {
    // If frame rate is consistently low, auto degrade quality
    if (this.fps < 40 && AppState.state.qualityLevel !== 'battery-saver') {
      const tiers = ['ultra', 'high', 'medium', 'low', 'battery-saver'];
      const currentIdx = tiers.indexOf(AppState.state.qualityLevel);
      if (currentIdx !== -1 && currentIdx < tiers.length - 1) {
        const nextQuality = tiers[currentIdx + 1];
        console.warn(`[Performance] FPS dropped to ${this.fps}. Auto downgrading quality from ${AppState.state.qualityLevel} to ${nextQuality}`);
        AppState.set('qualityLevel', nextQuality);
        AppState.state.graphicsConfig.particles = Math.max(30, AppState.state.graphicsConfig.particles - 80);
        bus.emit('graphics:quality-changed', nextQuality);
      }
    }
  }
}

export const performanceManager = new PerformanceManager();
