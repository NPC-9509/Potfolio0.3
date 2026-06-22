import React, { useEffect, useCallback } from 'react';
import { bus } from '../../contexts/EventBus.js';
import { useApp } from '../../contexts/AppContext.jsx';

const NAV_ITEMS = [
  { label: 'Home',      icon: '⬡', target: 0 },
  { label: 'About',     icon: '◈', target: 1 },
  { label: 'Skills',    icon: '◉', target: 2 },
  { label: 'Projects',  icon: '◆', target: 3 },
  { label: 'Timeline',  icon: '◎', target: 4 },
  { label: 'Contact',   icon: '▣', target: 5 },
  { label: 'Terminal',  icon: '>_', target: 'terminal' },
  { label: 'AI Guide',  icon: '◈', target: 'ai' },
];

export default function MobileNav() {
  const { state } = useApp();

  const handleClick = useCallback((target) => {
    if (target === 'terminal') {
      bus.emit('terminal:open');
      return;
    }
    if (target === 'ai') {
      bus.emit('assistant:toggle');
      return;
    }
    const scrollContainer = document.getElementById('scroll-container');
    const section = document.getElementById(`sec-${target}`);
    if (section && scrollContainer) {
      scrollContainer.scrollTo({ top: section.offsetTop, behavior: 'smooth' });
    }
    bus.emit('audio:click');
  }, []);

  if (!state.isMobile) return null;

  return (
    <nav id="mobile-nav" className="fixed bottom-0 left-0 w-full bg-[rgba(4,1,10,0.95)] backdrop-blur-md border-t border-[rgba(255,255,255,0.08)] z-[100] flex justify-around py-2 px-1"
      aria-label="Mobile navigation">
      {NAV_ITEMS.map((item) => {
        const isActive = typeof item.target === 'number' && item.target === state.currentSection;
        return (
          <button
            key={item.label}
            className={`mob-nav-btn flex flex-col items-center gap-0.5 bg-none border-none text-text-muted cursor-pointer px-1 py-0.5 transition-all duration-300 ${isActive ? 'text-accent-cyan' : ''}`}
            onClick={() => handleClick(item.target)}
            aria-label={item.label}
          >
            <span className="text-sm leading-none">{item.icon}</span>
            <span className="text-[0.55rem] font-mono leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
