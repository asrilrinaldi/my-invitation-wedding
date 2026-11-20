'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QrCode, X, UserCheck, Download, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';
import { useCouple } from '@/lib/context/CoupleContext';

interface QrCodeButtonProps {
  guestName: string;
}

// Generate deterministic unique pass code from guest name
function generateGuestCode(name: string): string {
  let hash = 0;
  const str = (name || 'Tamu').trim().toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const codeNum = Math.abs(hash % 90000) + 10000;
  return `AS-${codeNum}`;
}

export default function QrCodeButton({ guestName }: QrCodeButtonProps) {
  const couple = useCouple();
  const [isOpen, setIsOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const finalName = guestName && guestName !== 'Tamu Undangan' ? guestName : 'Tamu Undangan';
  const guestCode = generateGuestCode(finalName);

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

  // Generate dynamic QR Code with central logo when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    const generateQR = async () => {
      try {
        const size = 320;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        // Structured payload for event reception attendance
        const payload = `WEDDING-PASS:ASRIL-SISI|TAMU:${finalName.toUpperCase()}|KODE:${guestCode}|STATUS:VIP`;

        // Generate QR code with High error correction (Level H: 30% recovery)
        await QRCode.toCanvas(canvas, payload, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: size,
          color: {
            dark: '#2C2825',
            light: '#FFFFFF',
          },
        });

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const cx = size / 2;
        const cy = size / 2;
        const badgeRadius = size * 0.13; // ~41.6px radius

        // Load the central dark monogram logo
        const logo = new window.Image();
        logo.crossOrigin = 'anonymous';
        logo.src = '/logo/logo-dark.png';

        const finishRendering = (hasLogoImage: boolean) => {
          if (!isMounted) return;

          ctx.save();
          // Draw clean circular white badge
          ctx.beginPath();
          ctx.arc(cx, cy, badgeRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          // Elegant gold ring border around center logo
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#C5A880';
          ctx.stroke();

          // Clip to circle for logo placement
          ctx.clip();

          if (hasLogoImage) {
            const logoPadding = badgeRadius * 0.22;
            const logoW = (badgeRadius - logoPadding) * 2;
            const logoH = logoW * (1193 / 1318);
            ctx.drawImage(
              logo,
              cx - logoW / 2,
              cy - logoH / 2,
              logoW,
              logoH
            );
          } else {
            // Monogram fallback
            ctx.fillStyle = '#701A24';
            ctx.font = 'bold 22px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('AS', cx, cy);
          }

          ctx.restore();

          const dataUrl = canvas.toDataURL('image/png');
          setQrDataUrl(dataUrl);
          setIsLoading(false);
        };

        logo.onload = () => finishRendering(true);
        logo.onerror = () => finishRendering(false);
      } catch (err) {
        console.error('Failed to generate QR Code:', err);
        setIsLoading(false);
      }
    };

    generateQR();

    return () => {
      isMounted = false;
    };
  }, [isOpen, finalName, guestCode]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR-Kehadiran-${finalName.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(guestCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      {/* Pinned Tab on Right Edge */}
      <button
        onClick={() => {
          if (isPhotoOpen) return;
          setIsOpen(true);
        }}
        disabled={isPhotoOpen}
        aria-label="Tampilkan QR Code Kehadiran"
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
          QR PASS
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
            className="relative max-w-sm w-full bg-[#FAF8F5] rounded-3xl p-6 sm:p-7 text-center border border-[#E3DCD3] shadow-2xl space-y-4 animate-fade-in-up"
            style={{
              backgroundImage: "url('/images/paper-grain.png')",
              backgroundRepeat: 'repeat',
              backgroundSize: '180px 180px',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/5 hover:bg-black/10 text-[#6B635B] transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badge Icon */}
            <div className="w-11 h-11 rounded-full bg-[#701A24]/10 text-[#701A24] mx-auto flex items-center justify-center border border-[#701A24]/20 shadow-sm">
              <UserCheck className="w-5 h-5" />
            </div>

            {/* Title & Guest Info */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#8C7B6B] font-medium">
                Digital Attendance Pass
              </p>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2C2825] mt-1">
                {finalName}
              </h3>
              <p className="text-xs text-[#701A24] font-medium mt-0.5">
                Pernikahan {couple.groom.nickname} &amp; {couple.bride.nickname}
              </p>
            </div>

            {/* QR Code Box with Central Monogram Logo */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E0D9D0] inline-block shadow-md mx-auto relative">
              {isLoading ? (
                <div className="w-48 h-48 sm:w-52 sm:h-52 flex flex-col items-center justify-center space-y-2">
                  <div className="w-8 h-8 border-2 border-[#701A24] border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] text-[#8C7B6B]">Membuat QR Code...</p>
                </div>
              ) : qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="QR Code Kehadiran Tamu"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain select-none"
                />
              ) : null}

              {/* Verified Ribbon / Badge */}
              <div className="mt-2 pt-2 border-t border-[#F0EBE3] flex items-center justify-between text-[10px] text-[#8C7B6B] font-mono">
                <span>KODE TAMU:</span>
                <span className="font-bold text-[#2C2825] tracking-wider">{guestCode}</span>
              </div>
            </div>

            {/* Instruction Box */}
            <div className="bg-[#EFEAE2] rounded-xl p-3 text-[11px] text-[#635B53] space-y-0.5">
              <p className="font-semibold text-[#38332E]">Tunjukkan di Meja Registrasi</p>
              <p className="text-[10.5px]">Petugas akan memindai QR code ini untuk konfirmasi kehadiran Anda.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              {/* Download Pass Button */}
              <button
                onClick={handleDownload}
                disabled={!qrDataUrl}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-[#701A24] hover:bg-[#58141C] text-white text-xs font-medium tracking-wide transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Simpan Gambar</span>
              </button>

              {/* Copy Code Button */}
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-[#EAE4DC] hover:bg-[#DDD5CB] text-[#38332E] text-xs font-medium transition-all active:scale-95"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
