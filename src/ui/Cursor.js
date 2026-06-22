// Cursor.js — Custom cursor and particle trail (extracted from main.js)

import { bus } from '../core/EventBus.js';
import { AppState } from '../core/AppState.js';

let cursor, follower, trailCanvas, trailCtx;
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;
let followerScale = 1.0;
let trailParticles = [];
let lastMoveTime = 0;
let animating = false;
let cachedThemeColor = '#00e5ff';

export function initCursor() {
  // On mobile/touch: skip cursor entirely
  if (AppState.state.isMobile || AppState.state.isTablet) {
    const c = document.getElementById('custom-cursor');
    const f = document.getElementById('custom-cursor-follower');
    if (c) c.style.display = 'none';
    if (f) f.style.display = 'none';
    return;
  }

  cursor   = document.getElementById('custom-cursor');
  follower = document.getElementById('custom-cursor-follower');
  if (!cursor || !follower) return;

  // Show cursor
  cursor.style.display = 'block';
  follower.style.display = 'block';

  window.addEventListener('mousemove', onMouseMove);
  updateFollower();
  initTrail();
  bindInteractiveEvents();

  // Listen for theme color changes
  bus.on('theme:color', color => { cachedThemeColor = color; });
}

function onMouseMove(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

  const now = performance.now();
  if (now - lastMoveTime < 16) return;
  lastMoveTime = now;

  trailParticles.push({
    x: e.clientX, y: e.clientY,
    size: Math.random() * 4 + 2,
    life: 1.0,
    decay: 0.02 + Math.random() * 0.015,
    color: cachedThemeColor,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5
  });
}

function updateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%) scale(${followerScale}) rotate(45deg)`;
  requestAnimationFrame(updateFollower);
}

function initTrail() {
  if (AppState.state.prefersReducedMotion) return;

  trailCanvas = document.createElement('canvas');
  trailCanvas.id = 'cursor-trail-canvas';
  Object.assign(trailCanvas.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100vw', height: '100vh',
    pointerEvents: 'none', zIndex: '10000'
  });
  document.body.appendChild(trailCanvas);
  trailCtx = trailCanvas.getContext('2d');

  const resize = () => {
    trailCanvas.width  = window.innerWidth;
    trailCanvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  animateTrail();
}

function animateTrail() {
  if (!trailCtx) return;
  trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

  for (let i = trailParticles.length - 1; i >= 0; i--) {
    const p = trailParticles[i];
    p.x += p.vx; p.y += p.vy;
    p.life -= p.decay;
    if (p.life <= 0) { trailParticles.splice(i, 1); continue; }

    trailCtx.globalAlpha = p.life * 0.45;
    trailCtx.fillStyle = p.color;
    trailCtx.save();
    trailCtx.translate(p.x, p.y);
    trailCtx.rotate(p.life * Math.PI);
    const sz = p.size * p.life;
    trailCtx.fillRect(-sz / 2, -sz / 2, sz, sz);
    trailCtx.restore();
  }
  trailCtx.globalAlpha = 1.0;
  requestAnimationFrame(animateTrail);
}

export function bindInteractiveEvents() {
  const selector = 'button, a, input, textarea, .hud-dot-container, #audio-control-widget, .project-mini-row, .channel-link-btn, .hud-brand-logo-frame, .terminal-close-btn, .ai-assistant-btn';
  document.querySelectorAll(selector).forEach(el => {
    el.removeEventListener('mouseenter', onHoverIn);
    el.removeEventListener('mouseleave', onHoverOut);
    el.addEventListener('mouseenter', onHoverIn);
    el.addEventListener('mouseleave', onHoverOut);
  });
}

function onHoverIn() {
  if (!cursor || !follower) return;
  cursor.style.width  = '24px';
  cursor.style.height = '24px';
  cursor.style.backgroundColor = 'rgba(0, 229, 255, 0.35)';
  followerScale = 1.3;
  follower.style.borderColor  = '#ffffff';
  follower.style.borderRadius = '50%';
  bus.emit('cursor:hover', true);
}

function onHoverOut() {
  if (!cursor || !follower) return;
  cursor.style.width  = '10px';
  cursor.style.height = '10px';
  cursor.style.backgroundColor = '#ffffff';
  followerScale = 1.0;
  follower.style.borderColor  = 'var(--accent-cyan)';
  follower.style.borderRadius = '0';
  bus.emit('cursor:hover', false);
}
