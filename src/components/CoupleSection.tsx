'use client';

import React from 'react';
import { Instagram, Heart } from 'lucide-react';
import { useCouple } from '@/lib/context/CoupleContext';
import ScrollReveal from './ScrollReveal';

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
          <div className="w-12 h-[1px] bg-[#C4BBB0] mx-auto mt-3" />
        </div>
      </ScrollReveal>

      {/* Profiles */}
      <div className="space-y-10">
        {/* Groom */}
        <ScrollReveal animation="fade-up" delay={250} duration={800}>
          <div className="serein-card serein-card-hover rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center">
            <div className="relative w-40 h-40 mb-5 rounded-full p-1 bg-gradient-to-tr from-[#D1C7BA] via-[#EDE7DF] to-[#B3A697] shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#F0EBE3]">
                <img 
                  src={groom.photo} 
                  alt={groom.fullName} 
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
            <h3 className="text-2xl font-serif text-[#2C2825] font-semibold mb-1">
              {groom.fullName}
            </h3>
            <p className="text-xs uppercase tracking-widest text-[#8C7B6B] mb-3 font-medium">
              ( {groom.nickname} )
            </p>
            <div className="text-xs text-[#59524A] space-y-1 mb-5">
              <p className="text-[10px] text-[#8C847B] uppercase tracking-wider">Putra Tercinta dari:</p>
              <p className="font-serif text-sm text-[#38332E]">{groom.father}</p>
              <p className="text-[10px] text-[#8C847B]">&amp;</p>
              <p className="font-serif text-sm text-[#38332E]">{groom.mother}</p>
            </div>
            {groom.instagram && (
              <a
                href={`https://instagram.com/${groom.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-[#F2ECE3] text-[11px] text-[#59524A] border border-[#DDD6CC] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-[#8C7B6B]" />
                <span>@{groom.instagram}</span>
              </a>
            )}
          </div>
        </ScrollReveal>

        {/* Decorative Ampersand Connector */}
        <ScrollReveal animation="zoom-in" delay={300} duration={600}>
          <div className="flex items-center justify-center py-1">
            <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#DDD6CC] flex items-center justify-center text-base font-serif text-[#8C7B6B] shadow-sm">
              &amp;
            </div>
          </div>
        </ScrollReveal>

        {/* Bride */}
        <ScrollReveal animation="fade-up" delay={380} duration={800}>
          <div className="serein-card serein-card-hover rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center">
            <div className="relative w-40 h-40 mb-5 rounded-full p-1 bg-gradient-to-tr from-[#D1C7BA] via-[#EDE7DF] to-[#B3A697] shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#F0EBE3]">
                <img 
                  src={bride.photo} 
                  alt={bride.fullName} 
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
            <h3 className="text-2xl font-serif text-[#2C2825] font-semibold mb-1">
              {bride.fullName}
            </h3>
            <p className="text-xs uppercase tracking-widest text-[#8C7B6B] mb-3 font-medium">
              ( {bride.nickname} )
            </p>
            <div className="text-xs text-[#59524A] space-y-1 mb-5">
              <p className="text-[10px] text-[#8C847B] uppercase tracking-wider">Putri Tercinta dari:</p>
              <p className="font-serif text-sm text-[#38332E]">{bride.father}</p>
              <p className="text-[10px] text-[#8C847B]">&amp;</p>
              <p className="font-serif text-sm text-[#38332E]">{bride.mother}</p>
            </div>
            {bride.instagram && (
              <a
                href={`https://instagram.com/${bride.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-[#F2ECE3] text-[11px] text-[#59524A] border border-[#DDD6CC] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-[#8C7B6B]" />
                <span>@{bride.instagram}</span>
              </a>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
