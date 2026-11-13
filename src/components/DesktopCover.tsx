'use client';

import React from 'react';
import { useCouple } from '@/lib/context/CoupleContext';

export default function DesktopCover() {
  const { groom, bride } = useCouple();

  // Rich organic particle set matching the dust/star motes in reference
  const particles = [
    { top: '12%', left: '18%', size: 4, type: 'particle-1', delay: '0s' },
    { top: '22%', left: '72%', size: 5, type: 'particle-2', delay: '1.2s' },
    { top: '32%', left: '28%', size: 3, type: 'particle-3', delay: '2.5s' },
    { top: '42%', left: '82%', size: 7, type: 'particle-glow', delay: '0.8s', glow: true },
    { top: '55%', left: '16%', size: 4, type: 'particle-1', delay: '3.1s' },
    { top: '65%', left: '76%', size: 8, type: 'particle-glow', delay: '1.9s', glow: true },
    { top: '75%', left: '35%', size: 3, type: 'particle-2', delay: '2.2s' },
    { top: '18%', left: '88%', size: 6, type: 'particle-3', delay: '0.5s' },
    { top: '82%', left: '65%', size: 5, type: 'particle-1', delay: '1.5s' },
    { top: '48%', left: '12%', size: 3, type: 'particle-2', delay: '4.0s' },
    { top: '28%', left: '45%', size: 4, type: 'particle-3', delay: '1.8s' },
    { top: '68%', left: '48%', size: 7, type: 'particle-glow', delay: '2.7s', glow: true },
  ];

  return (
    <div className="hidden lg:flex lg:w-[58%] xl:w-[62%] h-screen sticky top-0 flex-col items-center justify-center text-center bg-[#EDE8E1] select-none overflow-hidden border-r border-[#E2DDD5] z-10">
      {/* Dynamic Floating Particles */}
      {particles.map((p, idx) => (
        <div
          key={idx}
          className={`absolute rounded-full pointer-events-none ${p.type} ${
            p.glow ? 'bg-[#D4AF37]' : 'bg-[#736B63]'
          }`}
          style={{
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* Clean Centered Typography without bold, smaller size, no date or city */}
      <div className="relative z-10 px-8 space-y-2 max-w-lg">
        {/* The Wedding of - Smaller, Not Italic, No Shadow */}
        <p className="font-serif text-xs md:text-sm text-[#7A736B] tracking-[0.2em] uppercase font-normal not-italic">
          The Wedding of
        </p>

        {/* Couple Names - Smaller, Not Bold */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#2E2925] tracking-tight font-normal leading-tight">
          {groom.nickname} &amp; {bride.nickname}
        </h1>
      </div>
    </div>
  );
}
