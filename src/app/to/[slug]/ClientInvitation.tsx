'use client';

import React, { useState, useEffect } from 'react';
import DesktopCover from '@/components/DesktopCover';
import InvitationHero from '@/components/InvitationHero';
import FloatingNavbar from '@/components/FloatingNavbar';
import QrCodeButton from '@/components/QrCodeButton';
import FallingPetals from '@/components/FallingPetals';
import AudioPlayer from '@/components/AudioPlayer';
import CoupleSection from '@/components/CoupleSection';
import EventSection from '@/components/EventSection';
import LoveStorySection from '@/components/LoveStorySection';
import GallerySection from '@/components/GallerySection';
import RsvpSection from '@/components/RsvpSection';
import WishesSection from '@/components/WishesSection';
import GiftSection from '@/components/GiftSection';
import Footer from '@/components/Footer';

interface ClientInvitationProps {
  guestName: string;
  isVerified?: boolean;
  guestCategory?: string;
}

export default function ClientInvitation({ 
  guestName,
  isVerified = false,
  guestCategory = ''
}: ClientInvitationProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Automatically mark guest as opened upon visiting the verified URL
  useEffect(() => {
    if (isVerified && guestName && guestName !== 'Tamu Undangan') {
      fetch('/api/guests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: guestName }),
      }).catch(() => {});
    }
  }, [isVerified, guestName]);

  const handleOpenInvitation = () => {
    setIsUnlocked(true);
    setIsAudioPlaying(true);
    if (isVerified && guestName && guestName !== 'Tamu Undangan') {
      fetch('/api/guests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: guestName }),
      }).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#EDE8E1] flex flex-col lg:flex-row relative">
      {/* Left Pane for Desktop */}
      <DesktopCover />

      {/* Right Pane: Invitation Screen */}
      <main className="w-full lg:w-[42%] xl:w-[38%] min-h-screen bg-[#FAF8F5] relative z-20 shadow-[-20px_0_50px_-10px_rgba(46,41,37,0.22)] overflow-x-hidden">
        {/* Smooth Gradient Seam along the left edge of Right Section on Desktop */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-16 xl:w-24 pointer-events-none z-30 bg-gradient-to-r from-black/25 via-black/8 to-transparent" />

        {/* Background Music Handler */}
        <AudioPlayer autoPlayTrigger={isAudioPlaying} />

        {/* Hero Section */}
        <InvitationHero 
          guestName={guestName}
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
            <RsvpSection initialGuestName={isVerified ? guestName : ''} />
            <WishesSection initialGuestName={isVerified ? guestName : ''} />
            <Footer />
          </div>
        )}
      </main>

      {/* Floating Elements at top level for reliable fixed positioning & clicks */}
      {isUnlocked && (
        <>
          <FallingPetals />
          <FloatingNavbar />
          <QrCodeButton guestName={guestName} />
        </>
      )}
    </div>
  );
}
