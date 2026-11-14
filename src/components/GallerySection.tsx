'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ZoomIn } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const galleryItems = [
  { 
    id: 1, 
    src: '/foto-pasangan/DSC_0182.jpg', 
    alt: 'Pre-Wedding Asril & Sisi 1',
    tiltClass: 'taped-card-1',
    tapeLeft: '#D4C9BD', // Warm Linen (senada dengan warna site)
    tapeRight: '#BAADA0', // Soft Taupe Serein
  },
  { 
    id: 2, 
    src: '/foto-pasangan/DSC_0228-2.jpg', 
    alt: 'Pre-Wedding Asril & Sisi 2',
    tiltClass: 'taped-card-2',
    tapeLeft: '#BAADA0', 
    tapeRight: '#C8BEB3', // Champagne Sand
  },
  { 
    id: 3, 
    src: '/foto-pasangan/DSC_0242.jpg', 
    alt: 'Pre-Wedding Asril & Sisi 3',
    tiltClass: 'taped-card-3',
    tapeLeft: '#C8BEB3', 
    tapeRight: '#B5A698', // Muted Earthy Taupe
  },
  { 
    id: 4, 
    src: '/foto-pasangan/DSN_7764.jpg', 
    alt: 'Pre-Wedding Asril & Sisi 4',
    tiltClass: 'taped-card-4',
    tapeLeft: '#B5A698', 
    tapeRight: '#D4C9BD', 
  },
  { 
    id: 5, 
    src: '/foto-pasangan/DSN_7788.jpg', 
    alt: 'Pre-Wedding Asril & Sisi 5',
    tiltClass: 'taped-card-5',
    tapeLeft: '#D4C9BD', 
    tapeRight: '#BAADA0', 
  },
  { 
    id: 6, 
    src: '/foto-pasangan/foto-wanita.jpg', 
    alt: 'Pre-Wedding Asril & Sisi 6',
    tiltClass: 'taped-card-6',
    tapeLeft: '#BAADA0', 
    tapeRight: '#C8BEB3', 
  },
];

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openImage = (src: string) => {
    setSelectedImage(src);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gallery-modal-change', { detail: { isOpen: true } }));
      document.body.style.overflow = 'hidden';
    }
  };

  const closeImage = () => {
    setSelectedImage(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gallery-modal-change', { detail: { isOpen: false } }));
      document.body.style.overflow = 'unset';
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        closeImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  // Clean up body overflow and reset event on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.overflow = 'unset';
        window.dispatchEvent(new CustomEvent('gallery-modal-change', { detail: { isOpen: false } }));
      }
    };
  }, []);

  return (
    <section id="gallery" className="py-20 px-6 max-w-xl mx-auto space-y-10">
      <style>{`
        .photo-tape {
          box-shadow: 0 1px 3px rgba(74, 69, 63, 0.16);
          backdrop-filter: blur(0.5px);
          border-top: 1px solid rgba(255, 255, 255, 0.45);
          border-bottom: 1px solid rgba(74, 69, 63, 0.1);
        }

        .taped-card-1 { transform: rotate(-2.8deg); }
        .taped-card-2 { transform: rotate(2.5deg); }
        .taped-card-3 { transform: rotate(-1.9deg); }
        .taped-card-4 { transform: rotate(2.8deg); }
        .taped-card-5 { transform: rotate(-2.5deg); }
        .taped-card-6 { transform: rotate(1.8deg); }

        .taped-card {
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease;
        }

        .taped-card:hover {
          transform: rotate(0deg) scale(1.04) translateY(-4px) !important;
          z-index: 30 !important;
        }

        .taped-card:hover .taped-paper {
          box-shadow: 0 16px 32px rgba(44, 40, 37, 0.22) !important;
        }
      `}</style>

      <ScrollReveal animation="fade-up">
        <div className="text-center space-y-2">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#8C7B6B] font-medium">
            Momen Indah
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#2C2825] font-normal">
            Galeri Foto
          </h2>
          <div className="w-12 h-[1px] bg-[#C4BBB0] mx-auto mt-3" />
        </div>
      </ScrollReveal>

      {/* Gallery Grid: Gaya Foto Ditempel di Dinding dengan Selotip (Washi Tape) & Ritme Bertingkat */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 items-start px-1 sm:px-2 pt-2">
        {/* Kolom Kiri */}
        <div className="space-y-6 sm:space-y-8">
          {galleryItems.filter((_, i) => i % 2 === 0).map((item, idx) => (
            <ScrollReveal 
              key={item.id} 
              animation="zoom-in" 
              delay={idx * 160}
              duration={700}
            >
              <div
                onClick={() => openImage(item.src)}
                className={`taped-card ${item.tiltClass} group relative cursor-pointer select-none`}
              >
                {/* Selotip Kiri Atas */}
                <div 
                  className="photo-tape absolute -top-2.5 -left-2.5 sm:-top-3 sm:-left-3 w-8 sm:w-11 h-3.5 sm:h-4.5 z-20 pointer-events-none opacity-90"
                  style={{
                    backgroundColor: item.tapeLeft,
                    transform: 'rotate(-35deg)',
                  }}
                />

                {/* Selotip Kanan Atas */}
                <div 
                  className="photo-tape absolute -top-2.5 -right-2.5 sm:-top-3 sm:-right-3 w-8 sm:w-11 h-3.5 sm:h-4.5 z-20 pointer-events-none opacity-90"
                  style={{
                    backgroundColor: item.tapeRight,
                    transform: 'rotate(35deg)',
                  }}
                />

                {/* Bingkai Kertas Foto Putih (Photo Paper) */}
                <div className="taped-paper bg-white p-2 sm:p-2.5 pb-3 sm:pb-4 shadow-[0_6px_18px_rgba(44,40,37,0.13)] border border-[#E8E1D5] transition-all duration-300">
                  <div className="relative aspect-square w-full overflow-hidden bg-[#FAF8F5]">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-full object-cover rounded-none transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Hover Dark Overlay with Minimalist Zoom Icon */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="p-2.5 rounded-none bg-white/90 text-[#3A3530] shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <ZoomIn className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Kolom Kanan (Ritme Bertingkat / Staggered Offset Turun) */}
        <div className="space-y-6 sm:space-y-8 pt-8 sm:pt-12">
          {galleryItems.filter((_, i) => i % 2 !== 0).map((item, idx) => (
            <ScrollReveal 
              key={item.id} 
              animation="zoom-in" 
              delay={idx * 160 + 100}
              duration={700}
            >
              <div
                onClick={() => openImage(item.src)}
                className={`taped-card ${item.tiltClass} group relative cursor-pointer select-none`}
              >
                {/* Selotip Kiri Atas */}
                <div 
                  className="photo-tape absolute -top-2.5 -left-2.5 sm:-top-3 sm:-left-3 w-8 sm:w-11 h-3.5 sm:h-4.5 z-20 pointer-events-none opacity-90"
                  style={{
                    backgroundColor: item.tapeLeft,
                    transform: 'rotate(-35deg)',
                  }}
                />

                {/* Selotip Kanan Atas */}
                <div 
                  className="photo-tape absolute -top-2.5 -right-2.5 sm:-top-3 sm:-right-3 w-8 sm:w-11 h-3.5 sm:h-4.5 z-20 pointer-events-none opacity-90"
                  style={{
                    backgroundColor: item.tapeRight,
                    transform: 'rotate(35deg)',
                  }}
                />

                {/* Bingkai Kertas Foto Putih (Photo Paper) */}
                <div className="taped-paper bg-white p-2 sm:p-2.5 pb-3 sm:pb-4 shadow-[0_6px_18px_rgba(44,40,37,0.13)] border border-[#E8E1D5] transition-all duration-300">
                  <div className="relative aspect-square w-full overflow-hidden bg-[#FAF8F5]">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-full object-cover rounded-none transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Hover Dark Overlay with Minimalist Zoom Icon */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="p-2.5 rounded-none bg-white/90 text-[#3A3530] shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <ZoomIn className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <ScrollReveal animation="fade-up" delay={200}>
        <div className="text-center pt-2">
          <p className="text-xs text-[#8C7B6B] italic font-serif">
            &ldquo;Setiap detik yang kami lalui bersama adalah kenangan yang tak ternilai harganya.&rdquo;
          </p>
        </div>
      </ScrollReveal>

      {/* Lightbox Modal with Full-Screen Portal (100% Layar Penuh Meliputi Seluruh Layar Desktop & Mobile) */}
      {selectedImage && mounted && createPortal(
        <div 
          onClick={closeImage}
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in cursor-pointer select-none"
          role="dialog"
          aria-modal="true"
        >
          {/* Image Container with Safe Height */}
          <div 
            className="relative max-w-lg max-h-[75vh] sm:max-h-[78vh] w-full flex items-center justify-center"
          >
            <img
              src={selectedImage}
              alt="Preview Galeri"
              className="max-w-full max-h-[75vh] sm:max-h-[78vh] rounded-none object-contain shadow-2xl pointer-events-none"
            />
          </div>

          {/* User Hint - Diberikan jarak yang lega dan tidak dempet dengan foto */}
          <div className="pt-6 sm:pt-8 text-center pointer-events-none">
            <p className="text-xs sm:text-sm text-white/75 font-sans tracking-widest font-normal drop-shadow-md">
              Ketuk di mana saja untuk menutup
            </p>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
