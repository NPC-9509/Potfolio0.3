// ScrollAnimations.js — GSAP scroll-driven animations (extracted from main.js)

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AppState } from '../core/AppState.js';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations() {
  if (AppState.state.prefersReducedMotion) return;

  ScrollTrigger.defaults({ scroller: '#scroll-container' });

  // Chapter 0 hero is animated via animateHeroEntry() called after preloader
  animateSections();
  animateSkillBars();
  initCardTilts();
}

export function animateHeroEntry() {
  if (AppState.state.prefersReducedMotion) return;
  const tl = gsap.timeline();

  const paneLeft = document.querySelector('.hero-comic-grid .pane-left');
  if (paneLeft) tl.from(paneLeft, { duration: 0.9, x: -50, opacity: 0, scale: 0.98, ease: 'power3.out' });

  const paneRight = document.querySelector('.hero-comic-grid .pane-right');
  if (paneRight) tl.from(paneRight, { duration: 0.9, x: 50, opacity: 0, scale: 0.98, ease: 'power3.out' }, '-=0.6');

  const bubble = document.querySelector('.hero-comic-grid .speech-bubble');
  if (bubble) tl.from(bubble, { duration: 0.5, scale: 0.9, opacity: 0, ease: 'power2.out' }, '-=0.2');

  const sfx = document.querySelector('#sec-0 .sound-fx');
  if (sfx) tl.from(sfx, { duration: 0.4, scale: 1.5, opacity: 0, ease: 'power2.out' }, '-=0.2');
}

function animateSections() {
  const chapters = ['sec-1', 'sec-2', 'sec-3', 'sec-4', 'sec-5'];
  chapters.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 65%', toggleActions: 'play none none none' }
    });

    const header = el.querySelector('.chapter-header');
    if (header) tl.from(header, { duration: 0.5, y: -20, opacity: 0, ease: 'power2.out' });

    const paneLeft = el.querySelector('.pane-left');
    if (paneLeft) tl.from(paneLeft, { duration: 0.7, x: -40, opacity: 0, scale: 0.98, ease: 'power2.out' }, header ? '-=0.25' : '+=0');

    const paneRight = el.querySelector('.pane-right');
    if (paneRight) tl.from(paneRight, { duration: 0.7, x: 40, opacity: 0, scale: 0.98, ease: 'power2.out' }, paneLeft ? '-=0.55' : '+=0');

    const bubble = el.querySelector('.speech-bubble');
    if (bubble) tl.from(bubble, { duration: 0.4, scale: 0.9, opacity: 0, ease: 'power2.out' }, '-=0.2');

    const caption = el.querySelector('.caption-box');
    if (caption) tl.from(caption, { duration: 0.4, scale: 0.9, opacity: 0, ease: 'power2.out' }, '-=0.3');

    const sfx = el.querySelector('.sound-fx');
    if (sfx) tl.from(sfx, { duration: 0.4, scale: 1.5, opacity: 0, ease: 'power2.out' }, '-=0.2');
  });
}

function animateSkillBars() {
  ScrollTrigger.create({
    trigger: '#sec-2',
    start: 'top 50%',
    onEnter: () => {
      document.querySelectorAll('.chart-fill').forEach(bar => {
        const w = bar.dataset.width || bar.style.getPropertyValue('--width').trim() || '80%';
        bar.style.width = '0%';
        gsap.to(bar, { width: w, duration: 1.2, ease: 'power2.out' });
      });
    }
  });
}

export function initCardTilts() {
  if (AppState.state.isMobile || AppState.state.isTablet) return;

  const cards = document.querySelectorAll('.comic-panel, .project-mini-row, .settings-panel-section, .resume-dossier-panel, .resume-downloads-panel');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const bounds = card.getBoundingClientRect();
      const x = (e.clientX - bounds.left - bounds.width / 2) / (bounds.width / 2);
      const y = (e.clientY - bounds.top - bounds.height / 2) / (bounds.height / 2);
      
      gsap.to(card, {
        transform: `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.02)`,
        duration: 0.3,
        ease: 'power1.out',
        overwrite: 'auto'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        transform: 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1.0)',
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
  });
}

