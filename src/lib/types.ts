export interface Guest {
  id: string;
  name: string;
  slug: string;
  category?: 'Keluarga' | 'Teman' | 'Sahabat' | 'VIP' | 'Rekan Kerja' | 'Umum';
  phoneNumber?: string;
  customNote?: string;
  hasOpened?: boolean;
  createdAt: string;
}

export interface RSVP {
  id: string;
  guestName: string;
  attendance: 'hadir' | 'tidak_hadir' | 'ragu';
  guestCount: number;
  message?: string;
  createdAt: string;
}

export interface Wish {
  id: string;
  name: string;
  relationship?: string;
  message: string;
  createdAt: string;
}

export interface WeddingData {
  couple: {
    heroPhoto?: string;
    groom: {
      fullName: string;
      nickname: string;
      father: string;
      mother: string;
      photo: string;
      instagram?: string;
    };
    bride: {
      fullName: string;
      nickname: string;
      father: string;
      mother: string;
      photo: string;
      instagram?: string;
    };
  };
  event: {
    date: string;
    displayDate: string;
    akadTime: string;
    resepsiTime: string;
    locationName: string;
    address: string;
    gmapsUrl: string;
    gmapsEmbedUrl?: string;
  };
  bank: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    qrisUrl: string;
  };
  music: {
    url: string;
    title: string;
  };
}
