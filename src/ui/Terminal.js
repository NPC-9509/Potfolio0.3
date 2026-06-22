// Terminal.js — Upgraded Interactive Developer Terminal (V3.0)

import { bus } from '../core/EventBus.js';
import { AppState } from '../core/AppState.js';
import { navigateTo } from './HUD.js';
import { openModal } from './Modals.js';
import { analytics } from '../core/Analytics.js';
import { performanceManager } from '../utils/Performance.js';

let terminalEl, outputEl, inputEl, isOpen = false;
let history = [], historyIdx = -1;
let _portfolioData = {};

// Hacking Mini-game state variables
let inGameMode = false;
let gameSecretCode = '';
let gameAttempts = 0;

const ASCII_LOGO = `
███╗   ███╗██╗   ██╗██╗  ██╗██╗   ██╗██╗     
████╗ ████║██║   ██║██║ ██╔╝██║   ██║██║     
██╔████╔██║██║   ██║█████╔╝ ██║   ██║██║     
██║╚██╔╝██║██║   ██║██╔═██╗ ██║   ██║██║     
██║ ╚═╝ ██║╚██████╔╝██║  ██╗╚██████╔╝███████╗
╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
// RTR_200 SPEED PROTOCOL — DEVELOPER TERMINAL v3.0
`;

const COMMANDS = {
  help: {
    desc: 'List all commands',
    run: () => `
<span class="t-head">// AVAILABLE COMMANDS</span>
<span class="t-cyan">about</span>        — Agent bio
<span class="t-cyan">projects</span>     — Mission logs
<span class="t-cyan">skills</span>       — Tech arsenal
<span class="t-cyan">experience</span>   — Service chronicle
<span class="t-cyan">contact</span>      — Beacon channels
<span class="t-cyan">resume</span>       — Open resume room
<span class="t-cyan">fps</span>          — Render frame rate
<span class="t-cyan">performance</span>  — Performance diagnostics
<span class="t-cyan">graphics</span> [q] — Graphics preset (ultra/high/medium/low/battery-saver/auto)
<span class="t-cyan">stats</span>        — Visitor session analytics
<span class="t-cyan">achievements</span> — View unlocked milestones
<span class="t-cyan">game</span>         — Launch hex decryption mini-game
<span class="t-cyan">theme</span> [c]    — Set theme: cyan / pink / purple / green / orange
<span class="t-cyan">clear</span>        — Clear output
<span class="t-cyan">sudo hire mukul</span> — Run hire protocol`
  },
  about: {
    desc: 'Agent profile',
    run: (d) => `
<span class="t-head">// AGENT: MUKUL VYAS</span>
${d.portfolio?.bio_short || ''}
${d.portfolio?.bio_detail || ''}
<span class="t-muted">[ Navigate: </span><span class="t-pink">nav about</span><span class="t-muted"> ]</span>`
  },
  projects: {
    desc: 'Mission log',
    run: (d) => {
      const lines = (d.projects || []).map(p =>
        `<span class="t-cyan">${p.index}</span> <span class="t-white">${p.title}</span>\n     <span class="t-muted">${p.tags}</span>`
      ).join('\n\n');
      return `<span class="t-head">// ACTIVE MISSION LOG</span>\n\n${lines}\n\n<span class="t-muted">[ Open: </span><span class="t-pink">open projects</span><span class="t-muted"> ]</span>`;
    }
  },
  skills: {
    desc: 'Tech arsenal',
    run: (d) => {
      const cats = (d.skills?.categories || []).map(c => {
        const names = c.skills.map(s => s.name).join(', ');
        return `<span class="t-cyan">${c.label}</span>\n  ${names}`;
      }).join('\n\n');
      return `<span class="t-head">// TECHNICAL ARSENAL</span>\n\n${cats}`;
    }
  },
  experience: {
    desc: 'Service archive',
    run: (d) => {
      const lines = (d.experience || []).map(e =>
        `<span class="t-green">${e.dateRange}</span>\n<span class="t-white">${e.role}</span> @ <span class="t-cyan">${e.org}</span>`
      ).join('\n\n');
      return `<span class="t-head">// AGENT CHRONICLE</span>\n\n${lines}`;
    }
  },
  contact: {
    desc: 'Beacon channels',
    run: (d) => {
      const c = d.portfolio?.contact || {};
      const s = (d.portfolio?.socials || []).map(s => `<span class="t-cyan">${s.label}</span>: ${s.url}`).join('\n');
      return `<span class="t-head">// TRANSMISSION BEACON</span>\n\nEmail: <span class="t-pink">${c.email}</span>\nPhone: <span class="t-pink">${c.phone}</span>\n\n${s}`;
    }
  },
  resume: {
    desc: 'Resume Room',
    run: () => {
      openModal('modal-resume-room');
      return '<span class="t-green">[OK] Opening Resume Room module...</span>';
    }
  },
  fps: {
    desc: 'Show frame rate',
    run: () => `Current engine performance: <span class="t-green">${AppState.state.fps || 60} FPS</span>`
  },
  performance: {
    desc: 'Performance diagnostics',
    run: () => `
<span class="t-head">// SYSTEM PERFORMANCE DIAGNOSTICS</span>
Active Rate:       <span class="t-green">${AppState.state.fps || 60} FPS</span>
Preset Mode:       <span class="t-cyan">${AppState.state.graphicsPreset?.toUpperCase() || 'AUTO'}</span>
Effective Tier:    <span class="t-white">${AppState.state.qualityLevel?.toUpperCase() || 'HIGH'}</span>
Render Scale:      <span class="t-white">${AppState.state.qualityLevel === 'low' ? '0.85' : '1.0'}</span>
Hologram Bloom:    <span class="t-white">${AppState.state.graphicsConfig?.bloom ? 'ACTIVE' : 'INACTIVE'}</span>
Ambient Particles: <span class="t-white">${AppState.state.graphicsConfig?.particles || 350} units</span>
Weather Density:   <span class="t-white">${AppState.state.graphicsConfig?.weather?.toUpperCase() || 'FULL'}</span>`
  },
  clear: {
    desc: 'Clear output',
    run: () => { setTimeout(() => { if (outputEl) outputEl.innerHTML = ''; }, 50); return ''; }
  }
};

