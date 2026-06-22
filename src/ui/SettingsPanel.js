// SettingsPanel.js — Settings panel UI and Audio Captions Manager (Phase 12, 13)

import { bus } from '../core/EventBus.js';
import { AppState } from '../core/AppState.js';
import { performanceManager } from '../utils/Performance.js';

let captionsOverlay, presetBtns, weatherBtns, todBtns;
let captionsChk, highContrastChk, reducedMotionChk, motionIntensitySld, motionIntensityVal;

export function initSettingsPanel() {
  captionsOverlay   = document.getElementById('audio-captions-overlay');
  presetBtns        = document.querySelectorAll('.preset-btn');
  weatherBtns       = document.querySelectorAll('.weather-btn');
  todBtns           = document.querySelectorAll('.tod-btn');
  
  captionsChk        = document.getElementById('setting-captions');
  highContrastChk    = document.getElementById('setting-highcontrast');
  reducedMotionChk   = document.getElementById('setting-reducedmotion');
  motionIntensitySld = document.getElementById('setting-motionintensity');
  motionIntensityVal = document.getElementById('val-motionintensity');

  // Initialize UI values from state/localStorage
  restoreSettings();

  // 1. Graphics Presets Click
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = btn.getAttribute('data-preset');
      performanceManager.applyPreset(preset);
      showCaption(`[ Graphics preset changed to: ${preset.toUpperCase()} ]`);
    });
  });

  // 2. Weather Click
  weatherBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      weatherBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const weather = btn.getAttribute('data-weather');
      bus.emit('settings:weather', weather);
      showCaption(`[ Environmental weather changed to: ${weather.toUpperCase()} ]`);
    });
  });

  // 3. Time of Day Click
  todBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      todBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tod = btn.getAttribute('data-tod');
      bus.emit('settings:timeofday', tod);
      showCaption(`[ System lighting cycle changed to: ${tod.toUpperCase()} ]`);
    });
  });

  // 4. Accessibility Checkboxes & Sliders
  captionsChk?.addEventListener('change', e => {
    AppState.set('captionsEnabled', e.target.checked);
    localStorage.setItem('setting-captions', e.target.checked);
  });

  highContrastChk?.addEventListener('change', e => {
    const active = e.target.checked;
    AppState.set('highContrast', active);
    localStorage.setItem('setting-highcontrast', active);
    if (active) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    showCaption(`[ High Contrast theme ${active ? 'enabled' : 'disabled'} ]`);
  });

  reducedMotionChk?.addEventListener('change', e => {
    const active = e.target.checked;
    AppState.set('prefersReducedMotion', active);
    localStorage.setItem('setting-reducedmotion', active);
    bus.emit('reduced-motion-change', active);
    showCaption(`[ Reduced Motion ${active ? 'enabled' : 'disabled'} ]`);
  });

  motionIntensitySld?.addEventListener('input', e => {
    const val = parseFloat(e.target.value);
    AppState.set('motionIntensity', val);
    localStorage.setItem('setting-motionintensity', val);
    if (motionIntensityVal) motionIntensityVal.textContent = val.toFixed(1);
  });

  // 4b. Photo Mode Bindings
  const photoModeBtn = document.getElementById('setting-photomode-btn');
  const photoModeExitBtn = document.getElementById('photo-mode-exit-btn');

  photoModeBtn?.addEventListener('click', () => {
    AppState.set('photoModeActive', true);
    document.body.classList.add('photo-mode');
    if (photoModeExitBtn) photoModeExitBtn.style.display = 'block';
    // Close settings modal to let user view
    bus.emit('modal:close', 'modal-settings');
    showCaption('[ Photo Mode Activated. Left-drag mouse to orbit camera view. ]');
  });

  photoModeExitBtn?.addEventListener('click', () => {
    AppState.set('photoModeActive', false);
    document.body.classList.remove('photo-mode');
    if (photoModeExitBtn) photoModeExitBtn.style.display = 'none';
    showCaption('[ Photo Mode Deactivated. ]');
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && AppState.state.photoModeActive) {
      photoModeExitBtn?.click();
    }
  });

  // 5. Audio events Subtitles/Captions bindings
  setupAudioCaptions();
}

function restoreSettings() {
  // Captions
  const savedCaptions = localStorage.getItem('setting-captions');
  const capVal = savedCaptions !== null ? savedCaptions === 'true' : true;
  if (captionsChk) captionsChk.checked = capVal;
  AppState.state.captionsEnabled = capVal;

  // High contrast
  const savedHC = localStorage.getItem('setting-highcontrast');
  const hcVal = savedHC === 'true';
  if (highContrastChk) highContrastChk.checked = hcVal;
  AppState.state.highContrast = hcVal;
  if (hcVal) document.body.classList.add('high-contrast');

  // Reduced motion
  const savedRM = localStorage.getItem('setting-reducedmotion');
  const rmVal = savedRM !== null ? savedRM === 'true' : AppState.state.prefersReducedMotion;
  if (reducedMotionChk) reducedMotionChk.checked = rmVal;
  AppState.state.prefersReducedMotion = rmVal;

  // Motion intensity
  const savedMI = localStorage.getItem('setting-motionintensity');
  const miVal = savedMI !== null ? parseFloat(savedMI) : 1.0;
  if (motionIntensitySld) motionIntensitySld.value = miVal;
  if (motionIntensityVal) motionIntensityVal.textContent = miVal.toFixed(1);
  AppState.state.motionIntensity = miVal;

  // Set active preset button in settings panel UI
  const currentPreset = localStorage.getItem('mv-graphics-preset') || 'auto';
  presetBtns.forEach(btn => {
    if (btn.getAttribute('data-preset') === currentPreset) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

function setupAudioCaptions() {
  // Listening to system/audio events to print subtitles
  bus.on('audio:ambient', () => showCaption("[ SYSTEM ONLINE: Ambient Synthesizer Humming ]"));
  bus.on('audio:stinger', () => showCaption("[ Incoming Transmission Motif Playing ]"));
  bus.on('achievement:unlock', () => showCaption("[ Achievement Unlocked Arpeggio Playing ]"));
  
  bus.on('terminal:open', () => showCaption("[ Terminal Connected ]"));
  bus.on('terminal:close', () => showCaption("[ Communication Lost ]"));
  
  bus.on('assistant:open', () => showCaption("[ AI Assistant Connected ]"));
  bus.on('assistant:close', () => showCaption("[ AI Assistant Offline ]"));

  bus.on('contact:submit', () => showCaption("[ Success: Transmission Upload Completed ]"));
  bus.on('contact:error', () => showCaption("[ Error: Transmission Upload Failed ]"));
}

export function showCaption(text) {
  if (!AppState.state.captionsEnabled || !captionsOverlay) return;

  captionsOverlay.textContent = text;
  captionsOverlay.classList.add('active');
  captionsOverlay.setAttribute('aria-hidden', 'false');

  // Hide after 3 seconds
  if (captionsOverlay._timeout) clearTimeout(captionsOverlay._timeout);
  captionsOverlay._timeout = setTimeout(() => {
    captionsOverlay.classList.remove('active');
    captionsOverlay.setAttribute('aria-hidden', 'true');
  }, 3000);
}
