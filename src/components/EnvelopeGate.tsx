'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { MailOpen, Heart, Sparkles } from 'lucide-react';
import { weddingConfig } from '@/lib/data';

interface EnvelopeGateProps {
  guestName: string;
  onOpen: () => void;
}

export default function EnvelopeGate({ guestName, onOpen }: EnvelopeGateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleOpenInvitation = () => {
    setIsAnimating(true);
    
    // Shoot celebratory gold confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F5E8D2', '#C5A880', '#FFFFFF'],
      });
    } catch (e) {
      // Ignore if confetti fails
    }

    setTimeout(() => {
      setIsOpen(true);
      onOpen();
    }, 800);
  };

  if (isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-[#141518] via-[#1c1a1f] to-[#0d0e10] transition-all duration-1000 ${
        isAnimating ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Decorative Rings */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-25">
        <div className="w-[600px] h-[600px] rounded-full border border-gold-500/30 animate-pulse-subtle" />
        <div className="absolute w-[450px] h-[450px] rounded-full border border-gold-400/20" />
        <div className="absolute w-[300px] h-[300px] rounded-full border border-gold-300/10" />
      </div>

      <div className="relative max-w-md w-full glass-card rounded-3xl p-8 sm:p-10 text-center shadow-2xl border border-gold-500/30">
        {/* Top Ornament */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-gold-400/80" />
          <Heart className="w-4 h-4 text-gold-400 animate-pulse fill-gold-400" />
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-gold-400/80" />
        </div>

        <p className="text-xs uppercase tracking-[0.3em] text-gold-300 font-light mb-2">
          The Wedding Celebration of
        </p>

        {/* Couple Names */}
        <h1 className="text-4xl sm:text-5xl font-serif tracking-wider text-gold-gradient font-bold mb-6">
          {weddingConfig.couple.groom.nickname} &amp; {weddingConfig.couple.bride.nickname}
        </h1>

        {/* Decorative Wax Seal Card */}
        <div className="relative mx-auto my-6 w-36 h-36 rounded-full p-[2px] bg-gradient-to-tr from-gold-600 via-gold-300 to-gold-700 shadow-xl shadow-gold-500/10">
          <div className="w-full h-full rounded-full overflow-hidden bg-[#17181c] relative flex flex-col items-center justify-center p-2 border border-gold-500/20">
            <img 
              src={weddingConfig.couple.heroPhoto || "/foto-pasangan/DSC_0228-2.jpg"} 
              alt="Asril & Sisi" 
              className="absolute inset-0 w-full h-full object-cover filter brightness-75"
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
            <span className="relative z-10 font-serif text-3xl font-light text-gold-200 tracking-widest drop-shadow-md">
              A &amp; S
            </span>
            <span className="relative z-10 text-[10px] tracking-[0.25em] text-gold-300 uppercase mt-1 drop-shadow-md">
              20.06.2027
            </span>
          </div>
        </div>

        {/* Recipient Box */}
        <div className="bg-black/40 rounded-2xl p-4 sm:p-5 border border-gold-500/20 mb-6 backdrop-blur-sm">
          <p className="text-xs text-gray-400 tracking-wider uppercase mb-1">
            Kepada Yth. Bapak/Ibu/Saudara/i:
          </p>
          <p className="text-lg sm:text-xl font-semibold text-gold-200 tracking-wide font-serif break-words">
            {guestName || 'Tamu Undangan'}
          </p>
          <p className="text-[11px] text-gray-400/80 mt-1 italic">
            *Mohon maaf apabila ada kesalahan penulisan nama/gelar
          </p>
        </div>

        {/* Open Button */}
        <button
          onClick={handleOpenInvitation}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-gold-gradient text-black font-semibold text-sm tracking-widest uppercase transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/30 hover:scale-105 active:scale-95"
        >
          <MailOpen className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
          <span>Buka Undangan</span>
          <Sparkles className="w-4 h-4 text-black/70 animate-pulse" />
        </button>
      </div>
    </div>
  );
}
