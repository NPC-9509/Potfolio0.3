import React, { useState, useRef } from 'react';
import { bus } from '../contexts/EventBus.js';

export default function ContactSection({ portfolio }) {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [btnText, setBtnText] = useState('[ TRANSMIT MESSAGE ]');
  const formRef = useRef(null);

  const handleChange = (e) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnText('[ TRANSMITTING... ]');

    const accessKey = 'f491cccd-442f-4a6d-a329-6bf9a9618b99';
    const formData = new FormData(formRef.current);
    formData.append('access_key', accessKey);

    try {
      const resp = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
      const data = await resp.json();
      if (data.success) {
        setBtnText('[ TRANSMISSION SENT ✓ ]');
        setFormState({ name: '', email: '', message: '' });
        bus.emit('audio:click');
      } else {
        throw new Error(data.message);
      }
    } catch(err) {
      console.error(err);
      setBtnText('[ TRANSMISSION FAILED ]');
      bus.emit('audio:click');
    }

    setTimeout(() => setBtnText('[ TRANSMIT MESSAGE ]'), 3500);
  };

  const socials = portfolio?.socials || [];

  return (
    <section className="comic-chapter w-screen h-screen flex items-center justify-center px-[5%] pl-[10%] relative" id="sec-5" aria-label="Chapter 5 — Transmission Beacon">
      <div className="comic-page w-full max-w-[1100px] h-[82vh] relative flex flex-col justify-between">
        <div className="chapter-header border-b border-white/25 pb-3 mb-8 flex items-end gap-4 w-fit">
          <span className="chapter-index font-mono text-base text-accent-pink font-bold">CHAPTER 05 //</span>
          <h2 className="chapter-title font-display text-2xl font-black tracking-wide text-white uppercase">TRANSMISSION BEACON</h2>
        </div>
        <div className="contact-comic-grid grid grid-cols-[1.2fr_1fr] gap-10 h-[calc(100%-70px)]">
          <div className="comic-panel form-panel flex items-center px-14 py-[3.2rem] rounded-xl bg-[rgba(8,2,18,0.45)] backdrop-blur-md border border-accent-cyan/30 shadow-cyber-cyan transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:border-accent-cyan/55 hover:shadow-[0_8px_32px_0_rgba(4,1,10,0.37),0_0_25px_rgba(0,229,255,0.25)]">
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-content w-full h-full">
              <h3 className="panel-heading font-display text-2xl font-black uppercase tracking-wide mb-6">Transmit <span className="text-accent-cyan">Input</span></h3>
              <form ref={formRef} className="comic-form flex flex-col gap-5 w-full" id="portfolio-contact-form" onSubmit={handleSubmit} noValidate>
                <div className="form-group-item flex flex-col gap-1">
                  <label className="form-group-label font-mono text-xs text-text-muted uppercase" htmlFor="form-name">Name</label>
                  <input
                    className="form-group-input bg-black border-2 border-white/10 text-white px-4 py-2 font-mono text-sm transition-all duration-300 focus:outline-none focus:border-accent-cyan focus:shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                    type="text" id="form-name" name="name" placeholder="Please provide your name"
                    value={formState.name} onChange={handleChange}
                    required autoComplete="name"
                  />
                </div>
                <div className="form-group-item flex flex-col gap-1">
                  <label className="form-group-label font-mono text-xs text-text-muted uppercase" htmlFor="form-email">Email Address</label>
                  <input
                    className="form-group-input bg-black border-2 border-white/10 text-white px-4 py-2 font-mono text-sm transition-all duration-300 focus:outline-none focus:border-accent-cyan focus:shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                    type="email" id="form-email" name="email" placeholder="Your email address"
                    value={formState.email} onChange={handleChange}
                    required autoComplete="email"
                  />
                </div>
                <div className="form-group-item flex flex-col gap-1">
                  <label className="form-group-label font-mono text-xs text-text-muted uppercase" htmlFor="form-message">Message</label>
                  <textarea
                    className="form-group-input bg-black border-2 border-white/10 text-white px-4 py-2 font-mono text-sm transition-all duration-300 focus:outline-none focus:border-accent-cyan focus:shadow-[0_0_10px_rgba(0,229,255,0.2)] resize-none"
                    id="form-message" name="message" rows="3" placeholder="Write your message here..."
                    value={formState.message} onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-action-buttons flex gap-4 mt-2">
                  <button
                    className="comic-btn-premium inline-glow inline-flex items-center justify-center gap-4 bg-accent-cyan/[0.05] backdrop-blur-sm text-accent-cyan border border-accent-cyan/40 px-9 py-4 font-mono text-xs font-bold tracking-widest cursor-pointer transition-all duration-300 shadow-[4px_4px_0_#00e5ff] w-fit uppercase hover:bg-accent-cyan hover:text-black hover:shadow-[0_0_20px_rgba(0,229,255,0.45)] hover:border-accent-cyan"
                    type="submit" id="btn-submit-contact"
                  >{btnText}</button>
                  <a href="/resume.pdf" download
                    className="comic-btn-premium inline-glow inline-flex items-center justify-center gap-4 bg-accent-cyan/[0.05] backdrop-blur-sm text-accent-cyan border border-accent-cyan/40 px-9 py-4 font-mono text-xs font-bold tracking-widest transition-all duration-300 shadow-[4px_4px_0_#00e5ff] no-underline text-center uppercase hover:bg-accent-cyan hover:text-black hover:shadow-[0_0_20px_rgba(0,229,255,0.45)] hover:border-accent-cyan"
                    id="link-resume" aria-label="Download resume PDF"
                  >[ RESUME.PDF ]</a>
                </div>
              </form>
            </div>
          </div>
          <div className="comic-panel artwork-panel pane-right rounded-xl bg-cover bg-center transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5"
            style={{ backgroundImage: "url('assets/comic_contact.png')" }}>
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-overlay-grad absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[rgba(4,1,10,0.85)] to-[rgba(4,1,10,0.1)] pointer-events-none z-[2]" />
            <div className="caption-box bottom-right absolute bottom-5 right-5 bg-accent-cyan/15 backdrop-blur-md border border-accent-cyan/35 px-5 py-3 z-[6] shadow-lg rounded-lg"
              style={{ maxWidth: '280px' }}>
              <p className="caption-title font-mono text-[0.7rem] font-black tracking-widest mb-1 uppercase border-b border-white/15 pb-1">BEACON CHANNELS</p>
              <p className="caption-body font-sans text-sm leading-tight font-medium">
                Direct: <a id="beacon-phone" href={portfolio?.contact?.phone_href || 'tel:+919509006795'} className="text-black font-bold underline">{portfolio?.contact?.phone || '+91 9509006795'}</a> | <a id="beacon-email" href={portfolio?.contact?.email_href || 'mailto:mollyvyas@gmail.com'} className="text-black font-bold underline">{portfolio?.contact?.email || 'mollyvyas@gmail.com'}</a>
                <br />
                Nodes: {socials.filter(s => s.external).map((s, i) => (
                  <React.Fragment key={s.id}>
                    {i > 0 && ' '}
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-black font-bold underline mr-2">{s.label}</a>
                  </React.Fragment>
                ))}
              </p>
            </div>
            <div className="speech-bubble top-left absolute top-8 left-8 bg-[rgba(12,4,28,0.7)] backdrop-blur-md text-white border border-white/10 px-5 py-4 rounded-xl font-sans text-sm leading-relaxed font-semibold max-w-[260px] z-[6] shadow-lg" role="note">
              <span className="bubble-speaker block font-mono text-[0.65rem] text-accent-pink mb-1 tracking-wider uppercase">TERMINAL</span>
              <p className="bubble-text italic">"Open audio/data tunnel active. Uploading files."</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
