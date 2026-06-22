import React from 'react';
import { bus } from '../contexts/EventBus.js';

export default function SkillsModal({ skills }) {
  const colorMap = { cyan: 'color-cyan border-accent-cyan text-accent-cyan', pink: 'color-pink border-accent-pink text-accent-pink', purple: 'color-purple border-accent-purple text-accent-purple' };
  const borderColorMap = { cyan: 'border-t-accent-cyan', pink: 'border-t-accent-pink', purple: 'border-t-accent-purple' };

  return (
    <div className="comic-detail-modal" id="modal-skills" role="dialog" aria-modal="true" aria-label="Skills Arsenal" aria-hidden="true">
      <div className="modal-hologram-wrapper w-full max-w-[1000px] relative">
        <button className="modal-close-trigger absolute top-5 right-6 bg-[rgba(12,4,28,0.5)] backdrop-blur-md text-text-muted border border-white/10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer z-[100] transition-all duration-300 hover:scale-105 hover:rotate-90 hover:text-accent-pink hover:border-accent-pink/40 hover:shadow-[0_0_15px_rgba(255,42,133,0.25)]"
          data-close="modal-skills" aria-label="Close Skills modal"
          onClick={() => bus.emit('modal:close', 'modal-skills')}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>
        </button>
        <div className="modal-comic-book-page modal-glass px-[3.8rem] py-12 rounded-xl flex flex-col justify-between">
          <div className="modal-comic-header border-b border-white/15 pb-5 mb-10">
            <span className="chapter-number font-mono text-xs text-accent-pink block mb-1">LOGS: SYSTEM // INVENTORY OF TOOLS</span>
            <h2 className="modal-comic-title font-display text-3xl font-black tracking-wide text-white uppercase" style={{textShadow: '0 0 15px rgba(0, 229, 255, 0.35)'}}>THE TECHNICAL ARSENAL</h2>
          </div>
          <div className="modal-comic-grid-3col grid grid-cols-3 gap-8 h-[45vh]" id="modal-skills-cols">
            {skills?.categories?.map((c, i) => (
              <div key={c.id} className={`modal-comic-panel list-card-panel bg-black/45 backdrop-blur-md border border-white/[0.08] rounded-xl overflow-hidden shadow-lg ${borderColorMap[c.color] || 'border-t-accent-cyan'} border-t-3`}>
                <div className="comic-card-border absolute top-0 left-0 w-full h-full border-[1.5px] border-white/[0.04] pointer-events-none" />
                <div className="modal-panel-content p-8">
                  <div className="card-icon-header flex items-center gap-2 mb-3">
                    <span className="card-icon text-xl">{c.icon}</span>
                    <h4 className="card-title font-display text-sm text-white uppercase">{c.label}</h4>
                  </div>
                  <p className="card-summary text-xs leading-relaxed text-text-muted mb-5">{c.summary}</p>
                  <div className="comic-badges-group flex flex-wrap gap-2">
                    {c.skills.map((s, j) => (
                      <span key={j} className={`tag-badge font-mono text-[0.65rem] px-2 py-1 border-2 font-bold ${colorMap[c.color] || 'border-accent-cyan text-accent-cyan'}`}>{s.name}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="modal-comic-footer-strip border-t-2 border-dashed border-white/10 pt-4 mt-6">
            <div className="certifications-row flex items-center flex-wrap gap-3">
              <span className="cert-title font-mono text-xs text-accent-yellow">// CERTIFIED TELEMETRY:</span>
              {skills?.certifications?.map((c, i) => (
                <span key={i} className="cert-badge font-mono text-[0.7rem] text-white border border-white/10 px-3 py-1">{c.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
