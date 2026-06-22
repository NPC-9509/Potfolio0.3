import React, { createContext, useContext, useRef, useCallback, useEffect } from 'react';
import { bus } from './EventBus.js';
import { useApp } from './AppContext.jsx';

const AudioContextCtx = createContext(null);

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.ambientNodes = [];
    this.masterGain = null;
    this.isMuted = true;
    this.schedulerTimer = null;
    this.seqStep = 0;
    this.seqTempo = 115;
    this.stepDuration = 60 / 115 / 2;
    this.nextNoteTime = 0;
    this.dragOsc = null;
    this.dragGain = null;
    this._currentSection = 0;
  }

  init() {
    if (this.initialized) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
    this.initialized = true;
  }

  setVolume(v) {
    const vol = Math.max(0, Math.min(1, v));
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(vol * 0.18, this.ctx.currentTime, 0.1);
    }
  }

  startAmbient(audioVolume) {
    if (!this.initialized) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.isMuted = false;
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
    const targetVol = (audioVolume !== undefined ? audioVolume : 0.7) * 0.18;
    this.masterGain.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + 2.0);

    const frequencies = [65.41, 98.00, 130.81, 155.56];
    frequencies.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      osc.type = index % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.1 + index * 0.05;
      lfoGain.gain.value = 1.5;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180 + index * 50, this.ctx.currentTime);
      filter.Q.value = 1.0;
      osc.connect(oscGain);
      oscGain.connect(filter);
      filter.connect(this.masterGain);
      osc.start();
      this.ambientNodes.push({ osc, lfo, oscGain, filter });
      this._modulateFilter(filter, index);
    });

    const humOsc = this.ctx.createOscillator();
    const humGain = this.ctx.createGain();
    const humFilter = this.ctx.createBiquadFilter();
    humOsc.type = 'triangle';
    humOsc.frequency.setValueAtTime(55, this.ctx.currentTime);
    const humLfo = this.ctx.createOscillator();
    const humLfoGain = this.ctx.createGain();
    humLfo.frequency.value = 0.3;
    humLfoGain.gain.value = 1.2;
    humLfo.connect(humLfoGain);
    humLfoGain.connect(humOsc.frequency);
    humLfo.start();
    humGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
    humFilter.type = 'lowpass';
    humFilter.frequency.setValueAtTime(95, this.ctx.currentTime);
    humOsc.connect(humGain);
    humGain.connect(humFilter);
    humFilter.connect(this.masterGain);
    humOsc.start();
    this.ambientNodes.push({ osc: humOsc, lfo: humLfo, oscGain: humGain, filter: humFilter });

    this._startSequencer();
  }

  stopAmbient() {
    this.isMuted = true;
    if (this.schedulerTimer) { clearTimeout(this.schedulerTimer); this.schedulerTimer = null; }
    if (!this.masterGain) return;
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
    setTimeout(() => {
      if (this.isMuted && this.ambientNodes.length > 0) {
        this.ambientNodes.forEach(node => {
          try { node.osc.stop(); node.lfo.stop(); } catch(e) {}
        });
        this.ambientNodes = [];
      }
    }, 1600);
  }

  toggle(audioVolume) {
    if (this.isMuted) { this.startAmbient(audioVolume); return true; }
    else { this.stopAmbient(); return false; }
  }

  onSectionChange(idx) {
    this._currentSection = idx;
    if (this.isMuted || !this.initialized) return;
    const filterFreqs = [180, 220, 160, 200, 140, 250];
    const baseFreq = filterFreqs[idx] || 180;
    this.ambientNodes.forEach((node, i) => {
      if (node.filter) {
        node.filter.frequency.setTargetAtTime(baseFreq + i * 40, this.ctx.currentTime, 0.5);
      }
    });
    this._playSting(idx);
  }

  _playSting(idx) {
    if (this.isMuted || !this.initialized) return;
    const stings = [65.41, 73.42, 82.41, 98.00, 110.00, 130.81];
    const freq = stings[idx] || 65.41;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * 4, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(freq * 2, this.ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  }

  _startSequencer() {
    if (this.schedulerTimer) clearTimeout(this.schedulerTimer);
    this.seqStep = 0;
    this.seqTempo = 115;
    this.stepDuration = 60 / this.seqTempo / 2;
    this.nextNoteTime = this.ctx.currentTime;
    const scheduler = () => {
      if (this.isMuted || !this.initialized) return;
      while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
        this._scheduleNextStep(this.seqStep, this.nextNoteTime);
        this.nextNoteTime += this.stepDuration;
        this.seqStep = (this.seqStep + 1) % 16;
      }
      this.schedulerTimer = setTimeout(scheduler, 25);
    };
    scheduler();
  }

  _scheduleNextStep(step, time) {
    if (this.isMuted) return;
    if (step % 2 === 0) {
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      const bassFilter = this.ctx.createBiquadFilter();
      bassOsc.type = 'sawtooth';
      const bassProgression = [32.70, 32.70, 48.99, 58.27, 51.91, 51.91, 48.99, 38.89];
      bassOsc.frequency.setValueAtTime(bassProgression[Math.floor(step / 2) % bassProgression.length], time);
      bassGain.gain.setValueAtTime(0.04, time);
      bassGain.gain.linearRampToValueAtTime(0, time + 0.22);
      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(250, time);
      bassFilter.frequency.linearRampToValueAtTime(600, time + 0.06);
      bassFilter.frequency.linearRampToValueAtTime(160, time + 0.22);
      bassOsc.connect(bassGain); bassGain.connect(bassFilter); bassFilter.connect(this.masterGain);
      bassOsc.start(time); bassOsc.stop(time + 0.23);
    }
    if (step % 4 === 2) {
      const hatOsc = this.ctx.createOscillator();
      const hatGain = this.ctx.createGain();
      const hatFilter = this.ctx.createBiquadFilter();
      hatOsc.type = 'triangle'; hatOsc.frequency.setValueAtTime(9000, time);
      hatGain.gain.setValueAtTime(0.006, time); hatGain.gain.linearRampToValueAtTime(0, time + 0.05);
      hatFilter.type = 'highpass'; hatFilter.frequency.setValueAtTime(8000, time);
      hatOsc.connect(hatGain); hatGain.connect(hatFilter); hatFilter.connect(this.masterGain);
      hatOsc.start(time); hatOsc.stop(time + 0.06);
    }
    if (step === 4 || step === 12) {
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      const snareGain = this.ctx.createGain();
      snareGain.gain.setValueAtTime(0.012, time); snareGain.gain.linearRampToValueAtTime(0, time + 0.11);
      const snareFilter = this.ctx.createBiquadFilter();
      snareFilter.type = 'bandpass'; snareFilter.frequency.setValueAtTime(1000, time);
      noiseSource.connect(snareGain); snareGain.connect(snareFilter); snareFilter.connect(this.masterGain);
      noiseSource.start(time); noiseSource.stop(time + 0.12);
    }
    if (step % 4 === 3 && Math.random() < 0.45) {
      const baseBeepFreq = 1400 + Math.random() * 600;
      for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
        const bt = time + i * 0.045;
        const beepOsc = this.ctx.createOscillator();
        const beepGain = this.ctx.createGain();
        beepOsc.type = 'sine'; beepOsc.frequency.setValueAtTime(baseBeepFreq + i * 150, bt);
        beepGain.gain.setValueAtTime(0.003, bt); beepGain.gain.linearRampToValueAtTime(0, bt + 0.025);
        beepOsc.connect(beepGain); beepGain.connect(this.masterGain);
        beepOsc.start(bt); beepOsc.stop(bt + 0.03);
      }
    }
  }

  _modulateFilter(filter, index) {
    const baseFreq = 180 + index * 50;
    const sweepRange = 80;
    const sweep = () => {
      if (!this.initialized || this.isMuted) return;
      const duration = 6 + index * 2;
      filter.frequency.cancelScheduledValues(this.ctx.currentTime);
      filter.frequency.setValueAtTime(filter.frequency.value, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(baseFreq + sweepRange, this.ctx.currentTime + duration / 2);
      filter.frequency.linearRampToValueAtTime(Math.max(20, baseFreq - sweepRange), this.ctx.currentTime + duration);
      setTimeout(() => { if (!this.isMuted) sweep(); }, duration * 1000);
    };
    sweep();
  }

  playHover() {
    if (this.isMuted || !this.initialized) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1500, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.008, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.08);
    filter.type = 'highpass'; filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    osc.connect(gain); gain.connect(filter); filter.connect(this.masterGain);
    osc.start(); osc.stop(this.ctx.currentTime + 0.09);
  }

  playClick() {
    if (this.isMuted || !this.initialized) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(55, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.connect(gain); gain.connect(filter); filter.connect(this.masterGain);
    osc.start(); osc.stop(this.ctx.currentTime + 0.32);
  }

  playAchievement() {
    if (this.isMuted || !this.initialized) return;
    [523, 659, 784, 1046].forEach((freq, i) => {
      const t = this.ctx.currentTime + i * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.12);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(t); osc.stop(t + 0.15);
    });
  }

  destroy() {
    this.stopAmbient();
    if (this.ctx) {
      this.ctx.close();
      this.initialized = false;
      this.ctx = null;
    }
  }
}

export function AudioProvider({ children }) {
  const engineRef = useRef(null);
  const { state, updateState, saveAudio } = useApp();

  if (!engineRef.current) {
    engineRef.current = new AudioEngine();
  }
  const engine = engineRef.current;

  const toggleAudio = useCallback(() => {
    engine.init();
    const playing = engine.toggle(state.audioVolume);
    updateState('audioEnabled', playing);
    if (!playing) {
      updateState('audioEnabled', false);
    } else {
      updateState('audioEnabled', true);
    }
    saveAudio();
    return playing;
  }, [engine, state.audioVolume, updateState, saveAudio]);

  const setVolume = useCallback((v) => {
    engine.setVolume(v);
    updateState('audioVolume', v);
  }, [engine, updateState]);

  useEffect(() => {
    bus.on('audio:click', () => engine.playClick());
    bus.on('audio:hover', () => engine.playHover());
    bus.on('audio:achievement', () => engine.playAchievement());
    bus.on('section:change', idx => engine.onSectionChange(idx));
    return () => {
      engine.destroy();
    };
  }, [engine]);

  const value = { engine, toggleAudio, setVolume };

  return (
    <AudioContextCtx.Provider value={value}>
      {children}
    </AudioContextCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContextCtx);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
