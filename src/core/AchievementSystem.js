// AchievementSystem.js — Gamification and achievement toasts (Phase 19)

import { bus } from './EventBus.js';
import { AppState } from './AppState.js';
import { analytics } from './Analytics.js';

let toastEl, _achievementDefs = {};

export function initAchievements(achievementsData) {
  toastEl = document.getElementById('achievement-toast');
  _achievementDefs = {};
  (achievementsData?.achievements || []).forEach(a => { _achievementDefs[a.id] = a; });

  bus.on('achievement:unlock', id => unlock(id));
}

function unlock(id) {
  if (AppState.hasAchievement(id)) return; // Already unlocked
  const def = _achievementDefs[id];
  if (!def) return;

  AppState.saveAchievement(id);
  analytics.trackAchievementUnlocked();
  showToast(def);
  bus.emit('audio:achievement');
}

function showToast(def) {
  if (!toastEl) return;
  const colorMap = { cyan: 'var(--accent-cyan)', pink: 'var(--accent-pink)', purple: 'var(--accent-purple)', green: 'var(--accent-green)', yellow: 'var(--accent-yellow)' };
  const color = colorMap[def.color] || 'var(--accent-cyan)';

  toastEl.innerHTML = `
    <div class="achievement-inner" style="border-color: ${color}; box-shadow: 4px 4px 0 ${color}">
      <span class="achievement-icon-large">${def.icon}</span>
      <div class="achievement-text-block">
        <span class="achievement-label" style="color: ${color}">// ACHIEVEMENT UNLOCKED</span>
        <strong class="achievement-name">${def.title}</strong>
        <p class="achievement-desc">${def.description}</p>
      </div>
    </div>`;

  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 4500);
}
