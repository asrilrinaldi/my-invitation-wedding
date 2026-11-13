'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { weddingConfig } from '@/lib/data';
import { WeddingData } from '@/lib/types';

export type CoupleData = WeddingData['couple'];

interface CoupleContextType {
  couple: CoupleData;
  updateCouple: (newCouple: CoupleData) => void;
  refreshCouple: () => Promise<void>;
}

const CoupleContext = createContext<CoupleContextType>({
  couple: weddingConfig.couple,
  updateCouple: () => {},
  refreshCouple: async () => {},
});

export function CoupleProvider({ 
  children, 
  initialCouple 
}: { 
  children: React.ReactNode; 
  initialCouple?: CoupleData;
}) {
  const [couple, setCouple] = useState<CoupleData>(initialCouple || weddingConfig.couple);

  const refreshCouple = async () => {
    try {
      const res = await fetch('/api/config/couple', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.data) {
        setCouple(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch couple config:', err);
    }
  };

  useEffect(() => {
    refreshCouple();
  }, []);

  const updateCouple = (newCouple: CoupleData) => {
    setCouple(newCouple);
  };

  return (
    <CoupleContext.Provider value={{ couple, updateCouple, refreshCouple }}>
      {children}
    </CoupleContext.Provider>
  );
}

export function useCouple() {
  const context = useContext(CoupleContext);
  return context.couple;
}

export function useCoupleActions() {
  const context = useContext(CoupleContext);
  return {
    updateCouple: context.updateCouple,
    refreshCouple: context.refreshCouple,
  };
}
