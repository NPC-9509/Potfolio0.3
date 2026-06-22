// MobileNav.js — Bottom navigation bar for mobile devices

import { bus } from '../core/EventBus.js';
import { navigateTo } from './HUD.js';
import { AppState } from '../core/AppState.js';

const NAV_ITEMS = [
  { label: 'Home',      icon: '⬡', target: 0, action: 'nav' },
  { label: 'About',     icon: '◈', target: 1, action: 'nav' },
  { label: 'Skills',    icon: '◉', target: 2, action: 'nav' },
  { label: 'Projects',  icon: '◆', target: 3, action: 'nav' },
  { label: 'Timeline',  icon: '◎', target: 4, action: 'nav' },
  { label: 'Contact',   icon: '▣', target: 5, action: 'nav' },
  { label: 'Terminal',  icon: '>_', target: null, action: 'terminal' },
  { label: 'AI Guide',  icon: '◈', target: null, action: 'ai' },
];

let navEl;

export function initMobileNav() {
  if (!AppState.state.isMobile) return;

  navEl = document.createElement('nav');
  navEl.id = 'mobile-nav';
  navEl.setAttribute('aria-label', 'Mobile navigation');
  navEl.innerHTML = NAV_ITEMS.map(item => `
    <button class="mob-nav-btn" data-target="${item.target}" data-action="${item.action}" aria-label="${item.action === 'nav' ? 'Go to ' + item.label : item.label}">
      <span class="mob-nav-icon">${item.icon}</span>
      <span class="mob-nav-label">${item.label}</span>
    </button>
  `).join('');
  document.body.appendChild(navEl);

  navEl.querySelectorAll('.mob-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      if (action === 'terminal') {
        bus.emit('terminal:open');
        return;
      }
      if (action === 'ai') {
        bus.emit('assistant:toggle');
        return;
      }
      const idx = parseInt(btn.getAttribute('data-target'));
      navigateTo(idx);
      setActive(idx);
      bus.emit('audio:click');
    });
  });

  // Keep in sync with section changes
  bus.on('section:change', idx => setActive(idx));
  setActive(0);
}

function setActive(idx) {
  if (!navEl) return;
  navEl.querySelectorAll('.mob-nav-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === idx);
  });
}
