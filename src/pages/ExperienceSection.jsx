import React from 'react';
import { bus } from '../contexts/EventBus.js';
import Button from '../components/ui/Button.jsx';

export default function ExperienceSection({ experience }) {
  return (
    <section className="comic-chapter" id="sec-4" aria-label="Chapter 4 — The Chronicle">
      <div className="comic-page">
        {/* Chapter Header */}
        <div className="chapter-header border-b border-white/25 pb-3 mb-8 flex items-end gap-4 w-fit">
          <span className="chapter-index font-mono text-base text-accent-pink font-bold">CHAPTER 04 //</span>
          <h2 className="chapter-title font-display text-2xl font-black tracking-wide text-white uppercase">THE CHRONICLE</h2>
        </div>

        {/* Responsive Grid */}
        <div className="experience-comic-grid">
          {/* Artwork Panel */}
          <div className="comic-panel artwork-panel pane-left rounded-xl bg-cover bg-center min-h-[300px]"
            style={{ backgroundImage: "url('assets/comic_experience.png')" }}>
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

          {/* Timeline Panel */}
          <div className="comic-panel timeline-panel flex items-center px-8 md:px-14 py-8 md:py-12">
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-content w-full h-full flex flex-col justify-between gap-6">
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
              <Button
                variant="primary"
                onClick={() => bus.emit('modal:open', 'modal-experience')}
                aria-label="Open Experience Details"
                className="gap-4 w-fit"
              >
                Transmit Chronology
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

