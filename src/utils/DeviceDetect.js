// DeviceDetect.js — Device and capability detection utilities

export function isMobile() {
  return window.matchMedia('(max-width: 768px)').matches ||
    ('ontouchstart' in window && window.innerWidth < 768);
}

export function isTablet() {
  return window.matchMedia('(min-width: 769px) and (max-width: 1024px)').matches;
}

export function isTouch() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function prefersHighContrast() {
  return window.matchMedia('(forced-colors: active)').matches;
}

export function getDevicePixelRatio(quality = 'high') {
  const dpr = window.devicePixelRatio || 1;
  if (quality === 'low') return Math.min(dpr, 1);
  if (quality === 'medium') return Math.min(dpr, 1.5);
  return Math.min(dpr, 2);
}

export function getParticleCount(quality = 'high') {
  if (quality === 'low') return 80;
  if (quality === 'medium') return 250;
  return 500;
}

// Simple GPU tier estimate — no heavy GPU checks needed for this project
export function getQualityLevel() {
  if (isMobile()) return 'low';
  if (isTablet()) return 'medium';
  return 'high';
}
