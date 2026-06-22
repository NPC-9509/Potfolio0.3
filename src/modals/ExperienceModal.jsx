import React from 'react';
import { bus } from '../contexts/EventBus.js';

export default function ExperienceModal({ experience, achievements }) {
  return (
    <div className="comic-detail-modal" id="modal-experience" role="dialog" aria-modal="true" aria-label="Experience Chronicle" aria-hidden="true">
      <div className="modal-hologram-wrapper w-full max-w-[1000px] relative">
        <button className="modal-close-trigger absolute top-5 right-6 bg-[rgba(12,4,28,0.5)] backdrop-blur-md text-text-muted border border-white/10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer z-[100] transition-all duration-300 hover:scale-105 hover:rotate-90 hover:text-accent-pink hover:border-accent-pink/40 hover:shadow-[0_0_15px_rgba(255,42,133,0.25)]"
          data-close="modal-experience" aria-label="Close Experience modal"
          onClick={() => bus.emit('modal:close', 'modal-experience')}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>
        </button>
        <div className="modal-comic-book-page modal-glass px-[3.8rem] py-12 rounded-xl flex flex-col justify-between">
          <div className="modal-comic-header border-b border-white/15 pb-5 mb-10">
            <span className="chapter-number font-mono text-xs text-accent-pink block mb-1">LOGS: SYSTEM // SERVICE ARCHIVES</span>
            <h2 className="modal-comic-title font-display text-3xl font-black tracking-wide text-white uppercase" style={{textShadow: '0 0 15px rgba(0, 229, 255, 0.35)'}}>THE AGENT CHRONICLE</h2>
          </div>
          <div className="modal-comic-grid-2col grid grid-cols-[1.2fr_1fr] gap-10 h-[45vh]">
            <div className="modal-comic-panel timeline-details-panel bg-black/45 backdrop-blur-md border border-white/[0.08] rounded-xl overflow-hidden shadow-lg border-t-3 border-t-accent-purple">
              <div className="comic-card-border absolute top-0 left-0 w-full h-full border-[1.5px] border-white/[0.04] pointer-events-none" />
              <div className="modal-panel-content p-8 h-full overflow-y-auto">
                {experience?.map((e) => (
                  <div key={e.id} className="timeline-detail-item border-b border-dashed border-white/[0.06] pb-5 mb-5 last:border-none last:pb-0 last:mb-0">
                    <div className={`timeline-date-tag font-mono text-[0.7rem] px-2 py-0.5 text-black font-bold w-fit mb-1.5 ${e.dateTag === 'bg-purple' ? 'bg-accent-purple' : e.dateTag === 'bg-cyan' ? 'bg-accent-cyan' : 'bg-accent-pink'}`}>{e.dateRange}</div>
                    <h4 className="timeline-role font-display text-base font-bold text-white">{e.role}</h4>
                    <span className="timeline-org font-mono text-xs text-accent-cyan block mb-1.5">{e.org}</span>
                    <p className="timeline-desc text-sm leading-relaxed text-text-muted">{e.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-comic-panel achievements-details-panel bg-black/45 backdrop-blur-md border border-white/[0.08] rounded-xl overflow-hidden shadow-lg border-t-3 border-t-accent-cyan">
              <div className="comic-card-border absolute top-0 left-0 w-full h-full border-[1.5px] border-white/[0.04] pointer-events-none" />
              <div className="modal-panel-content p-8 h-full flex flex-col justify-between">
                <div>
                  <h3 className="modal-subheading font-display text-lg font-bold text-accent-cyan mb-3 uppercase">Achievements & Badges</h3>
                  <ul className="modal-achievement-list list-none flex flex-col gap-4">
                    {achievements?.awards?.map((a, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span className="achievement-icon text-lg bg-white/[0.04] p-1 border border-white/[0.06]">{a.icon}</span>
                        <div className="achievement-text">
                          <strong className="font-display text-sm text-white block">{a.title}</strong>
                          <p className="text-xs leading-relaxed text-text-muted">{a.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="caption-box bg-cyan" style={{position: 'static', marginTop: '1rem', background: 'rgba(0, 229, 255, 0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0, 229, 255, 0.35)', padding: '0.9rem 1.3rem', borderRadius: '8px', maxWidth: 'none'}}>
                  <p className="caption-title font-mono text-[0.7rem] font-black tracking-widest mb-1 uppercase border-b border-white/15 pb-1">CHRONICLE COMPILING COMPLETE</p>
                  <p className="caption-body font-sans text-sm leading-tight font-medium">Verify active communication link channels on transmission page.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
