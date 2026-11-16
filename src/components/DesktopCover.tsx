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
    <div 
      className="hidden lg:flex lg:w-[58%] xl:w-[62%] h-screen sticky top-0 flex-col items-center justify-center text-center bg-gradient-to-r from-[#F5F1EB] via-[#EDE8E1] to-[#E2DDD5] select-none overflow-hidden z-10"
      style={{
        backgroundImage: "url('/images/paper-grain.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '180px 180px',
      }}
    >
      {/* Smooth Gradient Transition to Right Section */}
      <div className="absolute right-0 top-0 bottom-0 w-32 xl:w-48 pointer-events-none bg-gradient-to-r from-transparent via-[#3A332C]/[0.04] to-[#3A332C]/[0.18] z-20" />
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

      {/* Clean Centered Typography with Logo Monogram */}
      <div className="relative z-10 px-8 space-y-3 max-w-lg">
        {/* The Wedding of - Smaller, Not Italic, No Shadow */}
        <p className="font-serif text-xs md:text-sm text-[#7A736B] tracking-[0.2em] uppercase font-normal not-italic">
          The Wedding of
        </p>

        {/* Logo Pengantin Monogram AS */}
        <div className="flex justify-center items-center py-1">
          <img
            src="/logo/logo.PNG"
            alt={`${groom.nickname} & ${bride.nickname}`}
            className="h-24 md:h-32 w-auto object-contain brightness-0 opacity-80 select-none pointer-events-none drop-shadow-sm"
          />
          <h1 className="sr-only">
            {groom.nickname} &amp; {bride.nickname}
          </h1>
        </div>
      </div>
    </div>
  );
}
