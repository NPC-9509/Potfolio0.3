import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="w-full py-8 mt-12 bg-black/40 border-t border-white/5 backdrop-blur-md"
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left column */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="font-mono text-[0.7rem] text-text-muted">
            © {currentYear} <span className="text-white font-bold">MUKUL VYAS</span>. ALL RIGHTS RESERVED.
          </p>
          <p className="font-mono text-[0.62rem] text-accent-cyan/80 tracking-widest uppercase">
            // PROTOCOL STATE: SYSTEM STABLE
          </p>
        </div>

        {/* Right column */}
        <div className="text-center md:text-right">
          <p className="font-mono text-[0.7rem] text-text-muted">
            DESIGNED & ENGINE-TUNED FOR MAXIMUM PERFORMANCE.
          </p>
        </div>
      </div>
    </footer>
  );
}
