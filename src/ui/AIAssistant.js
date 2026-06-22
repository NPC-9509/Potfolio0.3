// AIAssistant.js — Upgraded Context-Aware AI Guide Widget (V3.0)

import { bus } from '../core/EventBus.js';
import { AppState } from '../core/AppState.js';
import { navigateTo } from './HUD.js';
import { openModal } from './Modals.js';
import { openTerminal } from './Terminal.js';
import { analytics } from '../core/Analytics.js';

let widgetEl, chatEl, suggestionsEl, voiceBtn, isOpen = false;
let _data = {};

// Suggestion chips templates based on current viewport section
const CHIPS_TEMPLATES = {
  0: ["Who is Mukul?", "Show me projects", "Open developer terminal"],
  1: ["Classified logs?", "Where did he work?", "Download resume"],
  2: ["Core technologies", "Design tools", "Certifications"],
  3: ["Recommend a project", "Hospital ERP?", "Source codes?"],
  4: ["Chronic timeline", "Achievements info", "Open credentials"],
  5: ["Direct Email link", "Phone number", "Social channels"]
};

const RESPONSES = [
  { pattern: /\b(hello|hi|hey|greet)\b/i, reply: "Greetings, Agent. I'm SYS_AI. Ask me about Mukul's skills, projects, experience, or type a command like <code>nav [section]</code>." },
  { pattern: /\b(about|who|mukul|agent)\b/i, reply: "Mukul Vyas is a Digital Solutions Specialist with expertise in Software Development, Creative UI Design, and Social Media Marketing. <a href='#' data-action='modal-about'>Open full profile →</a>" },
  { pattern: /\b(project|mission|work|build|built)\b/i, reply: "Mukul has built 3 key missions: University Portal Website, Responsive Web UI, and Custom Digital Ads campaigns. I highly recommend checking out his Hospital ERP system! <a href='#' data-action='modal-projects'>View mission logs →</a>" },
  { pattern: /\b(hospital|erp)\b/i, reply: "The Hospital ERP system optimizes reception patient flow, inventory, and clinical reports. Built using React, Python, and MongoDB. <a href='#' data-action='modal-projects'>View project details →</a>" },
  { pattern: /\b(skill|tech|stack|know|language|tool)\b/i, reply: "Mukul's arsenal is divided into Frontend (React, JS, CSS), Backend (Node, Python, MySQL), and Creative (Figma, Adobe Suite, Meta Ads). <a href='#' data-action='modal-skills'>View tech constellation →</a>" },
  { pattern: /\b(experience|work history|job|intern|university)\b/i, reply: "Mukul worked as a Web Developer Intern at Swaastik Solutions and completed academic cybersecurity milestones at Parul University. <a href='#' data-action='modal-experience'>Open chronicle archives →</a>" },
  { pattern: /\b(contact|hire|email|phone|reach|connect)\b/i, reply: "You can email Mukul directly at mollyvyas@gmail.com, or dial +91 9509006795. <a href='#' data-action='section-5'>Go to Transmission beacon →</a>" },
  { pattern: /\b(resume|cv|download)\b/i, reply: "Resume download room is available. Click here: <a href='#' data-action='modal-resume-room'>[ ACCESS RESUME ROOM ]</a>" },
  { pattern: /\b(terminal|cmd|console)\b/i, reply: "Launching the developer command line console... <a href='#' data-action='terminal'>Open Terminal →</a>" },
  { pattern: /\b(github)\b/i, reply: "Explore source repositories on GitHub at: <a href='https://github.com/NPC-9509' target='_blank'>NPC-9509 →</a>" },
  { pattern: /\b(linkedin)\b/i, reply: "Connect with Mukul on LinkedIn at: <a href='https://www.linkedin.com/in/mukul-vyas-hey/' target='_blank'>mukul-vyas-hey →</a>" },
  { pattern: /\b(certif|cisco|google)\b/i, reply: "Credentials: Fundamentals of Digital Marketing (Google) & Introduction to Cybersecurity (Cisco Networking Academy)." },
  { pattern: /\b(bike|rtr|apache|motorcycle)\b/i, reply: "The Apache RTR 200 4V represents Mukul's focus on speed, precision, and engineering balance. Click the bike logo in the HUD 5 times to unlock a secret!" },
  { pattern: /\b(help|what can)\b/i, reply: "I can answer questions about: skills, projects, experience, contact details, resume credentials, github links, terminal, or take you to any section." },
  { pattern: /\b(where am i|section|zone|current)\b/i, reply: () => getContextualResponse() }
];

export function initAIAssistant(portfolioData) {
  _data = portfolioData;
  widgetEl      = document.getElementById('ai-assistant-widget');
  chatEl        = document.getElementById('ai-chat-area');
  suggestionsEl = document.getElementById('ai-suggestions-row');
  voiceBtn      = document.getElementById('ai-voice-btn');
  if (!widgetEl) return;

  const toggle    = document.getElementById('ai-toggle-btn');
  const closeBtn  = document.getElementById('ai-close-btn');
  const input     = document.getElementById('ai-input');
  const sendBtn   = document.getElementById('ai-send-btn');

  // Restoring saved voice preferences
  AppState.state.aiVoiceEnabled = localStorage.getItem('setting-aivoice') === 'true';
  updateVoiceBtnIcon();

  toggle?.addEventListener('click', () => { isOpen ? close() : open(); });
  closeBtn?.addEventListener('click', close);
  
  voiceBtn?.addEventListener('click', () => {
    const active = !AppState.state.aiVoiceEnabled;
    AppState.state.aiVoiceEnabled = active;
    localStorage.setItem('setting-aivoice', active);
    updateVoiceBtnIcon();
    bus.emit('audio:click');
  });

  const send = () => {
    const msg = input?.value?.trim();
    if (!msg) return;
    input.value = '';
    addMessage(msg, 'user');
    respond(msg);
    bus.emit('audio:click');
  };

  sendBtn?.addEventListener('click', send);
  input?.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });

  // Handle action links inside chat
  chatEl?.addEventListener('click', e => {
    const link = e.target.closest('[data-action]');
    if (!link) return;
    e.preventDefault();
    const action = link.getAttribute('data-action');
    handleAction(action);
  });

  // Track section change to rotate suggestion chips dynamically
  bus.on('section:change', () => {
    if (isOpen) populateSuggestions();
  });

  // Toggle from external triggers (e.g. mobile nav)
  bus.on('assistant:toggle', () => {
    isOpen ? close() : open();
  });
}

