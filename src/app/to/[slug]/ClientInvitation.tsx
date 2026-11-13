'use client';

import React, { useState, useEffect } from 'react';
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
      <main className="w-full lg:w-[42%] xl:w-[38%] min-h-screen bg-[#FAF8F5] relative shadow-2xl overflow-x-hidden">
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
          <FloatingNavbar />
          <QrCodeButton guestName={guestName} />
        </>
      )}
    </div>
  );
}
