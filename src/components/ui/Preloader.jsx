import React, { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { useApp } from '../../contexts/AppContext.jsx';

const ASSETS_TO_PRELOAD = [
  'assets/comic_hero.png',
  'assets/comic_skills.png',
  'assets/comic_projects.png',
  'assets/comic_experience.png',
  'assets/comic_contact.png',
  'assets/comic_bike.png'
];

const preloadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = resolve;
    img.onerror = resolve; // Continue on failure so layout doesn't freeze
  });
};

export default function Preloader({ onComplete, data }) {
  const preloaderRef = useRef(null);
  const progressCircleRef = useRef(null);
  const progressTextRef = useRef(null);
  const termLogRef = useRef(null);
  const { state } = useApp();
  const circleLength = 251.32;

  const endPreloader = useCallback(() => {
    if (preloaderRef.current) {
      gsap.to(preloaderRef.current, {
        opacity: 0,
        visibility: 'hidden',
        duration: 0.6,
        ease: 'power2.out',
        onComplete
      });
    }
  }, [onComplete]);

  useEffect(() => {
    let displayProgress = 0;
    const termLines = [
      '<p class="term-line green">[OK] COMIC PROTOCOL SYNCED</p>',
      '<p class="term-line cyan">[LOAD] DEVELOPER PROFILE — VERIFIED</p>',
      '<p class="term-line purple">[LOAD] PROJECT DATABASE — SYNCING...</p>',
      '<p class="term-line pink">[OK] FULL ACCESS GRANTED. WELCOME, AGENT.</p>'
    ];
    let progressVal = 0;
    let assetsLoaded = false;

    // Start preloading images
    Promise.all(ASSETS_TO_PRELOAD.map(preloadImage)).then(() => {
      assetsLoaded = true;
    });

    const safetyTimeout = setTimeout(() => {
      clearInterval(updateInterval);
      endPreloader();
    }, 12000);

    const updateInterval = setInterval(() => {
      // Progress increments smoothly but halts at 92% if assets are still preloading
      const cap = assetsLoaded ? 100 : 92;
      progressVal = Math.min(progressVal + 1.25, cap);
      displayProgress = Math.max(displayProgress, progressVal);
      displayProgress = Math.min(displayProgress, 100);

      // Round to nearest integer for display
      const displayInt = Math.floor(displayProgress);

      if (termLogRef.current) {
        const children = termLogRef.current.children.length;
        if (displayInt > 25 && children === 4) termLogRef.current.innerHTML += termLines[0];
        if (displayInt > 50 && children === 5) termLogRef.current.innerHTML += termLines[1];
        if (displayInt > 75 && children === 6) termLogRef.current.innerHTML += termLines[2];
        if (displayInt > 92 && children === 7) termLogRef.current.innerHTML += termLines[3];
      }

      if (progressCircleRef.current) {
        progressCircleRef.current.style.strokeDashoffset = circleLength - (displayProgress * circleLength) / 100;
      }
      if (progressTextRef.current) {
        progressTextRef.current.textContent = `${displayInt}%`;
      }

      if (displayProgress >= 100) {
        clearInterval(updateInterval);
        clearTimeout(safetyTimeout);
        setTimeout(() => endPreloader(), 500);
      }
    }, 30);

    return () => {
      clearInterval(updateInterval);
      clearTimeout(safetyTimeout);
    };
  }, [endPreloader, circleLength]);

  return (
    <div
      ref={preloaderRef}
      id="preloader"
      className="fixed top-0 left-0 w-screen h-screen bg-[#020005] z-[10000] flex flex-col items-center justify-center"
      role="status"
      aria-label="Loading portfolio"
    >
      <div ref={termLogRef} className="boot-terminal" aria-live="polite">
        <p className="term-line green">[OK] CORE SYSTEMS INITIATED</p>
        <p className="term-line purple">[SYNC] COMM LINK ESTABLISHED</p>
        <p className="term-line cyan">[SYS] LOADING GRAPHIC CHRONICLES...</p>
        <p className="term-line pink">[SYS] RTR_200 DRIVE_CORE ACTIVE</p>
      </div>

      <div className="loader-circle-container">
        <svg className="loader-circle-svg" viewBox="0 0 100 100" aria-hidden="true">
          <circle className="loader-circle-bg" cx="50" cy="50" r="40" />
          <circle
            ref={progressCircleRef}
            className="loader-circle-progress"
            cx="50" cy="50" r="40"
          />
        </svg>
        <span ref={progressTextRef} className="loader-percentage">0%</span>
      </div>

      <div className="loader-quote-container">
        <p className="loader-logo">MUKUL VYAS</p>
        <p className="loader-sub">MV // RTR_200 SPEED PROTOCOL</p>
      </div>
    </div>
  );
}
