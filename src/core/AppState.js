// AppState.js — Centralized application state

import { bus } from './EventBus.js';

const state = {
  currentSection: 0,
  totalSections: 6,
  audioEnabled: false,
  audioVolume: 0.7,
  isMobile: false,
  isTablet: false,
  prefersReducedMotion: false,
  qualityLevel: 'high', // 'high' | 'medium' | 'low'
  terminalOpen: false,
  assistantOpen: false,
  modalOpen: null,
  bikeLogoClickCount: 0,
  achievements: {},
  scrollPercent: 0,
};

function init() {
  // Device detection
  const mq = window.matchMedia('(max-width: 768px)');
  const mqTablet = window.matchMedia('(max-width: 1024px)');
  state.isMobile  = mq.matches;
  state.isTablet  = mqTablet.matches && !mq.matches;
  mq.addEventListener('change', e => { state.isMobile = e.matches; });

  // Reduced motion
  const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  state.prefersReducedMotion = motionMq.matches;
  motionMq.addEventListener('change', e => {
    state.prefersReducedMotion = e.matches;
    bus.emit('reduced-motion-change', e.matches);
  });

  // Quality detection based on device
  if (state.isMobile) {
    state.qualityLevel = 'low';
  } else if (state.isTablet) {
    state.qualityLevel = 'medium';
  } else {
    state.qualityLevel = 'high';
  }

  // Restore audio preference
  const savedAudio = localStorage.getItem('mv-audio-enabled');
  if (savedAudio !== null) {
    state.audioEnabled = savedAudio === 'true';
  }

  // Restore achievements
  const savedAchievements = localStorage.getItem('mv-achievements');
  if (savedAchievements) {
    try { state.achievements = JSON.parse(savedAchievements); } catch(e) {}
  }
}

function set(key, value) {
  const old = state[key];
  state[key] = value;
  bus.emit(`state:${key}`, { value, old });
}

function get(key) {
  return state[key];
}

function saveAudio() {
  localStorage.setItem('mv-audio-enabled', state.audioEnabled);
}

function saveAchievement(id) {
  state.achievements[id] = Date.now();
  localStorage.setItem('mv-achievements', JSON.stringify(state.achievements));
}

function hasAchievement(id) {
  return !!state.achievements[id];
}

export const AppState = { init, set, get, saveAudio, saveAchievement, hasAchievement, state };
