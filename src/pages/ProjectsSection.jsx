import React from 'react';
import { bus } from '../contexts/EventBus.js';
import Button from '../components/ui/Button.jsx';

export default function ProjectsSection({ projects }) {
  return (
    <section className="comic-chapter" id="sec-3" aria-label="Chapter 3 — Active Operations">
      <div className="comic-page">
        {/* Chapter Header */}
        <div className="chapter-header border-b border-white/25 pb-3 mb-8 flex items-end gap-4 w-fit">
          <span className="chapter-index font-mono text-base text-accent-pink font-bold">CHAPTER 03 //</span>
          <h2 className="chapter-title font-display text-2xl font-black tracking-wide text-white uppercase">ACTIVE OPERATIONS</h2>
        </div>

        {/* Responsive Grid */}
        <div className="projects-comic-grid">
          {/* Mission Logs list panel */}
          <div className="comic-panel cards-panel pane-left flex items-center px-8 md:px-14 py-8 md:py-12">
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-content w-full h-full">
              <h3 className="panel-heading font-display text-2xl font-black uppercase tracking-wide mb-6">Mission <span className="text-accent-purple">Logs</span></h3>
              <div className="comic-project-rows flex flex-col gap-4 mt-5">
                {projects?.map((p, i) => (
                  <div
                    key={p.id}
                    className="project-mini-row flex items-center gap-5 bg-black/30 border border-white/[0.06] px-6 py-4 cursor-pointer rounded-lg transition-all duration-300 hover:border-accent-purple hover:bg-accent-purple/[0.06] hover:translate-x-1"
                    onClick={() => { bus.emit('modal:open', 'modal-projects'); bus.emit('audio:click'); }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open ${p.title} details`}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bus.emit('modal:open', 'modal-projects'); bus.emit('audio:click'); }}}
                  >
                    <span className="row-num font-mono text-base text-accent-cyan font-bold">{p.index}</span>
                    <div className="row-info flex flex-col gap-1">
                      <h4 className="row-title font-display text-sm text-white uppercase">{p.title}</h4>
                      <p className="row-tags font-mono text-[0.7rem] text-text-muted">{p.tags}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Artwork panel */}
          <div className="comic-panel artwork-panel pane-right rounded-xl bg-cover bg-center min-h-[300px]"
            style={{ backgroundImage: "url('assets/comic_projects.png')" }}>
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-overlay-grad absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[rgba(4,1,10,0.85)] to-[rgba(4,1,10,0.1)] pointer-events-none z-[2]" />
            <div className="caption-box top-right absolute top-5 right-5 bg-accent-purple/15 backdrop-blur-md border border-accent-purple/35 px-5 py-3 z-[6] max-w-[280px] shadow-lg rounded-lg">
              <p className="caption-title font-mono text-[0.7rem] font-black tracking-widest mb-1 uppercase border-b border-white/15 pb-1">ACTIVE RUNTIME DEPLOYMENTS</p>
              <p className="caption-body font-sans text-sm leading-tight font-medium">Inter-device communications, cloud marketing matrices, and optimized SEO databases.</p>
            </div>
            <div className="panel-action-overlay absolute bottom-8 left-1/2 -translate-x-1/2 z-[5]">
              <Button
                variant="primary"
                onClick={() => { bus.emit('modal:open', 'modal-projects'); }}
                aria-label="Open Projects Details"
              >
                Run Mission Telemetry
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

