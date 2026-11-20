'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Camera } from 'lucide-react';
import { useCouple } from '@/lib/context/CoupleContext';
import ScrollReveal from './ScrollReveal';
import SectionDivider from './SectionDivider';

export default function Footer() {
  const { groom, bride } = useCouple();

  return (
    <footer className="relative py-16 px-6 border-t border-[#E5DFD6] text-center space-y-6 bg-[#F5F0E8] overflow-hidden">
      {/* Botanical Lily Watermark Accent */}
      <div className="absolute -bottom-10 right-4 w-48 pointer-events-none opacity-[0.10] select-none">
        <img
          src="/images/lily-desktop-corner.png"
          alt="Lily Footer Accent"
          className="w-full h-auto object-contain"
        />
      </div>
      <div className="max-w-md mx-auto space-y-3">
        <ScrollReveal animation="fade-up" duration={700}>
          {/* Logo Monogram AS sebagai Signature Seal Penutup */}
          <div className="flex justify-center items-center mb-3">
            <img
              src="/logo/logo.PNG"
              alt={`${groom.nickname} & ${bride.nickname}`}
              className="h-20 sm:h-24 w-auto object-contain brightness-0 opacity-80 select-none pointer-events-none drop-shadow-sm transition-transform duration-500 hover:scale-105"
            />
          </div>

          <SectionDivider className="my-3 opacity-70" />

          <p className="text-xs text-[#6B635B] italic leading-relaxed pt-1">
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
        <div className="pt-8 flex flex-col items-center justify-between max-w-md mx-auto text-[10px] text-[#8C847B] border-t border-[#DDD6CC] gap-2.5">
          <p>&copy; 2026 Asril Rinaldi</p>
          <div className="flex items-center gap-3">
            <Link
              href="/scan"
              className="inline-flex items-center gap-1 text-[#8C7B6B] hover:text-[#38332E] transition-colors"
            >
              <Camera className="w-3 h-3 text-[#A38C75]" />
              <span>Scan QR Tamu</span>
            </Link>
            <span className="text-[#C4BBB0]">•</span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-[#8C7B6B] hover:text-[#38332E] transition-colors"
            >
              <ShieldCheck className="w-3 h-3 text-[#A38C75]" />
              <span>Dashboard Pengantin</span>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </footer>
  );
}
