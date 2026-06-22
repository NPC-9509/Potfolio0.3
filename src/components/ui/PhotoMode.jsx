import React from 'react';
import { useApp } from '../../contexts/AppContext.jsx';
import { bus } from '../../contexts/EventBus.js';

export default function PhotoMode() {
  const { state, updateState } = useApp();

  const handleExit = () => {
    updateState('photoModeActive', false);
    document.body.classList.remove('photo-mode');
    const btn = document.getElementById('photo-mode-exit-btn');
    if (btn) btn.style.display = 'none';
  };

  if (!state.photoModeActive) return null;

  return (
    <button
      id="photo-mode-exit-btn"
      className="comic-btn-premium fixed top-4 right-4 z-[99999]"
      onClick={handleExit}
      aria-label="Exit Photo Mode"
    >[ EXIT PHOTO MODE ]</button>
  );
}
