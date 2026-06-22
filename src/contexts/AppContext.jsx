import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { bus } from './EventBus.js';
import { AppState } from '../core/AppState.js';

const AppContext = createContext(null);

const defaultState = {
  currentSection: 0,
  totalSections: 6,
  audioEnabled: false,
  audioVolume: 0.7,
  isMobile: false,
  isTablet: false,
  prefersReducedMotion: false,
  qualityLevel: 'high',
  graphicsPreset: 'auto',
  terminalOpen: false,
  assistantOpen: false,
  modalOpen: null,
  bikeLogoClickCount: 0,
  achievements: {},
  scrollPercent: 0,
  fps: 60,
  captionsEnabled: true,
  highContrast: false,
  motionIntensity: 1.0,
  photoModeActive: false,
  currentTimeOfDay: 'neon',
  currentWeather: 'rain',
  openedModals: new Set(),
  aiVoiceEnabled: false,
};

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const mqTablet = window.matchMedia('(max-width: 1024px)');
    const isMobile = mq.matches;
    const isTablet = mqTablet.matches && !mq.matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let quality = 'high';
    if (isMobile) quality = 'low';
    else if (isTablet) quality = 'medium';

    const savedAudio = localStorage.getItem('mv-audio-enabled');
    const audioEnabled = savedAudio !== null ? savedAudio === 'true' : false;

    const savedAchievements = localStorage.getItem('mv-achievements');
    let achievements = {};
    if (savedAchievements) {
      try { achievements = JSON.parse(savedAchievements); } catch(e) {}
    }

    return {
      ...defaultState,
      isMobile,
      isTablet,
      prefersReducedMotion: reducedMotion,
      qualityLevel: quality,
      audioEnabled,
      achievements,
    };
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const mqTablet = window.matchMedia('(max-width: 1024px)');
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleMobile = (e) => setState(s => ({ ...s, isMobile: e.matches }));
    const handleTablet = (e) => setState(s => ({ ...s, isTablet: e.matches && !s.isMobile }));
    const handleMotion = (e) => {
      setState(s => ({ ...s, prefersReducedMotion: e.matches }));
      bus.emit('reduced-motion-change', e.matches);
    };

    mq.addEventListener('change', handleMobile);
    mqTablet.addEventListener('change', handleTablet);
    motionMq.addEventListener('change', handleMotion);

    return () => {
      mq.removeEventListener('change', handleMobile);
      mqTablet.removeEventListener('change', handleTablet);
      motionMq.removeEventListener('change', handleMotion);
    };
  }, []);

  useEffect(() => {
    // Keep legacy AppState.state synchronized with React state
    if (AppState && AppState.state) {
      Object.keys(state).forEach(key => {
        AppState.state[key] = state[key];
      });
    }
  }, [state]);

  const updateState = useCallback((key, value) => {
    setState(s => {
      const old = s[key];
      const next = { ...s, [key]: value };
      bus.emit(`state:${key}`, { value, old });
      return next;
    });
  }, []);

  const saveAudio = useCallback(() => {
    localStorage.setItem('mv-audio-enabled', state.audioEnabled);
  }, [state.audioEnabled]);

  const saveAchievement = useCallback((id) => {
    setState(s => {
      const newAchievements = { ...s.achievements, [id]: Date.now() };
      localStorage.setItem('mv-achievements', JSON.stringify(newAchievements));
      return { ...s, achievements: newAchievements };
    });
  }, []);

  const hasAchievement = useCallback((id) => {
    return !!state.achievements[id];
  }, [state.achievements]);

  const value = {
    state,
    setState,
    updateState,
    saveAudio,
    saveAchievement,
    hasAchievement,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
