import React from 'react';
import { useAudio } from '../../contexts/AudioContext.jsx';
import { useApp } from '../../contexts/AppContext.jsx';
import { bus } from '../../contexts/EventBus.js';

export default function AudioWidget() {
  const { toggleAudio, setVolume } = useAudio();
  const { state } = useApp();

  const handleToggle = (e) => {
    e.stopPropagation();
    toggleAudio();
  };

  const handleVolume = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div
      id="audio-control-widget"
      className={`fixed bottom-8 right-8 z-10 flex items-center gap-3 bg-[rgba(12,4,28,0.5)] backdrop-blur-md border border-accent-purple/30 px-5 py-2 cursor-pointer transition-all duration-300 rounded-2xl shadow-cyber hover:border-accent-cyan hover:shadow-[0_8px_24px_rgba(4,1,10,0.37),0_0_10px_rgba(0,229,255,0.2)] ${state.audioEnabled ? 'playing' : ''}`}
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      aria-label="Toggle sound"
      aria-pressed={state.audioEnabled}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggle(e); }}}
    >
      <div className="audio-waves-icon flex items-end gap-[2.5px] w-4 h-3.5" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="audio-wave-bar w-[2.5px] bg-text-muted"
            style={{
              height: '4px',
              transition: 'height 0.2s ease-out',
              ...(state.audioEnabled ? {
                backgroundColor: '#00e5ff',
                animation: `wavePulse 0.8s ease-in-out infinite alternate`,
                animationDelay: `${[0.1, 0.3, 0.2, 0.4][i]}s`
              } : {})
            }}
          />
        ))}
      </div>
      <span className="audio-status-text font-mono text-[0.75rem] tracking-widest uppercase text-text-muted"
        style={state.audioEnabled ? { color: '#00e5ff' } : {}}>
        {state.audioEnabled ? 'Sound On' : 'Sound Off'}
      </span>
      <input
        type="range"
        className="volume-slider w-[60px] h-[3px] bg-white/10 rounded-none outline-none cursor-pointer ml-1"
        min="0" max="1" step="0.05"
        value={state.audioVolume !== undefined ? state.audioVolume : 0.7}
        onChange={handleVolume}
        onClick={(e) => e.stopPropagation()}
        aria-label="Volume"
        title="Volume"
      />
    </div>
  );
}
