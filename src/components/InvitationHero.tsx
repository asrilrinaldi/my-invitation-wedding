'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { weddingConfig } from '@/lib/data';
import { useCouple } from '@/lib/context/CoupleContext';
import { useEvent } from '@/lib/context/EventContext';

interface InvitationHeroProps {
  guestName: string;
  isUnlocked: boolean;
  onOpenInvitation: () => void;
  isVerified?: boolean;
}

const slidePhotos = [
  '/foto-pasangan/DSC_0228-2.jpg',
  '/foto-pasangan/DSC_0182.jpg',
  '/foto-pasangan/DSN_7764.jpg',
  '/foto-pasangan/DSN_7788.jpg',
  '/foto-pasangan/DSC_0242.jpg',
];

export default function InvitationHero({ 
  guestName, 
  isUnlocked, 
  onOpenInvitation,
  isVerified = false,
}: InvitationHeroProps) {
  const couple = useCouple();
  const event = useEvent();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Auto-Slideshow effect changing photos smoothly every 4.5 seconds
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidePhotos.length);
    }, 4500);
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    const targetDate = new Date(event.date).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0 || isNaN(targetDate)) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [event.date]);

  const handleOpen = () => {
    try {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      confetti({
        particleCount: isMobile ? 40 : 65,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#D4AF37', '#FAF8F5', '#F8D7DA', '#ECC5CB', '#C5A880', '#F7E5DE'],
        disableForReducedMotion: true,
      });
    } catch (e) {
      // ignore confetti errors
    }
    onOpenInvitation();
  };

  return (
    <section 
      id="hero"
      className="relative w-full h-[100dvh] min-h-[100dvh] flex flex-col justify-end text-center overflow-hidden bg-[#B5AAA0] select-none"
    >
      {/* Background Auto-Slideshow with Smooth Crossfade & Ken Burns Zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {slidePhotos.map((photo, idx) => (
          <img
            key={idx}
            src={photo}
            alt={`Foto Pasangan Asril & Sisi ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover object-[center_15%] sm:object-[center_20%] transition-all duration-1000 ease-in-out ${
              idx === currentSlide 
                ? 'opacity-100 scale-105' 
                : 'opacity-0 scale-100 pointer-events-none'
            }`}
          />
        ))}

        {/* Gradient overlays blending smoothly into the warm taupe/sepia lower background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent via-40% to-[#B5AAA0] to-80% pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#B5AAA0] via-[#B5AAA0]/85 to-transparent pointer-events-none" />
      </div>

      {/* Content Stack - Elevated with generous bottom padding so it never crowds the navbar */}
      <div className="relative z-10 px-6 pb-28 sm:pb-36 pt-16 max-w-sm sm:max-w-md mx-auto w-full space-y-3 sm:space-y-3.5">
        {/* The Wedding of - Smaller, Not Italic, No Shadow */}
        <p className="font-serif text-[11px] sm:text-xs text-white/90 tracking-[0.2em] uppercase font-normal not-italic">
          The Wedding of
        </p>

        {/* Logo Pengantin Monogram AS */}
        <div className="flex justify-center items-center py-1">
          <img
            src="/logo/logo.PNG"
            alt={`${couple.groom.nickname} & ${couple.bride.nickname}`}
            className="h-20 sm:h-24 w-auto object-contain drop-shadow-md select-none pointer-events-none"
          />
          <h1 className="sr-only">
            {couple.groom.nickname} &amp; {couple.bride.nickname}
          </h1>
        </div>

        {/* Date (2 lines) - Smaller size, elegant sans-serif, dynamically loaded */}
        <div className="text-[10px] sm:text-[11px] text-white/85 font-light tracking-[0.15em] uppercase space-y-0.5 font-sans">
          {event.displayDate ? (
            event.displayDate.includes(',') ? (
              <>
                <p>{event.displayDate.split(',')[0].trim()}</p>
                <p>{event.displayDate.split(',').slice(1).join(',').trim()}</p>
              </>
            ) : (
              <p>{event.displayDate}</p>
            )
          ) : (
            <>
              <p>Minggu</p>
              <p>20 Juni 2027</p>
            </>
          )}
        </div>

        {/* Before click: "Buka Undangan" Button with Breathing Animation */}
        {!isUnlocked ? (
          <div className="space-y-4 pt-2 animate-fade-in-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
            {/* Recipient info - Not Bold, No Shadow */}
            <div className="space-y-0.5 text-white">
              <p className="text-[10px] sm:text-[11px] font-light text-white/80 font-sans flex items-center justify-center gap-1.5">
                <span>Kepada:</span>
                {isVerified && (
                  <span className="inline-flex items-center text-[9px] bg-emerald-500/25 text-emerald-100 border border-emerald-400/30 px-1.5 py-0.5 rounded-full">
                    ✓ Terdaftar
                  </span>
                )}
              </p>
              <p className="font-serif text-sm sm:text-base font-normal tracking-wide">
                {guestName || 'Tamu Undangan'}
              </p>
            </div>

            {/* Buka Undangan Button - With Smooth Breathing (Mengecil & Membesar) Animation */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpen}
                className="group inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#4A453F]/95 hover:bg-[#38332E] text-white text-xs font-normal tracking-wider shadow-lg transition-all duration-300 animate-breathe cursor-pointer active:scale-95"
              >
                <img 
                  src="/icon/love-letter.png" 
                  alt="Ikon Undangan" 
                  className="w-4 h-4 object-contain brightness-0 invert group-hover:-translate-y-0.5 transition-transform select-none pointer-events-none"
                />
                <span>Buka Undangan</span>
              </button>
            </div>
          </div>
        ) : (
          /* After click: Countdown Timer & Recipient (Staggered Entrance Animation) */
          <div className="space-y-3 sm:space-y-4 pt-1">
            {/* 4 Countdown Circles Glass - Staggered fade in up */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 max-w-[280px] sm:max-w-[310px] mx-auto">
              {[
                { label: 'Hari', value: timeLeft.days },
                { label: 'Jam', value: timeLeft.hours },
                { label: 'Menit', value: timeLeft.minutes },
                { label: 'Detik', value: timeLeft.seconds },
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col items-center animate-fade-in-up"
                  style={{ animationDelay: `${idx * 90 + 80}ms`, animationFillMode: 'both' }}
                >
                  {/* Frosted Glass Circle Coin */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/70 backdrop-blur-md border border-white/50 shadow-[0_4px_14px_rgba(44,40,37,0.14)] flex items-center justify-center transition-all duration-300 hover:scale-105 hover:bg-white/80">
                    <span className="block font-sans text-base sm:text-lg font-bold text-[#2E2824] leading-none tracking-tight">
                      {String(item.value).padStart(2, '0')}
                    </span>
                  </div>
                  {/* Label below circle */}
                  <span className="block text-[9.5px] sm:text-[10px] text-white/95 font-sans font-medium tracking-widest uppercase mt-1.5 drop-shadow-sm">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Recipient info below countdown - Not Bold, No Shadow */}
            <div 
              className="space-y-0.5 text-white pt-1 animate-fade-in-up"
              style={{ animationDelay: '450ms', animationFillMode: 'both' }}
            >
              <p className="text-[10px] sm:text-[11px] font-light text-white/85 font-sans flex items-center justify-center gap-1.5">
                <span>Kepada:</span>
                {isVerified && (
                  <span className="inline-flex items-center text-[9px] bg-emerald-500/25 text-emerald-100 border border-emerald-400/30 px-1.5 py-0.5 rounded-full">
                    ✓ Terdaftar
                  </span>
                )}
              </p>
              <p className="font-serif text-sm sm:text-base font-normal tracking-wide">
                {guestName || 'Tamu Undangan'}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
