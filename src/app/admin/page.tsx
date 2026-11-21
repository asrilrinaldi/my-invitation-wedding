'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Users, CheckCircle, XCircle, MessageSquare, Plus, Trash2, 
  Copy, Check, ExternalLink, Share2, ArrowLeft, RefreshCw, Eye, EyeOff,
  Heart, Save, Sparkles, User, ShieldCheck, Music, Play, Pause, Volume2, Camera, QrCode,
  Download, X, Calendar, Clock, MapPin, Navigation, Map, Lock, LogOut, KeyRound
} from 'lucide-react';
import QRCode from 'qrcode';
import { Guest, RSVP, Wish, WeddingData, MusicTrackOption } from '@/lib/types';
import { weddingConfig } from '@/lib/data';

type CoupleConfig = WeddingData['couple'];
type EventConfig = WeddingData['event'];

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

// Helper to format ISO date string to YYYY-MM-DD for date input
function getIsoDateOnly(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '2027-06-20';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '2027-06-20';
  }
}

// Helper to format ISO date string to HH:mm for time input
function getIsoTimeOnly(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '08:00';
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  } catch {
    return '08:00';
  }
}

// Helper to format date into Indonesian display text: e.g. "Minggu, 20 Juni 2027"
function formatIndonesianDate(dateVal: string): string {
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dayName = days[d.getDay()];
    const dateNum = d.getDate();
    const monthName = months[d.getMonth()];
    const year = d.getFullYear();
    return `${dayName}, ${dateNum} ${monthName} ${year}`;
  } catch {
    return '';
  }
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'guests' | 'couple' | 'event' | 'music' | 'rsvp' | 'wishes'>('guests');
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

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  // Event Config State
  const [eventForm, setEventForm] = useState<EventConfig>(weddingConfig.event);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [eventSuccessMessage, setEventSuccessMessage] = useState('');
  const [eventErrorMessage, setEventErrorMessage] = useState('');

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

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      const authed = Boolean(data.authenticated);
      setIsAuthenticated(authed);
      if (authed) {
        fetchData();
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setLoginUsername('');
        setLoginPassword('');
        fetchData();
      } else {
        setLoginError(data.message || 'Username atau kata sandi salah.');
      }
    } catch (err) {
      setLoginError('Terjadi kesalahan jaringan.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthenticated(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [guestsRes, rsvpsRes, wishesRes, statsRes, coupleRes, musicRes, eventRes] = await Promise.all([
        fetch('/api/guests', { cache: 'no-store' }),
        fetch('/api/rsvp', { cache: 'no-store' }),
        fetch('/api/wishes', { cache: 'no-store' }),
        fetch('/api/stats', { cache: 'no-store' }),
        fetch('/api/config/couple', { cache: 'no-store' }),
        fetch('/api/config/music', { cache: 'no-store' }),
        fetch('/api/config/event', { cache: 'no-store' }),
      ]);

      const [guestsData, rsvpsData, wishesData, statsData, coupleData, musicData, eventData] = await Promise.all([
        guestsRes.json(),
        rsvpsRes.json(),
        wishesRes.json(),
        statsRes.json(),
        coupleRes.json(),
        musicRes.json(),
        eventRes.json(),
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
      if (eventData.success && eventData.data) {
        setEventForm(eventData.data);
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

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEvent(true);
    setEventSuccessMessage('');
    setEventErrorMessage('');

    try {
      const res = await fetch('/api/config/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm),
      });

      const data = await res.json();
      if (data.success) {
        setEventSuccessMessage('Tanggal dan rangkaian acara pernikahan berhasil diperbarui!');
        setTimeout(() => setEventSuccessMessage(''), 4500);
        fetchData();
      } else {
        setEventErrorMessage(data.message || 'Gagal menyimpan data acara pernikahan.');
      }
    } catch (err) {
      setEventErrorMessage('Terjadi kesalahan jaringan.');
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleDateChange = (dateVal: string) => {
    if (!dateVal) return;
    const timeVal = getIsoTimeOnly(eventForm.date);
    const newIso = `${dateVal}T${timeVal}:00+07:00`;
    const formatted = formatIndonesianDate(dateVal);
    setEventForm(prev => ({
      ...prev,
      date: newIso,
      displayDate: formatted || prev.displayDate,
    }));
  };

  const handleTimeChange = (timeVal: string) => {
    if (!timeVal) return;
    const dateVal = getIsoDateOnly(eventForm.date);
    const newIso = `${dateVal}T${timeVal}:00+07:00`;
    setEventForm(prev => ({
      ...prev,
      date: newIso,
    }));
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
    const groomFull = coupleForm.groom?.fullName || weddingConfig.couple.groom.fullName;
    const brideFull = coupleForm.bride?.fullName || weddingConfig.couple.bride.fullName;
    const groomNick = coupleForm.groom?.nickname || weddingConfig.couple.groom.nickname;
    const brideNick = coupleForm.bride?.nickname || weddingConfig.couple.bride.nickname;
    const eventDate = eventForm.displayDate || weddingConfig.event.displayDate;
    const eventLoc = eventForm.locationName || weddingConfig.event.locationName;

    return `Kepada Yth.
Bapak/Ibu/Saudara/i *${guest.name}*

_Assalamu'alaikum Warahmatullahi Wabarakatuh_

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk berkenan menghadiri hari bahagia pernikahan kami:

💍 *${groomFull} & ${brideFull}*
🗓️ *${eventDate}*
📍 *${eventLoc}, Bandar Lampung*

Detail acara, QR Pass, dan konfirmasi kehadiran dapat diakses melalui tautan undangan berikut:
${link}

🎫 *Kode Tamu:* ${generateGuestCode(guest.name)}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu.

_Wassalamu'alaikum Warahmatullahi Wabarakatuh_
Hormat kami yang berbahagia,
*${groomNick} & ${brideNick}*`;
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

  // 1. Loading screen while verifying credentials
  if (isAuthenticated === null) {
    return (
      <div 
        className="min-h-screen bg-[#EDE8E1] flex items-center justify-center p-6 text-center select-none"
        style={{
          backgroundImage: "url('/images/paper-grain.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '180px 180px',
        }}
      >
        <div className="flex flex-col items-center gap-3 bg-white/85 backdrop-blur-md p-8 rounded-3xl border border-[#DDD6CC] shadow-md animate-fade-in">
          <RefreshCw className="w-7 h-7 text-[#846030] animate-spin" />
          <p className="text-xs font-serif text-[#59524A] tracking-wider uppercase">Memeriksa Kredensial Akses...</p>
        </div>
      </div>
    );
  }

  // 2. Login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div 
        className="min-h-screen bg-[#EDE8E1] flex items-center justify-center p-4 sm:p-6 select-none"
        style={{
          backgroundImage: "url('/images/paper-grain.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '180px 180px',
        }}
      >
        <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6 border border-[#DDD6CC] animate-fade-in-up">
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center items-center py-1">
              <img
                src="/logo/logo.PNG"
                alt="Logo Asril & Sisi"
                className="h-20 w-auto object-contain brightness-0 opacity-80 pointer-events-none select-none"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5ECE1] border border-[#DDD4C8] text-[#8C7B6B] text-[10px] uppercase tracking-wider font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8C7B6B]" />
              <span>Akses Khusus Pengantin &amp; Admin</span>
            </div>

            <h1 className="text-2xl font-serif font-bold text-[#2C2825]">
              Login Dashboard
            </h1>
            <p className="text-xs text-[#7E776F] leading-relaxed">
              Halaman ini dilindungi. Masukkan kredensial admin untuk mengelola daftar tamu, tanggal pernikahan, musik, dan konfirmasi kehadiran.
            </p>
          </div>

          {/* Login Error Notification */}
          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fade-in font-medium">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-[#4A453F] block mb-1">
                Username Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7B6B]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Masukkan username"
                  required
                  autoFocus
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#4A453F] block mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7B6B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C7B6B] hover:text-[#4A453F] transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-[#4A453F] hover:bg-[#34302C] text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>{isLoggingIn ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C2825] p-4 sm:p-8 font-sans">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D8] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2825]">
            Dashboard Pengantin
          </h1>
          <p className="text-xs text-[#7E776F]">
            Pernikahan {coupleForm.groom?.nickname || weddingConfig.couple.groom.nickname} &amp; {coupleForm.bride?.nickname || weddingConfig.couple.bride.nickname} • {eventForm.displayDate || weddingConfig.event.displayDate}
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

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 text-xs font-semibold border border-rose-200 shadow-2xs transition-all w-fit cursor-pointer"
            title="Keluar dari sesi dashboard"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
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
            onClick={() => setActiveTab('event')}
            className={`pb-3 px-4 text-xs font-semibold tracking-wider uppercase transition-colors border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'event'
                ? 'border-[#4A453F] text-[#2C2825]'
                : 'border-transparent text-[#7E776F] hover:text-[#2C2825]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>Tanggal &amp; Lokasi Acara</span>
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

        {/* TAB: WEDDING DATE & EVENT CONFIGURATION */}
        {activeTab === 'event' && (
          <form onSubmit={handleSaveEvent} className="space-y-6 animate-fade-in">
            {/* Header info */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E5E0D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#2C2825] font-semibold text-base sm:text-lg">
                  <Calendar className="w-5 h-5 text-[#846030]" />
                  <span>Pengaturan Tanggal &amp; Rangkaian Acara Pernikahan</span>
                </div>
                <p className="text-xs text-[#7E776F]">
                  Atur tanggal hari pernikahan, waktu akad &amp; resepsi, serta lokasi acara yang tampil di seluruh halaman undangan dan pesan WhatsApp.
                </p>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs shrink-0 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#846030]" />
                <span>Target: <strong className="font-semibold text-[#2C2825]">{eventForm.displayDate || '20 Juni 2027'}</strong></span>
              </div>
            </div>

            {/* Notification messages */}
            {eventSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{eventSuccessMessage}</span>
              </div>
            )}

            {eventErrorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fade-in font-medium">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{eventErrorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Tanggal & Waktu Acara */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E5E0D8] shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#E8E2D8]">
                  <div className="w-9 h-9 rounded-full bg-[#F3EFEA] border border-[#E0D8CE] flex items-center justify-center text-[#846030]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#2C2825]">
                      Tanggal Pernikahan &amp; Countdown
                    </h3>
                    <p className="text-[10px] text-[#7E776F]">
                      Target hitung mundur waktu dan format tanggal tampilan
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Tanggal & Jam Picker */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[#4A453F] block mb-1 font-medium">
                        Pilih Tanggal Acara (Kalender)
                      </label>
                      <input
                        type="date"
                        value={getIsoDateOnly(eventForm.date)}
                        onChange={(e) => handleDateChange(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#4A453F] block mb-1 font-medium">
                        Jam Mulai (Target Countdown)
                      </label>
                      <input
                        type="time"
                        value={getIsoTimeOnly(eventForm.date)}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Countdown Status Badge */}
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-[11px] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#846030] shrink-0" />
                    <span className="text-[#59524A]">
                      {(() => {
                        const target = new Date(eventForm.date).getTime();
                        const diff = target - Date.now();
                        if (isNaN(target)) return 'Format tanggal belum valid';
                        if (diff <= 0) return 'Hari pernikahan telah tiba / telah terlewati';
                        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        return `Status Countdown: Tersisa ${d} Hari ${h} Jam ${m} Menit`;
                      })()}
                    </span>
                  </div>

                  {/* Teks Format Tanggal Tampilan */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-[#4A453F] font-medium">
                        Teks Tanggal Tampilan Undangan
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const dateOnly = getIsoDateOnly(eventForm.date);
                          const formatted = formatIndonesianDate(dateOnly);
                          if (formatted) {
                            setEventForm(prev => ({ ...prev, displayDate: formatted }));
                          }
                        }}
                        className="text-[10px] text-[#846030] hover:text-[#5C421E] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        title="Klik untuk membuat format bahasa Indonesia otomatis sesuai kalender di atas"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Format Otomatis Kalender</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={eventForm.displayDate}
                      onChange={(e) => setEventForm({ ...eventForm, displayDate: e.target.value })}
                      placeholder="Contoh: Minggu, 20 Juni 2027"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                    />
                    <p className="text-[10px] text-[#7E776F] mt-1">
                      Teks ini ditampilkan pada sampul utama, judul acara, teks WhatsApp, dan detail rangkaian acara.
                    </p>
                  </div>

                  {/* Jam Akad & Resepsi */}
                  <div className="pt-2 border-t border-[#EFEAE2] space-y-3">
                    <p className="text-[10px] uppercase tracking-wider text-[#846030] font-semibold">
                      Waktu Pelaksanaan Sesi:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-[#4A453F] block mb-1">
                          Waktu Akad Nikah
                        </label>
                        <input
                          type="text"
                          value={eventForm.akadTime}
                          onChange={(e) => setEventForm({ ...eventForm, akadTime: e.target.value })}
                          placeholder="Contoh: 08:00 - 10:00 WIB"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-[#4A453F] block mb-1">
                          Waktu Resepsi Pernikahan
                        </label>
                        <input
                          type="text"
                          value={eventForm.resepsiTime}
                          onChange={(e) => setEventForm({ ...eventForm, resepsiTime: e.target.value })}
                          placeholder="Contoh: 11:00 - 17:00 WIB"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Lokasi & Alamat Acara */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E5E0D8] shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#E8E2D8]">
                  <div className="w-9 h-9 rounded-full bg-[#F3EFEA] border border-[#E0D8CE] flex items-center justify-center text-[#846030]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#2C2825]">
                      Lokasi &amp; Tautan Peta
                    </h3>
                    <p className="text-[10px] text-[#7E776F]">
                      Tempat pelaksanaan dan petunjuk navigasi Google Maps
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-[11px] text-[#4A453F] block mb-1 font-medium">
                      Nama Lokasi / Tempat Acara
                    </label>
                    <input
                      type="text"
                      value={eventForm.locationName}
                      onChange={(e) => setEventForm({ ...eventForm, locationName: e.target.value })}
                      placeholder="Contoh: Kediaman Mempelai / Gedung Serbaguna"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#4A453F] block mb-1 font-medium">
                      Alamat Lengkap
                    </label>
                    <textarea
                      rows={3}
                      value={eventForm.address}
                      onChange={(e) => setEventForm({ ...eventForm, address: e.target.value })}
                      placeholder="Jalan, No Rumah, Kelurahan, Kecamatan, Kota / Kabupaten..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#4A453F] block mb-1 font-medium">
                      Tautan Google Maps (Navigasi Tamu)
                    </label>
                    <input
                      type="url"
                      value={eventForm.gmapsUrl}
                      onChange={(e) => setEventForm({ ...eventForm, gmapsUrl: e.target.value })}
                      placeholder="Contoh: https://maps.app.goo.gl/..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#4A453F] block mb-1">
                      Tautan Embed Google Maps (Iframe Peta, Opsional)
                    </label>
                    <input
                      type="text"
                      value={eventForm.gmapsEmbedUrl || ''}
                      onChange={(e) => setEventForm({ ...eventForm, gmapsEmbedUrl: e.target.value })}
                      placeholder="Contoh: https://maps.google.com/maps?q=...&output=embed"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E5E0D8] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#846030]" />
                  <h3 className="text-sm font-serif font-bold text-[#2C2825]">
                    Pratinjau Tampilan Rangkaian Acara di Undangan
                  </h3>
                </div>
                <span className="text-[10px] text-[#7E776F]">Tampilan Langsung</span>
              </div>

              <div className="p-6 rounded-2xl bg-[#F5F1EB] border border-[#E5DFD6] space-y-4 max-w-xl mx-auto text-center">
                <p className="text-[11px] uppercase tracking-[0.25em] text-[#8C7B6B] font-medium">
                  Rangkaian Acara
                </p>
                <h4 className="text-xl font-serif font-semibold text-[#2C2825]">
                  {eventForm.displayDate || 'Minggu, 20 Juni 2027'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Akad Nikah Preview */}
                  <div className="p-4 rounded-xl bg-white border border-[#DDD6CC] shadow-2xs space-y-1">
                    <p className="font-serif font-bold text-sm text-[#2C2825]">Akad Nikah</p>
                    <p className="text-xs text-[#846030] font-medium">{eventForm.akadTime || '08:00 - 10:00 WIB'}</p>
                    <p className="text-[11px] text-[#7A7167]">{eventForm.locationName || 'Kediaman Mempelai'}</p>
                  </div>

                  {/* Resepsi Preview */}
                  <div className="p-4 rounded-xl bg-white border border-[#DDD6CC] shadow-2xs space-y-1">
                    <p className="font-serif font-bold text-sm text-[#2C2825]">Resepsi Pernikahan</p>
                    <p className="text-xs text-[#846030] font-medium">{eventForm.resepsiTime || '11:00 - 17:00 WIB'}</p>
                    <p className="text-[11px] text-[#7A7167]">{eventForm.locationName || 'Kediaman Mempelai'}</p>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#6B635B] space-y-1">
                  <p className="font-medium text-[#2C2825]">{eventForm.locationName}</p>
                  <p className="text-[10.5px] line-clamp-2">{eventForm.address}</p>
                </div>
              </div>
            </div>

            {/* Action Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingEvent}
                className="px-8 py-3 rounded-xl bg-[#4A453F] hover:bg-[#34302C] text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingEvent ? 'Menyimpan Tanggal & Acara...' : 'Simpan Tanggal & Lokasi Acara'}</span>
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
