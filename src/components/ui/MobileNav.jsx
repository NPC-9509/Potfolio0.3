import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bus } from '../../contexts/EventBus.js';
import { useApp } from '../../contexts/AppContext.jsx';
import Button from './Button.jsx';

const NAV_ITEMS = [
  { label: 'Origin Gate (Home)',      icon: '⬡', target: 0 },
  { label: 'Profile Matrix (About)',  icon: '◈', target: 1 },
  { label: 'Skills Arsenal (Skills)', icon: '◉', target: 2 },
  { label: 'Active Ops (Projects)',   icon: '◆', target: 3 },
  { label: 'Service Chronicle (Exp)', icon: '◎', target: 4 },
  { label: 'Transmission Beacon (Contact)', icon: '▣', target: 5 },
  { label: 'Developer Terminal',      icon: '>_', target: 'terminal' },
  { label: 'SYS_AI Guide',            icon: '⚡', target: 'ai' },
];

export default function MobileNav() {
  const { state } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // Toggle Scroll Lock
  useEffect(() => {
    const sc = document.getElementById('scroll-container');
    if (!sc) return;
    if (isOpen) {
      sc.style.overflow = 'hidden';
    } else {
      sc.style.overflow = 'auto';
    }
    return () => {
      sc.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleClick = useCallback((target) => {
    setIsOpen(false);
    bus.emit('audio:click');

    if (target === 'terminal') {
      // Small timeout to allow overlay close animation
      setTimeout(() => {
        bus.emit('terminal:open');
      }, 300);
      return;
    }
    if (target === 'ai') {
      setTimeout(() => {
        bus.emit('assistant:toggle');
      }, 300);
      return;
    }

    const scrollContainer = document.getElementById('scroll-container');
    const section = document.getElementById(`sec-${target}`);
    if (section && scrollContainer) {
      scrollContainer.scrollTo({ top: section.offsetTop, behavior: 'smooth' });
    }
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    bus.emit('audio:click');
  };

  // Close when clicking outside of list container
  const handleBackdropClick = (e) => {
    if (e.target.id === 'mob-menu-overlay') {
      setIsOpen(false);
      bus.emit('audio:click');
    }
  };

  // Ensure menu closes if screen resized to desktop
  useEffect(() => {
    if (!state.isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [state.isMobile, isOpen]);

  // Hamburger line variant animations
  const topBarVariants = {
    closed: { rotate: 0, y: 0 },
    open: { rotate: 45, y: 6 }
  };

  const centerBarVariants = {
    closed: { opacity: 1, scale: 1 },
    open: { opacity: 0, scale: 0 }
  };

  const bottomBarVariants = {
    closed: { rotate: 0, y: 0 },
    open: { rotate: -45, y: -6 }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.25, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 20 } 
    }
  };

  if (!state.isMobile) return null;

  return (
    <>
      {/* Floating Hamburger Toggle Button */}
      <button
        id="mobile-hamburger-btn"
        className="fixed top-6 right-6 z-[200] w-12 h-12 flex flex-col justify-center items-center gap-[4px] bg-[rgba(8,2,18,0.7)] backdrop-blur-md border border-accent-cyan/30 text-accent-cyan rounded-full cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.5),0_0_8px_rgba(56,189,248,0.2)] hover:border-accent-cyan hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-accent-cyan"
        onClick={toggleMenu}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <motion.span
          variants={topBarVariants}
          animate={isOpen ? 'open' : 'closed'}
          transition={{ duration: 0.2 }}
          className="w-5 h-[2px] bg-accent-cyan block rounded"
        />
        <motion.span
          variants={centerBarVariants}
          animate={isOpen ? 'open' : 'closed'}
          transition={{ duration: 0.2 }}
          className="w-5 h-[2px] bg-accent-cyan block rounded"
        />
        <motion.span
          variants={bottomBarVariants}
          animate={isOpen ? 'open' : 'closed'}
          transition={{ duration: 0.2 }}
          className="w-5 h-[2px] bg-accent-cyan block rounded"
        />
      </button>

      {/* Full-Screen Blurred Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mob-menu-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[190] w-full h-full bg-black/90 backdrop-blur-xl flex flex-col justify-center items-center px-6"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="absolute top-8 left-8 font-mono text-[0.62rem] text-accent-cyan tracking-widest">// NAV PROTOCOL STATUS: ACTIVE</div>
            
            <motion.nav
              variants={containerVariants}
              className="flex flex-col gap-4 w-full max-w-[340px] text-center"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = typeof item.target === 'number' && item.target === state.currentSection;
                return (
                  <motion.div key={item.label} variants={itemVariants}>
                    <Button
                      variant={isActive ? 'primary' : 'outline'}
                      className="w-full justify-start gap-4 py-4 px-6 text-sm"
                      onClick={() => handleClick(item.target)}
                      aria-label={`Go to ${item.label}`}
                    >
                      <span className="text-accent-cyan" aria-hidden="true">{item.icon}</span>
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 bg-accent-cyan shadow-[0_0_8px_#38BDF8] rounded-full" />
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </motion.nav>
            
            <div className="absolute bottom-8 text-[0.62rem] font-mono text-text-muted">
              RTR SPEED PROTOCOL v3.0
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
