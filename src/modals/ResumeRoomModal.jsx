import React from 'react';
import { bus } from '../contexts/EventBus.js';

export default function ResumeRoomModal() {
  return (
    <div className="comic-detail-modal" id="modal-resume-room" role="dialog" aria-modal="true" aria-label="Interactive Resume Room" aria-hidden="true">
      <div className="modal-hologram-wrapper w-full max-w-[1000px] relative">
        <button className="modal-close-trigger absolute top-5 right-6 bg-[rgba(12,4,28,0.5)] backdrop-blur-md text-text-muted border border-white/10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer z-[100] transition-all duration-300 hover:scale-105 hover:rotate-90 hover:text-accent-pink hover:border-accent-pink/40 hover:shadow-[0_0_15px_rgba(255,42,133,0.25)]"
          data-close="modal-resume-room" aria-label="Close Resume Room modal"
          onClick={() => bus.emit('modal:close', 'modal-resume-room')}>✕</button>
        <div className="modal-comic-book-page modal-glass px-[3.8rem] py-12 rounded-xl overflow-y-auto max-h-[75vh]">
          <div className="modal-comic-header border-b border-white/15 pb-5 mb-8">
            <span className="chapter-number font-mono text-xs text-accent-pink block mb-1">LOGS: DRIVER // RESUME MODULE</span>
            <h2 className="modal-comic-title font-display text-3xl font-black tracking-wide text-white uppercase" style={{textShadow: '0 0 15px rgba(0, 229, 255, 0.35)'}}>INTERACTIVE RESUME ARCHIVE</h2>
          </div>
          <div className="resume-room-grid grid grid-cols-2 gap-6">
            <div className="modal-comic-panel resume-dossier-panel bg-black/45 backdrop-blur-md border border-white/[0.08] rounded-xl overflow-hidden shadow-lg">
              <div className="comic-card-border absolute top-0 left-0 w-full h-full border-[1.5px] border-white/[0.04] pointer-events-none" />
              <div className="modal-panel-content p-8 h-full">
                <h3 className="modal-subheading font-display text-lg font-bold text-accent-cyan mb-3 uppercase">Agent Dossier: Mukul Vyas</h3>
                <p className="text-sm leading-relaxed text-text-muted mb-3"><strong className="text-white">Specialization:</strong> Digital Solutions (Design, Code, Grow)</p>
                <p className="text-sm leading-relaxed text-text-muted mb-4"><strong className="text-white">Focus:</strong> Cybersecurity, full-stack frameworks, strategic marketing deployment.</p>
                <div className="resume-details-dossier">
                  <div className="dossier-item text-sm text-text-muted mb-2"><strong className="text-white">Education:</strong> MCA (Cybersecurity) @ Parul University</div>
                  <div className="dossier-item text-sm text-text-muted mb-2"><strong className="text-white">Experience:</strong> Web Development Intern @ Swaastik Solutions</div>
                  <div className="dossier-item text-sm text-text-muted"><strong className="text-white">Core Proficiencies:</strong> React, JavaScript, Python, Meta Advertising, Figma, Premiere Pro</div>
                </div>
              </div>
            </div>
            <div className="modal-comic-panel resume-downloads-panel bg-black/45 backdrop-blur-md border border-white/[0.08] rounded-xl overflow-hidden shadow-lg">
              <div className="comic-card-border absolute top-0 left-0 w-full h-full border-[1.5px] border-white/[0.04] pointer-events-none" />
              <div className="modal-panel-content p-8 h-full flex flex-col justify-between">
                <div>
                  <h3 className="modal-subheading font-display text-lg font-bold text-accent-cyan mb-3 uppercase">Verified Credentials</h3>
                  <ul className="certifications-list-bullet list-none">
                    <li className="text-sm text-text-muted mb-2">✓ Google Digital Marketing Fundamentals</li>
                    <li className="text-sm text-text-muted mb-2">✓ Cisco Introduction to Cybersecurity</li>
                    <li className="text-sm text-text-muted">✓ Cisco Network Defender Pathway</li>
                  </ul>
                </div>
                <div className="resume-actions-group mt-4">
                  <a href="/resume.pdf" download
                    className="comic-btn-premium inline-glow block w-full text-center no-underline inline-flex items-center justify-center gap-4 bg-accent-cyan/[0.05] backdrop-blur-sm text-accent-cyan border border-accent-cyan/40 px-9 py-4 font-mono text-xs font-bold tracking-widest transition-all duration-300 shadow-[4px_4px_0_#00e5ff] uppercase hover:bg-accent-cyan hover:text-black hover:shadow-[0_0_20px_rgba(0,229,255,0.45)] hover:border-accent-cyan"
                    id="link-resume-modal"
                  >[ DOWNLOAD RESUME PDF ]</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
