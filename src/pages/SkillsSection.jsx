import React from 'react';
import { bus } from '../contexts/EventBus.js';
import Button from '../components/ui/Button.jsx';

export default function SkillsSection({ skills }) {
  const colorMap = { cyan: 'bg-accent-cyan', pink: 'bg-accent-pink', purple: 'bg-accent-purple' };

  return (
    <section className="comic-chapter" id="sec-2" aria-label="Chapter 2 — The Arsenal">
      <div className="comic-page">
        {/* Chapter Header */}
        <div className="chapter-header border-b border-white/25 pb-3 mb-8 flex items-end gap-4 w-fit">
          <span className="chapter-index font-mono text-base text-accent-pink font-bold">CHAPTER 02 //</span>
          <h2 className="chapter-title font-display text-2xl font-black tracking-wide text-white uppercase">THE ARSENAL</h2>
        </div>

        {/* Responsive Grid */}
        <div className="skills-comic-grid">
          {/* Artwork Panel */}
          <div className="comic-panel artwork-panel pane-left rounded-xl bg-cover bg-center min-h-[300px]"
            style={{ backgroundImage: "url('assets/comic_skills.png')" }}>
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-overlay-grad absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[rgba(4,1,10,0.85)] to-[rgba(4,1,10,0.1)] pointer-events-none z-[2]" />
            <div className="speech-bubble top-right absolute top-8 right-8 bg-[rgba(12,4,28,0.7)] backdrop-blur-md text-white border border-white/10 px-5 py-4 rounded-xl font-sans text-sm leading-relaxed font-semibold max-w-[260px] z-[6] shadow-lg" role="note">
              <span className="bubble-speaker block font-mono text-[0.65rem] text-accent-pink mb-1 tracking-wider uppercase">AGENT</span>
              <p className="bubble-text italic">"Holographic systems sync'd. All technologies loaded at maximum efficiency."</p>
            </div>
            <div className="caption-box bottom-left absolute bottom-5 left-5 bg-accent-cyan/15 backdrop-blur-md border border-accent-cyan/35 px-5 py-3 z-[6] max-w-[280px] shadow-lg rounded-lg">
              <p className="caption-title font-mono text-[0.7rem] font-black tracking-widest mb-1 uppercase border-b border-white/15 pb-1">WORKSTATION LOADED</p>
              <p className="caption-body font-sans text-sm leading-tight font-medium">Compiling skills spanning software development, media editing, and audience engagement tracking.</p>
            </div>
          </div>

          {/* List Panel */}
          <div className="comic-panel list-panel pane-right flex items-center px-8 md:px-14 py-8 md:py-12">
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-content w-full h-full flex flex-col justify-between gap-6">
              <div>
                <h3 className="panel-heading font-display text-2xl font-black uppercase tracking-wide mb-6">Core <span className="text-accent-pink">Capacities</span></h3>
                <div className="skills-mini-chart flex flex-col gap-6" id="skills-chart">
                  {skills?.categories?.map((c, i) => (
                    <div key={i} className="skills-chart-row flex flex-col gap-2">
                      <span className="chart-label font-mono text-xs text-text-muted">{c.chartLabel}</span>
                      <div className="chart-bar w-full h-2 bg-white/[0.06] border border-white/[0.12] rounded-[4px] overflow-hidden">
                        <div className={`chart-fill h-full rounded-[4px] ${colorMap[c.color] || 'bg-accent-cyan'}`}
                          style={{ width: c.chartWidth }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => bus.emit('modal:open', 'modal-skills')}
                aria-label="Open Skills Details"
                className="gap-4 w-fit"
              >
                Inventory Details
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

