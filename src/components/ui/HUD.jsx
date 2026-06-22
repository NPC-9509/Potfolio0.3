import React, { useEffect, useRef, useCallback } from 'react';
import { bus } from '../../contexts/EventBus.js';
import { useApp } from '../../contexts/AppContext.jsx';

export default function HUD() {
  const { state, updateState, hasAchievement } = useApp();
  const scrollContainerRef = useRef(null);
  const sectionsRef = useRef([]);
  const bikeClickCountRef = useRef(0);

  const updateActiveDot = useCallback((idx) => {
    document.querySelectorAll('.hud-dot-container').forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
    });
  }, []);

  const navigateTo = useCallback((idx) => {
    const target = document.getElementById(`sec-${idx}`);
    const sc = document.getElementById('scroll-container');
    if (target && sc) {
      sc.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
    }
    updateState('currentSection', idx);
    bus.emit('section:change', idx);
  }, [updateState]);

  useEffect(() => {
    const sc = document.getElementById('scroll-container');
    scrollContainerRef.current = sc;
    sectionsRef.current = document.querySelectorAll('.comic-chapter');

    const handleScroll = () => {
      if (!sc) return;
      const { scrollTop } = sc;
      const sections = sectionsRef.current;
      if (!sections.length) return;
      let currentIdx = 0;
      const viewHeight = window.innerHeight;
      sections.forEach((sec, idx) => {
        if (scrollTop >= sec.offsetTop - viewHeight * 0.4) currentIdx = idx;
      });
      if (currentIdx !== state.currentSection) {
        updateState('currentSection', currentIdx);
        bus.emit('section:change', currentIdx);
        if (currentIdx === 5) bus.emit('achievement:unlock', 'first-contact');
      }
      const totalHeight = sc.scrollHeight - sc.clientHeight;
      const pct = totalHeight > 0 ? scrollTop / totalHeight : 0;
      updateState('scrollPercent', pct);
      bus.emit('scroll:update', pct);
    };

    sc?.addEventListener('scroll', handleScroll, { passive: true });

    bus.on('section:change', updateActiveDot);

    bus.on('graphics:quality-changed', () => {});

    return () => {
      sc?.removeEventListener('scroll', handleScroll);
    };
  }, [state.currentSection, updateState, updateActiveDot]);

  const handleBikeClick = useCallback(() => {
    bikeClickCountRef.current++;
    if (bikeClickCountRef.current >= 5) {
      bus.emit('achievement:unlock', 'speed-demon');
    }
    bus.emit('audio:click');
  }, []);

  const sections = [
    { label: 'I. Origin', target: 0 },
    { label: 'II. Profile', target: 1 },
    { label: 'III. Arsenal', target: 2 },
    { label: 'IV. Missions', target: 3 },
    { label: 'V. Chronicle', target: 4 },
    { label: 'VI. Transmission', target: 5 },
  ];

  return (
    <nav id="hud-navigation" className="fixed left-10 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col gap-6" aria-label="Section navigation">
      <div
        className="w-12 h-12 border border-white/10 shadow-lg overflow-hidden relative mb-5 bg-[rgba(12,4,28,0.6)] backdrop-blur-md cursor-pointer rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-[0_0_12px_#00e5ff] hover:border-accent-cyan"
        onClick={() => { navigateTo(0); handleBikeClick(); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateTo(0); handleBikeClick(); }}}
        tabIndex={0}
        role="button"
        aria-label="Scroll to top"
        title="RTR 200 Speed Logo"
      >
        <img src="assets/comic_bike.png" alt="RTR 200 Logo" className="w-full h-full object-cover object-center" loading="lazy" />
        <div className="absolute bottom-0 right-0 bg-accent-cyan text-black font-mono text-[0.55rem] font-black px-1 border-l border-t border-white/10" aria-hidden="true">RTR</div>
      </div>

      {sections.map((sec) => (
        <div
          key={sec.target}
          className={`hud-dot-container flex items-center gap-4 cursor-pointer relative ${sec.target === state.currentSection ? 'active' : ''}`}
          data-target={sec.target}
          onClick={() => { navigateTo(sec.target); bus.emit('audio:click'); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateTo(sec.target); }}}
          tabIndex={0}
          role="button"
          aria-label={`Go to ${sec.label}`}
        >
          <div className="w-[10px] h-[10px] border-[1.5px] border-text-muted rotate-45 bg-transparent transition-all duration-300" />
          <span className="font-mono text-[0.7rem] text-text-muted opacity-0 -translate-x-2.5 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-accent-cyan">
            {sec.label}
          </span>
        </div>
      ))}
    </nav>
  );
}
