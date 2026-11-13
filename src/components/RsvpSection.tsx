'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Send, Users, User, Check, XCircle, HelpCircle } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface RsvpSectionProps {
  initialGuestName?: string;
}

export default function RsvpSection({ initialGuestName = '' }: RsvpSectionProps) {
  const [name, setName] = useState(initialGuestName);
  const [attendance, setAttendance] = useState<'hadir' | 'tidak_hadir' | 'ragu'>('hadir');
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Silakan masukkan nama Anda.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: name,
          attendance,
          guestCount: attendance === 'hadir' ? guestCount : 0,
          message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        if (attendance === 'hadir') {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#A38C75', '#10B981', '#FAF8F5'],
          });
        }
      } else {
        setErrorMessage(data.message || 'Gagal mengirim konfirmasi.');
      }
    } catch (err) {
      setErrorMessage('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 px-6 max-w-xl mx-auto space-y-10">
      <ScrollReveal animation="fade-up">
        <div className="text-center space-y-2">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#8C7B6B] font-medium">
            Konfirmasi Kehadiran
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#2C2825] font-normal">
            RSVP
          </h2>
          <div className="w-12 h-[1px] bg-[#C4BBB0] mx-auto mt-3" />
          <p className="text-xs text-[#6B635B] pt-2">
            Merupakan suatu kehormatan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal animation="fade-up" delay={150}>
        <div className="serein-card rounded-3xl p-6 sm:p-8">
          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-[#2C2825]">
                Terima Kasih, {name}!
              </h3>
              <p className="text-xs text-[#6B635B] max-w-sm mx-auto leading-relaxed">
                Konfirmasi kehadiran Anda telah berhasil dicatat. Doa restu Anda sangat berarti bagi kami.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="text-xs text-[#8C7B6B] underline hover:text-[#59524A] transition-colors pt-2"
              >
                Ubah konfirmasi kehadiran
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center">
                  {errorMessage}
                </div>
              )}

              {/* Nama Tamu */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#59524A] font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#8C7B6B]" />
                  <span>Nama Lengkap</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-gray-400 focus:outline-none focus:border-[#8C7B6B] text-xs transition-colors"
                />
              </div>

              {/* Status Kehadiran Radio Cards */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#59524A] font-medium">
                  Konfirmasi Kehadiran
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAttendance('hadir')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-xs font-medium ${
                      attendance === 'hadir'
                        ? 'bg-[#4A453F] border-[#4A453F] text-white shadow-sm'
                        : 'bg-[#FAF8F5] border-[#DDD6CC] text-[#6B635B] hover:border-[#8C7B6B]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Hadir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendance('tidak_hadir')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-xs font-medium ${
                      attendance === 'tidak_hadir'
                        ? 'bg-[#4A453F] border-[#4A453F] text-white shadow-sm'
                        : 'bg-[#FAF8F5] border-[#DDD6CC] text-[#6B635B] hover:border-[#8C7B6B]'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Berhalangan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendance('ragu')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-xs font-medium ${
                      attendance === 'ragu'
                        ? 'bg-[#4A453F] border-[#4A453F] text-white shadow-sm'
                        : 'bg-[#FAF8F5] border-[#DDD6CC] text-[#6B635B] hover:border-[#8C7B6B]'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Ragu-ragu</span>
                  </button>
                </div>
              </div>

              {/* Jumlah Tamu (jika hadir) */}
              {attendance === 'hadir' && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-xs text-[#59524A] font-medium flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#8C7B6B]" />
                    <span>Jumlah Orang yang Hadir</span>
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] focus:outline-none focus:border-[#8C7B6B] text-xs transition-colors"
                  >
                    <option value={1}>1 Orang</option>
                    <option value={2}>2 Orang</option>
                    <option value={3}>3 Orang</option>
                    <option value={4}>4 Orang</option>
                    <option value={5}>5 Orang atau Lebih</option>
                  </select>
                </div>
              )}

              {/* Pesan Opsional */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#59524A] font-medium">
                  Pesan / Catatan Khusus (Opsional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Tuliskan catatan untuk kedua mempelai..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-gray-400 focus:outline-none focus:border-[#8C7B6B] text-xs resize-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-full bg-[#4A453F] hover:bg-[#38332E] text-white font-medium text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Mengirim...' : 'Kirim Konfirmasi'}</span>
              </button>
            </form>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}
