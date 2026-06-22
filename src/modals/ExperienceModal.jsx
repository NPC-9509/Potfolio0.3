import React from 'react';
import { bus } from '../contexts/EventBus.js';
import Button from '../components/ui/Button.jsx';

export default function ExperienceModal({ experience, achievements }) {
  return (
    <div className="comic-detail-modal" id="modal-experience" role="dialog" aria-modal="true" aria-label="Experience Chronicle" aria-hidden="true">
      <div className="modal-hologram-wrapper w-full max-w-[1000px] relative">
        <Button 
          variant="ghost"
          className="modal-close-trigger absolute top-5 right-6 bg-[rgba(12,4,28,0.5)] backdrop-blur-md text-text-muted border border-white/10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer z-[100] transition-all duration-300 hover:scale-105 hover:rotate-90 hover:text-accent-pink hover:border-accent-pink/40 hover:shadow-[0_0_15px_rgba(255,42,133,0.25)]"
          aria-label="Close Experience modal"
          onClick={() => bus.emit('modal:close', 'modal-experience')}
        >
          ✕
        </Button>
        <div className="modal-comic-book-page modal-glass px-6 md:px-[3.8rem] py-8 md:py-12 rounded-xl flex flex-col justify-between">
          <div className="modal-comic-header border-b border-white/15 pb-5 mb-6 md:mb-10">
            <span className="chapter-number font-mono text-xs text-accent-pink block mb-1">LOGS: SYSTEM // SERVICE ARCHIVES</span>
            <h2 className="modal-comic-title font-display text-2xl md:text-3xl font-black tracking-wide text-white uppercase" style={{textShadow: '0 0 15px rgba(0, 229, 255, 0.35)'}}>THE AGENT CHRONICLE</h2>
          </div>
          <div className="modal-comic-grid-2col grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 md:gap-10 h-[50vh] md:h-[45vh] overflow-y-auto pr-1 md:pr-0">
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
