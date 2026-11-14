'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Navigation, ExternalLink, MapPin, Copy, Check } from 'lucide-react';
import { weddingConfig } from '@/lib/data';
import { useCouple } from '@/lib/context/CoupleContext';
import ScrollReveal from './ScrollReveal';

export default function EventSection() {
  const { event } = weddingConfig;
  const couple = useCouple();
  const [copied, setCopied] = useState(false);

  // Background photo mengikuti foto header/sampul pengantin
  const heroPhoto = couple.heroPhoto || weddingConfig.couple.heroPhoto || '/foto-pasangan/DSC_0228-2.jpg';

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(event.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const embedUrl = event.gmapsEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(event.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="event" className="relative py-24 px-6 overflow-hidden">
      {/* Background Photo mengikuti Foto Header/Sampul */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src={heroPhoto} 
          alt="Latar Belakang Rangkaian Acara" 
          className="w-full h-full object-cover object-[center_30%]"
        />
        {/* Soft translucent overlay agar foto terlihat jelas namun teks tetap mudah dibaca */}
        <div className="absolute inset-0 bg-[#FAF8F5]/80 backdrop-blur-[2px]" />
        
        {/* Top & bottom gradient blend ke section atas dan bawah */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#FAF8F5] via-[#FAF8F5]/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/80 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-xl mx-auto space-y-10">
        <ScrollReveal animation="fade-up">
          <div className="text-center space-y-2">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#8C7B6B] font-medium">
              Waktu &amp; Tempat
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#2C2825] font-normal">
              Rangkaian Acara
            </h2>
            <div className="w-12 h-[1px] bg-[#C4BBB0] mx-auto mt-3" />
          </div>
        </ScrollReveal>

        <div className="space-y-6">
          {/* Akad Nikah - Transparan Frosted Glass Card */}
          <ScrollReveal animation="fade-up" delay={150}>
            <div className="bg-white/75 hover:bg-white/85 backdrop-blur-md rounded-3xl p-6 sm:p-8 text-center space-y-4 border border-white/70 shadow-[0_8px_30px_rgba(74,69,63,0.08)] hover:shadow-xl transition-all duration-300">
              <div className="w-11 h-11 rounded-full bg-white/90 text-[#8C7B6B] border border-white/80 shadow-sm mx-auto flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-[#2C2825]">
                Akad Nikah
              </h3>
              <div className="space-y-2 text-xs text-[#59524A] pt-1">
                <div className="flex items-center justify-center gap-2 font-medium text-[#38332E]">
                  <Calendar className="w-4 h-4 text-[#8C7B6B]" />
                  <span>{event.displayDate}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-[#8C7B6B]" />
                  <span>{event.akadTime}</span>
                </div>
                <div className="text-[11px] text-[#7A7167] pt-2">
                  <p className="font-semibold text-[#2C2825]">{event.locationName}</p>
                  <p>{event.address}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Resepsi - Transparan Frosted Glass Card */}
          <ScrollReveal animation="fade-up" delay={250}>
            <div className="bg-white/75 hover:bg-white/85 backdrop-blur-md rounded-3xl p-6 sm:p-8 text-center space-y-4 border border-white/70 shadow-[0_8px_30px_rgba(74,69,63,0.08)] hover:shadow-xl transition-all duration-300">
              <div className="w-11 h-11 rounded-full bg-white/90 text-[#8C7B6B] border border-white/80 shadow-sm mx-auto flex items-center justify-center">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-[#2C2825]">
                Resepsi Pernikahan
              </h3>
              <div className="space-y-2 text-xs text-[#59524A] pt-1">
                <div className="flex items-center justify-center gap-2 font-medium text-[#38332E]">
                  <Calendar className="w-4 h-4 text-[#8C7B6B]" />
                  <span>{event.displayDate}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-[#8C7B6B]" />
                  <span>{event.resepsiTime}</span>
                </div>
                <div className="text-[11px] text-[#7A7167] pt-2">
                  <p className="font-semibold text-[#2C2825]">{event.locationName}</p>
                  <p>{event.address}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Google Maps Section - Transparan Frosted Glass Card */}
        <ScrollReveal animation="fade-up" delay={350}>
          <div className="bg-white/80 hover:bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 space-y-5 text-center border border-white/70 shadow-[0_8px_30px_rgba(74,69,63,0.08)] transition-all duration-300">
            {/* Header & Location Details */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-white/80 shadow-sm text-[10px] tracking-wider uppercase text-[#8C7B6B] font-medium">
                <MapPin className="w-3 h-3 text-[#8C7B6B]" />
                <span>Petunjuk Lokasi</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-serif font-semibold text-[#2C2825]">
                {event.locationName}
              </h4>
              <p className="text-xs text-[#6B635B] leading-relaxed max-w-md mx-auto">
                {event.address}
              </p>
            </div>

            {/* Interactive Google Maps Frame */}
            <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-[#E0D8CE] shadow-sm bg-[#FAF8F5]">
              <iframe
                src={embedUrl}
                title={`Peta Lokasi - ${event.locationName}`}
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Action Buttons: Buka Google Maps & Salin Alamat */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <a
                href={event.gmapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#4A453F] hover:bg-[#38332E] text-white font-medium text-xs tracking-wider uppercase transition-all shadow-md hover:scale-[1.02] active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Buka Google Maps</span>
                <ExternalLink className="w-3 h-3 text-white/70" />
              </a>

              <button
                type="button"
                onClick={handleCopyAddress}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/90 hover:bg-white border border-[#D9D0C5] text-[#4A453F] font-medium text-xs tracking-wider uppercase transition-all shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Alamat Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#8C7B6B]" />
                    <span>Salin Alamat</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
