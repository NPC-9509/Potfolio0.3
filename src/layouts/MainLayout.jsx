import React, { useState, useEffect } from 'react';
import { bus } from '../contexts/EventBus.js';
import { useApp } from '../contexts/AppContext.jsx';
import ThreeScene from '../components/ThreeScene.jsx';
import Cursor from '../components/ui/Cursor.jsx';
import HUD from '../components/ui/HUD.jsx';
import AudioWidget from '../components/ui/AudioWidget.jsx';
import MobileNav from '../components/ui/MobileNav.jsx';
import Terminal from '../components/ui/Terminal.jsx';
import AIAssistant from '../components/ui/AIAssistant.jsx';
import AchievementToast from '../components/ui/AchievementToast.jsx';
import PhotoMode from '../components/ui/PhotoMode.jsx';
import HeroSection from '../pages/HeroSection.jsx';
import AboutSection from '../pages/AboutSection.jsx';
import SkillsSection from '../pages/SkillsSection.jsx';
import ProjectsSection from '../pages/ProjectsSection.jsx';
import ExperienceSection from '../pages/ExperienceSection.jsx';
import ContactSection from '../pages/ContactSection.jsx';
import ModalManager from '../modals/ModalManager.jsx';
import AboutModal from '../modals/AboutModal.jsx';
import SkillsModal from '../modals/SkillsModal.jsx';
import ProjectsModal from '../modals/ProjectsModal.jsx';
import ExperienceModal from '../modals/ExperienceModal.jsx';
import SettingsModal from '../modals/SettingsModal.jsx';
import ResumeRoomModal from '../modals/ResumeRoomModal.jsx';
import Button from '../components/ui/Button.jsx';
import ScrollReveal from '../components/ui/ScrollReveal.jsx';
import Footer from '../components/ui/Footer.jsx';

export default function MainLayout({ portfolioData }) {
  const { state } = useApp();
  const { portfolio, projects, experience, skills, achievements } = portfolioData || {};

  return (
    <>
      <div className="scanlines" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      <Cursor />
      <AchievementToast />
      <PhotoMode />

      <ThreeScene
        quality={state.qualityLevel}
        currentSection={state.currentSection}
        scrollPercent={state.scrollPercent}
        reducedMotion={state.prefersReducedMotion}
      />

      <HUD />
      <AudioWidget />
      <MobileNav />
      <Terminal portfolioData={portfolioData} />
      <AIAssistant portfolioData={portfolioData} />

      <div className="hud-action-buttons-group fixed bottom-8 left-8 z-[100] flex gap-3">
        <Button
          id="terminal-open-btn"
          variant="outline"
          className="w-11 h-11 bg-[rgba(12,4,28,0.5)] backdrop-blur-md border border-accent-green/40 text-accent-green font-mono text-base font-bold rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,255,102,0.1)] hover:bg-accent-green hover:text-black hover:shadow-[0_0_15px_rgba(0,255,102,0.45)]"
          onClick={() => bus.emit('terminal:open')}
          aria-label="Open developer terminal"
          title="Open Terminal [Ctrl+`]"
        >
          <span aria-hidden="true">&gt;_</span>
        </Button>
        <Button
          id="settings-open-btn"
          variant="outline"
          className="w-11 h-11 bg-[rgba(12,4,28,0.5)] backdrop-blur-md border border-accent-purple/40 text-accent-purple font-mono text-base font-bold rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(189,90,247,0.1)] hover:bg-accent-purple hover:text-black hover:shadow-[0_0_15px_rgba(189,90,247,0.45)]"
          onClick={() => bus.emit('modal:open', 'modal-settings')}
          aria-label="Open settings panel"
          title="Open Settings Panel"
        >
          <span aria-hidden="true">⚙</span>
        </Button>
      </div>

      <main id="scroll-container" className="absolute top-0 left-0 w-full h-full overflow-y-auto overflow-x-hidden z-[5] scroll-smooth">
        <a className="skip-nav fixed -top-[100px] left-4 bg-accent-cyan text-black px-4 py-2 font-mono text-sm font-bold z-[99999] no-underline transition-all duration-200 focus:top-4"
          href="#scroll-container">Skip to main content</a>

        <ScrollReveal className="w-full">
          <HeroSection portfolio={portfolio} />
        </ScrollReveal>
        <ScrollReveal className="w-full">
          <AboutSection portfolio={portfolio} />
        </ScrollReveal>
        <ScrollReveal className="w-full">
          <SkillsSection skills={skills} />
        </ScrollReveal>
        <ScrollReveal className="w-full">
          <ProjectsSection projects={projects} />
        </ScrollReveal>
        <ScrollReveal className="w-full">
          <ExperienceSection experience={experience} />
        </ScrollReveal>
        <ScrollReveal className="w-full">
          <ContactSection portfolio={portfolio} />
        </ScrollReveal>
        <Footer />
      </main>

      <ModalManager modals={[
        <AboutModal key="about" portfolio={portfolio} />,
        <SkillsModal key="skills" skills={skills} />,
        <ProjectsModal key="projects" projects={projects} />,
        <ExperienceModal key="experience" experience={experience} achievements={achievements} />,
        <SettingsModal key="settings" />,
        <ResumeRoomModal key="resume-room" />,
      ]} />

      <div id="audio-captions-overlay" className="audio-captions-container fixed bottom-20 left-1/2 -translate-x-1/2 z-[999] bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg text-center transition-opacity duration-300" role="status" aria-live="polite" aria-hidden="true" />
    </>
  );
}
