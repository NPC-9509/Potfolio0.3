import React, { useEffect, useRef, useCallback } from 'react';
import { bus } from '../contexts/EventBus.js';
import { useApp } from '../contexts/AppContext.jsx';

export default function ModalManager({ modals }) {
  const { state, updateState } = useApp();
  const lastFocusedRef = useRef(null);

  const openModal = useCallback((modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    lastFocusedRef.current = document.activeElement;
    updateState('modalOpen', modalId);
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    const sc = document.getElementById('scroll-container');
    if (sc) sc.style.overflowY = 'hidden';
    const firstFocusable = modal.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) setTimeout(() => firstFocusable.focus(), 50);
    bus.emit('audio:click');

    const openedSet = new Set(state.openedModals);
    openedSet.add(modalId);
    if (openedSet.size >= 4) bus.emit('achievement:unlock', 'code-archaeology');
  }, [updateState, state.openedModals]);

  const closeModal = useCallback((modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    updateState('modalOpen', null);
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    const sc = document.getElementById('scroll-container');
    if (sc) sc.style.overflowY = 'auto';
    if (lastFocusedRef.current) { lastFocusedRef.current.focus(); lastFocusedRef.current = null; }
    bus.emit('audio:click');
  }, [updateState]);

  useEffect(() => {
    bus.on('modal:open', openModal);
    bus.on('modal:close', closeModal);
    return () => {
      bus.off('modal:open', openModal);
      bus.off('modal:close', closeModal);
    };
  }, [openModal, closeModal]);

  useEffect(() => {
    const escHandler = (e) => {
      if (e.key === 'Escape' && state.modalOpen) {
        closeModal(state.modalOpen);
      }
    };
    window.addEventListener('keydown', escHandler);
    return () => window.removeEventListener('keydown', escHandler);
  }, [state.modalOpen, closeModal]);

  useEffect(() => {
    const backdropHandler = (e) => {
      if (e.target.classList.contains('comic-detail-modal') && state.modalOpen) {
        closeModal(state.modalOpen);
      }
    };
    document.querySelectorAll('.comic-detail-modal').forEach(m => {
      m.addEventListener('click', backdropHandler);
    });
    return () => {
      document.querySelectorAll('.comic-detail-modal').forEach(m => {
        m.removeEventListener('click', backdropHandler);
      });
    };
  }, [state.modalOpen, closeModal]);

  return <>{modals}</>;
}
