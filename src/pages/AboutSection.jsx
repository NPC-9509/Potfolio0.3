import React from 'react';
import { bus } from '../contexts/EventBus.js';
import Button from '../components/ui/Button.jsx';

export default function AboutSection({ portfolio }) {
  return (
    <section className="comic-chapter" id="sec-1" aria-label="Chapter 1 — Origin Protocol">
      <div className="comic-page">
        {/* Chapter Header */}
        <div className="chapter-header border-b border-white/25 pb-3 mb-8 flex items-end gap-4 w-fit">
          <span className="chapter-index font-mono text-base text-accent-pink font-bold">CHAPTER 01 //</span>
          <h2 className="chapter-title font-display text-2xl font-black tracking-wide text-white uppercase">ORIGIN PROTOCOL</h2>
        </div>

        {/* Responsive Grid */}
        <div className="about-comic-grid">
          {/* Artwork Panel */}
          <div className="comic-panel artwork-panel pane-left rounded-xl bg-cover bg-center min-h-[300px]"
            style={{ backgroundImage: "url('assets/comic_origin.png')" }}>
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-overlay-grad absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[rgba(4,1,10,0.85)] to-[rgba(4,1,10,0.1)] pointer-events-none z-[2]" />
            <div className="caption-box top-left absolute top-5 left-5 bg-accent-purple/15 backdrop-blur-md border border-accent-purple/35 px-5 py-3 z-[6] max-w-[280px] shadow-lg rounded-lg">
              <p className="caption-title font-mono text-[0.7rem] font-black tracking-widest mb-1 uppercase border-b border-white/15 pb-1">FILE: MUKUL_VYAS.log</p>
              <p className="caption-body font-sans text-sm leading-tight font-medium">Half-shadow, half-neon-glow. Reflecting code in his glasses, determined to solve real-world problems.</p>
            </div>
          </div>

          {/* Text/Content Panel */}
          <div className="comic-panel text-panel pane-right flex items-center px-8 md:px-14 py-8 md:py-12">
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-content w-full h-full flex flex-col justify-between gap-6">
              <div>
                <h3 className="panel-heading font-display text-2xl font-black uppercase tracking-wide mb-6">Who is <span className="text-accent-purple">Mukul?</span></h3>
                <p className="panel-paragraph text-sm leading-relaxed text-text-muted font-medium mb-5">{portfolio?.bio_short || ''}</p>
                <p className="panel-paragraph text-sm leading-relaxed text-text-muted font-medium">From frontend web systems to custom social marketing campaigns, I help businesses grow and establish an authoritative, premium online presence.</p>
              </div>
              <Button
                variant="primary"
                onClick={() => bus.emit('modal:open', 'modal-about')}
                aria-label="Open About Details"
                className="gap-4 w-fit"
              >
                Access Classified Logs
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

