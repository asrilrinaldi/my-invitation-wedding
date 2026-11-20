'use client';

import React from 'react';
import { Instagram, Heart } from 'lucide-react';
import { useCouple } from '@/lib/context/CoupleContext';
import ScrollReveal from './ScrollReveal';
import SectionDivider from './SectionDivider';

export default function CoupleSection() {
  const { groom, bride } = useCouple();

  return (
    <section id="couple" className="py-20 px-6 max-w-xl mx-auto text-center space-y-12">
      {/* Quranic Verse */}
      <ScrollReveal animation="fade-up" duration={700}>
        <div className="serein-card rounded-3xl p-6 sm:p-8 space-y-3">
          <Heart className="w-5 h-5 mx-auto text-[#A38C75] fill-[#A38C75]/20" />
          <p className="text-xs sm:text-sm font-serif italic text-[#59524A] leading-relaxed">
            &ldquo;Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.&rdquo;
          </p>
          <p className="text-[10px] tracking-widest uppercase text-[#8C7B6B] font-semibold">
            (QS. Ar-Rum: 21)
          </p>
        </div>
      </ScrollReveal>

      {/* Header */}
      <ScrollReveal animation="fade-up" delay={150} duration={700}>
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#8C7B6B] font-medium">
            Mempelai Yang Berbahagia
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#2C2825] font-normal">
            Pengantin
          </h2>
          <SectionDivider />
        </div>
      </ScrollReveal>

      {/* Profiles */}
      <div className="space-y-12">
        {/* Groom */}
        <ScrollReveal animation="fade-up" delay={250} duration={800}>
          <div className="group serein-card serein-card-hover rounded-3xl px-1.5 pt-4 pb-8 sm:px-3 sm:pt-6 sm:pb-9 flex flex-col items-center text-center relative overflow-hidden">
            {/* Maximized Arch Frame Approaching Card Boundaries */}
            <div className="relative w-full max-w-[440px] aspect-[896/1005] mb-3 sm:mb-4 mx-auto flex items-center justify-center">
              {/* Photo Layer - Masked into the smooth rounded dome arch contour */}
              <div 
                className="absolute inset-0 z-10 overflow-hidden"
                style={{
                  zIndex: 10,
                  WebkitMaskImage: "url('/images/floral-arch-rounded-mask.png?v=9')",
                  maskImage: "url('/images/floral-arch-rounded-mask.png?v=9')",
                  WebkitMaskSize: "100% 100%",
                  maskSize: "100% 100%",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                }}
              >
                <img 
                  src={groom.photo} 
                  alt={groom.fullName} 
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* 1. Base Arch Frame Line (Delicate Wine Hairline Contour) */}
              <div 
                className="absolute inset-0 z-20 pointer-events-none select-none"
                style={{ zIndex: 20 }}
              >
                <img 
                  src="/images/bunga-arch-clean.png?v=9" 
                  alt="Arch Frame" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* 2. Bunga Kiri & Top Arch Garland (Lush cluster, slow organic sway - ON TOP OF PHOTO) */}
              <div 
                className="absolute inset-0 z-30 pointer-events-none select-none animate-floral-left"
                style={{ 
                  zIndex: 30,
                  filter: "drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.38)) drop-shadow(0px 10px 22px rgba(0, 0, 0, 0.22))"
                }}
              >
                <img 
                  src="/images/bunga-kiri.png?v=9" 
                  alt="Bunga Kiri & Top Arch" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* 3. Bunga Kanan Border (Slender vine, ZERO GAP, dynamic breeze flutter - ON TOP OF PHOTO) */}
              <div 
                className="absolute inset-0 z-30 pointer-events-none select-none animate-floral-right"
                style={{ 
                  zIndex: 30,
                  filter: "drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.38)) drop-shadow(0px 10px 22px rgba(0, 0, 0, 0.22))"
                }}
              >
                <img 
                  src="/images/bunga-kanan.png?v=9" 
                  alt="Bunga Kanan Border" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Profile Info Below Photo (With generous clearance for flowers) */}
            <div className="pt-1 space-y-2">
              <h3 className="text-xl sm:text-2xl font-serif text-[#2C2825] font-bold tracking-[0.12em] uppercase">
                {groom.fullName}
              </h3>
              
              <div className="text-xs sm:text-[13px] text-[#59524A] font-serif leading-relaxed max-w-xs mx-auto">
                <p className="text-[10px] text-[#8C847B] uppercase tracking-[0.2em] font-sans font-medium mb-1">
                  Putra Tercinta dari:
                </p>
                <p className="font-semibold text-[#38332E]">
                  {groom.father} &amp; {groom.mother}
                </p>
              </div>

              {groom.instagram && (
                <div className="pt-3">
                  <a
                    href={`https://instagram.com/${groom.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#701A24] hover:bg-[#58141C] text-white text-xs tracking-wider transition-all shadow-md active:scale-95"
                  >
                    <Instagram className="w-3.5 h-3.5 text-white/90" />
                    <span>@{groom.instagram}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Decorative Ampersand Connector */}
        <ScrollReveal animation="zoom-in" delay={300} duration={600}>
          <div className="flex items-center justify-center py-1">
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#DDD6CC] flex items-center justify-center text-lg font-serif text-[#8C7B6B] shadow-sm">
              &amp;
            </div>
          </div>
        </ScrollReveal>

        {/* Bride */}
        <ScrollReveal animation="fade-up" delay={380} duration={800}>
          <div className="group serein-card serein-card-hover rounded-3xl px-1.5 pt-4 pb-8 sm:px-3 sm:pt-6 sm:pb-9 flex flex-col items-center text-center relative overflow-hidden">
            {/* Maximized Arch Frame Approaching Card Boundaries */}
            <div className="relative w-full max-w-[440px] aspect-[896/1005] mb-3 sm:mb-4 mx-auto flex items-center justify-center">
              {/* Photo Layer - Masked into the smooth rounded dome arch contour */}
              <div 
                className="absolute inset-0 z-10 overflow-hidden"
                style={{
                  zIndex: 10,
                  WebkitMaskImage: "url('/images/floral-arch-rounded-mask.png?v=9')",
                  maskImage: "url('/images/floral-arch-rounded-mask.png?v=9')",
                  WebkitMaskSize: "100% 100%",
                  maskSize: "100% 100%",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                }}
              >
                <img 
                  src={bride.photo} 
                  alt={bride.fullName} 
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* 1. Base Arch Frame Line (Delicate Wine Hairline Contour) */}
              <div 
                className="absolute inset-0 z-20 pointer-events-none select-none"
                style={{ zIndex: 20 }}
              >
                <img 
                  src="/images/bunga-arch-clean.png?v=9" 
                  alt="Arch Frame" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* 2. Bunga Kiri & Top Arch Garland (Lush cluster, slow organic sway - ON TOP OF PHOTO) */}
              <div 
                className="absolute inset-0 z-30 pointer-events-none select-none animate-floral-left"
                style={{ 
                  zIndex: 30,
                  filter: "drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.38)) drop-shadow(0px 10px 22px rgba(0, 0, 0, 0.22))"
                }}
              >
                <img 
                  src="/images/bunga-kiri.png?v=9" 
                  alt="Bunga Kiri & Top Arch" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* 3. Bunga Kanan Border (Slender vine, ZERO GAP, dynamic breeze flutter - ON TOP OF PHOTO) */}
              <div 
                className="absolute inset-0 z-30 pointer-events-none select-none animate-floral-right"
                style={{ 
                  zIndex: 30,
                  filter: "drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.38)) drop-shadow(0px 10px 22px rgba(0, 0, 0, 0.22))"
                }}
              >
                <img 
                  src="/images/bunga-kanan.png?v=9" 
                  alt="Bunga Kanan Border" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Profile Info Below Photo (With generous clearance for flowers) */}
            <div className="pt-1 space-y-2">
              <h3 className="text-xl sm:text-2xl font-serif text-[#2C2825] font-bold tracking-[0.12em] uppercase">
                {bride.fullName}
              </h3>
              
              <div className="text-xs sm:text-[13px] text-[#59524A] font-serif leading-relaxed max-w-xs mx-auto">
                <p className="text-[10px] text-[#8C847B] uppercase tracking-[0.2em] font-sans font-medium mb-1">
                  Putri Tercinta dari:
                </p>
                <p className="font-semibold text-[#38332E]">
                  {bride.father} &amp; {bride.mother}
                </p>
              </div>

              {bride.instagram && (
                <div className="pt-3">
                  <a
                    href={`https://instagram.com/${bride.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#701A24] hover:bg-[#58141C] text-white text-xs tracking-wider transition-all shadow-md active:scale-95"
                  >
                    <Instagram className="w-3.5 h-3.5 text-white/90" />
                    <span>@{bride.instagram}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
