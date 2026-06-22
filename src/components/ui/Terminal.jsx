import React, { useEffect, useRef, useState, useCallback } from 'react';
import { bus } from '../../contexts/EventBus.js';
import { useApp } from '../../contexts/AppContext.jsx';
import Button from './Button.jsx';

const ASCII_LOGO = `
███╗   ███╗██╗   ██╗██╗  ██╗██╗   ██╗██╗     
████╗ ████║██║   ██║██║ ██╔╝██║   ██║██║     
██╔████╔██║██║   ██║█████╔╝ ██║   ██║██║     
██║╚██╔╝██║██║   ██║██╔═██╗ ██║   ██║██║     
██║ ╚═╝ ██║╚██████╔╝██║  ██╗╚██████╔╝███████╗
╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
// RTR_200 SPEED PROTOCOL — DEVELOPER TERMINAL v3.0
`;

export default function Terminal({ portfolioData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const outputRef = useRef(null);
  const inputRef = useRef(null);
  const historyRef = useRef([]);
  const historyIdxRef = useRef(-1);
  const [inGameMode, setInGameMode] = useState(false);
  const gameSecretRef = useRef('');
  const gameAttemptsRef = useRef(0);
  const { state, updateState, hasAchievement, saveAchievement } = useApp();
  const [lines, setLines] = useState([
    { html: ASCII_LOGO + '\nType <span class="t-cyan">help</span> to see all commands.\n', type: 'system' }
  ]);

  const print = useCallback((html, type = 'output') => {
    setLines(prev => [...prev, { html, type }]);
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  const closeTerminal = useCallback(() => {
    setIsOpen(false);
    updateState('terminalOpen', false);
  }, [updateState]);

  const openTerminal = useCallback(() => {
    setIsOpen(true);
    updateState('terminalOpen', true);
    setTimeout(() => inputRef.current?.focus(), 100);
    bus.emit('achievement:unlock', 'terminal-hacker');
  }, [updateState]);

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        isOpen ? closeTerminal() : openTerminal();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, openTerminal, closeTerminal]);

  useEffect(() => {
    bus.on('terminal:open', openTerminal);
    bus.on('terminal:close', closeTerminal);
    return () => {
      bus.off('terminal:open', openTerminal);
      bus.off('terminal:close', closeTerminal);
    };
  }, [openTerminal, closeTerminal]);

  const execCommand = useCallback((cmd) => {
    if (cmd.startsWith('nav ')) {
      const parts = cmd.split(' ');
      const targets = { 'home': 0, 'about': 1, 'skills': 2, 'projects': 3, 'experience': 4, 'contact': 5 };
      const idx = targets[parts[1]];
      if (idx !== undefined) {
        const sc = document.getElementById('scroll-container');
        const sec = document.getElementById(`sec-${idx}`);
        if (sec && sc) sc.scrollTo({ top: sec.offsetTop, behavior: 'smooth' });
        print(`<span class="t-green">[OK] Navigating to section ${parts[1]}...</span>`);
      } else print(`<span class="t-err">[ERR] Unknown section: ${parts[1]}</span>`);
      return;
    }

    if (cmd.startsWith('open ')) {
      const parts = cmd.split(' ');
      const modals = { 'about': 'modal-about', 'skills': 'modal-skills', 'projects': 'modal-projects', 'experience': 'modal-experience', 'settings': 'modal-settings', 'resume': 'modal-resume-room' };
      const modalId = modals[parts[1]];
      if (modalId) {
        bus.emit('modal:open', modalId);
        print(`<span class="t-green">[OK] Opening ${parts[1]} module...</span>`);
      } else print(`<span class="t-err">[ERR] Unknown modal: ${parts[1]}</span>`);
      return;
    }

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

    if (cmd === 'game') {
      setInGameMode(true);
      gameAttemptsRef.current = 0;
      const hex = '0123456789ABCDEF';
      gameSecretRef.current = Array.from({length: 4}, () => hex[Math.floor(Math.random() * 16)]).join('');
      print(`
<span class="t-pink">// DECRYPT SECURITY PROTOCOL ACTIVE</span>
A secret 4-character HEX validation key (0-9, A-F) has been generated.
Decrypt the key to bypass sub-protocols.
Type your 4-digit guess (e.g. <span class="t-cyan">A38E</span>) or type <span class="t-err">exit</span> to abort.
`);
      return;
    }

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

    const commands = {
      help: () => `
<span class="t-head">// AVAILABLE COMMANDS</span>
<span class="t-cyan">about</span>        — Agent bio
<span class="t-cyan">projects</span>     — Mission logs
<span class="t-cyan">skills</span>       — Tech arsenal
<span class="t-cyan">experience</span>   — Service chronicle
<span class="t-cyan">contact</span>      — Beacon channels
<span class="t-cyan">resume</span>       — Open resume room
<span class="t-cyan">fps</span>          — Render frame rate
<span class="t-cyan">performance</span>  — Performance diagnostics
<span class="t-cyan">graphics</span> [q] — Graphics preset
<span class="t-cyan">stats</span>        — Visitor session analytics
<span class="t-cyan">achievements</span> — View unlocked milestones
<span class="t-cyan">game</span>         — Launch hex decryption mini-game
<span class="t-cyan">theme</span> [c]    — Set theme: cyan/pink/purple/green/orange
<span class="t-cyan">clear</span>        — Clear output
<span class="t-cyan">sudo hire mukul</span> — Run hire protocol`,
      about: () => `
<span class="t-head">// AGENT: MUKUL VYAS</span>
${portfolioData?.portfolio?.bio_short || ''}
${portfolioData?.portfolio?.bio_detail || ''}
<span class="t-muted">[ Navigate: </span><span class="t-pink">nav about</span><span class="t-muted"> ]</span>`,
      projects: () => {
        const lines = (portfolioData?.projects || []).map(p =>
          `<span class="t-cyan">${p.index}</span> <span class="t-white">${p.title}</span>\n     <span class="t-muted">${p.tags}</span>`
        ).join('\n\n');
        return `<span class="t-head">// ACTIVE MISSION LOG</span>\n\n${lines}\n\n<span class="t-muted">[ Open: </span><span class="t-pink">open projects</span><span class="t-muted"> ]</span>`;
      },
      skills: () => {
        const cats = (portfolioData?.skills?.categories || []).map(c => {
          const names = c.skills.map(s => s.name).join(', ');
          return `<span class="t-cyan">${c.label}</span>\n  ${names}`;
        }).join('\n\n');
        return `<span class="t-head">// TECHNICAL ARSENAL</span>\n\n${cats}`;
      },
      experience: () => {
        const lines = (portfolioData?.experience || []).map(e =>
          `<span class="t-green">${e.dateRange}</span>\n<span class="t-white">${e.role}</span> @ <span class="t-cyan">${e.org}</span>`
        ).join('\n\n');
        return `<span class="t-head">// AGENT CHRONICLE</span>\n\n${lines}`;
      },
      contact: () => {
        const c = portfolioData?.portfolio?.contact || {};
        const s = (portfolioData?.portfolio?.socials || []).map(s => `<span class="t-cyan">${s.label}</span>: ${s.url}`).join('\n');
        return `<span class="t-head">// TRANSMISSION BEACON</span>\n\nEmail: <span class="t-pink">${c.email}</span>\nPhone: <span class="t-pink">${c.phone}</span>\n\n${s}`;
      },
      resume: () => {
        bus.emit('modal:open', 'modal-resume-room');
        return '<span class="t-green">[OK] Opening Resume Room module...</span>';
      },
      fps: () => `Current engine performance: <span class="t-green">${state.fps || 60} FPS</span>`,
      performance: () => `
<span class="t-head">// SYSTEM PERFORMANCE DIAGNOSTICS</span>
Active Rate:       <span class="t-green">${state.fps || 60} FPS</span>
Preset Mode:       <span class="t-cyan">${(state.graphicsPreset || 'AUTO').toUpperCase()}</span>
Effective Tier:    <span class="t-white">${state.qualityLevel?.toUpperCase() || 'HIGH'}</span>
Hologram Bloom:    <span class="t-white">ACTIVE</span>
Ambient Particles: <span class="t-white">350 units</span>`,
      clear: () => { setLines([]); return ''; },
      graphics: () => `Active Preset: <span class="t-cyan">${(state.graphicsPreset || 'AUTO').toUpperCase()}</span>\nType <span class="t-pink">graphics [preset]</span> to switch.`,
      stats: () => `
<span class="t-head">// VISITOR SESSION ANALYTICS</span>
Uptime Minutes:       <span class="t-white">0 mins</span>
Max Scroll Progress:  <span class="t-white">0%</span>
AI Assistant Queries: <span class="t-white">0 asked</span>
Resume Downloads:     <span class="t-white">0 clicks</span>
Contact Transmits:    <span class="t-white">0 completed</span>`,
      achievements: () => {
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
          output += hasAchievement(item.id)
            ? `<span class="t-green">[✓] ${item.label} (ACTIVE)</span>\n`
            : `<span class="t-muted">[ ] ${item.label} (LOCKED)</span>\n`;
        });
        return output;
      },
    };

    const cmdKey = cmd.split(' ')[0];
    if (commands[cmdKey]) {
      const result = commands[cmdKey]();
      if (result) print(result);
      bus.emit('achievement:unlock', 'terminal-hacker');
    } else if (cmd.startsWith('graphics ')) {
      const preset = cmd.split(' ')[1];
      print(`<span class="t-green">[OK] Graphics preset set to: ${preset.toUpperCase()}</span>`);
    } else {
      print(`<span class="t-err">[ERR] Unknown command: <span class="t-white">${cmd}</span>. Type <span class="t-cyan">help</span> for available commands.</span>`);
    }
  }, [portfolioData, state.fps, state.graphicsPreset, state.qualityLevel, hasAchievement, print, setLines]);

  const handleInput = useCallback((e) => {
    if (e.key === 'Enter') {
      const raw = inputValue.trim();
      if (!raw) return;
      historyRef.current.unshift(raw);
      historyIdxRef.current = -1;
      setInputValue('');

      print(`<span class="t-pink">agent@mv-terminal:~$</span> ${raw}`, 'input');

      if (inGameMode) {
        const clean = raw.trim().toUpperCase();
        if (clean === 'EXIT') {
          setInGameMode(false);
          print('<span class="t-muted">Decryption protocol aborted. Exit complete.</span>');
        } else if (clean.length !== 4 || !/^[0-9A-F]{4}$/i.test(clean)) {
          print('<span class="t-err">[ERR] Invalid key. Decryption code must be exactly 4 HEX characters (0-9, A-F).</span>');
        } else {
          gameAttemptsRef.current++;
          if (clean === gameSecretRef.current) {
            print(`
<span class="t-green">
[✓] SUCCESS! VALIDATION KEY MATCHED: ${gameSecretRef.current}
Decrypted in ${gameAttemptsRef.current} attempts.
Memory diagnostics cleared. Security bypass established.
</span>`);
            bus.emit('achievement:unlock', 'terminal-hacker');
            setInGameMode(false);
          } else {
            let correctPos = 0;
            for (let i = 0; i < 4; i++) {
              if (clean[i] === gameSecretRef.current[i]) correctPos++;
            }
            print(`<span class="t-err">[X] ACCESS DENIED</span>. Attempts: ${gameAttemptsRef.current}. Matches: <span class="t-cyan">${correctPos} of 4</span> alignment positions correct.`);
          }
        }
      } else {
        execCommand(raw.toLowerCase());
      }
    } else if (e.key === 'ArrowUp') {
      historyIdxRef.current = Math.min(historyIdxRef.current + 1, historyRef.current.length - 1);
      if (historyRef.current[historyIdxRef.current]) setInputValue(historyRef.current[historyIdxRef.current]);
    } else if (e.key === 'ArrowDown') {
      historyIdxRef.current = Math.max(historyIdxRef.current - 1, -1);
      setInputValue(historyIdxRef.current >= 0 ? historyRef.current[historyIdxRef.current] : '');
    }
  }, [inputValue, inGameMode, execCommand, print]);

  return (
    <div
      id="terminal-panel"
      className={`fixed top-0 left-0 w-screen h-screen bg-[rgba(4,1,10,0.97)] backdrop-blur-2xl z-[10100] flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Developer Terminal"
      aria-hidden={!isOpen}
    >
      <div className="terminal-inner w-[90vw] max-w-[800px] h-[70vh] bg-black/85 backdrop-blur-md border border-accent-green/35 shadow-[0_0_40px_rgba(0,255,102,0.15),0_12px_40px_rgba(0,0,0,0.5)] rounded-xl flex flex-col overflow-hidden">
        <div className="terminal-topbar flex items-center justify-between px-5 py-2.5 bg-accent-green/5 border-b border-accent-green/20 shrink-0">
          <span className="terminal-title font-mono text-[0.8rem]">
            <span className="text-accent-pink">agent@mv-terminal</span>:<span className="text-accent-cyan">~</span> // <span className="text-text-muted">RTR_200 SPEED PROTOCOL</span>
          </span>
          <div className="terminal-controls flex items-center gap-3">
            <kbd className="terminal-shortcut font-mono text-[0.65rem] border border-white/10 px-1 py-0.5 text-text-muted rounded-sm">Ctrl+`</kbd>
            <Button
              variant="ghost"
              className="terminal-close-btn bg-none border border-accent-pink text-accent-pink text-sm w-7 h-7 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-accent-pink hover:text-black"
              onClick={closeTerminal}
              aria-label="Close terminal"
            >
              ✕
            </Button>
          </div>
        </div>

        <div
          ref={outputRef}
          className="terminal-output flex-1 overflow-y-auto p-4 font-mono text-[0.82rem] leading-relaxed"
          aria-live="polite"
          aria-label="Terminal output"
        >
          {lines.map((line, idx) => (
            <div key={idx} className={`t-line t-${line.type}`} dangerouslySetInnerHTML={{ __html: line.html }} />
          ))}
        </div>

        <div className="terminal-inputrow flex items-center gap-2.5 px-5 py-3 border-t border-accent-green/15 bg-accent-green/[0.02] shrink-0">
          <span className="terminal-prompt font-mono text-[0.82rem] text-accent-pink shrink-0" aria-hidden="true">agent@mv-terminal:~$</span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-input flex-1 bg-transparent border-none outline-none text-white font-mono text-[0.82rem] caret-accent-green"
            placeholder="type a command..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInput}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            aria-label="Terminal command input"
          />
        </div>
      </div>
    </div>
  );
}
