import React from 'react';
import { bus } from '../contexts/EventBus.js';

export default function AboutSection({ portfolio }) {
  return (
    <section className="comic-chapter w-screen h-screen flex items-center justify-center px-[5%] pl-[10%] relative" id="sec-1" aria-label="Chapter 1 — Origin Protocol">
      <div className="comic-page w-full max-w-[1100px] h-[82vh] relative flex flex-col justify-between">
        <div className="chapter-header border-b border-white/25 pb-3 mb-8 flex items-end gap-4 w-fit">
          <span className="chapter-index font-mono text-base text-accent-pink font-bold">CHAPTER 01 //</span>
          <h2 className="chapter-title font-display text-2xl font-black tracking-wide text-white uppercase">ORIGIN PROTOCOL</h2>
        </div>
        <div className="about-comic-grid grid grid-cols-[1.2fr_1fr] gap-10 h-[calc(100%-70px)]">
          <div className="comic-panel artwork-panel pane-left rounded-xl bg-cover bg-center transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5"
            style={{ backgroundImage: "url('assets/comic_origin.png')" }}>
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-overlay-grad absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[rgba(4,1,10,0.85)] to-[rgba(4,1,10,0.1)] pointer-events-none z-[2]" />
            <div className="caption-box top-left absolute top-5 left-5 bg-accent-purple/15 backdrop-blur-md border border-accent-purple/35 px-5 py-3 z-[6] max-w-[280px] shadow-lg rounded-lg">
              <p className="caption-title font-mono text-[0.7rem] font-black tracking-widest mb-1 uppercase border-b border-white/15 pb-1">FILE: MUKUL_VYAS.log</p>
              <p className="caption-body font-sans text-sm leading-tight font-medium">Half-shadow, half-neon-glow. Reflecting code in his glasses, determined to solve real-world problems.</p>
            </div>
          </div>
          <div className="comic-panel text-panel pane-right flex items-center px-14 py-[3.2rem] rounded-xl bg-[rgba(8,2,18,0.45)] backdrop-blur-md border border-accent-purple/30 shadow-cyber-purple transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:border-accent-purple/55 hover:shadow-[0_8px_32px_0_rgba(4,1,10,0.37),0_0_25px_rgba(189,90,247,0.25)]">
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-content w-full h-full flex flex-col justify-between">
              <div>
                <h3 className="panel-heading font-display text-2xl font-black uppercase tracking-wide mb-6">Who is <span className="text-accent-purple">Mukul?</span></h3>
                <p className="panel-paragraph text-sm leading-relaxed text-text-muted font-medium mb-5">{portfolio?.bio_short || ''}</p>
                <p className="panel-paragraph text-sm leading-relaxed text-text-muted font-medium">From frontend web systems to custom social marketing campaigns, I help businesses grow and establish an authoritative, premium online presence.</p>
              </div>
              <button
                className="comic-btn-premium inline-flex items-center justify-center gap-4 bg-accent-cyan/[0.05] backdrop-blur-sm text-accent-cyan border border-accent-cyan/40 px-9 py-4 font-mono text-xs font-bold tracking-widest cursor-pointer transition-all duration-300 shadow-[4px_4px_0_#00e5ff] w-fit uppercase hover:bg-accent-cyan hover:text-black hover:shadow-[0_0_20px_rgba(0,229,255,0.45)] hover:border-accent-cyan"
                onClick={() => { bus.emit('modal:open', 'modal-about'); bus.emit('audio:click'); }}
                aria-label="Open About Details"
              >
                [ ACCESS CLASSIFIED LOGS ]
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
