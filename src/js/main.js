// main.js — V2.0 Orchestrator (clean, modular)

import { AppState }           from '../core/AppState.js';
import { bus }                from '../core/EventBus.js';
import { loader }             from '../utils/Loader.js';
import { initAchievements }   from '../core/AchievementSystem.js';
import { webGLScene }         from '../three/Scene.js';
import { audioEngine }        from '../audio/AudioEngine.js';
import { initCursor, bindInteractiveEvents } from '../ui/Cursor.js';
import { initHUD, updateFromScroll } from '../ui/HUD.js';
import { initModals }         from '../ui/Modals.js';
import { initMobileNav }      from '../ui/MobileNav.js';
import { initTerminal }       from '../ui/Terminal.js';
import { initAIAssistant }    from '../ui/AIAssistant.js';
import { initScrollAnimations, animateHeroEntry } from '../animations/ScrollAnimations.js';
import { performanceManager } from '../utils/Performance.js';
import { analytics }          from '../core/Analytics.js';
import { initSettingsPanel }  from '../ui/SettingsPanel.js';


document.addEventListener('DOMContentLoaded', async () => {

  // ── 1. Bootstrap core state ──────────────────────────
  AppState.init();
  performanceManager.init();
  analytics.init();
  initSettingsPanel();

  // ── 2. Load all data & init scene in parallel ────────
  let portfolioData = {};
  const progressRef = { value: 0 };

  // Listen to progress from data loader
  bus.on('loader:progress', pct => {
    progressRef.value = Math.round(pct * 0.6); // data = 60% of total
  });

  webGLScene.onLoadProgress = p => {
    progressRef.value = Math.min(60 + Math.round(p * 0.4), 100); // scene = 40% of total
  };

  // Kick off both in parallel
  const loadPromise = loader.loadAllData().then(data => {
    portfolioData = data;
    progressRef.value = 60; // data fully loaded
  }).catch(e => {
    console.warn('[V2] Data load failed, using fallback.', e);
    progressRef.value = 60;
  });

  webGLScene.init('canvas-3d');

  await loadPromise;
  const { portfolio, projects, experience, skills, achievements } = portfolioData;

  // ── 3. Populate DOM from data ─────────────────────────
  populateDOM(portfolioData);

  // ── 4. Boot preloader sequence ────────────────────────
  await runBootSequence(progressRef);


  // ── 5. Init all UI modules ────────────────────────────
  initCursor();
  initHUD();
  initModals();
  initMobileNav();
  initScrollAnimations();
  initTerminal(portfolioData);
  initAIAssistant(portfolioData);
  initAchievements(achievements);
  initAudioWidget();
  initContactForm(portfolio);
  initScrollTracking();

  // ── 6. Entry animation ────────────────────────────────
  animateHeroEntry();
  bindInteractiveEvents();

  // ── 7. Start audio on first interaction ───────────────
  initFirstInteractionAudio();

  // ── 8. SEO structured data ────────────────────────────
  injectStructuredData(portfolio);
});

