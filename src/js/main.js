// Main coordinator script - Cyberpunk Comic Book Rebuild
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { webGLScene } from './webgl.js';
import { audioSystem } from './audio.js';

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // Boot progress variables (declared early for scope)
  let simulatedProgress = 0;
  let actualProgress = 0;

  // 1. Setup WebGL progress listener first (prevents race condition)
  webGLScene.onLoadProgress = (progress) => {
    actualProgress = progress;
  };

  // 2. Initialize WebGL Scene (Grid & Starfield)
  webGLScene.init('canvas-3d');

  // Dynamic theme colors
  let cachedThemeColor = '#00e5ff'; // Default Cyber Cyan

  // 2. Custom cursor trail physics
  const cursor = document.getElementById('custom-cursor');
  const follower = document.getElementById('custom-cursor-follower');
  
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;
  let followerScale = 1.0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Position cursor
    cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  });

  function updateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    
    follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%) scale(${followerScale}) rotate(45deg)`;
    
    requestAnimationFrame(updateFollower);
  }
  updateFollower();

  // Hover states for cursor
  function bindInteractiveEvents() {
    const interactives = document.querySelectorAll(
      'button, a, input, textarea, .hud-dot-container, #audio-control-widget, .project-mini-row, .channel-link-btn, .hud-brand-logo-frame'
    );
    interactives.forEach(el => {
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('click', onClick);

      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);
      el.addEventListener('click', onClick);
    });
  }

  function onMouseEnter() {
    cursor.style.width = '24px';
    cursor.style.height = '24px';
    cursor.style.backgroundColor = 'rgba(0, 229, 255, 0.35)'; // Cyan glow
    followerScale = 1.3;
    follower.style.borderColor = '#ffffff';
    follower.style.borderRadius = '50%'; // morph square to circle
    audioSystem.playHover();
  }

  function onMouseLeave() {
    cursor.style.width = '10px';
    cursor.style.height = '10px';
    cursor.style.backgroundColor = '#ffffff';
    followerScale = 1.0;
    follower.style.borderColor = 'var(--accent-cyan)';
    follower.style.borderRadius = '0'; // reset to diamond
  }

  function onClick() {
    audioSystem.playClick();
  }

  bindInteractiveEvents();

  // 3. Immersive boot loader
  const progressCircle = document.getElementById('progress-circle');
  const progressText = document.getElementById('loader-percentage-text');
  const termLog = document.getElementById('boot-terminal-log');
  const circleLength = 251.32;

  // Add terminal text dynamically during boot
  const termLines = [
    '<p class="term-line green">[OK] COMIC PROTOCOL SYNCED</p>',
    '<p class="term-line cyan">[SYS] RENDERING NEO-COMIC ENGINE...</p>',
    '<p class="term-line pink">[SYS] PARALLAX TEXTURE BUFFERS ONLINE</p>'
  ];

  const loadInterval = setInterval(() => {
    if (simulatedProgress < 90) {
      simulatedProgress += Math.floor(Math.random() * 8) + 3;
    }

    if (actualProgress < 100 && simulatedProgress > 90) {
      simulatedProgress = 90;
    }

    if (actualProgress === 100) {
      simulatedProgress += 10;
      if (simulatedProgress >= 100) {
        simulatedProgress = 100;
        clearInterval(loadInterval);
        setTimeout(endPreloader, 600);
      }
    }

    // Add log lines at specific intervals
    if (simulatedProgress > 30 && termLog.children.length === 3) {
      termLog.innerHTML += termLines[0];
    } else if (simulatedProgress > 60 && termLog.children.length === 4) {
      termLog.innerHTML += termLines[1];
    } else if (simulatedProgress > 85 && termLog.children.length === 5) {
      termLog.innerHTML += termLines[2];
    }

    const offset = circleLength - (simulatedProgress * circleLength) / 100;
    progressCircle.style.strokeDashoffset = offset;
    progressText.textContent = `${simulatedProgress}%`;
  }, 75);

  function endPreloader() {
    const preloader = document.getElementById('preloader');
    preloader.style.opacity = '0';
    preloader.style.visibility = 'hidden';

    // Once loader is done, run opening animations for Chapter 0
    animateHeroEntry();
  }

  // 4. GSAP Scroll-Triggered Comic Panel Entrance Animations
  // Important: configure ScrollTrigger to scroller '#scroll-container'
  ScrollTrigger.defaults({
    scroller: '#scroll-container'
  });

  function animateHeroEntry() {
    const tl = gsap.timeline();
    
    const paneLeft = document.querySelector('.hero-comic-grid .pane-left');
    if (paneLeft) {
      tl.from(paneLeft, {
        duration: 0.9,
        x: -100,
        opacity: 0,
        skewX: -5,
        ease: 'power3.out'
      });
    }
    
    const paneRight = document.querySelector('.hero-comic-grid .pane-right');
    if (paneRight) {
      tl.from(paneRight, {
        duration: 0.9,
        x: 100,
        opacity: 0,
        skewX: 5,
        ease: 'power3.out'
      }, paneLeft ? '-=0.6' : '+=0');
    }
    
    const bubble = document.querySelector('.hero-comic-grid .speech-bubble');
    if (bubble) {
      tl.from(bubble, {
        duration: 0.5,
        scale: 0,
        opacity: 0,
        ease: 'back.out(1.7)'
      }, '-=0.2');
    }
    
    const sfx = document.querySelector('#sec-0 .sound-fx');
    if (sfx) {
      tl.from(sfx, {
        duration: 0.4,
        scale: 1.5,
        opacity: 0,
        ease: 'bounce.out'
      }, '-=0.2');
    }
  }

  // Animate other chapters on scroll
  const chapters = ['sec-1', 'sec-2', 'sec-3', 'sec-4', 'sec-5'];
  
  chapters.forEach((chapterId) => {
    const element = document.getElementById(chapterId);
    if (!element) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: 'top 65%',
        toggleActions: 'play none none none'
      }
    });

    const header = element.querySelector('.chapter-header');
    if (header) {
      tl.from(header, {
        duration: 0.5,
        y: -30,
        opacity: 0,
        skewX: -3,
        ease: 'power2.out'
      });
    }

    const paneLeft = element.querySelector('.pane-left');
    if (paneLeft) {
      tl.from(paneLeft, {
        duration: 0.7,
        x: -80,
        opacity: 0,
        skewX: -2,
        ease: 'power2.out'
      }, header ? '-=0.25' : '+=0');
    }

    const paneRight = element.querySelector('.pane-right');
    if (paneRight) {
      tl.from(paneRight, {
        duration: 0.7,
        x: 80,
        opacity: 0,
        skewX: 2,
        ease: 'power2.out'
      }, paneLeft ? '-=0.55' : '+=0');
    }

    const bubble = element.querySelector('.speech-bubble');
    if (bubble) {
      tl.from(bubble, {
        duration: 0.4,
        scale: 0,
        opacity: 0,
        ease: 'back.out(1.8)'
      }, '-=0.2');
    }

    const caption = element.querySelector('.caption-box');
    if (caption) {
      tl.from(caption, {
        duration: 0.4,
        scale: 0.8,
        opacity: 0,
        ease: 'power2.out'
      }, '-=0.3');
    }

    const sfx = element.querySelector('.sound-fx');
    if (sfx) {
      tl.from(sfx, {
        duration: 0.4,
        scale: 1.6,
        opacity: 0,
        ease: 'bounce.out'
      }, '-=0.2');
    }
  });

  // Specifically animate the skill bars width inside Chapter 2
  ScrollTrigger.create({
    trigger: '#sec-2',
    start: 'top 50%',
    onEnter: () => {
      document.querySelectorAll('.chart-fill').forEach(bar => {
        const w = bar.style.getPropertyValue('--width').trim() || '80%';
        gsap.to(bar, { width: w, duration: 1.2, ease: 'power2.out' });
      });
    }
  });

  // 5. Scroll Tracking for HUD Navigation & WebGL
  const scrollContainer = document.getElementById('scroll-container');
  const hudDots = document.querySelectorAll('.hud-dot-container');
  const sections = document.querySelectorAll('.comic-chapter');

  scrollContainer.addEventListener('scroll', () => {
    const scrollTop = scrollContainer.scrollTop;
    const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    
    // Pass scroll progress percentage to Three.js scene (0.0 to 1.0)
    const pct = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
    webGLScene.setScrollPercent(pct);

    // Track active chapter for HUD dot updates
    let currentIdx = 0;
    const viewHeight = window.innerHeight;
    
    sections.forEach((sec, idx) => {
      const topOffset = sec.offsetTop;
      if (scrollTop >= topOffset - viewHeight * 0.4) {
        currentIdx = idx;
      }
    });

    hudDots.forEach((dot, idx) => {
      if (idx === currentIdx) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  });

  // Click handler on HUD navigation dots
  hudDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetIdx = parseInt(dot.getAttribute('data-target'));
      const targetSec = document.getElementById(`sec-${targetIdx}`);
      
      if (targetSec) {
        scrollContainer.scrollTo({
          top: targetSec.offsetTop,
          behavior: 'smooth'
        });
      }
      
      audioSystem.init();
      audioSystem.playClick();
    });
  });

  // Click handler on HUD brand logo to scroll back to top (sec-0)
  const brandLogo = document.querySelector('.hud-brand-logo-frame');
  if (brandLogo) {
    brandLogo.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetSec = document.getElementById('sec-0');
      if (targetSec) {
        scrollContainer.scrollTo({
          top: targetSec.offsetTop,
          behavior: 'smooth'
        });
      }
      audioSystem.init();
      audioSystem.playClick();
    });
  }

  // 6. Audio Widget control
  const audioWidget = document.getElementById('audio-control-widget');
  const audioText = document.getElementById('audio-text');

  function setAudioWidgetState(isPlaying) {
    if (isPlaying) {
      audioWidget.classList.add('playing');
      audioText.textContent = "Sound On";
      audioText.style.color = "var(--accent-cyan)";
    } else {
      audioWidget.classList.remove('playing');
      audioText.textContent = "Sound Off";
      audioText.style.color = "var(--text-muted)";
    }
  }

  audioWidget.addEventListener('click', (e) => {
    e.stopPropagation();
    audioSystem.init();
    const isPlaying = audioSystem.toggle();
    setAudioWidgetState(isPlaying);
  });

  // Trigger audio on first interaction
  let hasInteractedForAudio = false;
  const startAudioOnFirstInteraction = () => {
    if (hasInteractedForAudio) return;
    hasInteractedForAudio = true;

    audioSystem.init();
    audioSystem.startAmbient();
    setAudioWidgetState(true);

    window.removeEventListener('click', startAudioOnFirstInteraction);
    window.removeEventListener('keydown', startAudioOnFirstInteraction);
    window.removeEventListener('touchstart', startAudioOnFirstInteraction);
    if (scrollContainer) {
      scrollContainer.removeEventListener('scroll', startAudioOnFirstInteraction);
    }
  };

  window.addEventListener('click', startAudioOnFirstInteraction);
  window.addEventListener('keydown', startAudioOnFirstInteraction);
  window.addEventListener('touchstart', startAudioOnFirstInteraction);
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', startAudioOnFirstInteraction);
  }

  // 7. Modals opening & closing coordination
  const modalMap = [
    { triggerId: 'btn-open-about', modalId: 'modal-about' },
    { triggerId: 'btn-open-skills', modalId: 'modal-skills' },
    { triggerId: 'btn-open-projects', modalId: 'modal-projects' },
    { triggerId: 'btn-open-experience', modalId: 'modal-experience' },
    { triggerId: 'row-proj-1', modalId: 'modal-projects' },
    { triggerId: 'row-proj-2', modalId: 'modal-projects' },
    { triggerId: 'row-proj-3', modalId: 'modal-projects' }
  ];

  modalMap.forEach(item => {
    const trigger = document.getElementById(item.triggerId);
    const modal = document.getElementById(item.modalId);
    
    if (trigger && modal) {
      trigger.addEventListener('click', () => {
        modal.classList.add('active');
        scrollContainer.style.overflowY = 'hidden'; // stop page scrolling
        audioSystem.playClick();
      });
    }
  });

  const modalCloseBtns = document.querySelectorAll('.modal-close-trigger');
  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('active');
        scrollContainer.style.overflowY = 'auto'; // restore scrolling
        audioSystem.playClick();
      }
    });
  });

  // ESC key to close modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.comic-detail-modal.active');
      if (activeModal) {
        activeModal.classList.remove('active');
        scrollContainer.style.overflowY = 'auto';
        audioSystem.playClick();
      }
    }
  });

  // Clicking outside modal page content to close it
  document.querySelectorAll('.comic-detail-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-hologram-wrapper')) {
        modal.classList.remove('active');
        scrollContainer.style.overflowY = 'auto';
        audioSystem.playClick();
      }
    });
  });

  // Ambient Cursor particle trail (Canvas 2D)
  const trailCanvas = document.createElement('canvas');
  trailCanvas.id = 'cursor-trail-canvas';
  trailCanvas.style.position = 'fixed';
  trailCanvas.style.top = '0';
  trailCanvas.style.left = '0';
  trailCanvas.style.width = '100vw';
  trailCanvas.style.height = '100vh';
  trailCanvas.style.pointerEvents = 'none';
  trailCanvas.style.zIndex = '10000';
  document.body.appendChild(trailCanvas);

  const trailCtx = trailCanvas.getContext('2d');
  let trailParticles = [];

  window.addEventListener('resize', () => {
    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;
  });
  trailCanvas.width = window.innerWidth;
  trailCanvas.height = window.innerHeight;

  let lastMoveTime = 0;
  window.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - lastMoveTime < 16) return;
    lastMoveTime = now;

    trailParticles.push({
      x: e.clientX,
      y: e.clientY,
      size: Math.random() * 4 + 2,
      life: 1.0,
      decay: 0.02 + Math.random() * 0.015,
      color: cachedThemeColor,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5
    });
  });

  function animateTrailParticles() {
    trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

    if (trailParticles.length === 0) {
      requestAnimationFrame(animateTrailParticles);
      return;
    }

    for (let i = trailParticles.length - 1; i >= 0; i--) {
      const p = trailParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        trailParticles.splice(i, 1);
        continue;
      }

      // Draw square particle trails to match comic layout
      trailCtx.globalAlpha = p.life * 0.45;
      trailCtx.fillStyle = p.color;
      
      // Draw tilted small square particles
      trailCtx.save();
      trailCtx.translate(p.x, p.y);
      trailCtx.rotate(p.life * Math.PI);
      const sz = p.size * p.life;
      trailCtx.fillRect(-sz/2, -sz/2, sz, sz);
      trailCtx.restore();
    }

    trailCtx.globalAlpha = 1.0;
    requestAnimationFrame(animateTrailParticles);
  }
  animateTrailParticles();

  // Listen for form transmission success to play a sound
  window.addEventListener('transmission-success', () => {
    audioSystem.playClick();
    setTimeout(() => audioSystem.playClick(), 120); // Double-chirp for success effect
  });

  // Listen for form transmission failure to play an error sound
  window.addEventListener('transmission-error', () => {
    // Glitchy triple-stutter for failure effect
    audioSystem.playClick();
    setTimeout(() => audioSystem.playClick(), 60);
    setTimeout(() => audioSystem.playClick(), 120);
  });

  // 8. Contact Form submission using native fetch (Formspree, Web3Forms, or Custom Backend)
  const contactForm = document.getElementById('portfolio-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const form = e.target;
      const submitBtn = document.getElementById('btn-submit-contact');
      if (!submitBtn) return;
      const originalBtnText = submitBtn.innerHTML;
      
      submitBtn.innerHTML = '[ TRANSMITTING... ]';
      submitBtn.style.pointerEvents = 'none';
      
      // Web3Forms Endpoint
      const formEndpoint = "https://api.web3forms.com/submit";
      // Paste your Web3Forms Access Key here (e.g. "a5b82c3c-...")
      const accessKey = "f491cccd-442f-4a6d-a329-6bf9a9618b99";
      
      // Demo Mode: If the key is the placeholder, simulate a successful send for testing.
      if (accessKey === "YOUR_ACCESS_KEY_HERE") {
        console.warn("DEMO MODE: Web3Forms Access Key is set to default placeholder. Simulating successful send.");
        setTimeout(() => {
          submitBtn.innerHTML = '[ TRANSMISSION SENT ]';
          form.reset();
          
          // Dispatch event to trigger success audio effect
          window.dispatchEvent(new CustomEvent('transmission-success'));
          
          setTimeout(() => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.style.pointerEvents = 'auto';
          }, 3000);
        }, 1500);
        return;
      }
      
      const formData = new FormData(form);
      formData.append("access_key", accessKey);
      
      fetch(formEndpoint, {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          submitBtn.innerHTML = '[ TRANSMISSION SENT ]';
          form.reset();
          
          // Dispatch event to trigger success audio effect
          window.dispatchEvent(new CustomEvent('transmission-success'));
          
          setTimeout(() => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.style.pointerEvents = 'auto';
          }, 3000);
        } else {
          throw new Error(data.message || 'Server returned error status');
        }
      })
      .catch((error) => {
        console.error('Submission Error:', error);
        
        // Dispatch event to trigger error audio effect
        window.dispatchEvent(new CustomEvent('transmission-error'));
        
        submitBtn.innerHTML = '[ TRANSMISSION FAILED ]';
        setTimeout(() => {
          submitBtn.innerHTML = originalBtnText;
          submitBtn.style.pointerEvents = 'auto';
        }, 3000);
      });
    });
  }
});