export function initTerminal(portfolioData) {
  _portfolioData = portfolioData;
  terminalEl = document.getElementById('terminal-panel');
  outputEl   = document.getElementById('terminal-output');
  inputEl    = document.getElementById('terminal-input');
  if (!terminalEl || !outputEl || !inputEl) return;

  // Open with Ctrl+` or terminal button
  window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === '`') { e.preventDefault(); toggleTerminal(); }
  });
  document.getElementById('terminal-open-btn')?.addEventListener('click', toggleTerminal);
  document.getElementById('terminal-close-btn')?.addEventListener('click', closeTerminal);

  // Input handling
  inputEl.addEventListener('keydown', handleInput);

  bus.on('terminal:open',  openTerminal);
  bus.on('terminal:close', closeTerminal);

  print(ASCII_LOGO + '\nType <span class="t-cyan">help</span> to see all commands.\n', 'system');
}

function handleInput(e) {
  if (e.key === 'Enter') {
    const raw = inputEl.value.trim();
    if (!raw) return;
    history.unshift(raw);
    historyIdx = -1;
    inputEl.value = '';

    print(`<span class="t-pink">agent@mv-terminal:~$</span> ${raw}`, 'input');

    if (inGameMode) {
      handleGameInput(raw);
    } else {
      execCommand(raw.toLowerCase());
    }
  } else if (e.key === 'ArrowUp') {
    historyIdx = Math.min(historyIdx + 1, history.length - 1);
    if (history[historyIdx]) inputEl.value = history[historyIdx];
  } else if (e.key === 'ArrowDown') {
    historyIdx = Math.max(historyIdx - 1, -1);
    inputEl.value = historyIdx >= 0 ? history[historyIdx] : '';
  }
}

