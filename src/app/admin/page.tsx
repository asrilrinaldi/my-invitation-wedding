'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Users, CheckCircle, XCircle, MessageSquare, Plus, Trash2, 
  Copy, Check, ExternalLink, Share2, ArrowLeft, RefreshCw, Eye,
  Heart, Save, Sparkles, User, ShieldCheck, Music, Play, Pause, Volume2, Camera, QrCode,
  Download, X
} from 'lucide-react';
import QRCode from 'qrcode';
import { Guest, RSVP, Wish, WeddingData, MusicTrackOption } from '@/lib/types';
import { weddingConfig } from '@/lib/data';

type CoupleConfig = WeddingData['couple'];

// Deterministic unique pass code generator (matches /scan and WeddingPass system)
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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'guests' | 'couple' | 'music' | 'rsvp' | 'wishes'>('guests');
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

  // QR Modal State
  const [selectedQrGuest, setSelectedQrGuest] = useState<Guest | null>(null);
  const [qrModalDataUrl, setQrModalDataUrl] = useState<string>('');
  const [isCopiedCode, setIsCopiedCode] = useState(false);

  // Couple Config State
  const [coupleForm, setCoupleForm] = useState<CoupleConfig>(weddingConfig.couple);
  const [isSavingCouple, setIsSavingCouple] = useState(false);
  const [coupleSuccessMessage, setCoupleSuccessMessage] = useState('');
  const [coupleErrorMessage, setCoupleErrorMessage] = useState('');

  // Music Config State
  const [musicForm, setMusicForm] = useState({
    url: weddingConfig.music.url,
    title: weddingConfig.music.title,
  });
  const [musicOptions, setMusicOptions] = useState<MusicTrackOption[]>([
    { id: 'music001', name: 'music001.mp3', title: 'Romantic Wedding Melody 01 (Soft Acoustic & Piano)', url: '/music/music001.mp3' },
    { id: 'music002', name: 'music002.mp3', title: 'Romantic Wedding Melody 02 (Classic Wedding Instrumental)', url: '/music/music002.mp3' },
  ]);
  const [isSavingMusic, setIsSavingMusic] = useState(false);
  const [musicSuccessMessage, setMusicSuccessMessage] = useState('');
  const [musicErrorMessage, setMusicErrorMessage] = useState('');
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // New Guest Form State
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestCategory, setNewGuestCategory] = useState<'Keluarga' | 'Teman' | 'Sahabat' | 'VIP' | 'Rekan Kerja' | 'Umum'>('Teman');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [isSubmittingGuest, setIsSubmittingGuest] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [guestsRes, rsvpsRes, wishesRes, statsRes, coupleRes, musicRes] = await Promise.all([
        fetch('/api/guests', { cache: 'no-store' }),
        fetch('/api/rsvp', { cache: 'no-store' }),
        fetch('/api/wishes', { cache: 'no-store' }),
        fetch('/api/stats', { cache: 'no-store' }),
        fetch('/api/config/couple', { cache: 'no-store' }),
        fetch('/api/config/music', { cache: 'no-store' }),
      ]);

      const [guestsData, rsvpsData, wishesData, statsData, coupleData, musicData] = await Promise.all([
        guestsRes.json(),
        rsvpsRes.json(),
        wishesRes.json(),
        statsRes.json(),
        coupleRes.json(),
        musicRes.json(),
      ]);

      if (guestsData.success) setGuests(guestsData.data);
      if (rsvpsData.success) setRsvps(rsvpsData.data);
      if (wishesData.success) setWishes(wishesData.data);
      if (statsData.success) setStats(statsData.data);
      if (coupleData.success && coupleData.data) setCoupleForm(coupleData.data);
      if (musicData.success && musicData.data) {
        setMusicForm(musicData.data);
        if (musicData.options) setMusicOptions(musicData.options);
      }
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

  const handleSaveMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMusic(true);
    setMusicSuccessMessage('');
    setMusicErrorMessage('');

    try {
      const res = await fetch('/api/config/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(musicForm),
      });

      const data = await res.json();
      if (data.success) {
        setMusicSuccessMessage('Musik latar berhasil diperbarui!');
        setTimeout(() => setMusicSuccessMessage(''), 4500);
        fetchData();
      } else {
        setMusicErrorMessage(data.message || 'Gagal menyimpan musik.');
      }
    } catch (err) {
      setMusicErrorMessage('Terjadi kesalahan jaringan.');
    } finally {
      setIsSavingMusic(false);
    }
  };

  const handleMusicSelect = (selectedUrl: string) => {
    const selectedTrack = musicOptions.find(t => t.url === selectedUrl);
    setMusicForm({
      url: selectedUrl,
      title: selectedTrack ? selectedTrack.title : musicForm.title,
    });

    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      setIsPreviewPlaying(false);
    }
  };

  const toggleAudioPreview = () => {
    if (!audioPreviewRef.current) return;
    if (isPreviewPlaying) {
      audioPreviewRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      audioPreviewRef.current.src = musicForm.url;
      audioPreviewRef.current.play()
        .then(() => setIsPreviewPlaying(true))
        .catch((err) => console.error('Audio play error:', err));
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

Detail acara, QR Pass, dan konfirmasi kehadiran dapat diakses melalui tautan undangan berikut:
${link}

🎫 *Kode Tamu:* ${generateGuestCode(guest.name)}

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

  const handleOpenQrModal = async (guest: Guest) => {
    setSelectedQrGuest(guest);
    setIsCopiedCode(false);
    const code = generateGuestCode(guest.name);
    const payload = `WEDDING-PASS:ASRIL-SISI|TAMU:${guest.name.toUpperCase()}|KODE:${code}|STATUS:${guest.category || 'VIP'}`;
    try {
      const url = await QRCode.toDataURL(payload, {
        width: 400,
        margin: 2,
        color: {
          dark: '#2C2825',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });
      setQrModalDataUrl(url);
    } catch (err) {
      console.error('Failed to generate QR:', err);
    }
  };

  const handleDownloadQr = () => {
    if (!selectedQrGuest || !qrModalDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR-Pass-${selectedQrGuest.slug || 'tamu'}.png`;
    link.href = qrModalDataUrl;
    link.click();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopiedCode(true);
    setTimeout(() => setIsCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C2825] p-4 sm:p-8 font-sans">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D8] pb-6">
        <div>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs text-[#8C7B6B] hover:text-[#4A453F] mb-2 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Lihat Halaman Undangan</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2825]">
            Dashboard Pengantin
          </h1>
          <p className="text-xs text-[#7E776F]">
            Pernikahan {weddingConfig.couple.groom.nickname} &amp; {weddingConfig.couple.bride.nickname} • 20 Juni 2027
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A453F] hover:bg-[#34302C] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider shadow-sm active:scale-95 transition-all w-fit cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scanner QR Tamu</span>
          </Link>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F5F0E8] text-xs font-medium border border-[#E5E0D8] text-[#2C2825] shadow-2xs transition-colors w-fit cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#846030] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8] shadow-xs">
            <div className="flex items-center justify-between text-[#7E776F] text-xs mb-2 font-medium">
              <span>Total Diundang</span>
              <Users className="w-4 h-4 text-[#846030]" />
            </div>
            <p className="text-2xl font-bold font-serif text-[#2C2825]">
              {stats.totalGuests}
            </p>
            <p className="text-[11px] text-[#7E776F] mt-1">
              {stats.totalOpened} telah membuka link ({stats.totalGuests > 0 ? Math.round((stats.totalOpened / stats.totalGuests) * 100) : 0}%)
            </p>
          </div>

          <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200 shadow-xs">
            <div className="flex items-center justify-between text-emerald-800 text-xs mb-2 font-semibold">
              <span>Konfirmasi Hadir</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-serif text-emerald-800">
              {stats.attendingCount}
            </p>
            <p className="text-[11px] text-emerald-700 mt-1">
              Estimasi Total: {stats.totalAttendingGuests} Orang (Pax)
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8] shadow-xs">
            <div className="flex items-center justify-between text-[#7E776F] text-xs mb-2 font-medium">
              <span>Tidak Hadir</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-bold font-serif text-rose-700">
              {stats.notAttendingCount}
            </p>
            <p className="text-[11px] text-[#7E776F] mt-1">
              Tamu yang berhalangan hadir
            </p>
          </div>

          <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200/80 shadow-xs">
            <div className="flex items-center justify-between text-amber-800 text-xs mb-2 font-semibold">
              <span>Buku Ucapan</span>
              <MessageSquare className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold font-serif text-amber-900">
              {stats.totalWishes}
            </p>
            <p className="text-[11px] text-amber-700 mt-1">
              Doa &amp; ucapan dari tamu
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E8E2D8] gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('guests')}
            className={`pb-3 px-4 text-xs font-semibold tracking-wider uppercase transition-colors border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'guests'
                ? 'border-[#4A453F] text-[#2C2825]'
                : 'border-transparent text-[#7E776F] hover:text-[#2C2825]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Daftar Tamu &amp; WhatsApp Link ({guests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('couple')}
            className={`pb-3 px-4 text-xs font-semibold tracking-wider uppercase transition-colors border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'couple'
                ? 'border-[#4A453F] text-[#2C2825]'
                : 'border-transparent text-[#7E776F] hover:text-[#2C2825]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Data Pengantin &amp; Orang Tua</span>
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`pb-3 px-4 text-xs font-semibold tracking-wider uppercase transition-colors border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'music'
                ? 'border-[#4A453F] text-[#2C2825]'
                : 'border-transparent text-[#7E776F] hover:text-[#2C2825]'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-amber-600" />
            <span>Musik Latar</span>
          </button>
          <button
            onClick={() => setActiveTab('rsvp')}
            className={`pb-3 px-4 text-xs font-semibold tracking-wider uppercase transition-colors border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'rsvp'
                ? 'border-[#4A453F] text-[#2C2825]'
                : 'border-transparent text-[#7E776F] hover:text-[#2C2825]'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Konfirmasi RSVP ({rsvps.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('wishes')}
            className={`pb-3 px-4 text-xs font-semibold tracking-wider uppercase transition-colors border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'wishes'
                ? 'border-[#4A453F] text-[#2C2825]'
                : 'border-transparent text-[#7E776F] hover:text-[#2C2825]'
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
            <div className="bg-white rounded-2xl p-6 border border-[#E5E0D8] shadow-xs">
              <h3 className="text-base font-serif font-bold text-[#2C2825] mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#846030]" />
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                  />
                </div>
                <div>
                  <select
                    value={newGuestCategory}
                    onChange={(e) => setNewGuestCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                  >
                    <option value="Teman">Teman</option>
                    <option value="Sahabat">Sahabat</option>
                    <option value="Keluarga">Keluarga</option>
                    <option value="VIP">VIP</option>
                    <option value="Rekan Kerja">Rekan Kerja</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    placeholder="Nomor WA (opsional: 0812...)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                  />
                </div>
                <div className="sm:col-span-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingGuest}
                    className="px-6 py-2.5 rounded-full bg-[#4A453F] hover:bg-[#34302C] text-white font-semibold text-xs tracking-wider uppercase transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isSubmittingGuest ? 'Menyimpan...' : '+ Tambah & Generate Link'}
                  </button>
                </div>
              </form>
            </div>

            {/* Tabel Tamu */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F1EB] text-[#4A453F] font-semibold uppercase tracking-wider border-b border-[#E8E2D8]">
                    <tr>
                      <th className="py-3 px-4">Nama Tamu</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4 text-center">Kode &amp; QR Pass</th>
                      <th className="py-3 px-4">Status Buka</th>
                      <th className="py-3 px-4 text-center">Tautan Undangan</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEAE2]">
                    {guests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#7E776F]">
                          Belum ada tamu terdaftar. Silakan tambahkan tamu di atas.
                        </td>
                      </tr>
                    ) : (
                      guests.map((guest) => (
                        <tr key={guest.id} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-[#2C2825]">
                            <div>{guest.name}</div>
                            {guest.phoneNumber && (
                              <div className="text-[10px] text-[#7E776F] font-normal">
                                WA: {guest.phoneNumber}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-[#F3EFEA] text-[#846030] border border-[#D4AF37]/30 text-[10px] font-medium">
                              {guest.category || 'Umum'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopyCode(generateGuestCode(guest.name))}
                                className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#F3EFEA] hover:bg-[#EAE4DC] text-[#846030] border border-[#D4AF37]/30 tracking-wider transition-colors cursor-pointer"
                                title="Klik untuk salin kode tamu"
                              >
                                {generateGuestCode(guest.name)}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenQrModal(guest)}
                                className="p-1.5 rounded-lg bg-[#F5F0E8] hover:bg-[#EAE4DC] text-[#846030] hover:text-[#5C421E] border border-[#E0D8CE] transition-colors cursor-pointer"
                                title="Buka & Download QR Pass Tamu"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {guest.hasOpened ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-medium">
                                <Eye className="w-3 h-3" />
                                <span>Sudah Dibuka</span>
                              </span>
                            ) : (
                              <span className="text-[#A3988C] text-[11px]">Belum Dibuka</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <a
                                href={`/to/${guest.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-[#F5F0E8] hover:bg-[#EAE4DC] text-[#4A453F] flex items-center gap-1 text-[11px] font-medium transition-colors"
                              >
                                <span>/to/{guest.slug}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                              <button
                                onClick={() => copyLink(guest)}
                                className="p-1.5 rounded-lg bg-[#F5F0E8] hover:bg-[#EAE4DC] text-[#4A453F] transition-colors cursor-pointer"
                                title="Salin Link"
                              >
                                {copiedId === guest.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
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
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 text-[11px] shadow-2xs transition-all cursor-pointer"
                                title="Kirim Undangan via WhatsApp"
                              >
                                <Share2 className="w-3 h-3" />
                                <span>Kirim WA</span>
                              </button>
                              <button
                                onClick={() => handleDeleteGuest(guest.id)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
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
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{coupleSuccessMessage}</span>
              </div>
            )}

            {coupleErrorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fade-in font-medium">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{coupleErrorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card Mempelai Pria */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E5E0D8] shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#E8E2D8]">
                  <div className="w-9 h-9 rounded-full bg-[#F3EFEA] border border-[#E0D8CE] flex items-center justify-center text-[#846030]">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#2C2825]">
                      Mempelai Pria (Groom)
                    </h3>
                    <p className="text-[10px] text-[#7E776F]">
                      Nama lengkap, nama panggilan, dan kedua orang tua
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-[11px] text-[#4A453F] block mb-1 font-medium">
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#4A453F] block mb-1 font-medium">
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                    />
                  </div>

                  <div className="pt-3 border-t border-[#EFEAE2] space-y-3">
                    <p className="text-[10px] uppercase tracking-wider text-[#846030] font-semibold">
                      Nama Orang Tua Mempelai Pria:
                    </p>

                    <div>
                      <label className="text-[11px] text-[#4A453F] block mb-1">
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#4A453F] block mb-1">
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#4A453F] block mb-1">
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Card Mempelai Wanita */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E5E0D8] shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#E8E2D8]">
                  <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#2C2825]">
                      Mempelai Wanita (Bride)
                    </h3>
                    <p className="text-[10px] text-[#7E776F]">
                      Nama lengkap, nama panggilan, dan kedua orang tua
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-[11px] text-[#4A453F] block mb-1 font-medium">
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#4A453F] block mb-1 font-medium">
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                    />
                  </div>

                  <div className="pt-3 border-t border-[#EFEAE2] space-y-3">
                    <p className="text-[10px] uppercase tracking-wider text-[#846030] font-semibold">
                      Nama Orang Tua Mempelai Wanita:
                    </p>

                    <div>
                      <label className="text-[11px] text-[#4A453F] block mb-1">
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#4A453F] block mb-1">
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#4A453F] block mb-1">
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingCouple}
                className="px-8 py-3 rounded-xl bg-[#4A453F] hover:bg-[#34302C] text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingCouple ? 'Menyimpan Perubahan...' : 'Simpan Data Pengantin & Orang Tua'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: MUSIC CONFIG */}
        {activeTab === 'music' && (
          <form onSubmit={handleSaveMusic} className="bg-white rounded-2xl p-6 sm:p-8 space-y-6 border border-[#E5E0D8] shadow-xs">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#2C2825] font-semibold text-base sm:text-lg">
                  <Music className="w-5 h-5 text-[#846030]" />
                  <span>Pengaturan Musik Latar Undangan</span>
                </div>
                <p className="text-xs text-[#7E776F]">
                  Pilih musik romantis yang akan diputar otomatis saat tamu membuka undangan pernikahan.
                </p>
              </div>

              {/* Status Musik Aktif */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs shrink-0 font-medium">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Musik Aktif: <strong className="font-semibold text-[#2C2825]">{musicForm.title || musicForm.url}</strong></span>
              </div>
            </div>

            {/* Notification messages */}
            {musicSuccessMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in font-medium">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{musicSuccessMessage}</span>
              </div>
            )}
            {musicErrorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fade-in font-medium">
                <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{musicErrorMessage}</span>
              </div>
            )}

            {/* Hidden HTML5 Audio Element for live preview */}
            <audio 
              ref={audioPreviewRef} 
              onEnded={() => setIsPreviewPlaying(false)}
              onError={() => setIsPreviewPlaying(false)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dropdown Pemilihan Lagu */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#4A453F] uppercase tracking-wider">
                  Pilih Lagu dari Dropdown
                </label>
                <div className="relative">
                  <select
                    value={musicForm.url}
                    onChange={(e) => handleMusicSelect(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl px-4 py-3 text-sm text-[#2C2825] focus:outline-none focus:border-[#C5A880] transition-colors cursor-pointer appearance-none"
                  >
                    {musicOptions.map((opt) => (
                      <option key={opt.id} value={opt.url} className="bg-white text-[#2C2825]">
                        🎵 {opt.title} ({opt.name})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
                    ▼
                  </div>
                </div>
                <p className="text-[11px] text-[#7E776F]">
                  Daftar lagu dideteksi otomatis dari folder <code className="text-[#846030] bg-[#F5F0E8] px-1 py-0.5 rounded">public/music/</code>.
                </p>
              </div>

              {/* Judul Tampilan Lagu */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#4A453F] uppercase tracking-wider">
                  Judul Tampilan Lagu
                </label>
                <input
                  type="text"
                  value={musicForm.title}
                  onChange={(e) => setMusicForm({ ...musicForm, title: e.target.value })}
                  placeholder="Contoh: Romantic Wedding Melody"
                  className="w-full bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl px-4 py-3 text-sm text-[#2C2825] placeholder-[#A3988C] focus:outline-none focus:border-[#C5A880] transition-colors"
                />
                <p className="text-[11px] text-[#7E776F]">
                  Judul ini akan ditampilkan saat tombol musik di-hover oleh tamu.
                </p>
              </div>
            </div>

            {/* Cuplikan Musik / Audio Preview Player Card */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3EFEA] text-[#846030] border border-[#E0D8CE] flex items-center justify-center shrink-0">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#2C2825]">
                    {musicForm.title || 'Lagu Terpilih'}
                  </p>
                  <p className="text-[11px] text-[#7E776F] font-mono">
                    File: {musicForm.url}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleAudioPreview}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                  isPreviewPlaying
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-white hover:bg-[#F5F0E8] text-[#2C2825] border border-[#DDD6CC]'
                }`}
              >
                {isPreviewPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Jeda Cuplikan</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Dengarkan Cuplikan Lagu</span>
                  </>
                )}
              </button>
            </div>

            {/* Tips Penambahan Lagu Baru */}
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Cara Menambahkan Koleksi Lagu Baru:</span>
              </p>
              <p className="text-[#59524A] leading-relaxed text-[11px]">
                Cukup letakkan file audio baru (format <code className="text-[#846030] bg-white px-1 py-0.5 rounded border border-amber-200">.mp3</code>) ke dalam folder <code className="text-[#846030] bg-white px-1 py-0.5 rounded border border-amber-200">public/music/</code> di proyek Anda. Lagu baru tersebut akan langsung otomatis muncul di dropdown pilihan di atas.
              </p>
            </div>

            {/* Action Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingMusic}
                className="px-8 py-3 rounded-xl bg-[#4A453F] hover:bg-[#34302C] text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingMusic ? 'Menyimpan Musik...' : 'Simpan Pengaturan Musik'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: RSVP LIST */}
        {activeTab === 'rsvp' && (
          <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F1EB] text-[#4A453F] font-semibold uppercase tracking-wider border-b border-[#E8E2D8]">
                  <tr>
                    <th className="py-3 px-4">Nama Tamu</th>
                    <th className="py-3 px-4">Status Kehadiran</th>
                    <th className="py-3 px-4">Jumlah Pax</th>
                    <th className="py-3 px-4">Catatan / Pesan</th>
                    <th className="py-3 px-4 text-right">Waktu Konfirmasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEAE2]">
                  {rsvps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#7E776F]">
                        Belum ada data konfirmasi kehadiran (RSVP) yang masuk.
                      </td>
                    </tr>
                  ) : (
                    rsvps.map((item) => (
                      <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-[#2C2825]">
                          {item.guestName}
                        </td>
                        <td className="py-3.5 px-4">
                          {item.attendance === 'hadir' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                              ✓ Hadir
                            </span>
                          )}
                          {item.attendance === 'tidak_hadir' && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
                              ✕ Berhalangan
                            </span>
                          )}
                          {item.attendance === 'ragu' && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                              ? Masih Ragu
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-[#2C2825]">
                          {item.guestCount > 0 ? `${item.guestCount} Orang` : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-[#59524A] max-w-xs truncate">
                          {item.message || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right text-[#8C7B6B]">
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

        {/* TAB 4: WISHES MODERATION */}
        {activeTab === 'wishes' && (
          <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F1EB] text-[#4A453F] font-semibold uppercase tracking-wider border-b border-[#E8E2D8]">
                  <tr>
                    <th className="py-3 px-4">Pengirim</th>
                    <th className="py-3 px-4">Hubungan</th>
                    <th className="py-3 px-4">Isi Doa / Ucapan</th>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4 text-right">Moderasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEAE2]">
                  {wishes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#7E776F]">
                        Belum ada ucapan yang masuk.
                      </td>
                    </tr>
                  ) : (
                    wishes.map((item) => (
                      <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-[#2C2825]">
                          {item.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-[#F3EFEA] text-[#846030] border border-[#E0D8CE] text-[10px] font-medium">
                            {item.relationship || 'Tamu'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#4A453F] max-w-md">
                          {item.message}
                        </td>
                        <td className="py-3.5 px-4 text-[#8C7B6B] text-[11px] whitespace-nowrap font-mono">
                          {(() => {
                            try {
                              const d = new Date(item.createdAt);
                              if (isNaN(d.getTime())) return '-';
                              const dateStr = d.toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              });
                              const hours = String(d.getHours()).padStart(2, '0');
                              const minutes = String(d.getMinutes()).padStart(2, '0');
                              return `${dateStr}, ${hours}:${minutes} WIB`;
                            } catch {
                              return '-';
                            }
                          })()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteWish(item.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
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

      {/* QR Pass Preview & Download Modal */}
      {selectedQrGuest && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedQrGuest(null)}
        >
          <div 
            className="relative w-full max-w-sm rounded-3xl bg-[#FAF8F5] text-[#2C2825] p-6 shadow-2xl border border-[#DDD5CA] space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedQrGuest(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#F3EFEA] hover:bg-[#EAE4DC] text-[#7E776F] hover:text-[#2C2825] flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Badge */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#846030] border border-[#D4AF37]/30">
                Wedding Pass &bull; Meja Penerima Tamu
              </span>
              <h3 className="text-xl font-serif font-bold text-[#2C2825] pt-2">
                {selectedQrGuest.name}
              </h3>
              <p className="text-xs text-[#7E776F]">
                Kategori: <strong className="text-[#846030]">{selectedQrGuest.category || 'Umum'}</strong>
              </p>
            </div>

            {/* QR Code Canvas/Image */}
            <div className="flex justify-center py-1">
              <div className="p-3 bg-white rounded-2xl border-2 border-[#D4AF37]/40 shadow-md">
                {qrModalDataUrl ? (
                  <img
                    src={qrModalDataUrl}
                    alt={`QR Code ${selectedQrGuest.name}`}
                    className="w-48 h-48 rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-[#7E776F]">
                    Membuat QR Code...
                  </div>
                )}
              </div>
            </div>

            {/* Code Display */}
            <div className="p-3 rounded-2xl bg-[#F5F0E8] border border-[#E0D8CE] flex items-center justify-between">
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-wider text-[#7E776F]">Kode Unik Tamu</p>
                <p className="font-mono font-bold text-sm text-[#846030]">
                  {generateGuestCode(selectedQrGuest.name)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(generateGuestCode(selectedQrGuest.name))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#DDD6CC] hover:bg-[#F3EFEA] text-xs font-medium text-[#4A453F] transition-colors cursor-pointer shadow-2xs"
              >
                {isCopiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#846030]" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            {/* Attendance Status */}
            {selectedQrGuest.isCheckedIn ? (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-center gap-1.5 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>
                  Tamu Sudah Hadir ({selectedQrGuest.pax || 1} Pax)
                  {selectedQrGuest.checkedInAt && (
                    <span className="text-[11px] text-emerald-700 ml-1">
                      • {new Date(selectedQrGuest.checkedInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                  )}
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-800 text-xs flex items-center justify-center gap-1.5">
                <span>Status: Belum Check-in</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="w-full py-2.5 px-4 rounded-xl bg-[#4A453F] hover:bg-[#34302C] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Gambar QR (PNG)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedQrGuest(null)}
                className="w-full py-1.5 text-xs text-[#7E776F] hover:text-[#2C2825] transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
