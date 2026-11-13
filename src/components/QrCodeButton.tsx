'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, X, UserCheck } from 'lucide-react';
import { useCouple } from '@/lib/context/CoupleContext';

interface QrCodeButtonProps {
  guestName: string;
}

export default function QrCodeButton({ guestName }: QrCodeButtonProps) {
  const couple = useCouple();
  const [isOpen, setIsOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);

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

  return (
    <>
      {/* Pinned Tab on Right Edge matching Image 3 */}
      <button
        onClick={() => {
          if (isPhotoOpen) return;
          setIsOpen(true);
        }}
        disabled={isPhotoOpen}
        aria-label="Tampilkan QR Code"
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-white text-[#3A3530] border-l border-y border-[#DDD6CC] shadow-md px-1.5 py-3 rounded-l-lg flex flex-col items-center gap-1.5 transition-all duration-300 group ${
          isPhotoOpen 
            ? 'opacity-0 translate-x-full pointer-events-none' 
            : 'opacity-100 translate-x-0 cursor-pointer hover:bg-[#FAF8F5] hover:pl-2.5'
        }`}
      >
        <QrCode className="w-3.5 h-3.5 text-[#635B53] group-hover:scale-110 transition-transform" />
        <span 
          className="text-[9px] font-bold tracking-widest text-[#5C554D] uppercase select-none leading-none"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          QR CODE
        </span>
      </button>

      {/* QR Code Modal */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm w-full bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 text-center border border-[#E3DCD3] shadow-2xl space-y-4 animate-fade-in-up"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/5 hover:bg-black/10 text-[#6B635B] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-[#4A453F]/10 text-[#4A453F] mx-auto flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-widest text-[#857C73] font-medium">
                Digital Guest Pass
              </p>
              <h3 className="text-xl font-serif font-bold text-[#2C2825] mt-1">
                {guestName || 'Tamu Undangan'}
              </h3>
              <p className="text-xs text-[#736B63] mt-0.5">
                Pernikahan {couple.groom.nickname} &amp; {couple.bride.nickname}
              </p>
            </div>

            {/* QR Code Box */}
            <div className="bg-white p-4 rounded-2xl border border-[#E0D9D0] inline-block shadow-inner mx-auto">
              <img 
                src="/images/qris-template.svg" 
                alt="QR Code Tamu"
                className="w-48 h-48 object-contain"
              />
            </div>

            <div className="bg-[#EFEAE2] rounded-xl p-3 text-[11px] text-[#635B53] space-y-1">
              <p className="font-semibold text-[#38332E]">Tunjukkan QR Code ini di Meja Registrasi</p>
              <p>Petugas akan memindai kode ini untuk konfirmasi kehadiran Anda.</p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 rounded-full bg-[#4A453F] hover:bg-[#38332E] text-white text-xs font-semibold tracking-wider uppercase transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
