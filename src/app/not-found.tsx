'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#EDE8E1] flex items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full serein-card rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 animate-fade-in-up border border-[#DDD6CC]">
        <div className="w-16 h-16 rounded-full bg-[#F5ECE1] border border-[#DDD4C8] text-[#8C7B6B] mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-[#8C7B6B]" />
        </div>

        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#8C7B6B] font-medium font-sans">
            Akses Undangan Terbatas
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#2C2825] font-normal">
            Undangan Tidak Ditemukan
          </h1>
          <div className="w-12 h-[1px] bg-[#C4BBB0] mx-auto my-3" />
          <p className="text-xs text-[#6B635B] leading-relaxed pt-1">
            Mohon maaf, tautan nama yang Anda akses tidak terdaftar dalam daftar tamu undangan resmi.
          </p>
          <p className="text-[11px] text-[#8C847B] pt-1">
            Pastikan Anda menggunakan tautan resmi yang dikirimkan langsung oleh kedua mempelai.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#4A453F] hover:bg-[#38332E] text-white text-xs font-medium tracking-wider uppercase transition-all shadow-md active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Buka Undangan Umum</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
