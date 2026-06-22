import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { CinematicCamera } from '../three/Camera.js';
import { Environment } from '../three/Environment.js';
import { bus } from '../contexts/EventBus.js';

// Post-processing imports
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export default function ThreeScene({ quality, currentSection, scrollPercent, reducedMotion }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cineCamRef = useRef(null);
  const environmentRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const elapsedTimeRef = useRef(0);

  // Raycasting and postprocessing refs
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const hoveredMeshRef = useRef(null);
  const composerRef = useRef(null);
  const bloomPassRef = useRef(null);

  const animate = useCallback(() => {
    animFrameRef.current = requestAnimationFrame(animate);
    const now = performance.now();
    const delta = Math.min((now - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = now;
    elapsedTimeRef.current += delta;

    if (!reducedMotion) {
      cineCamRef.current?.update(delta, quality);
      const camZ = cineCamRef.current ? cineCamRef.current.camera.position.z : 12;
      environmentRef.current?.update(delta, camZ);
    }

    if (composerRef.current) {
      composerRef.current.render();
    } else {
      rendererRef.current?.render(sceneRef.current, cineCamRef.current?.camera);
    }
  }, [quality, reducedMotion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const q = quality;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04010a, 0.045);
    scene.background = new THREE.Color(0x04010a);
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({
      antialias: q !== 'low',
      alpha: false,
      powerPreference: q === 'low' ? 'low-power' : 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(q === 'low' ? 1.0 : Math.min(window.devicePixelRatio, q === 'medium' ? 1.5 : 2.0));
    renderer.setClearColor(0x04010a, 1);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const cineCam = new CinematicCamera(renderer);
    cineCamRef.current = cineCam;

    const environment = new Environment(scene, q);
    environmentRef.current = environment;

    // Post processing setup
    const enableBloom = (q === 'ultra' || q === 'high');
    if (enableBloom) {
      const renderPass = new RenderPass(scene, cineCam.camera);
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        q === 'ultra' ? 1.25 : 0.8,
        0.4,
        0.18
      );
      const composer = new EffectComposer(renderer);
      composer.addPass(renderPass);
      composer.addPass(bloomPass);
      composerRef.current = composer;
      bloomPassRef.current = bloomPass;
    } else {
      composerRef.current = null;
      bloomPassRef.current = null;
    }

    // Raycasting Event Handlers
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (!sceneRef.current || !cineCamRef.current || !environmentRef.current) return;

      raycasterRef.current.setFromCamera(mouseRef.current, cineCamRef.current.camera);
      const intersects = raycasterRef.current.intersectObjects(environmentRef.current.interactiveMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hoveredMeshRef.current !== hit) {
          clearHover();
          hoveredMeshRef.current = hit;
          if (hit.material) {
            hit.userData.originalColor = hit.material.color.getHex();
            hit.material.color.setHex(0xffffff); // glow white
          }
          document.body.style.cursor = 'pointer';
          const cursor = document.getElementById('custom-cursor');
          const follower = document.getElementById('custom-cursor-follower');
          if (cursor) {
            cursor.style.width = '24px';
            cursor.style.height = '24px';
            cursor.style.backgroundColor = 'rgba(0, 229, 255, 0.35)';
          }
          if (follower) {
            follower.style.borderColor = '#ffffff';
            follower.style.borderRadius = '50%';
          }
          bus.emit('audio:hover');
        }
      } else {
        clearHover();
      }
    };

    const clearHover = () => {
      if (hoveredMeshRef.current) {
        const hit = hoveredMeshRef.current;
        if (hit.material && hit.userData.originalColor !== undefined) {
          hit.material.color.setHex(hit.userData.originalColor);
        }
        hoveredMeshRef.current = null;
        document.body.style.cursor = 'default';
        const cursor = document.getElementById('custom-cursor');
        const follower = document.getElementById('custom-cursor-follower');
        if (cursor) {
          cursor.style.width = '10px';
          cursor.style.height = '10px';
          cursor.style.backgroundColor = '#ffffff';
        }
        if (follower) {
          follower.style.borderColor = '#00e5ff';
          follower.style.borderRadius = '0';
        }
      }
    };

    const handleClick = () => {
      if (hoveredMeshRef.current) {
        const action = hoveredMeshRef.current.userData.action;
        if (action) {
          bus.emit('audio:click');
          if (action.startsWith('modal-')) {
            bus.emit('modal:open', action);
          } else if (action === 'focus-contact') {
            const sc = document.getElementById('scroll-container');
            const target = document.getElementById('sec-5');
            if (target && sc) {
              sc.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
            }
            setTimeout(() => {
              const input = document.getElementById('form-name');
              input?.focus();
            }, 600);
          }
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      if (composerRef.current) {
        composerRef.current.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
      } else {
        if (!animFrameRef.current) {
          lastTimeRef.current = performance.now();
          animFrameRef.current = requestAnimationFrame(animate);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    animFrameRef.current = requestAnimationFrame(animate);

    const handleQuality = (newQ) => {
      renderer.setPixelRatio(newQ === 'low' ? 1.0 : Math.min(window.devicePixelRatio, newQ === 'medium' ? 1.5 : 2.0));
      const enable = (newQ === 'ultra' || newQ === 'high');
      if (enable) {
        const renderPass = new RenderPass(sceneRef.current, cineCamRef.current.camera);
        const newBloom = new UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          newQ === 'ultra' ? 1.25 : 0.8,
          0.4,
          0.18
        );
        const newComposer = new EffectComposer(rendererRef.current);
        newComposer.addPass(renderPass);
        newComposer.addPass(newBloom);
        composerRef.current = newComposer;
        bloomPassRef.current = newBloom;
      } else {
        composerRef.current = null;
        bloomPassRef.current = null;
      }
    };
    const unsubQuality = bus.on('graphics:quality-changed', handleQuality);

    const unsubSection = bus.on('section:change', () => {
      const activeQ = quality;
      if (cineCamRef.current && activeQ !== 'low' && activeQ !== 'battery-saver') {
        cineCamRef.current.shake(0.08, 0.25);
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      unsubQuality();
      unsubSection();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [quality, animate]);

  useEffect(() => {
    if (cineCamRef.current && scrollPercent !== undefined) {
      cineCamRef.current.setScrollPercent(scrollPercent);
    }
  }, [scrollPercent]);

  return <div ref={containerRef} className="fixed top-0 left-0 w-screen h-screen z-[1] pointer-events-none" aria-hidden="true" />;
}
