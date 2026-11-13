'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, CheckCircle, XCircle, MessageSquare, Plus, Trash2, 
  Copy, Check, ExternalLink, Share2, ArrowLeft, RefreshCw, Eye,
  Heart, Save, Sparkles, User, ShieldCheck
} from 'lucide-react';
import { Guest, RSVP, Wish, WeddingData } from '@/lib/types';
import { weddingConfig } from '@/lib/data';

type CoupleConfig = WeddingData['couple'];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'guests' | 'couple' | 'rsvp' | 'wishes'>('guests');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [stats, setStats] = useState({
    totalGuests: 0,
    totalOpened: 0,
    totalRsvp: 0,
    attendingCount: 0,
    notAttendingCount: 0,
    totalAttendingGuests: 0,
    totalWishes: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Couple Config State
  const [coupleForm, setCoupleForm] = useState<CoupleConfig>(weddingConfig.couple);
  const [isSavingCouple, setIsSavingCouple] = useState(false);
  const [coupleSuccessMessage, setCoupleSuccessMessage] = useState('');
  const [coupleErrorMessage, setCoupleErrorMessage] = useState('');

  // New Guest Form State
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestCategory, setNewGuestCategory] = useState<'Keluarga' | 'Teman' | 'Sahabat' | 'VIP' | 'Rekan Kerja' | 'Umum'>('Teman');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [isSubmittingGuest, setIsSubmittingGuest] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [guestsRes, rsvpsRes, wishesRes, statsRes, coupleRes] = await Promise.all([
        fetch('/api/guests', { cache: 'no-store' }),
        fetch('/api/rsvp', { cache: 'no-store' }),
        fetch('/api/wishes', { cache: 'no-store' }),
        fetch('/api/stats', { cache: 'no-store' }),
        fetch('/api/config/couple', { cache: 'no-store' }),
      ]);

      const [guestsData, rsvpsData, wishesData, statsData, coupleData] = await Promise.all([
        guestsRes.json(),
        rsvpsRes.json(),
        wishesRes.json(),
        statsRes.json(),
        coupleRes.json(),
      ]);

      if (guestsData.success) setGuests(guestsData.data);
      if (rsvpsData.success) setRsvps(rsvpsData.data);
      if (wishesData.success) setWishes(wishesData.data);
      if (statsData.success) setStats(statsData.data);
      if (coupleData.success && coupleData.data) setCoupleForm(coupleData.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCouple(true);
    setCoupleSuccessMessage('');
    setCoupleErrorMessage('');

    try {
      const res = await fetch('/api/config/couple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupleForm),
      });

      const data = await res.json();
      if (data.success) {
        setCoupleSuccessMessage('Data kedua mempelai & orang tua berhasil diperbarui!');
        setTimeout(() => setCoupleSuccessMessage(''), 4500);
        fetchData();
      } else {
        setCoupleErrorMessage(data.message || 'Gagal menyimpan data pengantin.');
      }
    } catch (err) {
      setCoupleErrorMessage('Terjadi kesalahan jaringan.');
    } finally {
      setIsSavingCouple(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    setIsSubmittingGuest(true);
    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGuestName,
          category: newGuestCategory,
          phoneNumber: newGuestPhone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNewGuestName('');
        setNewGuestPhone('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to add guest:', err);
    } finally {
      setIsSubmittingGuest(false);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (!confirm('Yakin ingin menghapus tamu ini dari daftar?')) return;
    try {
      const res = await fetch(`/api/guests?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete guest:', err);
    }
  };

  const handleDeleteWish = async (id: string) => {
    if (!confirm('Hapus ucapan ini?')) return;
    try {
      const res = await fetch(`/api/wishes?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete wish:', err);
    }
  };

  const getInvitationUrl = (guest: Guest) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/to/${guest.slug}`;
  };

  const getWhatsAppMessage = (guest: Guest) => {
    const link = getInvitationUrl(guest);
    return `Kepada Yth.
Bapak/Ibu/Saudara/i *${guest.name}*

_Assalamu'alaikum Warahmatullahi Wabarakatuh_

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk berkenan menghadiri hari bahagia pernikahan kami:

💍 *${weddingConfig.couple.groom.fullName} & ${weddingConfig.couple.bride.fullName}*
🗓️ *${weddingConfig.event.displayDate}*
📍 *${weddingConfig.event.locationName}, Bandar Lampung*

Detail acara dan konfirmasi kehadiran dapat diakses melalui tautan undangan berikut:
${link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu.

_Wassalamu'alaikum Warahmatullahi Wabarakatuh_
Hormat kami yang berbahagia,
*${weddingConfig.couple.groom.nickname} & ${weddingConfig.couple.bride.nickname}*`;
  };

  const copyLink = (guest: Guest) => {
    const link = getInvitationUrl(guest);
    navigator.clipboard.writeText(link);
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openWhatsApp = (guest: Guest) => {
    let phone = guest.phoneNumber ? guest.phoneNumber.trim().replace(/[^0-9]/g, '') : '';
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }
    const message = encodeURIComponent(getWhatsAppMessage(guest));
    const url = phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0F1012] text-[#ECE5D8] p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold-500/20 pb-6">
        <div>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs text-gold-400 hover:text-gold-300 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Lihat Halaman Undangan</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gold-gradient">
            Dashboard Pengantin
          </h1>
          <p className="text-xs text-gray-400">
            Pernikahan {weddingConfig.couple.groom.nickname} &amp; {weddingConfig.couple.bride.nickname} • 20 Juni 2027
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs border border-white/10 transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-gold-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-gold-500/20">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
              <span>Total Diundang</span>
              <Users className="w-4 h-4 text-gold-400" />
            </div>
            <p className="text-2xl font-bold font-serif text-gold-200">
              {stats.totalGuests}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              {stats.totalOpened} telah membuka link ({stats.totalGuests > 0 ? Math.round((stats.totalOpened / stats.totalGuests) * 100) : 0}%)
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-gold-500/20">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
              <span>Konfirmasi Hadir</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold font-serif text-emerald-300">
              {stats.attendingCount}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Estimasi Total: {stats.totalAttendingGuests} Orang (Pax)
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-gold-500/20">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
              <span>Tidak Hadir</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-bold font-serif text-rose-300">
              {stats.notAttendingCount}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Tamu yang berhalangan hadir
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-gold-500/20">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
              <span>Buku Ucapan</span>
              <MessageSquare className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold font-serif text-amber-300">
              {stats.totalWishes}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Doa &amp; ucapan dari tamu
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('guests')}
            className={`pb-3 px-4 text-xs font-semibold tracking-wider uppercase transition-colors border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'guests'
                ? 'border-gold-400 text-gold-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Daftar Tamu &amp; WhatsApp Link ({guests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('couple')}
            className={`pb-3 px-4 text-xs font-semibold tracking-wider uppercase transition-colors border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'couple'
                ? 'border-gold-400 text-gold-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Data Pengantin &amp; Orang Tua</span>
          </button>
          <button
            onClick={() => setActiveTab('rsvp')}
            className={`pb-3 px-4 text-xs font-semibold tracking-wider uppercase transition-colors border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'rsvp'
                ? 'border-gold-400 text-gold-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Konfirmasi RSVP ({rsvps.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('wishes')}
            className={`pb-3 px-4 text-xs font-semibold tracking-wider uppercase transition-colors border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'wishes'
                ? 'border-gold-400 text-gold-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Buku Ucapan ({wishes.length})</span>
          </button>
        </div>

        {/* TAB 1: GUESTS & WHATSAPP GENERATOR */}
        {activeTab === 'guests' && (
          <div className="space-y-6">
            {/* Form Tambah Tamu */}
            <div className="glass-card rounded-2xl p-6 border border-gold-500/20">
              <h3 className="text-base font-serif font-bold text-gold-200 mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-gold-400" />
                <span>Tambah Tamu Undangan Baru</span>
              </h3>
              <form onSubmit={handleAddGuest} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    placeholder="Nama Lengkap / Gelar (Contoh: Bpk. Ahmad Subarjo)"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-gold-500/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div>
                  <select
                    value={newGuestCategory}
                    onChange={(e) => setNewGuestCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-gold-500/30 text-white text-xs focus:outline-none focus:border-gold-400"
                  >
                    <option value="Teman" className="bg-[#17181c]">Teman</option>
                    <option value="Sahabat" className="bg-[#17181c]">Sahabat</option>
                    <option value="Keluarga" className="bg-[#17181c]">Keluarga</option>
                    <option value="VIP" className="bg-[#17181c]">VIP</option>
                    <option value="Rekan Kerja" className="bg-[#17181c]">Rekan Kerja</option>
                    <option value="Umum" className="bg-[#17181c]">Umum</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    placeholder="Nomor WA (opsional: 0812...)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-gold-500/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div className="sm:col-span-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingGuest}
                    className="px-6 py-2.5 rounded-full bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmittingGuest ? 'Menyimpan...' : '+ Tambah & Generate Link'}
                  </button>
                </div>
              </form>
            </div>

            {/* Tabel Tamu */}
            <div className="glass-card rounded-2xl border border-gold-500/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/50 text-gold-300 uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Nama Tamu</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Status Buka</th>
                      <th className="py-3 px-4 text-center">Tautan Undangan</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {guests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          Belum ada tamu terdaftar. Silakan tambahkan tamu di atas.
                        </td>
                      </tr>
                    ) : (
                      guests.map((guest) => (
                        <tr key={guest.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div>{guest.name}</div>
                            {guest.phoneNumber && (
                              <div className="text-[10px] text-gray-400 font-normal">
                                WA: {guest.phoneNumber}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-300 border border-gold-500/20 text-[10px]">
                              {guest.category || 'Umum'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {guest.hasOpened ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                                <Eye className="w-3 h-3" />
                                <span>Sudah Dibuka</span>
                              </span>
                            ) : (
                              <span className="text-gray-500 text-[11px]">Belum Dibuka</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <a
                                href={`/to/${guest.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gold-300 flex items-center gap-1 text-[11px]"
                              >
                                <span>/to/{guest.slug}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                              <button
                                onClick={() => copyLink(guest)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-gold-500/20 text-gray-300 hover:text-gold-200 transition-colors"
                                title="Salin Link"
                              >
                                {copiedId === guest.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openWhatsApp(guest)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white font-medium flex items-center gap-1.5 text-[11px] transition-all"
                                title="Kirim Undangan via WhatsApp"
                              >
                                <Share2 className="w-3 h-3" />
                                <span>Kirim WA</span>
                              </button>
                              <button
                                onClick={() => handleDeleteGuest(guest.id)}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                                title="Hapus Tamu"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COUPLE & PARENTS CONFIGURATION */}
        {activeTab === 'couple' && (
          <form onSubmit={handleSaveCouple} className="space-y-6 animate-fade-in">
            {coupleSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{coupleSuccessMessage}</span>
              </div>
            )}

            {coupleErrorMessage && (
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-fade-in">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{coupleErrorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card Mempelai Pria */}
              <div className="glass-card rounded-2xl p-6 sm:p-7 border border-gold-500/20 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                  <div className="w-9 h-9 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-300">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-gold-200">
                      Mempelai Pria (Groom)
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      Nama lengkap, nama panggilan, dan kedua orang tua
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1 font-medium">
                      Nama Lengkap Mempelai Pria
                    </label>
                    <input
                      type="text"
                      value={coupleForm.groom.fullName}
                      onChange={(e) => setCoupleForm({
                        ...coupleForm,
                        groom: { ...coupleForm.groom, fullName: e.target.value }
                      })}
                      placeholder="Contoh: Asril Rinaldi, S.Kom"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-gold-500/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gold-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1 font-medium">
                      Nama Panggilan (Ditampilkan di Judul Utama &amp; Sampul)
                    </label>
                    <input
                      type="text"
                      value={coupleForm.groom.nickname}
                      onChange={(e) => setCoupleForm({
                        ...coupleForm,
                        groom: { ...coupleForm.groom, nickname: e.target.value }
                      })}
                      placeholder="Contoh: Asril"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-gold-500/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gold-400 transition-colors"
                    />
                  </div>

                  <div className="pt-3 border-t border-white/5 space-y-3">
                    <p className="text-[10px] uppercase tracking-wider text-gold-400 font-semibold">
                      Nama Orang Tua Mempelai Pria:
                    </p>

                    <div>
                      <label className="text-[11px] text-gray-300 block mb-1">
                        Nama Ayah
                      </label>
                      <input
                        type="text"
                        value={coupleForm.groom.father}
                        onChange={(e) => setCoupleForm({
                          ...coupleForm,
                          groom: { ...coupleForm.groom, father: e.target.value }
                        })}
                        placeholder="Contoh: Nowendri atau Bpk. Nowendri"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-gold-500/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gold-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-300 block mb-1">
                        Nama Ibu
                      </label>
                      <input
                        type="text"
                        value={coupleForm.groom.mother}
                        onChange={(e) => setCoupleForm({
                          ...coupleForm,
                          groom: { ...coupleForm.groom, mother: e.target.value }
                        })}
                        placeholder="Contoh: Surastini atau Ibu Surastini"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-gold-500/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gold-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1">
                      Username Instagram (Opsional)
                    </label>
                    <input
                      type="text"
                      value={coupleForm.groom.instagram || ''}
                      onChange={(e) => setCoupleForm({
                        ...coupleForm,
                        groom: { ...coupleForm.groom, instagram: e.target.value.replace('@', '') }
                      })}
                      placeholder="Contoh: asril_rinaldi (tanpa @)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-gold-500/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gold-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Card Mempelai Wanita */}
              <div className="glass-card rounded-2xl p-6 sm:p-7 border border-gold-500/20 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                  <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-300">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-gold-200">
                      Mempelai Wanita (Bride)
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      Nama lengkap, nama panggilan, dan kedua orang tua
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1 font-medium">
                      Nama Lengkap Mempelai Wanita
                    </label>
                    <input
                      type="text"
                      value={coupleForm.bride.fullName}
                      onChange={(e) => setCoupleForm({
                        ...coupleForm,
                        bride: { ...coupleForm.bride, fullName: e.target.value }
                      })}
                      placeholder="Contoh: Sisi Dian Yuriska, S.Pd"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-gold-500/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gold-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1 font-medium">
                      Nama Panggilan (Ditampilkan di Judul Utama &amp; Sampul)
                    </label>
                    <input
                      type="text"
                      value={coupleForm.bride.nickname}
                      onChange={(e) => setCoupleForm({
                        ...coupleForm,
                        bride: { ...coupleForm.bride, nickname: e.target.value }
                      })}
                      placeholder="Contoh: Sisi"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-gold-500/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gold-400 transition-colors"
                    />
                  </div>

                  <div className="pt-3 border-t border-white/5 space-y-3">
                    <p className="text-[10px] uppercase tracking-wider text-gold-400 font-semibold">
                      Nama Orang Tua Mempelai Wanita:
                    </p>

                    <div>
                      <label className="text-[11px] text-gray-300 block mb-1">
                        Nama Ayah
                      </label>
                      <input
                        type="text"
                        value={coupleForm.bride.father}
                        onChange={(e) => setCoupleForm({
                          ...coupleForm,
                          bride: { ...coupleForm.bride, father: e.target.value }
                        })}
                        placeholder="Contoh: Sistarudin atau Bpk. Sistarudin"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-gold-500/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gold-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-300 block mb-1">
                        Nama Ibu
                      </label>
                      <input
                        type="text"
                        value={coupleForm.bride.mother}
                        onChange={(e) => setCoupleForm({
                          ...coupleForm,
                          bride: { ...coupleForm.bride, mother: e.target.value }
                        })}
                        placeholder="Contoh: Dian atau Ibu Dian"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-gold-500/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gold-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1">
                      Username Instagram (Opsional)
                    </label>
                    <input
                      type="text"
                      value={coupleForm.bride.instagram || ''}
                      onChange={(e) => setCoupleForm({
                        ...coupleForm,
                        bride: { ...coupleForm.bride, instagram: e.target.value.replace('@', '') }
                      })}
                      placeholder="Contoh: sisi_dian (tanpa @)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-gold-500/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gold-400 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingCouple}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingCouple ? 'Menyimpan Perubahan...' : 'Simpan Data Pengantin & Orang Tua'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: RSVP LIST */}
        {activeTab === 'rsvp' && (
          <div className="glass-card rounded-2xl border border-gold-500/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/50 text-gold-300 uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Nama Tamu</th>
                    <th className="py-3 px-4">Status Kehadiran</th>
                    <th className="py-3 px-4">Jumlah Pax</th>
                    <th className="py-3 px-4">Catatan / Pesan</th>
                    <th className="py-3 px-4 text-right">Waktu Konfirmasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rsvps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        Belum ada data konfirmasi kehadiran (RSVP) yang masuk.
                      </td>
                    </tr>
                  ) : (
                    rsvps.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {item.guestName}
                        </td>
                        <td className="py-3.5 px-4">
                          {item.attendance === 'hadir' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                              ✓ Hadir
                            </span>
                          )}
                          {item.attendance === 'tidak_hadir' && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-medium">
                              ✕ Berhalangan
                            </span>
                          )}
                          {item.attendance === 'ragu' && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                              ? Masih Ragu
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-gold-200">
                          {item.guestCount > 0 ? `${item.guestCount} Orang` : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-gray-300 max-w-xs truncate">
                          {item.message || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right text-gray-500">
                          {new Date(item.createdAt).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: WISHES MODERATION */}
        {activeTab === 'wishes' && (
          <div className="glass-card rounded-2xl border border-gold-500/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/50 text-gold-300 uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Pengirim</th>
                    <th className="py-3 px-4">Hubungan</th>
                    <th className="py-3 px-4">Isi Doa / Ucapan</th>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4 text-right">Moderasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {wishes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        Belum ada ucapan yang masuk.
                      </td>
                    </tr>
                  ) : (
                    wishes.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {item.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-300 text-[10px]">
                            {item.relationship || 'Tamu'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-200 max-w-md">
                          {item.message}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 text-[11px] whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteWish(item.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                            title="Hapus Ucapan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
