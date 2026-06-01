// Web Audio API ambient synthesizer and UI sound effects

class AudioSystem {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.ambientNodes = [];
    this.masterGain = null;
    this.isMuted = true;
    this.activeSynthInterval = null;
    this.dragOsc = null;
    this.dragGain = null;
  }

  init() {
    if (this.initialized) return;

    // Create audio context
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Master gain node
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.initialized = true;
  }

  startAmbient() {
    if (!this.initialized) this.init();

    // Resume context if suspended (browser autoplay security)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = false;

    // Fade in master gain
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 2.0); // low volume ambient

    // Build the ambient synthesizer drone (A multi-oscillator pads system)
    const frequencies = [65.41, 98.00, 130.81, 155.56]; // C2, G2, C3, Eb3 (C minor pad)
    
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
      this.modulateFilter(filter, index);
    });

    // Add Terminal Server Room Hum (low whirring background drone)
    const humOsc = this.ctx.createOscillator();
    const humGain = this.ctx.createGain();
    const humFilter = this.ctx.createBiquadFilter();

    humOsc.type = 'triangle';
    humOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // 55Hz whir (A1 note)

    const humLfo = this.ctx.createOscillator();
    const humLfoGain = this.ctx.createGain();
    humLfo.frequency.value = 0.3; // whir rate of 0.3 Hz
    humLfoGain.gain.value = 1.2; // 1.2 Hz frequency swing
    humLfo.connect(humLfoGain);
    humLfoGain.connect(humOsc.frequency);
    humLfo.start();

    humGain.gain.setValueAtTime(0.015, this.ctx.currentTime); // very subtle background hum

    humFilter.type = 'lowpass';
    humFilter.frequency.setValueAtTime(95, this.ctx.currentTime); // filter out high harmonics

    humOsc.connect(humGain);
    humGain.connect(humFilter);
    humFilter.connect(this.masterGain);

    humOsc.start();
    
    this.ambientNodes.push({ osc: humOsc, lfo: humLfo, oscGain: humGain, filter: humFilter });

    // Start Cyberpunk drum/bass sequencer
    this.startSequencer();
  }

  startSequencer() {
    if (this.schedulerTimer) clearTimeout(this.schedulerTimer);
    
    this.seqStep = 0;
    this.seqTempo = 115; // Cyberpunk driving tempo
    this.stepDuration = 60 / this.seqTempo / 2; // 8th notes (0.26s)
    this.nextNoteTime = this.ctx.currentTime;

    const scheduler = () => {
      if (this.isMuted || !this.initialized) return;
      while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
        this.scheduleNextStep(this.seqStep, this.nextNoteTime);
        this.nextNoteTime += this.stepDuration;
        this.seqStep = (this.seqStep + 1) % 16;
      }
      this.schedulerTimer = setTimeout(scheduler, 25);
    };

    scheduler();
  }

  scheduleNextStep(step, time) {
    if (this.isMuted) return;

    // 1. Distorted Cyberpunk Saw Bassline on 8th notes
    if (step % 2 === 0) {
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      const bassFilter = this.ctx.createBiquadFilter();

      bassOsc.type = 'sawtooth';

      // Bass notes mapping in key of C Minor (C1=32.7Hz, G1=49Hz, Bb1=58.27Hz, Ab1=51.91Hz)
      const bassProgression = [32.70, 32.70, 48.99, 58.27, 51.91, 51.91, 48.99, 38.89];
      const noteIdx = Math.floor(step / 2) % bassProgression.length;
      const freq = bassProgression[noteIdx];

      bassOsc.frequency.setValueAtTime(freq, time);

      bassGain.gain.setValueAtTime(0.04, time);
      bassGain.gain.exponentialRampToValueAtTime(0.00001, time + 0.22);

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(250, time);
      bassFilter.frequency.exponentialRampToValueAtTime(600, time + 0.06);
      bassFilter.frequency.exponentialRampToValueAtTime(160, time + 0.22);

      bassOsc.connect(bassGain);
      bassGain.connect(bassFilter);
      bassFilter.connect(this.masterGain);

      bassOsc.start(time);
      bassOsc.stop(time + 0.23);
    }

    // 2. hi-hats on offbeats (steps 2, 6, 10, 14)
    if (step % 4 === 2) {
      const hatOsc = this.ctx.createOscillator();
      const hatGain = this.ctx.createGain();
      const hatFilter = this.ctx.createBiquadFilter();

      hatOsc.type = 'triangle';
      hatOsc.frequency.setValueAtTime(9000, time);

      hatGain.gain.setValueAtTime(0.006, time);
      hatGain.gain.exponentialRampToValueAtTime(0.00001, time + 0.05);

      hatFilter.type = 'highpass';
      hatFilter.frequency.setValueAtTime(8000, time);

      hatOsc.connect(hatGain);
      hatGain.connect(hatFilter);
      hatFilter.connect(this.masterGain);

      hatOsc.start(time);
      hatOsc.stop(time + 0.06);
    }

    // 3. Noise Snare on steps 4 and 12
    if (step === 4 || step === 12) {
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const snareGain = this.ctx.createGain();
      snareGain.gain.setValueAtTime(0.012, time);
      snareGain.gain.exponentialRampToValueAtTime(0.00001, time + 0.11);

      const snareFilter = this.ctx.createBiquadFilter();
      snareFilter.type = 'bandpass';
      snareFilter.frequency.setValueAtTime(1000, time);

      noiseSource.connect(snareGain);
      snareGain.connect(snareFilter);
      snareFilter.connect(this.masterGain);

      noiseSource.start(time);
      noiseSource.stop(time + 0.12);
    }

    // 4. Ambient Terminal Data Telemetry Beeps
    // Syncopated high-pitched retro computer data clicks (on steps 3, 7, 11, 15)
    if (step % 4 === 3 && Math.random() < 0.45) {
      const numBeeps = Math.floor(Math.random() * 3) + 1; // 1 to 3 beeps
      const baseBeepFreq = 1400 + Math.random() * 600; // 1400Hz - 2000Hz range
      
      for (let i = 0; i < numBeeps; i++) {
        const beepTime = time + i * 0.045; // 45ms spacing between blips
        
        const beepOsc = this.ctx.createOscillator();
        const beepGain = this.ctx.createGain();
        const beepFilter = this.ctx.createBiquadFilter();
        
        beepOsc.type = 'sine';
        // Rising pitch for retro data chirping
        beepOsc.frequency.setValueAtTime(baseBeepFreq + (i * 150), beepTime);
        
        beepGain.gain.setValueAtTime(0.003, beepTime); // extremely quiet ambient beep
        beepGain.gain.exponentialRampToValueAtTime(0.00001, beepTime + 0.025); // 25ms decay
        
        beepFilter.type = 'bandpass';
        beepFilter.frequency.setValueAtTime(baseBeepFreq, beepTime);
        
        beepOsc.connect(beepGain);
        beepGain.connect(beepFilter);
        beepFilter.connect(this.masterGain);
        
        beepOsc.start(beepTime);
        beepOsc.stop(beepTime + 0.03);
      }
    }
  }

  modulateFilter(filter, index) {
    const baseFreq = 180 + index * 50;
    const sweepRange = 80;
    
    const sweep = () => {
      if (!this.initialized || this.isMuted) return;
      const duration = 6 + index * 2; // slow sweeps
      filter.frequency.cancelScheduledValues(this.ctx.currentTime);
      filter.frequency.setValueAtTime(filter.frequency.value, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(baseFreq + sweepRange, this.ctx.currentTime + duration / 2);
      filter.frequency.exponentialRampToValueAtTime(baseFreq - sweepRange, this.ctx.currentTime + duration);

      setTimeout(() => {
        if (!this.isMuted) sweep();
      }, duration * 1000);
    };

    sweep();
  }

  stopAmbient() {
    this.isMuted = true;
    if (this.schedulerTimer) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    if (!this.masterGain) return;

    // Fade out master gain
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);

    // Stop oscillators after fadeout completes
    setTimeout(() => {
      if (this.isMuted && this.ambientNodes.length > 0) {
        this.ambientNodes.forEach(node => {
          try {
            node.osc.stop();
            node.lfo.stop();
          } catch(e) {}
        });
        this.ambientNodes = [];
      }
    }, 1600);
  }

  toggle() {
    if (this.isMuted) {
      this.startAmbient();
      return true;
    } else {
      this.stopAmbient();
      return false;
    }
  }

  // UI interaction sound effects
  playHover() {
    if (this.isMuted || !this.initialized) return;

    // Quick futuristic UI blip
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    // Random high note for UI feedback
    osc.frequency.setValueAtTime(800 + Math.random() * 200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1500, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.008, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + 0.08);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    osc.connect(gain);
    gain.connect(filter);
    filter.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  playClick() {
    if (this.isMuted || !this.initialized) return;

    // Warm resonant hum for selection
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime); // A2 note
    osc.frequency.exponentialRampToValueAtTime(55, this.ctx.currentTime + 0.3); // Drop an octave

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + 0.3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);

    osc.connect(gain);
    gain.connect(filter);
    filter.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.32);
  }

  // Synthesize dynamic hum/whoosh tone when dragging 3D models
  startDragTone() {
    if (this.isMuted || !this.initialized || this.dragOsc) return;

    this.dragOsc = this.ctx.createOscillator();
    this.dragOsc.type = 'triangle';
    this.dragOsc.frequency.setValueAtTime(60, this.ctx.currentTime); // baseline low hum

    this.dragGain = this.ctx.createGain();
    this.dragGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.dragGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.1);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime); // warm and dark

    this.dragOsc.connect(this.dragGain);
    this.dragGain.connect(filter);
    filter.connect(this.masterGain);

    this.dragOsc.start();
  }

  updateDragTone(speed) {
    if (this.isMuted || !this.initialized || !this.dragOsc) return;

    // Pitch rises and volume swells in proportion to movement speed
    const targetFreq = 60 + Math.min(speed * 380, 240); // 60Hz to 300Hz range
    this.dragOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);

    const targetVol = 0.02 + Math.min(speed * 0.35, 0.12);
    this.dragGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.05);
  }

  stopDragTone() {
    if (!this.initialized || !this.dragOsc) return;

    const osc = this.dragOsc;
    const gain = this.dragGain;
    this.dragOsc = null;
    this.dragGain = null;

    if (gain) {
      gain.gain.cancelScheduledValues(this.ctx.currentTime);
      gain.gain.setValueAtTime(gain.gain.value, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15);
    }

    setTimeout(() => {
      try {
        osc.stop();
      } catch (e) {}
    }, 200);
  }
}

export const audioSystem = new AudioSystem();
