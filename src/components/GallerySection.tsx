'use client';

import React, { useState, useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';
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

      {/* Lightbox Modal with Elevated z-index */}
      {selectedImage && (
        <div 
          onClick={closeImage}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <button 
            type="button"
            onClick={closeImage}
            aria-label="Tutup Foto"
            className="absolute top-6 right-6 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer active:scale-95 shadow-md"
          >
            <X className="w-6 h-6" />
          </button>
          <div 
            className="relative max-w-lg max-h-[85vh] w-full flex items-center justify-center" 
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Preview Galeri"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl select-none"
            />
          </div>
        </div>
      )}
    </section>
  );
}
