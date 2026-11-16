'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DesktopCover from '@/components/DesktopCover';
import InvitationHero from '@/components/InvitationHero';
import FloatingNavbar from '@/components/FloatingNavbar';
import QrCodeButton from '@/components/QrCodeButton';
import AudioPlayer from '@/components/AudioPlayer';
import CoupleSection from '@/components/CoupleSection';
import EventSection from '@/components/EventSection';
import LoveStorySection from '@/components/LoveStorySection';
import GallerySection from '@/components/GallerySection';
import RsvpSection from '@/components/RsvpSection';
import WishesSection from '@/components/WishesSection';
import GiftSection from '@/components/GiftSection';
import Footer from '@/components/Footer';

function WeddingInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawParam = searchParams.get('to') || searchParams.get('guest');
  const [displayName, setDisplayName] = useState('Tamu Undangan');
  const [isVerified, setIsVerified] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Strict Whitelist Validation for URL query parameters
  useEffect(() => {
    if (!rawParam) {
      setDisplayName('Tamu Undangan');
      setIsVerified(false);
      return;
    }

    fetch('/api/guests', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const cleanParam = rawParam.toLowerCase().trim().replace(/\s+/g, '-');
          const matched = data.data.find(
            (g: { slug: string; name: string }) =>
              g.slug.toLowerCase() === cleanParam ||
              g.name.toLowerCase() === rawParam.toLowerCase()
          );

          if (matched) {
            setDisplayName(matched.name);
            setIsVerified(true);
          } else {
            // Unregistered name typed arbitrarily in URL -> Reject, keep "Tamu Undangan", and reset URL!
            setDisplayName('Tamu Undangan');
            setIsVerified(false);
            router.replace('/');
          }
        }
      })
      .catch(() => {
        setDisplayName('Tamu Undangan');
        setIsVerified(false);
      });
  }, [rawParam, router]);

  const handleOpenInvitation = () => {
    setIsUnlocked(true);
    setIsAudioPlaying(true);
    if (isVerified && displayName && displayName !== 'Tamu Undangan') {
      fetch('/api/guests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: displayName }),
      }).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#EDE8E1] flex flex-col lg:flex-row relative">
      {/* Left Pane for Desktop */}
      <DesktopCover />

      {/* Right Pane: Invitation Screen with Cotton Paper Grain Texture */}
      <main 
        className="w-full lg:w-[42%] xl:w-[38%] min-h-screen bg-[#FAF8F5] relative z-20 shadow-[-20px_0_50px_-10px_rgba(46,41,37,0.22)] overflow-x-hidden"
        style={{
          backgroundImage: "url('/images/paper-grain.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '180px 180px',
        }}
      >
        {/* Smooth Gradient Seam along the left edge of Right Section on Desktop */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-16 xl:w-24 pointer-events-none z-30 bg-gradient-to-r from-black/25 via-black/8 to-transparent" />

        {/* Background Music Handler */}
        <AudioPlayer autoPlayTrigger={isAudioPlaying} />

        {/* Hero Section */}
        <InvitationHero 
          guestName={displayName}
          isUnlocked={isUnlocked}
          onOpenInvitation={handleOpenInvitation}
          isVerified={isVerified}
        />

        {/* Display remaining sections after opening */}
        {isUnlocked && (
          <div className="divide-y divide-[#EBE5DC]">
            <CoupleSection />
            <EventSection />
            <LoveStorySection />
            <GallerySection />
            <GiftSection />
            <RsvpSection initialGuestName={isVerified ? displayName : ''} />
            <WishesSection initialGuestName={isVerified ? displayName : ''} />
            <Footer />
          </div>
        )}
      </main>

      {/* Floating Elements at top level for reliable fixed positioning & clicks */}
      {isUnlocked && (
        <>
          <FloatingNavbar />
          <QrCodeButton guestName={displayName} />
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#EDE8E1] flex items-center justify-center text-[#59524A] font-serif">
        Memuat Undangan...
      </div>
    }>
      <WeddingInvitationContent />
    </Suspense>
  );
}
