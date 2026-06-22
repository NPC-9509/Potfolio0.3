import React, { useEffect, useRef, useCallback, useState } from 'react';
import { bus } from '../../contexts/EventBus.js';
import { useApp } from '../../contexts/AppContext.jsx';
import { useAudio } from '../../contexts/AudioContext.jsx';

export default function AchievementToast() {
  const [achievement, setAchievement] = useState(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const unlock = (id) => {
      const defs = {
        'first-contact': { icon: '📡', title: 'FIRST CONTACT', description: 'Visited the Transmission Beacon.', color: 'cyan' },
        'code-archaeology': { icon: '🏛️', title: 'CODE ARCHAEOLOGY', description: 'Opened all 4 classified log archives.', color: 'purple' },
        'terminal-hacker': { icon: '💻', title: 'TERMINAL HACKER', description: 'Accessed the developer terminal.', color: 'green' },
        'speed-demon': { icon: '🏍️', title: 'SPEED DEMON', description: 'Clicked the RTR bike logo 5 times.', color: 'pink' },
        'ghost-protocol': { icon: '👻', title: 'GHOST PROTOCOL', description: 'Found the AI system guide.', color: 'yellow' },
        'sudo-hire': { icon: '🎉', title: 'SUDO HIRE MUKUL', description: 'You ran the secret terminal command. Smart choice.', color: 'cyan' },
      };
      const def = defs[id];
      if (!def) return;
      setAchievement(def);
      setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 4500);
    };

    bus.on('achievement:unlock', unlock);
    return () => bus.off('achievement:unlock', unlock);
  }, []);

  if (!achievement) return null;

  const colorMap = { cyan: '#00e5ff', pink: '#ff2a85', purple: '#bd5af7', green: '#00ff66', yellow: '#ffe600' };
  const color = colorMap[achievement.color] || '#00e5ff';

  return (
    <div
      id="achievement-toast"
      className={`fixed top-20 right-5 z-[9999] transition-all duration-500 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="achievement-inner flex items-start gap-3 bg-[rgba(12,4,28,0.85)] backdrop-blur-md p-4 rounded-lg border-2"
        style={{ borderColor: color, boxShadow: `4px 4px 0 ${color}` }}>
        <span className="text-2xl">{achievement.icon}</span>
        <div>
          <span className="achievement-label font-mono text-xs font-black block mb-0.5" style={{ color }}>// ACHIEVEMENT UNLOCKED</span>
          <strong className="achievement-name font-display text-white text-sm block">{achievement.title}</strong>
          <p className="achievement-desc text-text-muted text-xs mt-0.5">{achievement.description}</p>
        </div>
      </div>
    </div>
  );
}
