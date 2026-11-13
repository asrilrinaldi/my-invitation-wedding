'use client';

import React, { useState, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Wish } from '@/lib/types';
import ScrollReveal from './ScrollReveal';

interface WishesSectionProps {
  initialGuestName?: string;
}

export default function WishesSection({ initialGuestName = '' }: WishesSectionProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [name, setName] = useState(initialGuestName);
  const [relationship, setRelationship] = useState('Sahabat');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWishes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/wishes');
      const data = await res.json();
      if (data.success) {
        setWishes(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch wishes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          relationship,
          message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('');
        fetchWishes();
      }
    } catch (err) {
      console.error('Failed to submit wish:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="wishes" className="py-20 px-6 max-w-xl mx-auto space-y-10">
      <ScrollReveal animation="fade-up" duration={700}>
        <div className="text-center space-y-2">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#8C7B6B] font-medium">
            Doa Restu
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#2C2825] font-normal">
            Buku Tamu
          </h2>
          <div className="w-12 h-[1px] bg-[#C4BBB0] mx-auto mt-3" />
          <p className="text-xs text-[#6B635B] pt-2">
            Tinggalkan pesan cinta dan doa hangat untuk kedua mempelai.
          </p>
        </div>
      </ScrollReveal>

      <div className="space-y-6">
        {/* Form Card */}
        <ScrollReveal animation="fade-up" delay={150} duration={750}>
          <div className="serein-card rounded-3xl p-6">
            <h3 className="text-sm font-serif font-semibold text-[#2C2825] mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#8C7B6B]" />
              <span>Kirim Doa &amp; Ucapan</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] text-[#59524A] block mb-1">Nama Pengirim</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-gray-400 focus:outline-none focus:border-[#8C7B6B] text-xs transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#59524A] block mb-1">Hubungan</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] focus:outline-none focus:border-[#8C7B6B] text-xs transition-colors"
                >
                  <option value="Sahabat">Sahabat / Teman</option>
                  <option value="Keluarga">Keluarga / Kerabat</option>
                  <option value="Rekan Kerja">Rekan Kerja</option>
                  <option value="Tetangga">Tetangga</option>
                  <option value="Tamu">Tamu Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#59524A] block mb-1">Ucapan &amp; Doa</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  required
                  placeholder="Tuliskan doa restu Anda..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-gray-400 focus:outline-none focus:border-[#8C7B6B] text-xs resize-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-full bg-[#4A453F] hover:bg-[#38332E] text-white font-medium text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Mengirim...' : 'Kirim Ucapan'}</span>
              </button>
            </form>
          </div>
        </ScrollReveal>

        {/* Wishes List */}
        <div className="space-y-3">
          <ScrollReveal animation="fade-up" delay={250} duration={750}>
            <div className="flex items-center justify-between text-xs text-[#736A61] px-1">
              <span>Ucapan Masuk ({wishes.length})</span>
              <button 
                onClick={fetchWishes} 
                className="hover:underline text-[11px] text-[#8C7B6B]"
              >
                Segarkan
              </button>
            </div>
          </ScrollReveal>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {wishes.length === 0 ? (
              <ScrollReveal animation="fade-up" delay={300}>
                <div className="serein-card rounded-2xl p-6 text-center text-[#8C847B] text-xs">
                  Belum ada ucapan. Jadilah yang pertama memberikan doa restu!
                </div>
              </ScrollReveal>
            ) : (
              wishes.map((item, idx) => (
                <ScrollReveal 
                  key={item.id} 
                  animation="fade-up" 
                  delay={Math.min(idx * 80 + 200, 500)} 
                  duration={650}
                >
                  <div className="serein-card rounded-2xl p-4 text-left space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#EAE4DC] text-[#4A453F] flex items-center justify-center text-[10px] font-bold">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-xs font-semibold text-[#2C2825]">{item.name}</p>
                        {item.relationship && (
                          <span className="text-[9px] text-[#6E655B] bg-[#EFEAE2] px-1.5 py-0.5 rounded-full">
                            {item.relationship}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#8C847B]">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-[#59524A] leading-relaxed pl-8">
                      {item.message}
                    </p>
                  </div>
                </ScrollReveal>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
