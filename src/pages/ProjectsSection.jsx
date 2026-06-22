import React from 'react';
import { bus } from '../contexts/EventBus.js';

export default function ProjectsSection({ projects }) {
  return (
    <section className="comic-chapter w-screen h-screen flex items-center justify-center px-[5%] pl-[10%] relative" id="sec-3" aria-label="Chapter 3 — Active Operations">
      <div className="comic-page w-full max-w-[1100px] h-[82vh] relative flex flex-col justify-between">
        <div className="chapter-header border-b border-white/25 pb-3 mb-8 flex items-end gap-4 w-fit">
          <span className="chapter-index font-mono text-base text-accent-pink font-bold">CHAPTER 03 //</span>
          <h2 className="chapter-title font-display text-2xl font-black tracking-wide text-white uppercase">ACTIVE OPERATIONS</h2>
        </div>
        <div className="projects-comic-grid grid grid-cols-[1fr_1.2fr] gap-10 h-[calc(100%-70px)]">
          <div className="comic-panel cards-panel pane-left flex items-center px-14 py-[3.2rem] rounded-xl bg-[rgba(8,2,18,0.45)] backdrop-blur-md border border-accent-purple/30 shadow-cyber-purple transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:border-accent-purple/55 hover:shadow-[0_8px_32px_0_rgba(4,1,10,0.37),0_0_25px_rgba(189,90,247,0.25)]">
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
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bus.emit('modal:open', 'modal-projects'); }}}
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
          <div className="comic-panel artwork-panel pane-right rounded-xl bg-cover bg-center transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5"
            style={{ backgroundImage: "url('/src/assets/comic_projects.png')" }}>
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-overlay-grad absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[rgba(4,1,10,0.85)] to-[rgba(4,1,10,0.1)] pointer-events-none z-[2]" />
            <div className="caption-box top-right absolute top-5 right-5 bg-accent-purple/15 backdrop-blur-md border border-accent-purple/35 px-5 py-3 z-[6] max-w-[280px] shadow-lg rounded-lg">
              <p className="caption-title font-mono text-[0.7rem] font-black tracking-widest mb-1 uppercase border-b border-white/15 pb-1">ACTIVE RUNTIME DEPLOYMENTS</p>
              <p className="caption-body font-sans text-sm leading-tight font-medium">Inter-device communications, cloud marketing matrices, and optimized SEO databases.</p>
            </div>
            <div className="panel-action-overlay absolute bottom-8 left-1/2 -translate-x-1/2 z-[5]">
              <button
                className="comic-btn-premium border-glow inline-flex items-center justify-center gap-4 bg-accent-cyan/[0.05] backdrop-blur-sm text-accent-cyan border border-accent-cyan/40 px-9 py-4 font-mono text-xs font-bold tracking-widest cursor-pointer transition-all duration-300 shadow-[4px_4px_0_#00e5ff] w-fit uppercase hover:bg-accent-cyan hover:text-black hover:shadow-[0_0_20px_rgba(0,229,255,0.45)] hover:border-accent-cyan"
                onClick={() => { bus.emit('modal:open', 'modal-projects'); bus.emit('audio:click'); }}
                aria-label="Open Projects Details"
              >[ RUN MISSION TELEMETRY ]</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