function execCommand(cmd) {
  analytics.trackTerminalCommand(cmd);

  // 1. Navigation commands
  if (cmd.startsWith('nav ')) {
    const parts = cmd.split(' ');
    const targets = { 'home': 0, 'about': 1, 'skills': 2, 'projects': 3, 'experience': 4, 'contact': 5 };
    const idx = targets[parts[1]];
    if (idx !== undefined) { navigateTo(idx); print(`<span class="t-green">[OK] Navigating to section ${parts[1]}...</span>`); }
    else print(`<span class="t-err">[ERR] Unknown section: ${parts[1]}</span>`);
    return;
  }

  // 2. Open modal commands
  if (cmd.startsWith('open ')) {
    const parts = cmd.split(' ');
    const modals = { 'about': 'modal-about', 'skills': 'modal-skills', 'projects': 'modal-projects', 'experience': 'modal-experience', 'settings': 'modal-settings', 'resume': 'modal-resume-room' };
    const modalId = modals[parts[1]];
    if (modalId) { openModal(modalId); print(`<span class="t-green">[OK] Opening ${parts[1]} module...</span>`); }
    else print(`<span class="t-err">[ERR] Unknown modal: ${parts[1]}</span>`);
    return;
  }

  // 3. Theme command
  if (cmd.startsWith('theme ')) {
    const color = cmd.split(' ')[1];
    const colors = { cyan: '#00e5ff', pink: '#ff2a85', purple: '#bd5af7', green: '#00ff66', orange: '#ff6b00' };
    if (colors[color]) {
      document.documentElement.style.setProperty('--accent-cyan', colors[color]);
      bus.emit('theme:color', colors[color]);
      print(`<span class="t-green">[OK] Accent color set to ${color}</span>`);
    } else {
      print(`<span class="t-err">[ERR] Valid themes: cyan, pink, purple, green, orange</span>`);
    }
    return;
  }

  // 4. Graphics preset override command
  if (cmd.startsWith('graphics ')) {
    const preset = cmd.split(' ')[1];
    const presets = ['ultra', 'high', 'medium', 'low', 'battery-saver', 'auto'];
    if (presets.includes(preset)) {
      performanceManager.applyPreset(preset);
      print(`<span class="t-green">[OK] Graphics preset manual override set to: ${preset.toUpperCase()}</span>`);
    } else {
      print(`<span class="t-err">[ERR] Available presets: ultra, high, medium, low, battery-saver, auto</span>`);
    }
    return;
  }
  if (cmd === 'graphics') {
    print(`Active Preset: <span class="t-cyan">${AppState.state.graphicsPreset?.toUpperCase() || 'AUTO'}</span>\nType <span class="t-pink">graphics [preset]</span> to switch.`);
    return;
  }

  // 5. Local Analytics stats report command
  if (cmd === 'stats') {
    const rep = analytics.getReport();
    print(`
<span class="t-head">// VISITOR SESSION ANALYTICS</span>
Uptime Minutes:       <span class="t-white">${rep.uptimeMinutes} mins</span>
Max Scroll Progress:  <span class="t-white">${rep.scrollDepthMax}%</span>
AI Assistant Queries: <span class="t-white">${rep.aiQuestions} asked</span>
Resume Downloads:     <span class="t-white">${rep.resumeDownloads} clicks</span>
Modals Opened:        <span class="t-white">${rep.achievementsUnlocked} events</span>
Contact Transmits:    <span class="t-white">${rep.contactSubmissions} completed</span>`);
    return;
  }

  // 6. Achievements listing
  if (cmd === 'achievements') {
    const list = [
      { id: 'speed-demon', label: '🏍️ SPEED DEMON' },
      { id: 'first-contact', label: '📡 FIRST CONTACT' },
      { id: 'code-archaeology', label: '🏛️ CODE ARCHAEOLOGY' },
      { id: 'terminal-hacker', label: '💻 TERMINAL HACKER' },
      { id: 'ghost-protocol', label: '👻 GHOST PROTOCOL' },
      { id: 'sudo-hire', label: '🎉 SUDO HIRE MUKUL' }
    ];
    let output = '<span class="t-head">// UNLOCKED ACHIEVEMENTS & MILESTONES</span>\n\n';
    list.forEach(item => {
      const unlocked = AppState.hasAchievement(item.id);
      output += unlocked
        ? `<span class="t-green">[✓] ${item.label} (ACTIVE)</span>\n`
        : `<span class="t-muted">[ ] ${item.label} (LOCKED)</span>\n`;
    });
    print(output);
    return;
  }

  // 7. Decryption Mini-game launch
  if (cmd === 'game') {
    inGameMode = true;
    gameAttempts = 0;
    // Generate random 4-character hex code
    const hex = '0123456789ABCDEF';
    gameSecretCode = Array.from({length: 4}, () => hex[Math.floor(Math.random() * 16)]).join('');
    print(`
<span class="t-pink">// DECRYPT SECURITY PROTOCOL ACTIVE</span>
A secret 4-character HEX validation key (0-9, A-F) has been generated.
Decrypt the key to bypass sub-protocols.
Type your 4-digit guess (e.g. <span class="t-cyan">A38E</span>) or type <span class="t-err">exit</span> to abort.
`);
    return;
  }

  // 8. Easter egg
  if (cmd === 'sudo hire mukul') {
    bus.emit('achievement:unlock', 'sudo-hire');
    bus.emit('audio:click');
    print(`
<span class="t-green">
██╗  ██╗██╗██████╗ ███████╗██████╗ 
██║  ██║██║██╔══██╗██╔════╝██╔══██╗
███████║██║██████╔╝█████╗  ██║  ██║
██╔══██║██║██╔══██╗██╔══╝  ██║  ██║
██║  ██║██║██║  ██║███████╗██████╔╝
╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═════╝ 

[OK] HIRE PROTOCOL EXECUTED.
[OK] Mukul Vyas has been added to your team.
[OK] Expect results. Speed is guaranteed.
Contact: mollyvyas@gmail.com
</span>`);
    return;
  }

  const cmdKey = cmd.split(' ')[0];
  if (COMMANDS[cmdKey]) {
    const result = COMMANDS[cmdKey].run(_portfolioData);
    if (result) print(result);
    bus.emit('achievement:unlock', 'terminal-hacker');
  } else {
    print(`<span class="t-err">[ERR] Unknown command: <span class="t-white">${cmd}</span>. Type <span class="t-cyan">help</span> for available commands.</span>`);
  }
}

