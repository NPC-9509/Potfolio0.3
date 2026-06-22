import React from 'react';
import { bus } from '../contexts/EventBus.js';
import Button from '../components/ui/Button.jsx';

export function getSocialLinks(portfolio) {
  if (!portfolio?.socials) return [];
  return portfolio.socials.map(s => ({
    ...s,
    Component: () => (
      <Button
        key={s.id}
        href={s.url}
        variant="outline"
        id={s.id}
        className="text-xs px-4 py-2"
        aria-label={`Visit Mukul's ${s.label}`}
      >
        {s.label}
      </Button>
    )
  }));
}

export default function HeroSection({ portfolio }) {
  const socials = getSocialLinks(portfolio);

  const scrollToSection = (idx) => {
    const sc = document.getElementById('scroll-container');
    const target = document.getElementById(`sec-${idx}`);
    if (target && sc) {
      sc.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
    }
  };

  return (
    <section className="comic-chapter hero-chapter" id="sec-0" aria-label="Hero — Introduction">
      <div className="comic-page">
        <div className="hero-comic-grid">
          {/* Welcome Text Panel */}
          <div className="comic-panel text-panel flex items-center px-10 md:px-16 py-12 md:py-16">
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-content w-full h-full flex flex-col justify-between">
              <div>
                <span className="panel-tag font-mono text-xs text-accent-cyan tracking-widest block mb-4 md:mb-6">// PROTOCOL: WELCOME</span>
                <h1 className="comic-main-title font-display font-black leading-tight tracking-tight mb-4 md:mb-5">
                  MUKUL VYAS
                </h1>
                <p className="comic-subtitle font-mono text-xs md:text-sm tracking-widest text-accent-cyan uppercase mb-6 md:mb-10 font-bold">
                  DIGITAL SOLUTIONS SPECIALIST
                </p>
                <p className="comic-role-desc text-xs md:text-sm leading-relaxed text-text-muted font-medium mb-8 md:mb-12">
                  Software Development | Creative Design | Social Media Marketing
                </p>
              </div>
              
              {/* Primary & Secondary Call to Actions */}
              <div className="hero-cta-buttons flex flex-wrap gap-5 mb-10">
                <Button 
                  variant="primary" 
                  onClick={() => scrollToSection(3)} 
                  aria-label="View Mukul's Projects"
                >
                  View Projects
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => scrollToSection(5)} 
                  aria-label="Contact Mukul"
                >
                  Contact Me
                </Button>
              </div>
 
              {/* Social Channels Link Row */}
              <div className="hero-channel-links flex flex-wrap gap-4">
                {socials.map((s, i) => <s.Component key={i} />)}
              </div>
            </div>
          </div>

          {/* Interactive Artwork Panel */}
          <div className="comic-panel artwork-panel pane-right rounded-xl bg-cover bg-center min-h-[300px]"
            style={{ backgroundImage: "url('assets/comic_hero.png')" }}>
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-overlay-grad absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[rgba(4,1,10,0.85)] to-[rgba(4,1,10,0.1)] pointer-events-none z-[2]" />
            
            <div className="speech-bubble bottom-left absolute bottom-6 md:bottom-8 left-6 md:left-8 bg-[rgba(12,4,28,0.7)] backdrop-blur-md text-white border border-white/10 px-4 md:px-5 py-3 md:py-4 rounded-xl font-sans text-xs md:text-sm leading-relaxed font-semibold max-w-[260px] z-[6] shadow-lg"
              role="note">
              <span className="bubble-speaker block font-mono text-[0.65rem] text-accent-pink mb-1 tracking-wider uppercase">SYSTEM_AI</span>
              <p className="bubble-text italic">"Grid matrix loaded. Agent path verified. Commencing walkthrough."</p>
            </div>
            
            <div className="scroll-prompt absolute bottom-6 md:bottom-8 right-6 md:right-8 flex flex-col items-end gap-2 text-accent-cyan z-[5]">
              <span className="font-mono text-[0.65rem] tracking-widest" style={{ textShadow: '1px 1px 2px #000' }}>SCROLL DOWN TO ENTER STORY</span>
              <div className="w-[60px] h-[2px] bg-accent-cyan relative">
                <div className="absolute right-0 -top-[3px] w-2 h-2 border-r-2 border-b-2 border-accent-cyan -rotate-45" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

