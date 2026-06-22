import React, { useState, useRef } from 'react';
import { bus } from '../contexts/EventBus.js';
import Button from '../components/ui/Button.jsx';

export default function ContactSection({ portfolio }) {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [btnText, setBtnText] = useState('Transmit Message');
  const [errors, setErrors] = useState({ name: '', email: '', message: '' });
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', message: '' };

    if (!formState.name.trim()) {
      newErrors.name = 'Name verification protocol is required.';
      isValid = false;
    }
    if (!formState.email.trim()) {
      newErrors.email = 'Email address beacon required.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = 'Invalid email packet format.';
      isValid = false;
    }
    if (!formState.message.trim()) {
      newErrors.message = 'Message payload cannot be empty.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      bus.emit('audio:click');
      return;
    }

    setBtnText('Transmitting...');

    const accessKey = 'f491cccd-442f-4a6d-a329-6bf9a9618b99';
    const formData = new FormData(formRef.current);
    formData.append('access_key', accessKey);

    try {
      const resp = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
      const data = await resp.json();
      if (data.success) {
        setBtnText('Transmission Sent ✓');
        setFormState({ name: '', email: '', message: '' });
        bus.emit('audio:click');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error(err);
      setBtnText('Transmission Failed');
      bus.emit('audio:click');
    }

    setTimeout(() => setBtnText('Transmit Message'), 3500);
  };

  const socials = portfolio?.socials || [];
  const isTransmitting = btnText === 'Transmitting...';

  return (
    <section className="comic-chapter" id="sec-5" aria-label="Chapter 5 — Transmission Beacon">
      <div className="comic-page">
        {/* Chapter Header */}
        <div className="chapter-header border-b border-white/25 pb-3 mb-8 flex items-end gap-4 w-fit">
          <span className="chapter-index font-mono text-base text-accent-pink font-bold">CHAPTER 05 //</span>
          <h2 className="chapter-title font-display text-2xl font-black tracking-wide text-white uppercase">TRANSMISSION BEACON</h2>
        </div>

        {/* Responsive Grid */}
        <div className="contact-comic-grid">
          {/* Form Panel */}
          <div className="comic-panel form-panel flex items-center">
            <div className="panel-border-glow absolute top-0 left-0 w-full h-full border-2 border-transparent pointer-events-none z-[5] transition-all duration-300" />
            <div className="panel-content w-full h-full">
              <h3 className="panel-heading font-display text-2xl font-black uppercase tracking-wide mb-6">Transmit <span className="text-accent-cyan">Input</span></h3>
              <form ref={formRef} className="comic-form flex flex-col gap-4 w-full" id="portfolio-contact-form" onSubmit={handleSubmit} noValidate>
                
                {/* Name field */}
                <div className="form-group-item w-full">
                  <div className="floating-label-group">
                    <input
                      type="text"
                      id="form-name"
                      name="name"
                      placeholder=" "
                      value={formState.name}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      aria-invalid={errors.name ? 'true' : 'false'}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    <label htmlFor="form-name">Name</label>
                  </div>
                  <div id="name-error" className="form-validation-msg" role="alert">
                    {errors.name}
                  </div>
                </div>

                {/* Email field */}
                <div className="form-group-item w-full">
                  <div className="floating-label-group">
                    <input
                      type="email"
                      id="form-email"
                      name="email"
                      placeholder=" "
                      value={formState.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      aria-invalid={errors.email ? 'true' : 'false'}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    <label htmlFor="form-email">Email Address</label>
                  </div>
                  <div id="email-error" className="form-validation-msg" role="alert">
                    {errors.email}
                  </div>
                </div>

                {/* Message field */}
                <div className="form-group-item w-full">
                  <div className="floating-label-group">
                    <textarea
                      id="form-message"
                      name="message"
                      rows="3"
                      placeholder=" "
                      value={formState.message}
                      onChange={handleChange}
                      required
                      aria-invalid={errors.message ? 'true' : 'false'}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                      className="resize-none"
                    />
                    <label htmlFor="form-message">Message</label>
                  </div>
                  <div id="message-error" className="form-validation-msg" role="alert">
                    {errors.message}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="form-action-buttons flex flex-col sm:flex-row justify-center md:justify-start items-center gap-4 mt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    id="btn-submit-contact"
                    aria-label="Transmit Message"
                    className="w-full sm:w-auto"
                    disabled={isTransmitting}
                  >
                    {isTransmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Transmitting...
                      </span>
                    ) : btnText}
                  </Button>
                  <Button
                    href="/resume.pdf"
                    download={true}
                    variant="outline"
                    id="link-resume"
                    aria-label="Download resume PDF"
                    className="w-full sm:w-auto text-center"
                  >
                    Resume.PDF
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Artwork Panel */}
          <div className="comic-panel artwork-panel pane-right rounded-xl bg-cover bg-center min-h-[300px]"
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
