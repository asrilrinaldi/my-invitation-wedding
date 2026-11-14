'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMusic } from '@/lib/context/MusicContext';

interface AudioPlayerProps {
  audioSrc?: string;
  autoPlayTrigger?: boolean;
}

export default function AudioPlayer({ 
  audioSrc, 
  autoPlayTrigger = false 
}: AudioPlayerProps) {
  const { music } = useMusic();
  const activeAudioSrc = audioSrc || music?.url || '/music/music001.mp3';

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Hide music button when photo preview is open to avoid overlapping the modal close button
  useEffect(() => {
    const handleGalleryModal = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOpen: boolean }>;
      if (customEvent && customEvent.detail) {
        setIsPhotoOpen(Boolean(customEvent.detail.isOpen));
      }
    };

    window.addEventListener('gallery-modal-change', handleGalleryModal);
    return () => {
      window.removeEventListener('gallery-modal-change', handleGalleryModal);
    };
  }, []);

  useEffect(() => {
    if (autoPlayTrigger && !hasInteracted && audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        })
        .catch((err) => {
          console.warn('Audio autoplay prevented by browser policy:', err);
        });
    }
  }, [autoPlayTrigger, hasInteracted]);

  // When active music URL changes dynamically
  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }
  }, [activeAudioSrc]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        })
        .catch(console.error);
    }
  };

  // Only show after user has clicked "Buka Undangan" or audio triggered
  if (!autoPlayTrigger && !hasInteracted) {
    return <audio ref={audioRef} src={activeAudioSrc} loop preload="auto" />;
  }

  return (
    <>
      <audio 
        ref={audioRef} 
        src={activeAudioSrc} 
        loop 
        preload="auto"
      />
      
      {/* Floating Audio Controller */}
      <div className={`fixed top-5 right-5 sm:top-6 sm:right-6 z-40 transition-opacity duration-300 ${
        isPhotoOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-fade-in'
      }`}>
        <button
          type="button"
          onClick={togglePlay}
          disabled={isPhotoOpen}
          aria-label={isPlaying ? 'Jeda Musik' : 'Putar Musik'}
          className="group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/85 hover:bg-white backdrop-blur-md shadow-xl border border-white/60 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer p-1.5"
          title={isPlaying ? `Jeda Musik (${music?.title || 'Romantic Wedding Melody'})` : `Putar Musik (${music?.title || 'Romantic Wedding Melody'})`}
        >
          <img
            src={isPlaying ? '/icon/play-music.png' : '/icon/pause-music.png'}
            alt={isPlaying ? 'Musik Sedang Berputar' : 'Musik Dijeda'}
            className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-200"
            style={{
              animation: isPlaying ? 'spin 4s linear infinite' : 'none',
              willChange: 'transform',
            }}
          />
        </button>
      </div>
    </>
  );
}
