'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ZoomIn } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const galleryItems = [
  { id: 1, src: '/foto-pasangan/DSC_0182.jpg', alt: 'Pre-Wedding Asril & Sisi 1' },
  { id: 2, src: '/foto-pasangan/DSC_0228-2.jpg', alt: 'Pre-Wedding Asril & Sisi 2' },
  { id: 3, src: '/foto-pasangan/DSC_0242.jpg', alt: 'Pre-Wedding Asril & Sisi 3' },
  { id: 4, src: '/foto-pasangan/DSN_7764.jpg', alt: 'Pre-Wedding Asril & Sisi 4' },
  { id: 5, src: '/foto-pasangan/DSN_7788.jpg', alt: 'Pre-Wedding Asril & Sisi 5' },
  { id: 6, src: '/foto-pasangan/foto-wanita.jpg', alt: 'Pre-Wedding Asril & Sisi 6' },
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

      {/* Gallery Grid with staggered zoom-in reveals */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {galleryItems.map((item, idx) => (
          <ScrollReveal 
            key={item.id} 
            animation="zoom-in" 
            delay={(idx % 2) * 140 + Math.floor(idx / 2) * 80}
            duration={700}
          >
            <div
              onClick={() => openImage(item.src)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl serein-card aspect-[4/5] transition-all duration-300 hover:shadow-lg"
            >
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="p-2 rounded-full bg-white/90 text-[#3A3530]">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal animation="fade-up" delay={200}>
        <div className="text-center">
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
              className="max-w-full max-h-[75vh] sm:max-h-[78vh] rounded-2xl object-contain shadow-2xl pointer-events-none"
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
