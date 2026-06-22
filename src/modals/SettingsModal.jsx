import React, { useState, useEffect } from 'react';
import { bus } from '../contexts/EventBus.js';
import { useApp } from '../contexts/AppContext.jsx';

export default function SettingsModal() {
  const { state, updateState } = useApp();
  const [settings, setSettings] = useState({
    captions: true,
    highContrast: false,
    reducedMotion: false,
    motionIntensity: 1.0,
  });

  useEffect(() => {
    setSettings({
      captions: localStorage.getItem('setting-captions') !== 'false',
      highContrast: localStorage.getItem('setting-highcontrast') === 'true',
      reducedMotion: localStorage.getItem('setting-reducedmotion') === 'true' || state.prefersReducedMotion,
      motionIntensity: parseFloat(localStorage.getItem('setting-motionintensity') || '1.0'),
    });
  }, [state.prefersReducedMotion]);

  const handleCaptions = (e) => {
    const val = e.target.checked;
    setSettings(s => ({ ...s, captions: val }));
    localStorage.setItem('setting-captions', val);
    updateState('captionsEnabled', val);
  };

  const handleHighContrast = (e) => {
    const val = e.target.checked;
    setSettings(s => ({ ...s, highContrast: val }));
    localStorage.setItem('setting-highcontrast', val);
    updateState('highContrast', val);
    document.body.classList.toggle('high-contrast', val);
  };

  const handleReducedMotion = (e) => {
    const val = e.target.checked;
    setSettings(s => ({ ...s, reducedMotion: val }));
    localStorage.setItem('setting-reducedmotion', val);
    updateState('prefersReducedMotion', val);
    bus.emit('reduced-motion-change', val);
  };

  const handleMotionIntensity = (e) => {
    const val = parseFloat(e.target.value);
    setSettings(s => ({ ...s, motionIntensity: val }));
    localStorage.setItem('setting-motionintensity', val);
    updateState('motionIntensity', val);
  };

  const handlePhotoMode = () => {
    updateState('photoModeActive', true);
    document.body.classList.add('photo-mode');
    const exitBtn = document.getElementById('photo-mode-exit-btn');
    if (exitBtn) exitBtn.style.display = 'block';
    bus.emit('modal:close', 'modal-settings');
  };

  return (
    <div className="comic-detail-modal" id="modal-settings" role="dialog" aria-modal="true" aria-label="Settings Panel" aria-hidden="true">
      <div className="modal-hologram-wrapper w-full max-w-[1000px] relative">
        <button className="modal-close-trigger absolute top-5 right-6 bg-[rgba(12,4,28,0.5)] backdrop-blur-md text-text-muted border border-white/10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer z-[100] transition-all duration-300 hover:scale-105 hover:rotate-90 hover:text-accent-pink hover:border-accent-pink/40 hover:shadow-[0_0_15px_rgba(255,42,133,0.25)]"
          data-close="modal-settings" aria-label="Close Settings modal"
          onClick={() => bus.emit('modal:close', 'modal-settings')}>✕</button>
        <div className="modal-comic-book-page modal-glass px-[3.8rem] py-12 rounded-xl">
          <div className="modal-comic-header border-b border-white/15 pb-5 mb-8">
            <span className="chapter-number font-mono text-xs text-accent-pink block mb-1">SYSTEM CONFIGURATION // OPTIONS</span>
            <h2 className="modal-comic-title font-display text-3xl font-black tracking-wide text-white uppercase" style={{textShadow: '0 0 15px rgba(0, 229, 255, 0.35)'}}>CONTROL PANEL</h2>
          </div>
          <div className="settings-panel-grid grid grid-cols-2 gap-4">
            <div className="settings-panel-section bg-black/30 backdrop-blur-sm border border-white/[0.06] rounded-lg p-5">
              <h3 className="settings-sec-title font-mono text-xs text-accent-cyan mb-3">// GRAPHICS PRESET</h3>
              <div className="settings-buttons-group flex flex-wrap gap-2">
                {['ultra', 'high', 'medium', 'low', 'battery-saver', 'auto'].map(preset => (
                  <button key={preset}
                    className={`preset-btn font-mono text-[0.65rem] px-3 py-1.5 border border-white/10 rounded text-text-muted cursor-pointer transition-all hover:bg-accent-cyan/10 hover:text-accent-cyan ${(state.graphicsPreset || 'auto') === preset ? 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40' : ''}`}
                    data-preset={preset}
                    onClick={() => { updateState('graphicsPreset', preset); updateState('qualityLevel', preset); bus.emit('graphics:quality-changed', preset); }}
                  >{preset.toUpperCase()}</button>
                ))}
              </div>
            </div>
            <div className="settings-panel-section bg-black/30 backdrop-blur-sm border border-white/[0.06] rounded-lg p-5">
              <h3 className="settings-sec-title font-mono text-xs text-accent-cyan mb-3">// WEATHER CONDITIONS</h3>
              <div className="settings-buttons-group flex flex-wrap gap-2">
                {['rain', 'fog', 'dust', 'digital', 'snow', 'none'].map(w => (
                  <button key={w}
                    className={`weather-btn font-mono text-[0.65rem] px-3 py-1.5 border border-white/10 rounded text-text-muted cursor-pointer transition-all hover:bg-accent-cyan/10 hover:text-accent-cyan ${state.currentWeather === w ? 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40' : ''}`}
                    data-weather={w}
                    onClick={() => { updateState('currentWeather', w); bus.emit('settings:weather', w); }}
                  >{w.toUpperCase()}</button>
                ))}
              </div>
            </div>
            <div className="settings-panel-section bg-black/30 backdrop-blur-sm border border-white/[0.06] rounded-lg p-5">
              <h3 className="settings-sec-title font-mono text-xs text-accent-cyan mb-3">// TIME OF DAY</h3>
              <div className="settings-buttons-group flex flex-wrap gap-2">
                {['morning', 'sunset', 'night', 'neon'].map(tod => (
                  <button key={tod}
                    className={`tod-btn font-mono text-[0.65rem] px-3 py-1.5 border border-white/10 rounded text-text-muted cursor-pointer transition-all hover:bg-accent-cyan/10 hover:text-accent-cyan ${state.currentTimeOfDay === tod ? 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40' : ''}`}
                    data-tod={tod}
                    onClick={() => { updateState('currentTimeOfDay', tod); bus.emit('settings:timeofday', tod); }}
                  >{tod.toUpperCase()}</button>
                ))}
              </div>
            </div>
            <div className="settings-panel-section bg-black/30 backdrop-blur-sm border border-white/[0.06] rounded-lg p-5">
              <h3 className="settings-sec-title font-mono text-xs text-accent-cyan mb-3">// ACCESSIBILITY CONFIGS</h3>
              <label className="setting-switch-wrapper flex items-center gap-3 mb-2 cursor-pointer">
                <input type="checkbox" checked={settings.captions} onChange={handleCaptions} className="w-4 h-4" />
                <span className="setting-switch-label font-mono text-xs text-text-muted">Audio Captions (Subtitles)</span>
              </label>
              <label className="setting-switch-wrapper flex items-center gap-3 mb-2 cursor-pointer">
                <input type="checkbox" checked={settings.highContrast} onChange={handleHighContrast} className="w-4 h-4" />
                <span className="setting-switch-label font-mono text-xs text-text-muted">High Contrast Theme</span>
              </label>
              <label className="setting-switch-wrapper flex items-center gap-3 mb-2 cursor-pointer">
                <input type="checkbox" checked={settings.reducedMotion} onChange={handleReducedMotion} className="w-4 h-4" />
                <span className="setting-switch-label font-mono text-xs text-text-muted">Reduced Motion Mode</span>
              </label>
              <div className="setting-range-wrapper flex items-center gap-2 mb-2">
                <label className="setting-range-label font-mono text-xs text-text-muted" htmlFor="setting-motionintensity">Motion Intensity: <span id="val-motionintensity">{settings.motionIntensity.toFixed(1)}</span></label>
                <input type="range" id="setting-motionintensity" min="0" max="1" step="0.1" value={settings.motionIntensity} onChange={handleMotionIntensity} className="flex-1" />
              </div>
              <button
                className="comic-btn-premium w-full mt-3 inline-flex items-center justify-center gap-4 bg-accent-cyan/[0.05] backdrop-blur-sm text-accent-cyan border border-accent-cyan/40 px-5 py-3 font-mono text-xs font-bold tracking-widest cursor-pointer transition-all duration-300 shadow-[4px_4px_0_#00e5ff] uppercase hover:bg-accent-cyan hover:text-black hover:shadow-[0_0_20px_rgba(0,229,255,0.45)] hover:border-accent-cyan"
                onClick={handlePhotoMode}
                aria-label="Activate Photo Mode"
              >[ ACTIVATE PHOTO MODE ]</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
