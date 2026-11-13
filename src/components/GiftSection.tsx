'use client';

import React, { useState } from 'react';
import { Gift, Copy, Check, QrCode, X, Download, CreditCard } from 'lucide-react';
import { weddingConfig } from '@/lib/data';
import ScrollReveal from './ScrollReveal';

export default function GiftSection() {
  const [copied, setCopied] = useState(false);
  const [showQris, setShowQris] = useState(false);
  const { bank, event } = weddingConfig;

  const handleCopy = () => {
    navigator.clipboard.writeText(bank.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="gift" className="py-20 px-6 max-w-xl mx-auto space-y-10">
      <ScrollReveal animation="fade-up" duration={700}>
        <div className="text-center space-y-2">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#8C7B6B] font-medium">
            Tanda Kasih
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#2C2825] font-normal">
            Amplop Digital
          </h2>
          <div className="w-12 h-[1px] bg-[#C4BBB0] mx-auto mt-3" />
          <p className="text-xs text-[#6B635B] leading-relaxed pt-2">
            Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda bermaksud memberikan tanda kasih, Anda dapat menyalurkannya melalui:
          </p>
        </div>
      </ScrollReveal>

      <div className="space-y-6">
        {/* Bank Transfer Card */}
        <ScrollReveal animation="fade-up" delay={150} duration={800}>
          <div className="serein-card serein-card-hover rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-base font-serif font-bold text-[#2C2825]">
                {bank.bankName}
              </span>
              <div className="p-2 rounded-xl bg-[#FAF8F5] text-[#8C7B6B] border border-[#E0D8CE]">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-[#8C847B] uppercase tracking-wider">Nomor Rekening</p>
              <p className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-[#2C2825]">
                {bank.accountNumber}
              </p>
              <p className="text-xs text-[#59524A] pt-0.5">
                a.n. <span className="font-semibold text-[#2C2825]">{bank.accountName}</span>
              </p>
            </div>

            <button
              onClick={handleCopy}
              className={`w-full py-2.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#4A453F] hover:bg-[#38332E] text-white hover:scale-[1.01]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Nomor Rekening Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Nomor Rekening</span>
                </>
              )}
            </button>
          </div>
        </ScrollReveal>

        {/* QRIS Card */}
        <ScrollReveal animation="fade-up" delay={280} duration={800}>
          <div className="serein-card serein-card-hover rounded-3xl p-6 sm:p-8 space-y-4 text-center">
            <div className="flex items-center justify-between">
              <span className="text-base font-serif font-bold text-[#2C2825]">
                QRIS Standar Nasional
              </span>
              <div className="p-2 rounded-xl bg-[#FAF8F5] text-[#8C7B6B] border border-[#E0D8CE]">
                <QrCode className="w-4 h-4" />
              </div>
            </div>

            <div className="w-28 h-28 mx-auto rounded-2xl bg-white p-2 border border-[#E0D9D0] shadow-sm">
              <img 
                src={bank.qrisUrl} 
                alt="QRIS Preview" 
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-[11px] text-[#7A7167]">
              Dapat dipindai dari semua aplikasi e-wallet &amp; m-banking.
            </p>

            <button
              onClick={() => setShowQris(true)}
              className="w-full py-2.5 rounded-full bg-[#FAF8F5] hover:bg-[#F2ECE3] text-[#3A3530] border border-[#DDD6CC] text-xs font-medium tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-3.5 h-3.5 text-[#8C7B6B]" />
              <span>Tampilkan QRIS Lengkap</span>
            </button>
          </div>
        </ScrollReveal>

        {/* Kirim Kado Fisik */}
        <ScrollReveal animation="fade-up" delay={380} duration={800}>
          <div className="serein-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#8C7B6B] border border-[#E0D8CE] flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-left">
              <h4 className="text-xs font-semibold text-[#2C2825]">Kirim Kado Fisik</h4>
              <p className="text-[11px] text-[#6B635B] leading-relaxed">
                {event.address}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* QRIS Modal */}
      {showQris && (
        <div 
          onClick={() => setShowQris(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm w-full bg-white text-[#2C2825] rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-fade-in-up"
          >
            <button
              onClick={() => setShowQris(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
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

            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-inner p-2 bg-[#FAF8F5]">
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