function handleGameInput(raw) {
  const clean = raw.trim().toUpperCase();

  if (clean === 'EXIT') {
    inGameMode = false;
    print('<span class="t-muted">Decryption protocol aborted. Exit complete.</span>');
    return;
  }

  if (clean.length !== 4 || !/^[0-9A-F]{4}$/i.test(clean)) {
    print('<span class="t-err">[ERR] Invalid key. Decryption code must be exactly 4 HEX characters (0-9, A-F).</span>');
    return;
  }

  gameAttempts++;

  if (clean === gameSecretCode) {
    print(`
<span class="t-green">
[✓] SUCCESS! VALIDATION KEY MATCHED: ${gameSecretCode}
Decrypted in ${gameAttempts} attempts.
Memory diagnostics cleared. Security bypass established.
</span>`);
    bus.emit('achievement:unlock', 'terminal-hacker');
    inGameMode = false;
  } else {
    // Calculate matching positions
    let correctPos = 0;
    for (let i = 0; i < 4; i++) {
      if (clean[i] === gameSecretCode[i]) correctPos++;
    }
    print(`<span class="t-err">[X] ACCESS DENIED</span>. Attempts: ${gameAttempts}. Matches: <span class="t-cyan">${correctPos} of 4</span> alignment positions correct.`);
  }
}

function print(html, type = 'output') {
  if (!outputEl) return;
  const line = document.createElement('div');
  line.className = `t-line t-${type}`;
  line.innerHTML = html;
  outputEl.appendChild(line);
  outputEl.scrollTop = outputEl.scrollHeight;
}

export function openTerminal() {
  if (!terminalEl) return;
  isOpen = true;
  terminalEl.classList.add('active');
  AppState.set('terminalOpen', true);
  setTimeout(() => inputEl?.focus(), 100);
  bus.emit('achievement:unlock', 'terminal-hacker');
}

export function closeTerminal() {
  if (!terminalEl) return;
  isOpen = false;
  terminalEl.classList.remove('active');
  AppState.set('terminalOpen', false);
}

export function toggleTerminal() {
  isOpen ? closeTerminal() : openTerminal();
}
