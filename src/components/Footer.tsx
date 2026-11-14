'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck } from 'lucide-react';
import { useCouple } from '@/lib/context/CoupleContext';
import ScrollReveal from './ScrollReveal';

export default function Footer() {
  const { groom, bride } = useCouple();

  return (
    <footer className="relative py-16 px-6 border-t border-[#E5DFD6] text-center space-y-6 bg-[#F5F0E8] overflow-hidden">
      <div className="max-w-md mx-auto space-y-3">
        <ScrollReveal animation="fade-up" duration={700}>
          <Heart className="w-5 h-5 mx-auto text-[#A38C75] fill-[#A38C75]/20 animate-pulse mb-3" />

          <h3 className="text-2xl sm:text-3xl font-serif text-[#2C2825]">
            {groom.nickname} &amp; {bride.nickname}
          </h3>

          <p className="text-xs text-[#6B635B] italic leading-relaxed pt-2">
            Atas kehadiran dan doa restu Bapak/Ibu/Saudara/i sekalian, kami sekeluarga mengucapkan terima kasih yang tak terhingga.
          </p>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={180} duration={750}>
          <div className="pt-3 text-xs text-[#59524A] space-y-0.5">
            <p className="font-semibold text-[#2C2825]">Kami yang berbahagia:</p>
            <p>Keluarga Besar {groom.father} &amp; {groom.mother}</p>
            <p>Keluarga Besar {bride.father} &amp; {bride.mother}</p>
          </div>

          <div className="pt-3">
            <span className="inline-block px-3 py-1 rounded-full bg-[#EAE3D8] text-[#59524A] font-serif text-xs border border-[#DDD5C9] tracking-wider">
              #AnswerStoRILoveSI
            </span>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal animation="fade" delay={320} duration={800}>
        <div className="pt-8 flex flex-col items-center justify-between max-w-md mx-auto text-[10px] text-[#8C847B] border-t border-[#DDD6CC] gap-2">
          <p>&copy; 2026 Asril Rinaldi</p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-[#8C7B6B] hover:text-[#38332E] transition-colors"
          >
            <ShieldCheck className="w-3 h-3 text-[#A38C75]" />
            <span>Dashboard Pengantin</span>
          </Link>
        </div>
      </ScrollReveal>
    </footer>
  );
}
