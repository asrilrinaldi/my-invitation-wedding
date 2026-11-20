'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  QrCode, Camera, RefreshCw, CheckCircle, AlertCircle, 
  Users, UserCheck, Clock, Search, ArrowLeft, ShieldCheck, 
  Volume2, VolumeX, Flashlight, ChevronRight, Sparkles, X, Plus, Minus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Guest, RSVP } from '@/lib/types';

// Audio Chime synthesizer using Web Audio API (zero external asset dependency)
function playSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Two-tone pleasant luxury chime (E5 -> A5)
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc2.frequency.setValueAtTime(880.00, now + 0.12); // A5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.15);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch (e) {
    // ignore audio errors if blocked by browser
  }
}

function playWarningChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(330, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {
    // ignore
  }
}

interface ScanResult {
  guest: Guest;
  rsvp?: RSVP;
  alreadyCheckedIn: boolean;
  message: string;
}

export default function GuestScannerPage() {
  const [activeMode, setActiveMode] = useState<'camera' | 'search'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scan Result Modal
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [adjustedPax, setAdjustedPax] = useState<number>(1);

  // Stats & Guest List
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingGuests, setIsLoadingGuests] = useState(true);
  const [recentScans, setRecentScans] = useState<Guest[]>([]);

  const html5QrCodeRef = useRef<any>(null);
  const isScannerRunningRef = useRef(false);

  // Load guests data
  const loadGuests = async () => {
    setIsLoadingGuests(true);
    try {
      const res = await fetch('/api/guests', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setGuests(data.data);
        const checkedIn = data.data.filter((g: Guest) => g.isCheckedIn);
        setRecentScans(checkedIn.slice(0, 10));
      }
    } catch (err) {
      console.error('Error fetching guests:', err);
    } finally {
      setIsLoadingGuests(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, []);

  // Initialize and manage camera scanner
  useEffect(() => {
    if (activeMode !== 'camera') {
      stopCamera();
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setCameraError(null);
        // Dynamically import html5-qrcode to prevent SSR issues
        const { Html5Qrcode } = await import('html5-qrcode');

        if (!isMounted) return;

        // Clean up existing instance if any
        if (html5QrCodeRef.current && isScannerRunningRef.current) {
          try {
            await html5QrCodeRef.current.stop();
          } catch {
            // ignore
          }
        }

        const scannerId = 'reader-viewport';
        const scanner = new Html5Qrcode(scannerId);
        html5QrCodeRef.current = scanner;

        const config = {
          fps: 12,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            return {
              width: Math.floor(minEdge * 0.72),
              height: Math.floor(minEdge * 0.72),
            };
          },
          aspectRatio: 1.0,
        };

        await scanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText: string) => {
            handleDecodedQr(decodedText);
          },
          () => {
            // QR scanning in progress (no match yet)
          }
        );

        if (isMounted) {
          isScannerRunningRef.current = true;
          setIsCameraActive(true);
        }
      } catch (err: any) {
        console.error('Failed to start scanner:', err);
        if (isMounted) {
          setCameraError(
            err?.message || 'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser Anda.'
          );
          setIsCameraActive(false);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [activeMode]);

  const stopCamera = async () => {
    if (html5QrCodeRef.current && isScannerRunningRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        isScannerRunningRef.current = false;
        setIsCameraActive(false);
      } catch (e) {
        // ignore
      }
    }
  };

  // Process decoded QR text
  const handleDecodedQr = async (decodedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    // Pause scanner during result dialog
    if (html5QrCodeRef.current && isScannerRunningRef.current) {
      try {
        html5QrCodeRef.current.pause();
      } catch {
        // ignore
      }
    }

    try {
      const res = await fetch('/api/guests/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: decodedText }),
      });

      const data = await res.json();

      if (data.success && data.guest) {
        setScanResult({
          guest: data.guest,
          rsvp: data.rsvp,
          alreadyCheckedIn: Boolean(data.alreadyCheckedIn),
          message: data.message,
        });
        setAdjustedPax(data.guest.pax || data.rsvp?.guestCount || 1);

        if (soundEnabled) {
          if (data.alreadyCheckedIn) {
            playWarningChime();
          } else {
            playSuccessChime();
          }
        }

        // Haptic feedback
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.([80, 50, 80]);
        }

        // Confetti for new check-in
        if (!data.alreadyCheckedIn) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#D4AF37', '#10B981', '#FAF8F5', '#C5A880'],
          });
        }

        // Refresh stats & guest list
        loadGuests();
      } else {
        alert(data.message || 'QR Code tidak cocok dengan tamu terdaftar.');
        resumeScanner();
      }
    } catch (err) {
      console.error('Scan processing error:', err);
      alert('Gagal memproses kode QR. Silakan coba lagi.');
      resumeScanner();
    } finally {
      setIsProcessing(false);
    }
  };

  const resumeScanner = () => {
    setScanResult(null);
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.resume();
      } catch {
        // ignore
      }
    }
  };

  // Manual Check-in by Guest from Search list
  const handleManualCheckIn = async (guest: Guest) => {
    try {
      const res = await fetch('/api/guests/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: guest.id }),
      });
      const data = await res.json();
      if (data.success) {
        setScanResult({
          guest: data.guest,
          rsvp: data.rsvp,
          alreadyCheckedIn: Boolean(data.alreadyCheckedIn),
          message: data.message,
        });
        setAdjustedPax(data.guest.pax || data.rsvp?.guestCount || 1);
        if (soundEnabled) playSuccessChime();
        loadGuests();
      }
    } catch (err) {
      console.error('Manual check-in error:', err);
    }
  };

  // Undo Check-in
  const handleUndoCheckIn = async (guestId: string) => {
    if (!confirm('Batalkan status check-in tamu ini?')) return;
    try {
      const res = await fetch(`/api/guests/scan?id=${guestId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Check-in berhasil dibatalkan.');
        resumeScanner();
        loadGuests();
      }
    } catch (err) {
      console.error('Failed to undo check-in:', err);
    }
  };

  // Update pax count
  const handleUpdatePax = async (delta: number) => {
    if (!scanResult) return;
    const newPax = Math.max(1, adjustedPax + delta);
    setAdjustedPax(newPax);
    try {
      await fetch('/api/guests/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: scanResult.guest.id, pax: newPax }),
      });
      loadGuests();
    } catch {
      // ignore
    }
  };

  // Calculations for stats
  const totalGuests = guests.length;
  const checkedInCount = guests.filter((g) => g.isCheckedIn).length;
  const remainingCount = totalGuests - checkedInCount;
  const percentage = totalGuests > 0 ? Math.round((checkedInCount / totalGuests) * 100) : 0;

  // Filtered search list
  const filteredGuests = guests.filter((g) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      g.name.toLowerCase().includes(q) ||
      (g.category && g.category.toLowerCase().includes(q)) ||
      (g.phoneNumber && g.phoneNumber.includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C2825] flex flex-col font-sans select-none">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E8E2D8] px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="w-8 h-8 rounded-full bg-[#F3EFEA] hover:bg-[#EAE4DC] flex items-center justify-center text-[#4A453F] transition-colors"
            title="Kembali ke Dashboard Admin"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold font-serif text-[#2C2825] tracking-wide flex items-center gap-1.5">
              <span>Buku Tamu Digital &amp; QR Scanner</span>
              <span className="text-[10px] bg-[#D4AF37]/15 text-[#846030] border border-[#D4AF37]/30 px-1.5 py-0.2 rounded-full font-sans uppercase font-medium">
                Resepsi
              </span>
            </h1>
            <p className="text-[10px] text-[#7E776F]">
              Scan QR Pass Meja Penerima Tamu
            </p>
          </div>
        </div>

        {/* Audio Toggle & Admin link */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-full border text-xs transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-[#F5F0E8] text-[#846030] border-[#D4AF37]/40 shadow-xs'
                : 'bg-[#F0EBE3] text-gray-400 border-gray-300'
            }`}
            title={soundEnabled ? 'Suara Chime Aktif' : 'Suara Dimatikan'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Realtime Attendance Metric Summary Bar */}
      <div className="bg-[#F5F1EB] border-b border-[#E8E2D8] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 text-center">
          <div className="flex-1 bg-white p-2 rounded-xl border border-[#E5E0D8] shadow-xs">
            <p className="text-[10px] text-[#7E776F] uppercase tracking-wider font-medium">Total Undangan</p>
            <p className="text-base sm:text-lg font-bold font-serif text-[#2C2825]">{totalGuests}</p>
          </div>
          <div className="flex-1 bg-emerald-50 p-2 rounded-xl border border-emerald-200 shadow-xs">
            <p className="text-[10px] text-emerald-700 uppercase tracking-wider font-semibold">Sudah Hadir</p>
            <p className="text-base sm:text-lg font-bold font-serif text-emerald-800">{checkedInCount}</p>
          </div>
          <div className="flex-1 bg-white p-2 rounded-xl border border-[#E5E0D8] shadow-xs">
            <p className="text-[10px] text-[#7E776F] uppercase tracking-wider font-medium">Belum Hadir</p>
            <p className="text-base sm:text-lg font-bold font-serif text-[#7E776F]">{remainingCount}</p>
          </div>
          <div className="flex-1 bg-amber-50/80 p-2 rounded-xl border border-amber-200/80 shadow-xs">
            <p className="text-[10px] text-amber-800 uppercase tracking-wider font-semibold">Kehadiran</p>
            <p className="text-base sm:text-lg font-bold font-serif text-amber-900">{percentage}%</p>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="max-w-md mx-auto w-full px-4 pt-4">
        <div className="flex p-1 bg-[#EAE4DC] rounded-full border border-[#DDD6CC]">
          <button
            type="button"
            onClick={() => setActiveMode('camera')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'camera'
                ? 'bg-[#4A453F] text-white font-semibold shadow-sm'
                : 'text-[#6B635B] hover:text-[#2C2825]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Kamera QR Scanner</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('search')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'search'
                ? 'bg-[#4A453F] text-white font-semibold shadow-sm'
                : 'text-[#6B635B] hover:text-[#2C2825]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Cari Manual ({totalGuests})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl mx-auto w-full p-4 flex flex-col items-center">
        {activeMode === 'camera' ? (
          <div className="w-full space-y-4 flex flex-col items-center">
            {/* Viewfinder Container */}
            <div className="relative w-full max-w-[340px] aspect-square rounded-3xl overflow-hidden bg-black border-2 border-[#C5A880] shadow-xl flex items-center justify-center ring-4 ring-[#EAE4DC]">
              {/* HTML5 QR Code Render Element */}
              <div id="reader-viewport" className="w-full h-full overflow-hidden" />

              {/* Viewfinder Laser & Reticle Overlay */}
              <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-7 h-7 border-t-2 border-l-2 border-[#D4AF37]" />
                  <div className="w-7 h-7 border-t-2 border-r-2 border-[#D4AF37]" />
                </div>
                {/* Animated Laser Scanning Line */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-pulse shadow-[0_0_8px_#D4AF37]" />
                <div className="flex justify-between">
                  <div className="w-7 h-7 border-b-2 border-l-2 border-[#D4AF37]" />
                  <div className="w-7 h-7 border-b-2 border-r-2 border-[#D4AF37]" />
                </div>
              </div>

              {/* Camera Error Message */}
              {cameraError && (
                <div className="absolute inset-0 bg-[#FAF8F5]/95 p-6 flex flex-col items-center justify-center text-center space-y-3 z-20">
                  <AlertCircle className="w-8 h-8 text-rose-500" />
                  <p className="text-xs text-[#2C2825] leading-relaxed font-medium">{cameraError}</p>
                  <button
                    onClick={() => setActiveMode('search')}
                    className="px-4 py-2 rounded-full bg-[#4A453F] hover:bg-[#34302C] text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                  >
                    Beralih ke Cari Manual
                  </button>
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#7E776F] text-center max-w-xs">
              Arahkan kamera ke QR Code / Wedding Pass tamu yang tertera di smartphone mereka.
            </p>

            {/* Recent Check-ins Mini List */}
            {recentScans.length > 0 && (
              <div className="w-full mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#59524A] px-1 font-semibold">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tamu Baru Masuk</span>
                  </span>
                  <span className="text-[10px] text-[#8C7B6B]">Terbaru</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {recentScans.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E5E0D8] text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </div>
                        <div>
                          <p className="font-semibold text-[#2C2825]">{g.name}</p>
                          <p className="text-[10px] text-[#7E776F]">
                            {g.category || 'Umum'} • {g.pax || 1} Pax
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#8C7B6B] font-mono">
                        {g.checkedInAt
                          ? new Date(g.checkedInAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Baru saja'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Manual Search Mode */
          <div className="w-full space-y-4">
            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama tamu, kategori, atau telepon..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#DDD6CC] text-[#2C2825] placeholder-[#A3988C] text-xs focus:outline-none focus:border-[#C5A880] shadow-xs transition-colors"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2C2825]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtered Guest List */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {isLoadingGuests ? (
                <div className="p-8 text-center text-xs text-[#7E776F]">
                  Memuat daftar undangan...
                </div>
              ) : filteredGuests.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#7E776F] bg-white rounded-2xl border border-[#E5E0D8]">
                  Tamu tidak ditemukan dengan kata kunci &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                filteredGuests.map((guest) => (
                  <div
                    key={guest.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      guest.isCheckedIn
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 shadow-2xs'
                        : 'bg-white border-[#E5E0D8] text-[#2C2825] hover:border-[#C5A880] shadow-xs'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-[#2C2825]">{guest.name}</p>
                        {guest.category && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#F3EFEA] text-[#846030] border border-[#D4AF37]/30 font-medium">
                            {guest.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#7E776F]">
                        {guest.phoneNumber || 'Tanpa No. HP'}
                        {guest.isCheckedIn && guest.checkedInAt && (
                          <span className="text-emerald-700 ml-2 font-medium">
                            • Hadir:{' '}
                            {new Date(guest.checkedInAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </p>
                    </div>

                    {guest.isCheckedIn ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Sudah Hadir</span>
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleManualCheckIn(guest)}
                        className="px-3.5 py-1.5 rounded-full bg-[#4A453F] hover:bg-[#34302C] text-white font-semibold text-xs tracking-wider uppercase transition-transform active:scale-95 cursor-pointer shadow-xs"
                      >
                        Check-in
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal Result Pop-up (After Successful Scan) */}
      {scanResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#FAF8F5] text-[#2C2825] p-6 shadow-2xl border border-[#DDD5CA] space-y-5 text-center">
            {/* Status Badge */}
            <div className="flex justify-center">
              {scanResult.alreadyCheckedIn ? (
                <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-400 text-amber-600 flex items-center justify-center shadow-lg animate-bounce">
                  <AlertCircle className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-lg animate-bounce">
                  <CheckCircle className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span
                className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${
                  scanResult.alreadyCheckedIn
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {scanResult.alreadyCheckedIn ? '⚠️ Sudah Pernah Check-in' : '✓ Check-in Berhasil!'}
              </span>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2C2825] pt-2">
                {scanResult.guest.name}
              </h2>

              <p className="text-xs text-[#8C7B6B] font-medium">
                Kategori: {scanResult.guest.category || 'Tamu Undangan'}
              </p>
            </div>

            {/* Info Box */}
            <div className="p-3.5 rounded-2xl bg-[#EFEAE2] border border-[#DDD5CA] text-xs text-[#59524A] space-y-2 text-left">
              {scanResult.rsvp ? (
                <div className="flex justify-between items-center text-[11px]">
                  <span>Konfirmasi RSVP:</span>
                  <span className="font-semibold uppercase text-emerald-700">
                    {scanResult.rsvp.attendance === 'hadir' ? 'Hadir' : scanResult.rsvp.attendance}
                  </span>
                </div>
              ) : null}

              {/* Pax Counter Adjustment */}
              <div className="flex justify-between items-center pt-1 border-t border-[#DDD5CA]">
                <span>Jumlah Kehadiran (Pax):</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdatePax(-1)}
                    className="w-6 h-6 rounded-full bg-white border border-[#C5BBAF] flex items-center justify-center hover:bg-gray-100 active:scale-95"
                  >
                    <Minus className="w-3 h-3 text-[#4A453F]" />
                  </button>
                  <span className="font-bold text-sm text-[#2C2825] w-5 text-center">
                    {adjustedPax}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdatePax(1)}
                    className="w-6 h-6 rounded-full bg-white border border-[#C5BBAF] flex items-center justify-center hover:bg-gray-100 active:scale-95"
                  >
                    <Plus className="w-3 h-3 text-[#4A453F]" />
                  </button>
                </div>
              </div>

              {scanResult.alreadyCheckedIn && scanResult.guest.checkedInAt && (
                <p className="text-[10px] text-amber-700 pt-1">
                  Waktu Check-in Pertama:{' '}
                  {new Date(scanResult.guest.checkedInAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  WIB
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={resumeScanner}
                className="w-full py-3 rounded-full bg-[#4A453F] hover:bg-[#34302C] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Scan Tamu Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleUndoCheckIn(scanResult.guest.id)}
                className="text-[11px] text-rose-600 hover:underline pt-1"
              >
                Batalkan Status Check-in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
