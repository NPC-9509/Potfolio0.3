import React from 'react';
import { bus } from '../contexts/EventBus.js';

export default function ProjectsModal({ projects }) {
  return (
    <div className="comic-detail-modal" id="modal-projects" role="dialog" aria-modal="true" aria-label="Featured Projects" aria-hidden="true">
      <div className="modal-hologram-wrapper w-full max-w-[1000px] relative">
        <button className="modal-close-trigger absolute top-5 right-6 bg-[rgba(12,4,28,0.5)] backdrop-blur-md text-text-muted border border-white/10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer z-[100] transition-all duration-300 hover:scale-105 hover:rotate-90 hover:text-accent-pink hover:border-accent-pink/40 hover:shadow-[0_0_15px_rgba(255,42,133,0.25)]"
          data-close="modal-projects" aria-label="Close Projects modal"
          onClick={() => bus.emit('modal:close', 'modal-projects')}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>
        </button>
        <div className="modal-comic-book-page modal-glass px-[3.8rem] py-12 rounded-xl overflow-y-auto max-h-[75vh]">
          <div className="modal-comic-header border-b border-white/15 pb-5 mb-8">
            <span className="chapter-number font-mono text-xs text-accent-pink block mb-1">LOGS: SYSTEM // COMPLETED MISSION DOSSIER</span>
            <h2 className="modal-comic-title font-display text-3xl font-black tracking-wide text-white uppercase" style={{textShadow: '0 0 15px rgba(0, 229, 255, 0.35)'}}>FEATURED MISSIONS</h2>
          </div>
          <div className="modal-comic-projects-grid flex flex-col gap-8" id="modal-projects-grid">
            {projects?.map((p) => (
              <div key={p.id} className="modal-comic-panel project-item-panel bg-black/45 backdrop-blur-md border border-white/[0.08] rounded-xl overflow-hidden shadow-lg mb-2">
                <div className="comic-card-border absolute top-0 left-0 w-full h-full border-[1.5px] border-white/[0.04] pointer-events-none" />
                <div className="modal-project-layout-inner grid grid-cols-[1.5fr_1fr] min-h-[180px]">
                  <div className="modal-project-text p-6 flex flex-col justify-center">
                    <span className="proj-index-tag font-mono text-[0.7rem] text-accent-pink mb-1 block">{p.mission}</span>
                    <h4 className="modal-project-title font-display text-lg font-bold uppercase mb-2">{p.title}</h4>
                    <p className="text-sm leading-relaxed text-text-muted mb-2">{p.description}</p>
                    <p className="t-challenge text-sm text-text-muted"><strong className="text-white">Challenge:</strong> {p.challenge}</p>
                    <p className="t-solution text-sm text-text-muted"><strong className="text-white">Solution:</strong> {p.solution}</p>
                    <div className="proj-badge-list flex flex-wrap gap-2 mt-3">
                      {p.badges?.map((b, i) => (
                        <span key={i} className={`tag-badge font-mono text-[0.65rem] px-2 py-1 border-2 font-bold ${b.color === 'cyan' ? 'border-accent-cyan text-accent-cyan' : b.color === 'pink' ? 'border-accent-pink text-accent-pink' : 'border-accent-purple text-accent-purple'}`}>{b.label}</span>
                      ))}
                    </div>
                    <div className="proj-action-links flex gap-3 mt-3">
                      {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener" className="proj-link-btn font-mono text-xs text-accent-cyan border border-accent-cyan/40 px-3 py-1 rounded hover:bg-accent-cyan hover:text-black transition-all">[ LIVE DEMO ]</a>}
                      {p.sourceUrl && <a href={p.sourceUrl} target="_blank" rel="noopener" className="proj-link-btn font-mono text-xs text-accent-pink border border-accent-pink/40 px-3 py-1 rounded hover:bg-accent-pink hover:text-black transition-all">[ SOURCE CODE ]</a>}
                    </div>
                  </div>
                  <div className="modal-project-artwork relative overflow-hidden">
                    <img src={p.artwork} alt={p.title} className="w-full h-full object-cover block" loading="lazy" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