function updateVoiceBtnIcon() {
  if (!voiceBtn) return;
  voiceBtn.textContent = AppState.state.aiVoiceEnabled ? '🔊' : '🔇';
  voiceBtn.title = AppState.state.aiVoiceEnabled ? 'Mute AI voice output' : 'Enable AI voice output';
}

function handleAction(action) {
  if (action === 'terminal') { openTerminal(); close(); return; }
  if (action.startsWith('modal-')) { openModal(action); return; }
  if (action.startsWith('section-')) { navigateTo(parseInt(action.split('-')[1])); return; }
}

function open() {
  isOpen = true;
  widgetEl.classList.add('active');
  AppState.set('assistantOpen', true);
  bus.emit('assistant:open');
  bus.emit('achievement:unlock', 'ghost-protocol');

  // Greet on first open
  if (chatEl && chatEl.children.length === 0) {
    const greeting = "Greetings, Agent. I'm SYS_AI — your guide through Mukul's continuous 3D portfolio.";
    setTimeout(() => {
      addMessage(greeting, 'ai');
      speakText(greeting);
    }, 300);
    setTimeout(() => addMessage("Ask me about <code>projects</code>, <code>skills</code>, <code>experience</code>, or select a question below.", 'ai'), 1000);
  }

  populateSuggestions();
}

function close() {
  isOpen = false;
  widgetEl.classList.remove('active');
  AppState.set('assistantOpen', false);
  bus.emit('assistant:close');
}

function populateSuggestions() {
  if (!suggestionsEl) return;
  suggestionsEl.innerHTML = '';

  const sec = AppState.state.currentSection || 0;
  const chips = CHIPS_TEMPLATES[sec] || CHIPS_TEMPLATES[0];

  chips.forEach(text => {
    const btn = document.createElement('button');
    btn.className = 'ai-suggestion-chip';
    btn.textContent = text;
    btn.addEventListener('click', () => {
      addMessage(text, 'user');
      respond(text);
      bus.emit('audio:click');
    });
    suggestionsEl.appendChild(btn);
  });
}

function getContextualResponse() {
  const sectionIdx = AppState.state.currentSection || 0;
  const zoneNames = {
    0: "Zone 0: Origin Gate. This is the entry street of the portfolio grid environment.",
    1: "Zone 1: Profile Matrix. Exploring classified logs of Mukul's personal digital skillset.",
    2: "Zone 2: Skills Arsenal. You are currently looking at the connected neural constellation clusters.",
    3: "Zone 3: Active Operations. Projected screen desks show Mukul's live project deployments.",
    4: "Zone 4: Service Chronicle. The green timeline pathway details past internships and academic cybersecurity paths.",
    5: "Zone 5: Transmission Beacon. A rooftop satellite tower beam is emitting direct contact channels."
  };
  return zoneNames[sectionIdx] || "Continuous 3D world, running speeds up to 60 FPS.";
}

function respond(msg) {
  // Save analytics hit
  analytics.trackAIQuestion();

  // Typing indicator
  const typingId = addMessage('<span class="ai-typing"><span></span><span></span><span></span></span>', 'ai');

  setTimeout(() => {
    removeMessage(typingId);
    let reply = "I couldn't decrypt that query. Try asking about: <code>about</code>, <code>projects</code>, <code>skills</code>, or <code>contact</code>.";
    
    for (const r of RESPONSES) {
      if (r.pattern.test(msg)) {
        reply = typeof r.reply === 'function' ? r.reply() : r.reply;
        break;
      }
    }
    
    addMessage(reply, 'ai');
    speakText(reply);
  }, 800 + Math.random() * 400);
}

function speakText(html) {
  if (!AppState.state.aiVoiceEnabled || !('speechSynthesis' in window)) return;

  // Clean HTML markup tags before speech output
  const clean = html.replace(/<[^>]*>/g, '').replace(/→/g, '').replace(/\[.*\]/g, '');
  
  // Stop current speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = 1.05;
  utterance.pitch = 0.95; // robotic guide feel
  
  // Try to find a nice English voice
  const voices = window.speechSynthesis.getVoices();
  const synthVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en'));
  if (synthVoice) utterance.voice = synthVoice;

  window.speechSynthesis.speak(utterance);
}

let _msgCounter = 0;
function addMessage(html, type) {
  if (!chatEl) return null;
  const id = `msg-${_msgCounter++}`;
  const el = document.createElement('div');
  el.className = `ai-msg ai-msg-${type}`;
  el.id = id;
  if (type === 'ai') el.innerHTML = `<span class="ai-avatar">SYS</span><div class="ai-bubble">${html}</div>`;
  else el.innerHTML = `<div class="ai-bubble ai-bubble-user">${html}</div>`;
  chatEl.appendChild(el);
  chatEl.scrollTop = chatEl.scrollHeight;
  return id;
}

function removeMessage(id) {
  if (!id) return;
  document.getElementById(id)?.remove();
}
