'use client';

import React, { useState, useEffect, useRef } from 'react';
import { loveStories } from '@/lib/data';
import ScrollReveal from './ScrollReveal';
import SectionDivider from './SectionDivider';

export default function LoveStorySection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const firstDotRef = useRef<HTMLDivElement | null>(null);
  const lastDotRef = useRef<HTMLDivElement | null>(null);
  const [lineHeight, setLineHeight] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);

  // Hitung jarak presisi dari pusat dot pertama sampai pusat dot terakhir
  const updateLineHeight = () => {
    if (firstDotRef.current && lastDotRef.current) {
      const firstRect = firstDotRef.current.getBoundingClientRect();
      const lastRect = lastDotRef.current.getBoundingClientRect();
      const height = lastRect.top - firstRect.top;
      if (height > 0) {
        setLineHeight(height);
      }
    }
  };

  useEffect(() => {
    // Jalankan kalkulasi saat mount dan saat resize
    updateLineHeight();
    const timeout = setTimeout(updateLineHeight, 200);

    const handleResize = () => updateLineHeight();
    window.addEventListener('resize', handleResize, { passive: true });

    // IntersectionObserver untuk memicu animasi saat bagian Kisah Kami terlihat
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setTimeout(updateLineHeight, 150);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-6 max-w-xl mx-auto space-y-10">
      <style>{`
        @keyframes journeyTravel {
          0% {
            top: 0%;
            transform: translateY(-50%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            transform: translateY(-50%);
            opacity: 0;
          }
        }

        .journey-runner {
          animation: journeyTravel 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          will-change: top, transform, opacity;
        }

        .journey-head {
          animation: journeyTravel 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          will-change: top, transform, opacity;
        }
      `}</style>

      <ScrollReveal animation="fade-up">
        <div className="text-center space-y-2">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#8C7B6B] font-medium">
            Perjalanan Cinta
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#2C2825] font-normal">
            Kisah Kami
          </h2>
          <SectionDivider />
        </div>
      </ScrollReveal>

      {/* Timeline Wrapper Container */}
      <div className="relative ml-4 sm:ml-8 space-y-8 pl-6 sm:pl-8">
        {/* Garis Perjalanan dari Dot Awal Sampai Dot Akhir */}
        <div 
          className="absolute -left-[1px] top-[14px] w-[2px] pointer-events-none"
          style={{ height: lineHeight > 0 ? `${lineHeight}px` : 'calc(100% - 90px)' }}
        >
          {/* 1. Track Garis Dasar (Statis & Lembut) */}
          <div className="w-full h-full bg-[#E5DFD7] rounded-full" />

          {/* 2. Garis Aktif Bertumbuh Mengalir saat Masuk Layar */}
          <div 
            className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#8C7B6B] via-[#B39B82] to-[#8C7B6B] rounded-full transition-all duration-1000 ease-out"
            style={{ height: isVisible ? '100%' : '0%' }}
          />

          {/* 3. Cahaya Perjalanan yang Berjalan Terus Menerus dari Dot Awal ke Dot Akhir */}
          {isVisible && (
            <>
              {/* Berkas Cahaya / Beam Trail */}
              <div className="journey-runner absolute -left-[3px] w-[8px] h-20 rounded-full bg-gradient-to-b from-transparent via-[#8C7B6B] to-transparent shadow-[0_0_12px_rgba(140,123,107,0.7)] pointer-events-none" />

              {/* Titik Cahaya Inti yang Bergerak Memimpin Jalur */}
              <div className="journey-head absolute -left-[2px] w-[6px] h-[6px] rounded-full bg-[#59524A] border border-white shadow-[0_0_8px_rgba(140,123,107,0.9)] pointer-events-none" />
            </>
          )}

          {/* Ornamen Daun Halus di Sisi Garis Timeline (Sesuai Referensi) */}
          <div className="absolute -left-[18px] top-[30%] opacity-50 pointer-events-none text-[#E8CCD0] select-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2 C16 4, 20 9, 18 16 C16 21, 10 22, 6 18 C2 14, 3 8, 8 4 Z" />
            </svg>
          </div>
          <div className="absolute -left-[18px] top-[75%] opacity-50 pointer-events-none text-[#E8CCD0] select-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2 C16 4, 20 9, 18 16 C16 21, 10 22, 6 18 C2 14, 3 8, 8 4 Z" />
            </svg>
          </div>
        </div>

        {/* Daftar Cerita & Milestone Timeline */}
        {loveStories.map((story, index) => (
          <ScrollReveal 
            key={index} 
            animation="fade-up" 
            delay={index * 160}
            duration={700}
          >
            <div className="relative">
              {/* Timeline Dot (Terhubung ke Ref untuk Mengukur Jarak Presisi) */}
              <div 
                ref={index === 0 ? firstDotRef : index === loveStories.length - 1 ? lastDotRef : undefined}
                className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-[#FAF8F5] border-2 border-[#8C7B6B] flex items-center justify-center z-10 shadow-sm"
              >
                {/* Titik Inti */}
                <div className="w-1.5 h-1.5 rounded-full bg-[#8C7B6B]" />

                {/* Gelombang Animasi Denyut (Pulse) saat Cahaya Perjalanan Melewatinya */}
                {isVisible && (
                  <div 
                    className="absolute inset-0 rounded-full bg-[#8C7B6B]/35 animate-ping pointer-events-none"
                    style={{
                      animationDuration: '3.6s',
                      animationDelay: `${index * 1.2}s`,
                      animationIterationCount: 'infinite',
                    }}
                  />
                )}
              </div>

              {/* Year Tag */}
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EBE5DC] text-[#59524A] font-serif font-bold text-xs mb-2 shadow-xs">
                {story.year}
              </span>

              {/* Content Card */}
              <div className="serein-card serein-card-hover rounded-2xl p-5 space-y-1.5">
                <h3 className="text-base font-serif font-semibold text-[#2C2825]">
                  {story.title}
                </h3>
                <p className="text-xs text-[#59524A] leading-relaxed">
                  {story.description}
                </p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
