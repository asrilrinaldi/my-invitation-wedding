'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FileText, Heart, Image as ImageIcon, Gift, MessageCircle } from 'lucide-react';

export default function FloatingNavbar() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const isClickScrollingRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navItems = [
    { id: 'hero', icon: FileText, label: 'Sampul' },
    { id: 'couple', icon: Heart, label: 'Mempelai' },
    { id: 'gallery', icon: ImageIcon, label: 'Galeri' },
    { id: 'gift', icon: Gift, label: 'Hadiah' },
    { id: 'wishes', icon: MessageCircle, label: 'Ucapan' },
  ];

  // Listen for Gallery Modal state to disable and hide navbar when viewing photos
  useEffect(() => {
    const handleGalleryModal = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOpen: boolean }>;
      if (customEvent && customEvent.detail) {
        setIsPhotoOpen(Boolean(customEvent.detail.isOpen));
      }
    };

    window.addEventListener('gallery-modal-change', handleGalleryModal);
    return () => {
      window.removeEventListener('gallery-modal-change', handleGalleryModal);
    };
  }, []);

  // ScrollSpy: Automatically highlights the icon based on current scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Don't override while smooth scrolling from a click or while photo modal is open
      if (isClickScrollingRef.current || isPhotoOpen) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // 1. If near the top, highlight 'hero'
      if (scrollY < 180) {
        setActiveSection('hero');
        return;
      }

      // 2. If scrolled near the bottom of the document, highlight the last item 'wishes'
      if (scrollY + windowHeight >= docHeight - 90) {
        setActiveSection('wishes');
        return;
      }

      // 3. Focal point for active section detection (around 38% down the screen)
      const targetPoint = windowHeight * 0.38;

      for (let i = navItems.length - 1; i >= 0; i--) {
        const item = navItems[i];
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= targetPoint && rect.bottom > 80) {
            setActiveSection(item.id);
            return;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, [isPhotoOpen]);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Disable clicks if photo is open
    if (isPhotoOpen) return;

    // Immediately highlight clicked section
    setActiveSection(id);

    // Lock ScrollSpy while smooth scrolling
    isClickScrollingRef.current = true;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 1100);

    const element = document.getElementById(id);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 16;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
    }
  };

  return (
    <div 
      className={`fixed bottom-5 left-0 right-0 lg:left-auto lg:right-0 lg:w-[42%] xl:w-[38%] z-40 flex justify-center items-center pointer-events-none transition-all duration-300 ease-in-out ${
        isPhotoOpen 
          ? 'opacity-0 translate-y-8 pointer-events-none scale-95' 
          : 'opacity-100 translate-y-0 scale-100'
      }`}
      aria-hidden={isPhotoOpen}
    >
      <nav 
        aria-label="Navigasi Undangan"
        className={`pointer-events-auto flex items-center gap-2 sm:gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#524B43]/95 backdrop-blur-md text-[#E8E3DC] shadow-2xl border border-white/20 transition-opacity duration-200 ${
          isPhotoOpen ? 'pointer-events-none' : ''
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={isPhotoOpen}
              onClick={(e) => scrollToSection(e, item.id)}
              aria-label={item.label}
              className={`p-2.5 sm:p-3 rounded-2xl transition-all duration-300 flex items-center justify-center select-none active:scale-95 ${
                isPhotoOpen
                  ? 'cursor-not-allowed opacity-40 pointer-events-none'
                  : 'cursor-pointer'
              } ${
                isActive 
                  ? 'bg-white text-[#38332E] shadow-md scale-105' 
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 pointer-events-none" />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
