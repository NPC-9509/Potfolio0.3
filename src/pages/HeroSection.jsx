import React from 'react';
import { bus } from '../contexts/EventBus.js';

export function getSocialLinks(portfolio) {
  if (!portfolio?.socials) return [];
  return portfolio.socials.map(s => ({
    ...s,
    Component: () => (
      <a
        key={s.id}
        href={s.url}
        target={s.external ? '_blank' : undefined}
        rel={s.external ? 'noopener noreferrer' : undefined}
        id={s.id}
        className="channel-link-btn font-mono text-xs text-white no-underline border border-accent-pink/40 px-4 py-2 bg-accent-pink/[0.05] backdrop-blur-sm transition-all duration-300 rounded-md hover:bg-accent-pink hover:text-white hover:shadow-[0_0_15px_rgba(255,42,133,0.55)] hover:border-accent-pink"
      >{s.label}</a>
    )
  }));
}

export default function HeroSection({ portfolio }) {
  const socials = getSocialLinks(portfolio);

  return (
    <section className="comic-chapter hero-chapter w-screen h-screen flex items-center justify-center px-[5%] pl-[10%] relative" id="sec-0" aria-label="Hero — Introduction">
      <div className="comic-page w-full max-w-[1100px] h-[82vh] relative flex flex-col justify-between">
        <div className="hero-comic-grid grid grid-cols-[1fr_1.3fr] gap-8 h-[calc(100%-20px)]">
          <div className="comic-panel display-panel flex items-center px-16 py-[3.8rem] rounded-xl bg-[rgba(8,2,18,0.45)] backdrop-blur-md border border-accent-purple/30 shadow-cyber-purple transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:border-accent-purple/55 hover:shadow-[0_8px_32px_0_rgba(4,1,10,0.37),0_0_25px_rgba(189,90,247,0.25)]">
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-content w-full h-full">
              <span className="panel-tag font-mono text-xs text-accent-cyan tracking-widest block mb-4">// PROTOCOL: WELCOME</span>
              <h1 className="comic-main-title font-display font-black leading-none tracking-tight text-white mb-3"
                style={{ textShadow: '0 0 20px rgba(255, 42, 133, 0.45)', fontSize: 'clamp(2.2rem, 5vw, 4.4rem)' }}>
                MUKUL VYAS
              </h1>
              <p className="comic-subtitle font-mono text-sm tracking-widest text-accent-cyan uppercase mb-8 font-bold">
                DIGITAL SOLUTIONS SPECIALIST
              </p>
              <p className="comic-role-desc text-sm leading-relaxed text-text-muted font-medium mb-12">
                Software Development | Creative Design | Social Media Marketing
              </p>
              <div className="hero-channel-links flex flex-wrap gap-4">
                {socials.map((s, i) => <s.Component key={i} />)}
              </div>
            </div>
          </div>

          <div className="comic-panel artwork-panel pane-right rounded-xl bg-cover bg-center transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5"
            style={{ backgroundImage: "url('/src/assets/comic_hero.png')", borderColor: 'rgba(0, 229, 255, 0.3)', boxShadow: '0 8px 32px 0 rgba(4, 1, 10, 0.37), 0 0 15px rgba(0, 229, 255, 0.1)' }}>
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-overlay-grad absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[rgba(4,1,10,0.85)] to-[rgba(4,1,10,0.1)] pointer-events-none z-[2]" />
            <div className="speech-bubble bottom-left absolute bottom-8 left-8 bg-[rgba(12,4,28,0.7)] backdrop-blur-md text-white border border-white/10 px-5 py-4 rounded-xl font-sans text-sm leading-relaxed font-semibold max-w-[260px] z-[6] shadow-lg"
              role="note">
              <span className="bubble-speaker block font-mono text-[0.65rem] text-accent-pink mb-1 tracking-wider uppercase">SYSTEM_AI</span>
              <p className="bubble-text italic">"Grid matrix loaded. Agent path verified. Commencing walkthrough."</p>
            </div>
            <div className="scroll-prompt absolute bottom-8 right-8 flex flex-col items-end gap-2 text-accent-cyan z-[5]">
              <span className="font-mono text-[0.65rem] tracking-widest" style={{ textShadow: '1px 1px 2px #000' }}>SCROLL DOWN TO ENTER STORY</span>
              <div className="w-[60px] h-[2px] bg-accent-cyan relative">
                <div className="absolute right-0 -top-[3px] w-2 h-2 border-r-2 border-b-2 border-accent-cyan -rotate-45" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
