import React from 'react';
import { bus } from '../contexts/EventBus.js';
import Button from '../components/ui/Button.jsx';

export default function AboutModal({ portfolio }) {
  return (
    <div className="comic-detail-modal" id="modal-about" role="dialog" aria-modal="true" aria-label="About Mukul Vyas" aria-hidden="true">
      <div className="modal-hologram-wrapper w-full max-w-[1000px] relative">
        <Button 
          variant="ghost"
          className="modal-close-trigger absolute top-5 right-6 bg-[rgba(12,4,28,0.5)] backdrop-blur-md text-text-muted border border-white/10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer z-[100] transition-all duration-300 hover:scale-105 hover:rotate-90 hover:text-accent-pink hover:border-accent-pink/40 hover:shadow-[0_0_15px_rgba(255,42,133,0.25)]"
          aria-label="Close About modal"
          onClick={() => bus.emit('modal:close', 'modal-about')}
        >
          ✕
        </Button>
        <div className="modal-comic-book-page modal-glass px-6 md:px-[3.8rem] py-8 md:py-12 rounded-xl flex flex-col justify-between">
          <div className="modal-comic-header border-b border-white/15 pb-5 mb-6 md:mb-10">
            <span className="chapter-number font-mono text-xs text-accent-pink block mb-1">LOGS: SYSTEM // ORIGIN REPORT</span>
            <h2 className="modal-comic-title font-display text-2xl md:text-3xl font-black tracking-wide text-white uppercase" style={{textShadow: '0 0 15px rgba(0, 229, 255, 0.35)'}}>ABOUT AGENT: MUKUL VYAS</h2>
          </div>
          <div className="modal-comic-grid-2col grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 md:gap-10 h-[50vh] md:h-[45vh] overflow-y-auto pr-1 md:pr-0">
            <div className="modal-comic-panel bg-black/45 backdrop-blur-md border border-white/[0.08] rounded-xl overflow-hidden shadow-lg">
              <div className="comic-card-border absolute top-0 left-0 w-full h-full border-[1.5px] border-white/[0.04] pointer-events-none" />
              <div className="modal-panel-content p-8 h-full">
                <span className="log-stamp font-mono text-[0.7rem] text-accent-pink block mb-2">[LOG_DATE: 2026.05.31]</span>
                <h3 className="modal-subheading font-display text-lg font-bold text-accent-cyan mb-3 uppercase">Digital Solutions Specialist</h3>
                <p className="text-sm leading-relaxed text-text-muted mb-3">{portfolio?.bio_detail || ''}</p>
                <p className="text-sm leading-relaxed text-text-muted mb-3">{portfolio?.bio_passion || ''}</p>
                <p className="text-sm leading-relaxed text-text-muted">{portfolio?.bio_collaboration || ''}</p>
              </div>
            </div>
            <div className="modal-right-col-flex flex flex-col gap-3 h-auto md:h-full">
              <div className="modal-comic-panel artwork-block-panel relative min-h-[220px] md:flex-1 overflow-hidden border-2 border-black rounded-xl">
                <img src={portfolio?.profile_image || 'assets/profile.png'} alt="Mukul Vyas profile photo" className="w-full h-full object-cover object-[center_10%] block" loading="lazy" />
              </div>
              <div className="caption-box bg-pink relative w-full border border-black"
                style={{background: 'rgba(255, 42, 133, 0.15)', boxShadow: '4px 4px 0 #000', margin: '0', maxWidth: 'none'}}>
                <p className="caption-title font-mono text-[0.7rem] font-black tracking-widest mb-1 uppercase border-b border-white/15 pb-1">AGENT PROFILE IDENT</p>
                <p className="caption-body font-sans text-sm leading-tight font-medium">Mukul Vyas, MCA (Cybersecurity), Digital Solutions Specialist.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
