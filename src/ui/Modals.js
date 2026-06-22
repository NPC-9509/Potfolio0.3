// Modals.js — Modal open/close coordination

import { bus } from '../core/EventBus.js';
import { AppState } from '../core/AppState.js';
import { bindInteractiveEvents } from './Cursor.js';

const scrollContainer = () => document.getElementById('scroll-container');

const modalMap = [
  { triggerId: 'btn-open-about',      modalId: 'modal-about'      },
  { triggerId: 'btn-open-skills',     modalId: 'modal-skills'     },
  { triggerId: 'btn-open-projects',   modalId: 'modal-projects'   },
  { triggerId: 'btn-open-experience', modalId: 'modal-experience' },
  { triggerId: 'row-proj-1',          modalId: 'modal-projects'   },
  { triggerId: 'row-proj-2',          modalId: 'modal-projects'   },
  { triggerId: 'row-proj-3',          modalId: 'modal-projects'   },
  { triggerId: 'settings-open-btn',   modalId: 'modal-settings'   },
  { triggerId: 'link-resume',         modalId: 'modal-resume-room'}
];

let _lastFocused = null;

export function initModals() {
  // Open triggers
  modalMap.forEach(({ triggerId, modalId }) => {
    const trigger = document.getElementById(triggerId);
    const modal   = document.getElementById(modalId);
    if (!trigger || !modal) return;

    trigger.addEventListener('click', (e) => {
      if (trigger.tagName === 'A' && trigger.hasAttribute('download')) {
        e.preventDefault();
      }
      openModal(modalId);
    });
  });

  // Close buttons
  document.querySelectorAll('.modal-close-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-close');
      closeModal(id);
    });
  });

  // Backdrop click
  document.querySelectorAll('.comic-detail-modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal || e.target.classList.contains('modal-hologram-wrapper')) {
        closeModal(modal.id);
      }
    });
  });

  // ESC key
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && AppState.state.modalOpen) {
      closeModal(AppState.state.modalOpen);
    }
  });

  bus.on('modal:open',  id => openModal(id));
  bus.on('modal:close', id => closeModal(id));
}

export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  _lastFocused = document.activeElement;
  AppState.set('modalOpen', modalId);
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');

  const sc = scrollContainer();
  if (sc) sc.style.overflowY = 'hidden';

  // Focus first focusable element inside modal
  const firstFocusable = modal.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
  if (firstFocusable) setTimeout(() => firstFocusable.focus(), 50);

  bus.emit('audio:click');

  // Achievement: opened all modals?
  const openedSet = AppState.state.openedModals || new Set();
  openedSet.add(modalId);
  AppState.state.openedModals = openedSet;
  if (openedSet.size >= 4) bus.emit('achievement:unlock', 'code-archaeology');
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  AppState.set('modalOpen', null);
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');

  const sc = scrollContainer();
  if (sc) sc.style.overflowY = 'auto';

  // Restore focus
  if (_lastFocused) { _lastFocused.focus(); _lastFocused = null; }

  bus.emit('audio:click');
}
