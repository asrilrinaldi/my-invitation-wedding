import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div 
      className="min-h-screen bg-[#EDE8E1] flex items-center justify-center p-4 sm:p-6 text-center select-none"
      style={{
        backgroundImage: "url('/images/paper-grain.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '180px 180px',
      }}
    >
      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 border border-[#DDD6CC] animate-fade-in-up">
        {/* Monogram Logo */}
        <div className="flex justify-center items-center">
          <img
            src="/logo/logo.PNG"
            alt="Logo Asril & Sisi"
            className="h-20 w-auto object-contain brightness-0 opacity-70 pointer-events-none select-none"
          />
        </div>

        {/* 404 Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] uppercase tracking-wider font-semibold">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>404 • URL Tidak Valid</span>
        </div>

        {/* Heading & Info */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-serif text-[#2C2825] font-normal">
            Halaman Tidak Ditemukan
          </h1>
          <div className="w-12 h-[1px] bg-[#C4BBB0] mx-auto my-3" />
          <p className="text-xs text-[#6B635B] leading-relaxed">
            Mohon maaf, alamat URL yang Anda tuju tidak valid atau tidak terdaftar dalam sistem undangan pernikahan ini.
          </p>
          <p className="text-[11px] text-[#8C847B] pt-1">
            Pastikan Anda membuka tautan personal resmi yang dikirimkan langsung oleh kedua mempelai.
          </p>
        </div>
      </div>
    </div>
  );
}
