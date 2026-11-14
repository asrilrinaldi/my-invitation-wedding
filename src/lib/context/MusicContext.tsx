'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { weddingConfig } from '@/lib/data';
import { WeddingData } from '@/lib/types';

export type MusicData = WeddingData['music'];

interface MusicContextType {
  music: MusicData;
  updateMusic: (newMusic: MusicData) => void;
  refreshMusic: () => Promise<void>;
}

const MusicContext = createContext<MusicContextType>({
  music: weddingConfig.music,
  updateMusic: () => {},
  refreshMusic: async () => {},
});

export function MusicProvider({ 
  children, 
  initialMusic 
}: { 
  children: React.ReactNode; 
  initialMusic?: MusicData;
}) {
  const [music, setMusic] = useState<MusicData>(initialMusic || weddingConfig.music);

  const refreshMusic = async () => {
    try {
      const res = await fetch('/api/config/music', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.data) {
        setMusic(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch music config:', err);
    }
  };

  useEffect(() => {
    refreshMusic();
  }, []);

  const updateMusic = (newMusic: MusicData) => {
    setMusic(newMusic);
  };

  return (
    <MusicContext.Provider value={{ music, updateMusic, refreshMusic }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  return context;
}
