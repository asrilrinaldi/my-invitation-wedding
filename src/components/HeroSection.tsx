'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { weddingConfig } from '@/lib/data';

export default function HeroSection() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date(weddingConfig.event.date).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
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
  }, []);

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(`The Wedding of ${weddingConfig.couple.groom.nickname} & ${weddingConfig.couple.bride.nickname}`);
    const details = encodeURIComponent(`Pernikahan ${weddingConfig.couple.groom.fullName} & ${weddingConfig.couple.bride.fullName}.\nLokasi: ${weddingConfig.event.address}`);
    const location = encodeURIComponent(weddingConfig.event.address);
    // 2027-06-20 08:00 WIB to 17:00 WIB -> UTC is 01:00 to 10:00 (WIB = UTC+7)
    const dates = '20270620T010000Z/20270620T100000Z';
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    window.open(gCalUrl, '_blank');
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-16 overflow-hidden">
      {/* Background Graphic / Overlay */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
        <img 
          src={weddingConfig.couple.heroPhoto || "/foto-pasangan/DSC_0228-2.jpg"} 
          alt="Wedding Background" 
          className="w-full h-full object-cover object-center filter blur-[1px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1012] via-[#0F1012]/60 to-[#0F1012]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        {/* Bismillah */}
        <p className="font-serif text-2xl sm:text-3xl text-gold-300 font-light tracking-widest opacity-90">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        <p className="text-xs uppercase tracking-[0.35em] text-gray-400 font-medium">
          WALIMATUL &apos;URSY • THE WEDDING OF
        </p>

        {/* Names */}
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-7xl font-serif text-gold-gradient font-bold tracking-tight">
            {weddingConfig.couple.groom.nickname} &amp; {weddingConfig.couple.bride.nickname}
          </h1>
          <p className="font-serif italic text-gold-200/80 text-lg sm:text-xl">
            {weddingConfig.couple.groom.fullName} &amp; {weddingConfig.couple.bride.fullName}
          </p>
        </div>

        {/* Date & Location Brief */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-gray-300 pt-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-gold-500/20 backdrop-blur-sm">
            <Calendar className="w-3.5 h-3.5 text-gold-400" />
            <span>{weddingConfig.event.displayDate}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-gold-500/20 backdrop-blur-sm">
            <MapPin className="w-3.5 h-3.5 text-gold-400" />
            <span>Bandar Lampung</span>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="pt-6">
          <p className="text-xs tracking-widest uppercase text-gold-400/90 mb-4 font-medium">
            Menghitung Hari Bahagia
          </p>
          <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
            {[
              { label: 'Hari', value: timeLeft.days },
              { label: 'Jam', value: timeLeft.hours },
              { label: 'Menit', value: timeLeft.minutes },
              { label: 'Detik', value: timeLeft.seconds },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="glass-card rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center border border-gold-500/20"
              >
                <span className="text-2xl sm:text-3xl font-bold font-serif text-gold-gradient">
                  {String(item.value).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider mt-1">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            onClick={handleAddToCalendar}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full glass-card hover:border-gold-400 text-gold-200 text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105"
          >
            <Calendar className="w-4 h-4 text-gold-400" />
            <span>Simpan ke Google Calendar</span>
          </button>
        </div>
      </div>
    </section>
  );
}
