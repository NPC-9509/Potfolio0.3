import React from 'react';
import { bus } from '../contexts/EventBus.js';

export default function ExperienceSection({ experience }) {
  return (
    <section className="comic-chapter w-screen h-screen flex items-center justify-center px-[5%] pl-[10%] relative" id="sec-4" aria-label="Chapter 4 — The Chronicle">
      <div className="comic-page w-full max-w-[1100px] h-[82vh] relative flex flex-col justify-between">
        <div className="chapter-header border-b border-white/25 pb-3 mb-8 flex items-end gap-4 w-fit">
          <span className="chapter-index font-mono text-base text-accent-pink font-bold">CHAPTER 04 //</span>
          <h2 className="chapter-title font-display text-2xl font-black tracking-wide text-white uppercase">THE CHRONICLE</h2>
        </div>
        <div className="experience-comic-grid grid grid-cols-[1.1fr_1fr] gap-10 h-[calc(100%-70px)]">
          <div className="comic-panel artwork-panel pane-left rounded-xl bg-cover bg-center transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5"
            style={{ backgroundImage: "url('/src/assets/comic_experience.png')" }}>
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-overlay-grad absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[rgba(4,1,10,0.85)] to-[rgba(4,1,10,0.1)] pointer-events-none z-[2]" />
            <div className="speech-bubble bottom-left absolute bottom-8 left-8 bg-[rgba(12,4,28,0.7)] backdrop-blur-md text-white border border-white/10 px-5 py-4 rounded-xl font-sans text-sm leading-relaxed font-semibold max-w-[260px] z-[6] shadow-lg" role="note">
              <span className="bubble-speaker block font-mono text-[0.65rem] text-accent-pink mb-1 tracking-wider uppercase">GUIDE</span>
              <p className="bubble-text italic">"Agent progression logs tracked. Academic records and internship operations online."</p>
            </div>
            <div className="caption-box top-left absolute top-5 left-5 bg-accent-cyan/15 backdrop-blur-md border border-accent-cyan/35 px-5 py-3 z-[6] max-w-[280px] shadow-lg rounded-lg">
              <p className="caption-title font-mono text-[0.7rem] font-black tracking-widest mb-1 uppercase border-b border-white/15 pb-1">TIMELINE METADATA</p>
              <p className="caption-body font-sans text-sm leading-tight font-medium">Pathways taken through Secure Software Academics (Cybersecurity) and Digital Design operations.</p>
            </div>
          </div>
          <div className="comic-panel timeline-panel flex items-center px-14 py-[3.2rem] rounded-xl bg-[rgba(8,2,18,0.45)] backdrop-blur-md border border-accent-green/30 shadow-cyber-green transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:border-accent-green/55 hover:shadow-[0_8px_32px_0_rgba(4,1,10,0.37),0_0_25px_rgba(0,255,102,0.25)]">
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-content w-full h-full flex flex-col justify-between">
              <div>
                <h3 className="panel-heading font-display text-2xl font-black uppercase tracking-wide mb-6">Timeline <span className="text-accent-green">Milestones</span></h3>
                <div className="chronicle-summary-nodes flex flex-col gap-5">
                  {experience?.map((e, i) => (
                    <div key={e.id} className="chronicle-node border-l-2 border-accent-green pl-5 relative">
                      <div className="absolute -left-[5.5px] top-1 w-[9px] h-[9px] bg-accent-green shadow-[0_0_8px_#00ff66] rotate-45" />
                      <span className="node-date font-mono text-xs text-accent-green font-bold block mb-1">{e.nodeDate}</span>
                      <p className="node-text text-sm text-text-muted leading-relaxed">
                        <strong className="text-white">{e.nodeText}</strong> - {e.nodeOrg}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <button
                className="comic-btn-premium inline-flex items-center justify-center gap-4 bg-accent-cyan/[0.05] backdrop-blur-sm text-accent-cyan border border-accent-cyan/40 px-9 py-4 font-mono text-xs font-bold tracking-widest cursor-pointer transition-all duration-300 shadow-[4px_4px_0_#00e5ff] w-fit uppercase hover:bg-accent-cyan hover:text-black hover:shadow-[0_0_20px_rgba(0,229,255,0.45)] hover:border-accent-cyan"
                onClick={() => { bus.emit('modal:open', 'modal-experience'); bus.emit('audio:click'); }}
                aria-label="Open Experience Details"
              >
                [ TRANSMIT CHRONOLOGY ]
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
