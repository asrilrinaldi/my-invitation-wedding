'use client';

import React, { useEffect, useRef } from 'react';

interface PetalParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  swayAngle: number;
  swaySpeed: number;
  swayRadius: number;
  rotation: number;
  rotationSpeed: number;
  flipAngle: number;
  flipSpeed: number;
  color: string;
  opacity: number;
  shapeType: number; // 0: classic rose, 1: fluttering petal, 2: slender petal
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

    // Palette warna kelopak bunga romantis (soft blush, rose, peach & champagne)
    const petalColors = [
      '#F8D7DA', // Soft blush pink
      '#F4CCD1', // Delicate rose
      '#F7E5DE', // Warm peach
      '#FAF2EA', // Champagne ivory
      '#ECC5CB', // Romantic cherry blossom
      '#F9EBEA', // Pale rose petal
    ];

    // Responsive: Pada layar HP/mobile kurangi jumlah kelopak (12-14 kelopak) agar ultra-ringan 60 FPS
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const petalCount = isMobile ? 13 : 22;

    const petals: PetalParticle[] = [];

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance
      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Inisialisasi posisi kelopak (disebar di seluruh layar sejak awal)
    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * (width || 400),
        y: Math.random() * (height || 800), // Sudah tersebar merata saat undangan dibuka
        size: isMobile ? 12 + Math.random() * 8 : 14 + Math.random() * 10,
        speedY: isMobile ? 0.7 + Math.random() * 0.9 : 0.8 + Math.random() * 1.1, // Gerak jatuh santai & anggun
        speedX: (Math.random() - 0.5) * 0.4,
        swayAngle: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.025,
        swayRadius: isMobile ? 1.0 + Math.random() * 1.2 : 1.3 + Math.random() * 1.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        flipAngle: Math.random() * Math.PI * 2,
        flipSpeed: 0.025 + Math.random() * 0.035, // Efek berputar 3D tertiup angin
        color: petalColors[i % petalColors.length],
        opacity: 0.7 + Math.random() * 0.22,
        shapeType: i % 3,
      });
    }

    // Fungsi menggambar kelopak bunga berbasis kurva Bezier murni (tanpa DOM/SVG filter)
    const drawPetal = (p: PetalParticle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      // Skala horizontal mengikuti cosinus untuk efek 3D flip (berputar di udara)
      const flipScale = Math.cos(p.flipAngle);
      ctx.scale(flipScale, 1);

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;

      ctx.beginPath();
      const s = p.size;

      if (p.shapeType === 0) {
        // Kelopak mawar klasik
        ctx.moveTo(0, -s * 0.7);
        ctx.bezierCurveTo(s * 0.6, -s * 0.7, s * 0.8, s * 0.3, 0, s);
        ctx.bezierCurveTo(-s * 0.8, s * 0.3, -s * 0.6, -s * 0.7, 0, -s * 0.7);
      } else if (p.shapeType === 1) {
        // Kelopak melengkung asimetris
        ctx.moveTo(-s * 0.3, -s * 0.6);
        ctx.bezierCurveTo(s * 0.7, -s * 0.5, s * 0.9, s * 0.5, 0, s * 0.9);
        ctx.bezierCurveTo(-s * 0.7, s * 0.6, -s * 0.8, -s * 0.1, -s * 0.3, -s * 0.6);
      } else {
        // Kelopak ramping berujung lancip halus
        ctx.moveTo(0, -s * 0.8);
        ctx.bezierCurveTo(s * 0.45, -s * 0.4, s * 0.55, s * 0.4, 0, s * 0.9);
        ctx.bezierCurveTo(-s * 0.55, s * 0.4, -s * 0.45, -s * 0.4, 0, -s * 0.8);
      }

      ctx.fill();

      // Garis urat kelopak halus (sangat lembut)
      ctx.strokeStyle = '#E8A7B0';
      ctx.lineWidth = 0.6;
      ctx.globalAlpha = p.opacity * 0.35;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.5);
      ctx.lineTo(0, s * 0.6);
      ctx.stroke();

      ctx.restore();
    };

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        // Update fisika kelopak
        p.y += p.speedY;
        p.swayAngle += p.swaySpeed;
        p.x += Math.sin(p.swayAngle) * p.swayRadius + p.speedX;
        p.rotation += p.rotationSpeed;
        p.flipAngle += p.flipSpeed;

        // Jika keluar dari layar bawah, munculkan kembali dari atas
        if (p.y > height + 25) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        // Jika melayang keluar dari sisi kiri atau kanan
        if (p.x < -30) {
          p.x = width + 20;
        } else if (p.x > width + 30) {
          p.x = -20;
        }

        drawPetal(p);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Pause animasi saat tab tidak aktif untuk hemat baterai & memori
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
