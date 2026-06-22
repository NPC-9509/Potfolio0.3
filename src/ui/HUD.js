// HUD.js — HUD navigation panel module

import { bus } from '../core/EventBus.js';
import { AppState } from '../core/AppState.js';

let hudDots, sections, scrollContainer;

export function initHUD() {
  hudDots = document.querySelectorAll('.hud-dot-container');
  sections = document.querySelectorAll('.comic-chapter');
  scrollContainer = document.getElementById('scroll-container');

  // Dot click navigation
  hudDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-target'));
      navigateTo(idx);
      bus.emit('audio:click');
    });
    // Keyboard support
    dot.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dot.click(); }
    });
  });

  // Brand logo click -> sec-0
  const brandLogo = document.querySelector('.hud-brand-logo-frame');
  if (brandLogo) {
    brandLogo.addEventListener('click', e => {
      e.stopPropagation();
      navigateTo(0);
      bus.emit('audio:click');

      // Achievement: bike logo clicked 5 times
      AppState.state.bikeLogoClickCount++;
      if (AppState.state.bikeLogoClickCount >= 5) {
        bus.emit('achievement:unlock', 'speed-demon');
      }
    });
  }

  // Listen for section changes to update active dot
  bus.on('section:change', idx => updateActiveDot(idx));
}

export function navigateTo(idx) {
  const target = document.getElementById(`sec-${idx}`);
  if (target && scrollContainer) {
    scrollContainer.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
  }
  AppState.set('currentSection', idx);
  updateActiveDot(idx);
}

export function updateActiveDot(idx) {
  hudDots.forEach((dot, i) => {
    if (i === idx) { dot.classList.add('active'); }
    else { dot.classList.remove('active'); }
  });
}

export function updateFromScroll(scrollTop) {
  if (!sections || !sections.length) return;
  let currentIdx = 0;
  const viewHeight = window.innerHeight;
  sections.forEach((sec, idx) => {
    if (scrollTop >= sec.offsetTop - viewHeight * 0.4) currentIdx = idx;
  });
  if (currentIdx !== AppState.state.currentSection) {
    AppState.set('currentSection', currentIdx);
    updateActiveDot(currentIdx);
    bus.emit('section:change', currentIdx);

    // Section achievement
    if (currentIdx === 5) bus.emit('achievement:unlock', 'first-contact');
  }
}
