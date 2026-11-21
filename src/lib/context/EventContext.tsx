'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { weddingConfig } from '@/lib/data';
import { WeddingData } from '@/lib/types';

export type EventData = WeddingData['event'];

interface EventContextType {
  event: EventData;
  updateEvent: (newEvent: EventData) => void;
  refreshEvent: () => Promise<void>;
}

const EventContext = createContext<EventContextType>({
  event: weddingConfig.event,
  updateEvent: () => {},
  refreshEvent: async () => {},
});

export function EventProvider({ 
  children, 
  initialEvent 
}: { 
  children: React.ReactNode; 
  initialEvent?: EventData;
}) {
  const [event, setEvent] = useState<EventData>(initialEvent || weddingConfig.event);

  const refreshEvent = async () => {
    try {
      const res = await fetch('/api/config/event', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.data) {
        setEvent(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch event config:', err);
    }
  };

  useEffect(() => {
    refreshEvent();
  }, []);

  const updateEvent = (newEvent: EventData) => {
    setEvent(newEvent);
  };

  return (
    <EventContext.Provider value={{ event, updateEvent, refreshEvent }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  return context.event;
}

export function useEventActions() {
  const context = useContext(EventContext);
  return {
    updateEvent: context.updateEvent,
    refreshEvent: context.refreshEvent,
  };
}
