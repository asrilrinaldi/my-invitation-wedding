'use client';

import React, { useEffect, useRef } from 'react';

interface GoldenDustParticle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  swayAngle: number;
  swaySpeed: number;
  swayRadius: number;
  baseOpacity: number;
  pulseSpeed: number;
  pulseAngle: number;
  color: string;
  glowRadius: number;
}

export default function FallingPetals() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Palet warna emas hangat & champagne elegan (senada dengan warna aksen website)
    const goldTones = [
      '#D4AF37', // Classic Wedding Gold
      '#E6C687', // Soft Champagne
      '#F3E5AB', // Warm Sunlight Amber
      '#C5A880', // Muted Earthy Taupe Gold
      '#F7E5C8', // Pale Golden Glow
    ];

    // Jumlah partikel sangat minimalis (8 di HP, 14 di Desktop) agar tidak mendistraksi
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const particleCount = isMobile ? 9 : 15;

    const particles: GoldenDustParticle[] = [];

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Inisialisasi butiran debu emas (disebar merata sejak awal)
    for (let i = 0; i < particleCount; i++) {
      const radius = isMobile ? 1.5 + Math.random() * 1.8 : 2.0 + Math.random() * 2.2;
      particles.push({
        x: Math.random() * (width || 400),
        y: Math.random() * (height || 800),
        radius,
        glowRadius: radius * (3.5 + Math.random() * 2.5), // Pendaran cahaya lembut
        speedY: 0.25 + Math.random() * 0.45,             // Melayang sangat lambat & tenang
        speedX: (Math.random() - 0.5) * 0.15,
        swayAngle: Math.random() * Math.PI * 2,
        swaySpeed: 0.012 + Math.random() * 0.015,
        swayRadius: 0.6 + Math.random() * 0.8,
        baseOpacity: 0.35 + Math.random() * 0.35,
        pulseSpeed: 0.02 + Math.random() * 0.03,        // Efek kerlap-kerlip lembut (twinkle)
        pulseAngle: Math.random() * Math.PI * 2,
        color: goldTones[i % goldTones.length],
      });
    }

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Fisika melayang tenang
        p.y += p.speedY;
        p.swayAngle += p.swaySpeed;
        p.x += Math.sin(p.swayAngle) * p.swayRadius + p.speedX;
        p.pulseAngle += p.pulseSpeed;

        // Wrap around layar
        if (p.y > height + 20) {
          p.y = -15;
          p.x = Math.random() * width;
        }
        if (p.x < -20) {
          p.x = width + 15;
        } else if (p.x > width + 20) {
          p.x = -15;
        }

        // Efek kedip cahaya halus (sinusoidal pulse)
        const pulse = 0.75 + Math.sin(p.pulseAngle) * 0.25;
        const currentOpacity = Math.max(0.15, Math.min(0.85, p.baseOpacity * pulse));

        // Gambar pendaran cahaya emas lembut (Soft Ambient Halo)
        ctx.save();
        const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glowRadius);
        radGrad.addColorStop(0, p.color);
        radGrad.addColorStop(0.4, p.color);
        radGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = radGrad;
        ctx.globalAlpha = currentOpacity * 0.65;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Inti titik emas yang bersinar lembut di tengah
        ctx.fillStyle = '#FFFDF5';
        ctx.globalAlpha = Math.min(1, currentOpacity * 1.2);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.55, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Hemat baterai saat tab tidak fokus
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        isRunning = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 lg:left-auto lg:right-0 lg:w-[42%] xl:w-[38%] w-full h-full pointer-events-none z-20 select-none"
      style={{ willChange: 'transform' }}
    />
  );
}
