'use client';

import React, { useState } from 'react';
import { Gift, Copy, Check, QrCode, X, Download, CreditCard, Building2 } from 'lucide-react';
import { weddingConfig } from '@/lib/data';
import { useEvent } from '@/lib/context/EventContext';
import ScrollReveal from './ScrollReveal';
import SectionDivider from './SectionDivider';

type GiftTab = 'bank' | 'qris' | 'gift';

export default function GiftSection() {
  const [activeTab, setActiveTab] = useState<GiftTab>('bank');
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showQrisModal, setShowQrisModal] = useState(false);
  const { bank } = weddingConfig;
  const event = useEvent();

  const handleCopyBank = () => {
    navigator.clipboard.writeText(bank.accountNumber);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(event.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  return (
    <section id="gift" className="py-20 px-6 max-w-xl mx-auto space-y-8">
      <ScrollReveal animation="fade-up" duration={700}>
        <div className="text-center space-y-2">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#8C7B6B] font-medium">
            Tanda Kasih
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#2C2825] font-normal">
            Amplop Digital
          </h2>
          <SectionDivider />
          <p className="text-xs text-[#6B635B] leading-relaxed pt-2 max-w-md mx-auto">
            Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda bermaksud memberikan tanda kasih, Anda dapat menyalurkannya melalui:
          </p>
        </div>
      </ScrollReveal>

      {/* Segmented Tab Navigation Minimalis (Opsi 6) */}
      <ScrollReveal animation="fade-up" delay={120} duration={700}>
        <div className="flex items-center justify-center p-1.5 rounded-full bg-[#E8E2D8] border border-[#DDD5CA] shadow-inner max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('bank')}
            className={`flex-1 py-2 px-2.5 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'bank'
                ? 'bg-[#4A453F] text-white shadow-md'
                : 'text-[#6B635B] hover:text-[#2C2825]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Transfer Bank</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qris')}
            className={`flex-1 py-2 px-2.5 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'qris'
                ? 'bg-[#4A453F] text-white shadow-md'
                : 'text-[#6B635B] hover:text-[#2C2825]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QRIS Pay</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gift')}
            className={`flex-1 py-2 px-2.5 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'gift'
                ? 'bg-[#4A453F] text-white shadow-md'
                : 'text-[#6B635B] hover:text-[#2C2825]'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Kirim Kado</span>
          </button>
        </div>
      </ScrollReveal>

      {/* Tab Contents with Smooth Reveal */}
      <div>
        {/* TAB 1: TRANSFER BANK (Luxury Debossed ATM Card) */}
        {activeTab === 'bank' && (
          <div className="space-y-4 animate-fade-in">
            {/* Kartu ATM Elegan */}
            <div className="relative w-full rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#38332E] via-[#2A2623] to-[#1C1816] text-white border border-[#D4AF37]/35 shadow-[0_20px_45px_-12px_rgba(40,35,30,0.45)] overflow-hidden space-y-6">
              {/* Soft Diagonal Gloss Shine */}
              <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent pointer-events-none transform -rotate-12" />

              {/* Top Row: Bank Name & Wireless Icon */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FAF8F5]/10 border border-white/20 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <span className="font-serif font-bold text-base tracking-wider text-white">
                      BCA
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-[#C4B7A6] block font-sans">
                      Bank Central Asia
                    </span>
                  </div>
                </div>

                {/* Wireless / Contactless Wave Symbol */}
                <div className="flex items-center gap-1 text-[#D4AF37]/80">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8.5 16.5a5 5 0 0 1 0-7" strokeLinecap="round" />
                    <path d="M12 19a8.5 8.5 0 0 0 0-14" strokeLinecap="round" />
                    <path d="M15.5 21.5a12 12 0 0 0 0-21" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Middle Row: EMV Chip & Monospace Account Number */}
              <div className="relative z-10 space-y-3">
                {/* Simulated EMV Smart Chip */}
                <div className="w-10 h-7 rounded-md bg-gradient-to-br from-[#E6C687] via-[#D4AF37] to-[#B38F2C] border border-[#F3E5AB]/50 shadow-inner relative overflow-hidden p-1 flex flex-col justify-between">
                  <div className="w-full h-[1px] bg-[#6B5318]/40" />
                  <div className="w-full h-[1px] bg-[#6B5318]/40" />
                  <div className="w-2.5 h-full absolute left-1/2 top-0 -translate-x-1/2 border-x border-[#6B5318]/40" />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-[#B8ACA0] font-sans">
                    Nomor Rekening
                  </p>
                  <p className="font-mono text-xl sm:text-2xl font-bold tracking-[0.18em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] pt-0.5">
                    {bank.accountNumber}
                  </p>
                </div>
              </div>

              {/* Bottom Row: Card Holder & Fast Copy Action */}
              <div className="relative z-10 flex items-end justify-between pt-1 border-t border-white/10">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#B8ACA0] font-sans">
                    Nama Pemilik
                  </p>
                  <p className="font-serif text-sm sm:text-base font-medium tracking-wider text-[#FAF8F5]">
                    {bank.accountName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyBank}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer ${
                    copiedBank
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#D4AF37] hover:bg-[#C29D26] text-[#2C2416]'
                  }`}
                >
                  {copiedBank ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Tombol Salin Panjang Tambahan untuk Kemudahan di Layar Ponsel */}
            <button
              type="button"
              onClick={handleCopyBank}
              className={`w-full py-3 rounded-2xl text-xs font-medium tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-sm border cursor-pointer ${
                copiedBank
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-[#FAF8F5] hover:bg-[#F2ECE3] text-[#4A453F] border-[#DDD6CC]'
              }`}
            >
              {copiedBank ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="font-semibold">Nomor Rekening Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#8C7B6B]" />
                  <span>Salin Nomor Rekening BCA</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 2: QRIS STANDAR NASIONAL */}
        {activeTab === 'qris' && (
          <div className="serein-card serein-card-hover rounded-3xl p-6 sm:p-8 space-y-5 text-center animate-fade-in">
            <div className="flex items-center justify-between pb-1 border-b border-[#EBE5DC]">
              <div className="text-left">
                <span className="text-base font-serif font-bold text-[#2C2825] block">
                  QRIS Standar Nasional
                </span>
                <span className="text-[10px] text-[#8C7B6B]">
                  Pernikahan Asril &amp; Sisi
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#FAF8F5] text-[#8C7B6B] border border-[#E0D8CE]">
                <QrCode className="w-4 h-4" />
              </div>
            </div>

            {/* QRIS Code Box */}
            <div className="w-44 h-44 sm:w-48 sm:h-48 mx-auto rounded-2xl bg-white p-3 border border-[#E0D9D0] shadow-md flex items-center justify-center">
              <img 
                src={bank.qrisUrl} 
                alt="QRIS Undangan Pernikahan" 
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-xs text-[#6B635B] max-w-xs mx-auto leading-relaxed">
              Dapat dipindai dari semua aplikasi e-wallet (GoPay, OVO, Dana, ShopeePay) &amp; Mobile Banking.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowQrisModal(true)}
                className="w-full sm:w-1/2 py-2.5 rounded-full bg-[#4A453F] hover:bg-[#38332E] text-white text-xs font-medium tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Perbesar QRIS</span>
              </button>

              <a
                href={bank.qrisUrl}
                download="QRIS-Pernikahan-Asril-Sisi.svg"
                className="w-full sm:w-1/2 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-[#F2ECE3] text-[#3A3530] border border-[#DDD6CC] text-xs font-medium tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-[#8C7B6B]" />
                <span>Unduh Gambar</span>
              </a>
            </div>
          </div>
        )}

        {/* TAB 3: KIRIM KADO FISIK */}
        {activeTab === 'gift' && (
          <div className="serein-card serein-card-hover rounded-3xl p-6 sm:p-8 space-y-5 animate-fade-in text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] text-[#8C7B6B] border border-[#E0D8CE] flex items-center justify-center shrink-0 shadow-sm">
                <Gift className="w-6 h-6 text-[#8C7B6B]" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#8C7B6B] font-medium">
                  Alamat Pengiriman Kado
                </p>
                <h4 className="font-serif text-lg font-bold text-[#2C2825]">
                  Kediaman Mempelai
                </h4>
                <p className="text-xs text-[#59524A] leading-relaxed pt-1">
                  {event.address}
                </p>
                <p className="text-[11px] text-[#8C7B6B] pt-0.5">
                  Penerima: <span className="font-semibold text-[#2C2825]">Asril Rinaldi &amp; Sisi Dian Yuriska</span>
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleCopyAddress}
                className={`w-full py-3 rounded-2xl text-xs font-medium tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-sm border cursor-pointer ${
                  copiedAddress
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-[#4A453F] hover:bg-[#38332E] text-white border-[#4A453F]'
                }`}
              >
                {copiedAddress ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Alamat Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Alamat Lengkap Kado</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QRIS Modal Pop-up Layar Penuh */}
      {showQrisModal && (
        <div 
          onClick={() => setShowQrisModal(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm w-full bg-white text-[#2C2825] rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-fade-in-up"
          >
            <button
              onClick={() => setShowQrisModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-serif font-bold text-lg text-[#2C2825]">
                QRIS Amplop Digital
              </h3>
              <p className="text-xs text-[#736A61] mt-0.5">
                Pernikahan Asril Rinaldi &amp; Sisi Dian Yuriska
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-inner p-3 bg-[#FAF8F5]">
              <img 
                src={bank.qrisUrl} 
                alt="QRIS Undangan" 
                className="w-full h-auto object-contain"
              />
            </div>

            <a
              href={bank.qrisUrl}
              download="QRIS-Pernikahan-Asril-Sisi.svg"
              className="w-full py-2.5 rounded-full bg-[#4A453F] hover:bg-[#38332E] text-white font-medium text-xs tracking-wider uppercase inline-flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Gambar QRIS</span>
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
