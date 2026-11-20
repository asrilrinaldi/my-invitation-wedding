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

interface LilyPetalParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  flutterAngle: number;
  flutterSpeed: number;
  opacity: number;
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

    const goldTones = [
      '#D4AF37', // Classic Wedding Gold
      '#E6C687', // Soft Champagne
      '#F3E5AB', // Warm Sunlight Amber
      '#C5A880', // Muted Earthy Taupe Gold
    ];

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const dustCount = isMobile ? 8 : 14;
    const petalCount = isMobile ? 4 : 7; // Gentle, luxury non-intrusive count

    const dustParticles: GoldenDustParticle[] = [];
    const lilyPetals: LilyPetalParticle[] = [];

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

    // Initialize Golden Dust
    for (let i = 0; i < dustCount; i++) {
      const radius = isMobile ? 1.5 + Math.random() * 1.5 : 2.0 + Math.random() * 2.0;
      dustParticles.push({
        x: Math.random() * (width || 400),
        y: Math.random() * (height || 800),
        radius,
        glowRadius: radius * (3.0 + Math.random() * 2.0),
        speedY: 0.2 + Math.random() * 0.35,
        speedX: (Math.random() - 0.5) * 0.12,
        swayAngle: Math.random() * Math.PI * 2,
        swaySpeed: 0.012 + Math.random() * 0.015,
        swayRadius: 0.5 + Math.random() * 0.7,
        baseOpacity: 0.3 + Math.random() * 0.35,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseAngle: Math.random() * Math.PI * 2,
        color: goldTones[i % goldTones.length],
      });
    }

    // Initialize Floating Lily Petals
    for (let i = 0; i < petalCount; i++) {
      const size = isMobile ? 12 + Math.random() * 8 : 16 + Math.random() * 10;
      lilyPetals.push({
        x: Math.random() * (width || 400),
        y: Math.random() * (height || 800),
        size,
        speedY: 0.35 + Math.random() * 0.45,
        speedX: (Math.random() - 0.5) * 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.012,
        flutterAngle: Math.random() * Math.PI * 2,
        flutterSpeed: 0.018 + Math.random() * 0.022,
        opacity: 0.35 + Math.random() * 0.25,
      });
    }

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, width, height);

      // 1. Render Golden Dust Motes
      for (let i = 0; i < dustParticles.length; i++) {
        const p = dustParticles[i];

        p.y += p.speedY;
        p.swayAngle += p.swaySpeed;
        p.x += Math.sin(p.swayAngle) * p.swayRadius + p.speedX;
        p.pulseAngle += p.pulseSpeed;

        if (p.y > height + 20) {
          p.y = -15;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 15;
        else if (p.x > width + 20) p.x = -15;

        const pulse = 0.75 + Math.sin(p.pulseAngle) * 0.25;
        const currentOpacity = Math.max(0.12, Math.min(0.8, p.baseOpacity * pulse));

        ctx.save();
        const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glowRadius);
        radGrad.addColorStop(0, p.color);
        radGrad.addColorStop(0.4, p.color);
        radGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = radGrad;
        ctx.globalAlpha = currentOpacity * 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFDF5';
        ctx.globalAlpha = Math.min(1, currentOpacity * 1.1);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Render Floating Translucent White Lily Petals
      for (let i = 0; i < lilyPetals.length; i++) {
        const lp = lilyPetals[i];

        lp.y += lp.speedY;
        lp.flutterAngle += lp.flutterSpeed;
        lp.rotation += lp.rotationSpeed;
        lp.x += Math.sin(lp.flutterAngle * 0.8) * 0.6 + lp.speedX;

        if (lp.y > height + 30) {
          lp.y = -25;
          lp.x = Math.random() * width;
        }
        if (lp.x < -30) lp.x = width + 20;
        else if (lp.x > width + 30) lp.x = -20;

        ctx.save();
        ctx.translate(lp.x, lp.y);
        ctx.rotate(lp.rotation);

        // Perspective 3D folding effect
        const scaleX = Math.cos(lp.flutterAngle);
        ctx.scale(scaleX, 1);

        // Draw organic curved lily petal
        ctx.beginPath();
        ctx.moveTo(0, -lp.size);
        ctx.bezierCurveTo(lp.size * 0.65, -lp.size * 0.5, lp.size * 0.55, lp.size * 0.5, 0, lp.size);
        ctx.bezierCurveTo(-lp.size * 0.55, lp.size * 0.5, -lp.size * 0.65, -lp.size * 0.5, 0, -lp.size);
        ctx.closePath();

        // Soft White-Champagne Petal Gradient
        const pGrad = ctx.createLinearGradient(0, -lp.size, 0, lp.size);
        pGrad.addColorStop(0, 'rgba(255, 255, 252, 0.72)');
        pGrad.addColorStop(0.55, 'rgba(252, 248, 242, 0.52)');
        pGrad.addColorStop(1, 'rgba(238, 226, 206, 0.38)');

        ctx.fillStyle = pGrad;
        ctx.globalAlpha = lp.opacity;
        ctx.fill();

        // Subtle Lily Central Vein
        ctx.beginPath();
        ctx.moveTo(0, -lp.size * 0.8);
        ctx.quadraticCurveTo(lp.size * 0.08, 0, 0, lp.size * 0.85);
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.28)';
        ctx.lineWidth = 0.6;
        ctx.stroke();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

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
      className="fixed inset-0 w-full h-full pointer-events-none z-25 select-none"
      style={{ mixBlendMode: 'normal' }}
      aria-hidden="true"
    />
  );
}