// ══════════════════════════════════════════
// DOM POPULATION FROM JSON DATA
// ══════════════════════════════════════════
function populateDOM({ portfolio, projects, experience, skills, achievements }) {
  if (!portfolio) return;

  // Hero social links
  const heroLinks = document.getElementById('hero-social-links');
  if (heroLinks && portfolio.socials) {
    heroLinks.innerHTML = portfolio.socials.map(s => `
      <a href="${s.url}" ${s.external ? 'target="_blank" rel="noopener noreferrer"' : ''} class="channel-link-btn" id="${s.id}">${s.label}</a>
    `).join('');
  }

  // About bio panels
  const aboutShort  = document.getElementById('about-bio-short');
  const aboutDetail = document.getElementById('modal-about-detail');
  const aboutPass   = document.getElementById('modal-about-passion');
  const aboutCollab = document.getElementById('modal-about-collab');
  if (aboutShort) aboutShort.textContent = portfolio.bio_short || '';
  if (aboutDetail) aboutDetail.textContent = portfolio.bio_detail || '';
  if (aboutPass)   aboutPass.textContent  = portfolio.bio_passion || '';
  if (aboutCollab) aboutCollab.textContent = portfolio.bio_collaboration || '';

  // Projects rows (section)
  const projRows = document.getElementById('projects-rows');
  if (projRows && projects) {
    projRows.innerHTML = projects.map((p, i) => `
      <div class="project-mini-row" id="row-proj-${i+1}" tabindex="0" role="button" aria-label="Open ${p.title} details">
        <span class="row-num">${p.index}</span>
        <div class="row-info">
          <h4 class="row-title">${p.title}</h4>
          <p class="row-tags">${p.tags}</p>
        </div>
      </div>`).join('');
  }

  // Experience timeline nodes (section)
  const expNodes = document.getElementById('experience-nodes');
  if (expNodes && experience) {
    expNodes.innerHTML = experience.map(e => `
      <div class="chronicle-node">
        <span class="node-date">${e.nodeDate}</span>
        <p class="node-text"><strong>${e.nodeText}</strong> - ${e.nodeOrg}</p>
      </div>`).join('');
  }

  // Skills chart bars
  const skillChart = document.getElementById('skills-chart');
  if (skillChart && skills?.categories) {
    const colorMap = { cyan: 'bg-cyan', pink: 'bg-pink', purple: 'bg-purple' };
    skillChart.innerHTML = skills.categories.map(c => `
      <div class="skills-chart-row">
        <span class="chart-label">${c.chartLabel}</span>
        <div class="chart-bar">
          <div class="chart-fill ${colorMap[c.color] || 'bg-cyan'}" data-width="${c.chartWidth}"></div>
        </div>
      </div>`).join('');
  }

  // Modal: About
  const modalAboutImg = document.getElementById('modal-about-img');
  if (modalAboutImg && portfolio.profile_image) {
    modalAboutImg.src = portfolio.profile_image;
    modalAboutImg.alt = `${portfolio.name} profile photo`;
  }

  // Modal: Skills categories
  const modalSkillsCols = document.getElementById('modal-skills-cols');
  if (modalSkillsCols && skills?.categories) {
    modalSkillsCols.innerHTML = skills.categories.map(c => `
      <div class="modal-comic-panel list-card-panel">
        <div class="comic-card-border"></div>
        <div class="modal-panel-content">
          <div class="card-icon-header">
            <span class="card-icon">${c.icon}</span>
            <h4 class="card-title">${c.label}</h4>
          </div>
          <p class="card-summary">${c.summary}</p>
          <div class="comic-badges-group">
            ${c.skills.map(s => `<span class="tag-badge color-${c.color}">${s.name}</span>`).join('')}
          </div>
        </div>
      </div>`).join('');
  }

  // Modal: Skills certifications
  const certRow = document.getElementById('modal-skills-certs');
  if (certRow && skills?.certifications) {
    certRow.innerHTML = skills.certifications.map(c => `<span class="cert-badge">${c.label}</span>`).join('');
  }

  // Modal: Projects
  const modalProjects = document.getElementById('modal-projects-grid');
  if (modalProjects && projects) {
    modalProjects.innerHTML = projects.map(p => `
      <div class="modal-comic-panel project-item-panel">
        <div class="comic-card-border"></div>
        <div class="modal-project-layout-inner">
          <div class="modal-project-text">
            <span class="proj-index-tag">${p.mission}</span>
            <h4 class="modal-project-title">${p.title}</h4>
            <p>${p.description}</p>
            <p class="t-challenge"><strong>Challenge:</strong> ${p.challenge}</p>
            <p class="t-solution"><strong>Solution:</strong> ${p.solution}</p>
            <div class="proj-badge-list">
              ${p.badges.map(b => `<span class="tag-badge color-${b.color}">${b.label}</span>`).join('')}
            </div>
            <div class="proj-action-links">
              ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" rel="noopener" class="proj-link-btn">[ LIVE DEMO ]</a>` : ''}
              ${p.sourceUrl ? `<a href="${p.sourceUrl}" target="_blank" rel="noopener" class="proj-link-btn">[ SOURCE CODE ]</a>` : ''}
            </div>
          </div>
          <div class="modal-project-artwork" style="position:relative;overflow:hidden;">
            <img src="${p.artwork}" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;" />
          </div>
        </div>
      </div>`).join('');
  }

  // Modal: Experience timeline
  const modalExp = document.getElementById('modal-experience-timeline');
  if (modalExp && experience) {
    modalExp.innerHTML = experience.map(e => `
      <div class="timeline-detail-item">
        <div class="timeline-date-tag ${e.dateTag}">${e.dateRange}</div>
        <h4 class="timeline-role">${e.role}</h4>
        <span class="timeline-org">${e.org}</span>
        <p class="timeline-desc">${e.description}</p>
      </div>`).join('');
  }

  // Modal: Achievements list
  const modalAwards = document.getElementById('modal-awards-list');
  if (modalAwards && achievements?.awards) {
    modalAwards.innerHTML = achievements.awards.map(a => `
      <li>
        <span class="achievement-icon">${a.icon}</span>
        <div class="achievement-text">
          <strong>${a.title}</strong>
          <p>${a.description}</p>
        </div>
      </li>`).join('');
  }

  // Contact beacon channels
  const beaconPhone = document.getElementById('beacon-phone');
  const beaconEmail = document.getElementById('beacon-email');
  if (beaconPhone && portfolio.contact) beaconPhone.href = portfolio.contact.phone_href;
  if (beaconEmail && portfolio.contact) beaconEmail.href = portfolio.contact.email_href;
}

// ══════════════════════════════════════════
// BOOT SEQUENCE (PRELOADER)
// ══════════════════════════════════════════
function runBootSequence(actualProgressRef) {
  return new Promise(resolve => {
    const progressCircle = document.getElementById('progress-circle');
    const progressText   = document.getElementById('loader-percentage-text');
    const termLog        = document.getElementById('boot-terminal-log');
    const circleLength   = 251.32;
    let displayProgress = 0;

    const termLines = [
      '<p class="term-line green">[OK] COMIC PROTOCOL SYNCED</p>',
      '<p class="term-line cyan">[LOAD] DEVELOPER PROFILE — VERIFIED</p>',
      '<p class="term-line purple">[LOAD] PROJECT DATABASE — SYNCING...</p>',
      '<p class="term-line pink">[OK] FULL ACCESS GRANTED. WELCOME, AGENT.</p>'
    ];

    // Safety timeout — finish after 12s max regardless
    const safetyTimeout = setTimeout(() => {
      clearInterval(updateInterval);
      endPreloader();
      resolve();
    }, 12000);

    const updateInterval = setInterval(() => {
      const realProgress = actualProgressRef.value;
      displayProgress = Math.max(displayProgress + 1, realProgress);
      displayProgress = Math.min(displayProgress, 100);

      // Log lines at milestones
      if (termLog) {
        if (displayProgress > 25  && termLog.children.length === 4) termLog.innerHTML += termLines[0];
        if (displayProgress > 50  && termLog.children.length === 5) termLog.innerHTML += termLines[1];
        if (displayProgress > 75  && termLog.children.length === 6) termLog.innerHTML += termLines[2];
        if (displayProgress > 92  && termLog.children.length === 7) termLog.innerHTML += termLines[3];
      }

      if (progressCircle) progressCircle.style.strokeDashoffset = circleLength - (displayProgress * circleLength) / 100;
      if (progressText)   progressText.textContent = `${Math.min(displayProgress, 100)}%`;

      if (displayProgress >= 100) {
        clearInterval(updateInterval);
        clearTimeout(safetyTimeout);
        setTimeout(() => { endPreloader(); resolve(); }, 500);
      }
    }, 40);
  });
}


function endPreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) { preloader.style.opacity = '0'; preloader.style.visibility = 'hidden'; }
}

// ══════════════════════════════════════════
// SCROLL TRACKING
// ══════════════════════════════════════════
function initScrollTracking() {
  const scrollContainer = document.getElementById('scroll-container');
  if (!scrollContainer) return;

  scrollContainer.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const pct = scrollHeight - clientHeight > 0 ? scrollTop / (scrollHeight - clientHeight) : 0;
    webGLScene.setScrollPercent(pct);
    updateFromScroll(scrollTop);
    analytics.trackScrollDepth(pct);
  }, { passive: true });
}

// ══════════════════════════════════════════
// AUDIO WIDGET
// ══════════════════════════════════════════
function initAudioWidget() {
  const widget    = document.getElementById('audio-control-widget');
  const audioText = document.getElementById('audio-text');
  const volSlider = document.getElementById('volume-slider');

  const setWidgetState = (playing) => {
    if (playing) {
      widget?.classList.add('playing');
      widget?.setAttribute('aria-pressed', 'true');
      if (audioText) { audioText.textContent = 'Sound On'; audioText.style.color = 'var(--accent-cyan)'; }
    } else {
      widget?.classList.remove('playing');
      widget?.setAttribute('aria-pressed', 'false');
      if (audioText) { audioText.textContent = 'Sound Off'; audioText.style.color = 'var(--text-muted)'; }
    }
  };

  // Restore saved state
  if (volSlider) {
    volSlider.value = AppState.state.audioVolume !== undefined ? AppState.state.audioVolume : 0.7;
  }

  if (AppState.state.audioEnabled) {
    setWidgetState(true);
  }

  widget?.addEventListener('click', e => {
    e.stopPropagation();
    audioEngine.init();
    const playing = audioEngine.toggle();
    setWidgetState(playing);
  });

  volSlider?.addEventListener('input', e => {
    audioEngine.setVolume(parseFloat(e.target.value));
  });

  // Bus events for external audio toggles (from terminal)
  bus.on('audio:toggle', () => {
    audioEngine.init();
    const playing = audioEngine.toggle();
    setWidgetState(playing);
  });
}

function initFirstInteractionAudio() {
  let interacted = false;
  const start = () => {
    if (interacted) return;
    interacted = true;
    if (AppState.state.audioEnabled) {
      audioEngine.init();
      audioEngine.startAmbient();
    }
    ['click', 'keydown', 'touchstart'].forEach(ev => window.removeEventListener(ev, start));
    const sc = document.getElementById('scroll-container');
    sc?.removeEventListener('scroll', start);
  };
  ['click', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, start));
  document.getElementById('scroll-container')?.addEventListener('scroll', start, { passive: true });
}

// ══════════════════════════════════════════
// CONTACT FORM
// ══════════════════════════════════════════
function initContactForm(portfolio) {
  const form = document.getElementById('portfolio-contact-form');
  const resumeLink = document.getElementById('link-resume');
  const resumeModalLink = document.getElementById('link-resume-modal');

  resumeLink?.addEventListener('click', () => {
    analytics.trackResumeDownload();
  });
  resumeModalLink?.addEventListener('click', () => {
    analytics.trackResumeDownload();
  });

  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const submitBtn = document.getElementById('btn-submit-contact');
    if (!submitBtn) return;
    const original = submitBtn.innerHTML;
    submitBtn.innerHTML = '[ TRANSMITTING... ]';
    submitBtn.style.pointerEvents = 'none';

    const accessKey = 'f491cccd-442f-4a6d-a329-6bf9a9618b99';
    const formData  = new FormData(form);
    formData.append('access_key', accessKey);

    try {
      const resp = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
      const data = await resp.json();
      if (data.success) {
        submitBtn.innerHTML = '[ TRANSMISSION SENT ✓ ]';
        form.reset();
        analytics.trackContactSubmission();
        bus.emit('audio:click');
        setTimeout(() => audioEngine.playClick(), 120);
      } else {
        throw new Error(data.message);
      }
    } catch(err) {
      console.error(err);
      submitBtn.innerHTML = '[ TRANSMISSION FAILED ]';
      bus.emit('audio:click');
      setTimeout(() => audioEngine.playClick(), 60);
      setTimeout(() => audioEngine.playClick(), 120);
    }

    setTimeout(() => { submitBtn.innerHTML = original; submitBtn.style.pointerEvents = 'auto'; }, 3500);
  });
}

// ══════════════════════════════════════════
// JSON-LD STRUCTURED DATA (SEO)
// ══════════════════════════════════════════
function injectStructuredData(portfolio) {
  if (!portfolio) return;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: portfolio.name,
    jobTitle: portfolio.title,
    description: portfolio.bio_short,
    email: portfolio.contact?.email,
    telephone: portfolio.contact?.phone,
    url: portfolio.seo?.canonical || window.location.href,
    sameAs: (portfolio.socials || []).filter(s => s.external).map(s => s.url)
  };
  const script = document.createElement('script');
  script.type  = 'application/ld+json';
  script.text  = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);
}
