import React, { useEffect, useRef, useState, useCallback } from 'react';
import { bus } from '../../contexts/EventBus.js';
import { useApp } from '../../contexts/AppContext.jsx';

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
  { pattern: /\b(project|mission|work|build|built)\b/i, reply: "Mukul has built 3 key missions: University Portal Website, Responsive Web UI, and Custom Digital Ads campaigns. <a href='#' data-action='modal-projects'>View mission logs →</a>" },
  { pattern: /\b(skill|tech|stack|know|language|tool)\b/i, reply: "Mukul's arsenal is divided into Frontend (React, JS, CSS), Backend (Node, Python, MySQL), and Creative (Figma, Adobe Suite, Meta Ads). <a href='#' data-action='modal-skills'>View tech constellation →</a>" },
  { pattern: /\b(experience|work history|job|intern|university)\b/i, reply: "Mukul worked as a Web Developer Intern at Swaastik Solutions and completed academic cybersecurity milestones at Parul University. <a href='#' data-action='modal-experience'>Open chronicle archives →</a>" },
  { pattern: /\b(contact|hire|email|phone|reach|connect)\b/i, reply: "You can email Mukul directly at mollyvyas@gmail.com, or dial +91 9509006795. <a href='#' data-action='section-5'>Go to Transmission beacon →</a>" },
  { pattern: /\b(resume|cv|download)\b/i, reply: "Resume download room is available. <a href='#' data-action='modal-resume-room'>Access Resume Room →</a>" },
  { pattern: /\b(terminal|cmd|console)\b/i, reply: "Launching the developer command line console... <a href='#' data-action='terminal'>Open Terminal →</a>" },
  { pattern: /\b(help|what can)\b/i, reply: "I can answer questions about: skills, projects, experience, contact details, resume credentials, or take you to any section." },
];

