import React, { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { useApp } from '../../contexts/AppContext.jsx';

export default function Cursor() {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const trailCanvasRef = useRef(null);
  const trailCtxRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const followerPosRef = useRef({ x: 0, y: 0 });
  const followerScaleRef = useRef(1.0);
  const particlesRef = useRef([]);
  const lastMoveRef = useRef(0);
  const { state } = useApp();
  const hoveredRef = useRef(false);

  const onMouseMove = useCallback((e) => {
    const { clientX, clientY } = e;
    mouseRef.current = { x: clientX, y: clientY };
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`;
    }
    const now = performance.now();
    if (now - lastMoveRef.current < 16) return;
    lastMoveRef.current = now;
    particlesRef.current.push({
      x: clientX, y: clientY,
      size: Math.random() * 4 + 2,
      life: 1.0,
      decay: 0.02 + Math.random() * 0.015,
      color: '#00e5ff',
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5
    });
  }, []);

  const onHoverIn = useCallback(() => {
    if (hoveredRef.current) return;
    hoveredRef.current = true;
    if (cursorRef.current) {
      cursorRef.current.style.width = '24px';
      cursorRef.current.style.height = '24px';
      cursorRef.current.style.backgroundColor = 'rgba(0, 229, 255, 0.35)';
    }
    followerScaleRef.current = 1.3;
    if (followerRef.current) {
      followerRef.current.style.borderColor = '#ffffff';
      followerRef.current.style.borderRadius = '50%';
    }
  }, []);

  const onHoverOut = useCallback(() => {
    hoveredRef.current = false;
    if (cursorRef.current) {
      cursorRef.current.style.width = '10px';
      cursorRef.current.style.height = '10px';
      cursorRef.current.style.backgroundColor = '#ffffff';
    }
    followerScaleRef.current = 1.0;
    if (followerRef.current) {
      followerRef.current.style.borderColor = '#00e5ff';
      followerRef.current.style.borderRadius = '0';
    }
  }, []);

  useEffect(() => {
    if (state.isMobile || state.isTablet) return;

    window.addEventListener('mousemove', onMouseMove);

    const interactiveSelector = 'button, a, input, textarea, .hud-dot-container, #audio-control-widget, .project-mini-row, .channel-link-btn, .hud-brand-logo-frame, .terminal-close-btn, .ai-assistant-btn';

    const addListeners = () => {
      document.querySelectorAll(interactiveSelector).forEach(el => {
        el.addEventListener('mouseenter', onHoverIn);
        el.addEventListener('mouseleave', onHoverOut);
      });
    };

    addListeners();
    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    const updateFollower = () => {
      followerPosRef.current.x += (mouseRef.current.x - followerPosRef.current.x) * 0.12;
      followerPosRef.current.y += (mouseRef.current.y - followerPosRef.current.y) * 0.12;
      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${followerPosRef.current.x}px, ${followerPosRef.current.y}px, 0) translate(-50%, -50%) scale(${followerScaleRef.current}) rotate(45deg)`;
      }
      requestAnimationFrame(updateFollower);
    };
    requestAnimationFrame(updateFollower);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      observer.disconnect();
      document.querySelectorAll(interactiveSelector).forEach(el => {
        el.removeEventListener('mouseenter', onHoverIn);
        el.removeEventListener('mouseleave', onHoverOut);
      });
    };
  }, [state.isMobile, state.isTablet, onMouseMove, onHoverIn, onHoverOut]);

  useEffect(() => {
    if (state.isMobile || state.isTablet || state.prefersReducedMotion) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'cursor-trail-canvas';
    Object.assign(canvas.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100vw', height: '100vh',
      pointerEvents: 'none', zIndex: '10000'
    });
    document.body.appendChild(canvas);
    trailCanvasRef.current = canvas;
    trailCtxRef.current = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const animateTrail = () => {
      const ctx = trailCtxRef.current;
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life * 0.45;
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.life * Math.PI);
        const sz = p.size * p.life;
        ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
        ctx.restore();
      }
      ctx.globalAlpha = 1.0;
      requestAnimationFrame(animateTrail);
    };
    requestAnimationFrame(animateTrail);

    return () => {
      window.removeEventListener('resize', resize);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [state.isMobile, state.isTablet, state.prefersReducedMotion]);

  return (
    <>
      <div ref={cursorRef} id="custom-cursor" className="fixed top-0 left-0 pointer-events-none z-[10002] mix-blend-difference will-change-transform"
        style={{ width: '10px', height: '10px', backgroundColor: '#ffffff', borderRadius: '50%' }} aria-hidden="true" />
      <div ref={followerRef} id="custom-cursor-follower" className="fixed top-0 left-0 pointer-events-none z-[10001] will-change-transform"
        style={{ width: '32px', height: '32px', border: '2px solid #00e5ff', borderRadius: '0' }} aria-hidden="true" />
    </>
  );
}