export default function AIAssistant({ portfolioData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(() => localStorage.getItem('setting-aivoice') === 'true');
  const chatRef = useRef(null);
  const { state } = useApp();
  const msgCounterRef = useRef(0);

  const addMessage = useCallback((html, type) => {
    const id = `msg-${msgCounterRef.current++}`;
    setChatMessages(prev => [...prev, { id, html, type }]);
    return id;
  }, []);

  const removeMessage = useCallback((id) => {
    setChatMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  const getContextualResponse = useCallback(() => {
    const zoneNames = {
      0: "Zone 0: Origin Gate. The entry street of the portfolio grid environment.",
      1: "Zone 1: Profile Matrix. Mukul's personal digital skillset.",
      2: "Zone 2: Skills Arsenal. Connected neural constellation clusters.",
      3: "Zone 3: Active Operations. Live project deployments.",
      4: "Zone 4: Service Chronicle. Past internships and academic paths.",
      5: "Zone 5: Transmission Beacon. Direct contact channels."
    };
    return zoneNames[state.currentSection] || "Continuous 3D world, running speeds up to 60 FPS.";
  }, [state.currentSection]);

  const respond = useCallback((msg) => {
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

      if (voiceEnabled && 'speechSynthesis' in window) {
        const clean = reply.replace(/<[^>]*>/g, '').replace(/→/g, '');
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    }, 800 + Math.random() * 400);
  }, [addMessage, removeMessage, voiceEnabled]);

  const handleAction = useCallback((action) => {
    if (action === 'terminal') { bus.emit('terminal:open'); setIsOpen(false); return; }
    if (action.startsWith('modal-')) { bus.emit('modal:open', action); return; }
    if (action.startsWith('section-')) {
      const idx = parseInt(action.split('-')[1]);
      const sc = document.getElementById('scroll-container');
      const sec = document.getElementById(`sec-${idx}`);
      if (sec && sc) sc.scrollTo({ top: sec.offsetTop, behavior: 'smooth' });
      return;
    }
  }, []);

  const handleSend = useCallback(() => {
    const msg = inputValue.trim();
    if (!msg) return;
    setInputValue('');
    addMessage(msg, 'user');
    respond(msg);
    bus.emit('audio:click');
  }, [inputValue, addMessage, respond]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const open = useCallback(() => {
    setIsOpen(true);
    bus.emit('achievement:unlock', 'ghost-protocol');
    if (chatMessages.length === 0) {
      const greeting = "Greetings, Agent. I'm SYS_AI — your guide through Mukul's continuous 3D portfolio.";
      setTimeout(() => addMessage(greeting, 'ai'), 300);
      setTimeout(() => addMessage("Ask me about <code>projects</code>, <code>skills</code>, <code>experience</code>, or select a question below.", 'ai'), 1000);
    }
  }, [addMessage, chatMessages.length]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const currentChips = CHIPS_TEMPLATES[state.currentSection] || CHIPS_TEMPLATES[0];

  return (
    <div id="ai-assistant-widget" className="fixed bottom-24 right-8 z-10">
      <button
        id="ai-toggle-btn"
        className="w-[52px] h-[52px] bg-[rgba(12,4,28,0.6)] backdrop-blur-md border border-accent-purple/40 text-accent-purple font-mono text-[0.62rem] font-black cursor-pointer flex items-center justify-center shadow-[0_4px_12px_rgba(189,90,247,0.1)] transition-all duration-300 relative rounded-full hover:bg-accent-purple hover:text-black hover:shadow-[0_0_15px_rgba(189,90,247,0.45)]"
        onClick={() => { isOpen ? close() : open(); }}
        aria-label={isOpen ? 'Close AI guide' : 'Open AI guide'}
        aria-expanded={isOpen}
        title={isOpen ? 'Close AI Guide' : 'Open AI Guide'}
      >
        <span className="ai-toggle-icon" aria-hidden="true">SYS</span>
        <span className="ai-pulse-ring absolute inset-0 rounded-full border-2 border-accent-purple/30 animate-ping" aria-hidden="true" />
      </button>

      <div className={`ai-panel absolute bottom-16 right-0 w-[340px] bg-[rgba(12,6,24,0.92)] backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
        <div className="ai-panel-header flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="ai-panel-title font-mono text-xs text-accent-cyan">// SYS_AI GUIDE</span>
          <div className="ai-header-controls flex gap-2">
            <button
              className="ai-voice-btn bg-none border-none text-sm cursor-pointer"
              onClick={() => { setVoiceEnabled(!voiceEnabled); localStorage.setItem('setting-aivoice', !voiceEnabled); }}
              aria-label="Toggle voice output"
              title={voiceEnabled ? 'Mute AI voice output' : 'Enable AI voice output'}
            >{voiceEnabled ? '🔊' : '🔇'}</button>
            <button className="ai-close-btn bg-none border-none text-text-muted cursor-pointer hover:text-accent-pink" onClick={close} aria-label="Close AI guide">✕</button>
          </div>
        </div>

        <div ref={chatRef} className="ai-chat-area h-[280px] overflow-y-auto p-3" aria-live="polite" aria-label="AI chat messages">
          {chatMessages.map(msg => (
            <div key={msg.id} className={`ai-msg mb-2 ${msg.type === 'ai' ? 'flex gap-2' : 'text-right'}`}>
              {msg.type === 'ai' && <span className="ai-avatar text-[10px] font-mono text-accent-pink shrink-0 mt-1">SYS</span>}
              <div
                className={`ai-bubble inline-block px-3 py-2 rounded-lg text-xs leading-relaxed ${msg.type === 'ai' ? 'bg-white/5 text-text-muted' : 'bg-accent-cyan/10 text-accent-cyan'}`}
                dangerouslySetInnerHTML={{ __html: msg.html }}
                onClick={(e) => {
                  const link = e.target.closest('[data-action]');
                  if (link) { e.preventDefault(); handleAction(link.getAttribute('data-action')); }
                }}
              />
            </div>
          ))}
        </div>

        <div className="ai-suggestions-row flex flex-wrap gap-1.5 px-3 py-2 border-t border-white/5">
          {currentChips.map((text, i) => (
            <button
              key={i}
              className="ai-suggestion-chip text-[10px] font-mono px-2 py-1 bg-white/5 border border-white/10 rounded text-text-muted cursor-pointer hover:bg-accent-cyan/10 hover:text-accent-cyan transition-all"
              onClick={() => { addMessage(text, 'user'); respond(text); bus.emit('audio:click'); }}
            >{text}</button>
          ))}
        </div>

        <div className="ai-input-row flex items-center gap-2 px-3 py-2 border-t border-white/5">
          <input
            type="text"
            className="ai-input flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs font-mono text-white outline-none focus:border-accent-cyan"
            placeholder="Ask me anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            aria-label="Ask the AI guide"
          />
          <button className="ai-send-btn bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan rounded px-2 py-1.5 text-xs cursor-pointer hover:bg-accent-cyan hover:text-black transition-all" onClick={handleSend} aria-label="Send message">→</button>
        </div>
      </div>
    </div>
  );
}
