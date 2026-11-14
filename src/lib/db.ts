import fs from 'fs';
import path from 'path';
import { Guest, RSVP, Wish, WeddingData } from './types';
import { weddingConfig } from './data';

interface DatabaseSchema {
  guests: Guest[];
  rsvps: RSVP[];
  wishes: Wish[];
  couple?: WeddingData['couple'];
  music?: WeddingData['music'];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'wedding-data.json');

const INITIAL_DATA: DatabaseSchema = {
  guests: [
    {
      id: "gst-1",
      name: "Bpk. Budi Santoso & Keluarga",
      slug: "budi-santoso",
      category: "Keluarga",
      phoneNumber: "081234567890",
      hasOpened: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "gst-2",
      name: "Siti Rahmawati, S.Kom",
      slug: "siti-rahmawati",
      category: "Sahabat",
      phoneNumber: "089876543210",
      hasOpened: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "gst-3",
      name: "Rizky Pratama",
      slug: "rizky-pratama",
      category: "Rekan Kerja",
      phoneNumber: "082112345678",
      hasOpened: false,
      createdAt: new Date().toISOString(),
    },
  ],
  rsvps: [
    {
      id: "rsvp-1",
      guestName: "Bpk. Budi Santoso & Keluarga",
      attendance: "hadir",
      guestCount: 3,
      message: "Insya Allah kami sekeluarga hadir mendoakan langsung kedua mempelai.",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: "rsvp-2",
      guestName: "Siti Rahmawati, S.Kom",
      attendance: "hadir",
      guestCount: 1,
      message: "Selamat ya Sisi dan Asril! Pasti hadir!",
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ],
  wishes: [
    {
      id: "wish-1",
      name: "Bpk. Budi Santoso",
      relationship: "Keluarga",
      message: "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fii khair. Selamat menempuh hidup baru untuk Ananda Asril & Sisi. Semoga menjadi keluarga sakinah, mawaddah, warahmah.",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: "wish-2",
      name: "Siti Rahmawati",
      relationship: "Sahabat",
      message: "Masya Allah akhirnya sampai di pelaminan! Selamat berbahagia Asril & Sisi, langgeng sampai kakek nenek, dilancarkan seluruh prosesi acaranya! Aamiin.",
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: "wish-3",
      name: "Dimas Anggara",
      relationship: "Teman",
      message: "Selamat kawan! Semoga rumah tangganya senantiasa diberkahi, penuh cinta dan rezeki yang melimpah. Bahagia selalu!",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ],
};

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
  }
}

function readData(): DatabaseSchema {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (error) {
    console.error('Error reading wedding database:', error);
    return INITIAL_DATA;
  }
}

function writeData(data: DatabaseSchema): void {
  ensureDataFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GUEST OPERATIONS
export function getGuests(): Guest[] {
  const data = readData();
  return data.guests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getGuestBySlug(slug: string): Guest | undefined {
  const data = readData();
  const normalized = decodeURIComponent(slug).toLowerCase().trim().replace(/[-_]/g, ' ');
  return data.guests.find(g => 
    g.slug.toLowerCase() === slug.toLowerCase() || 
    g.name.toLowerCase().trim() === normalized
  );
}

export function saveGuest(guestData: Omit<Guest, 'id' | 'createdAt'> & { id?: string }): Guest {
  const data = readData();
  const newGuest: Guest = {
    id: guestData.id || `gst-${Date.now()}`,
    name: guestData.name.trim(),
    slug: guestData.slug ? guestData.slug.toLowerCase().trim().replace(/\s+/g, '-') : guestData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
    category: guestData.category || 'Umum',
    phoneNumber: guestData.phoneNumber || '',
    customNote: guestData.customNote || '',
    hasOpened: false,
    createdAt: new Date().toISOString(),
  };

  const existingIdx = data.guests.findIndex(g => g.id === newGuest.id);
  if (existingIdx >= 0) {
    data.guests[existingIdx] = { ...data.guests[existingIdx], ...newGuest };
  } else {
    data.guests.unshift(newGuest);
  }

  writeData(data);
  return newGuest;
}

export function markGuestOpened(identifier: string): boolean {
  const data = readData();
  const clean = decodeURIComponent(identifier).toLowerCase().trim();
  const cleanSlug = clean.replace(/\s+/g, '-');

  const guest = data.guests.find(g => 
    g.slug.toLowerCase() === clean || 
    g.slug.toLowerCase() === cleanSlug ||
    g.name.toLowerCase().trim() === clean ||
    g.id.toLowerCase() === clean
  );

  if (guest && !guest.hasOpened) {
    guest.hasOpened = true;
    writeData(data);
    return true;
  }
  return Boolean(guest?.hasOpened);
}

export function deleteGuest(id: string): boolean {
  const data = readData();
  const initialLen = data.guests.length;
  data.guests = data.guests.filter(g => g.id !== id);
  if (data.guests.length !== initialLen) {
    writeData(data);
    return true;
  }
  return false;
}

// RSVP OPERATIONS
export function getRSVPs(): RSVP[] {
  const data = readData();
  return data.rsvps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveRSVP(rsvpData: Omit<RSVP, 'id' | 'createdAt'>): RSVP {
  const data = readData();
  const newRsvp: RSVP = {
    id: `rsvp-${Date.now()}`,
    guestName: rsvpData.guestName.trim(),
    attendance: rsvpData.attendance,
    guestCount: Number(rsvpData.guestCount) || 1,
    message: rsvpData.message?.trim(),
    createdAt: new Date().toISOString(),
  };

  data.rsvps.unshift(newRsvp);

  // Automatically mark guest as opened in guest list
  const cleanName = newRsvp.guestName.toLowerCase().trim();
  const cleanSlug = cleanName.replace(/\s+/g, '-');
  const guest = data.guests.find(g => 
    g.name.toLowerCase().trim() === cleanName ||
    g.slug.toLowerCase() === cleanSlug
  );
  if (guest) {
    guest.hasOpened = true;
  }

  writeData(data);
  return newRsvp;
}

// WISHES OPERATIONS
export function getWishes(): Wish[] {
  const data = readData();
  return data.wishes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveWish(wishData: Omit<Wish, 'id' | 'createdAt'>): Wish {
  const data = readData();
  const newWish: Wish = {
    id: `wish-${Date.now()}`,
    name: wishData.name.trim(),
    relationship: wishData.relationship || 'Tamu',
    message: wishData.message.trim(),
    createdAt: new Date().toISOString(),
  };

  data.wishes.unshift(newWish);

  // Automatically mark guest as opened in guest list
  const cleanName = newWish.name.toLowerCase().trim();
  const cleanSlug = cleanName.replace(/\s+/g, '-');
  const guest = data.guests.find(g => 
    g.name.toLowerCase().trim() === cleanName ||
    g.slug.toLowerCase() === cleanSlug
  );
  if (guest) {
    guest.hasOpened = true;
  }

  writeData(data);
  return newWish;
}

export function deleteWish(id: string): boolean {
  const data = readData();
  const initialLen = data.wishes.length;
  data.wishes = data.wishes.filter(w => w.id !== id);
  if (data.wishes.length !== initialLen) {
    writeData(data);
    return true;
  }
  return false;
}

// ADMIN STATS
export function getStats() {
  const data = readData();
  const totalGuests = data.guests.length;
  const totalOpened = data.guests.filter(g => g.hasOpened).length;
  const totalRsvp = data.rsvps.length;
  const attendingRsvps = data.rsvps.filter(r => r.attendance === 'hadir');
  const notAttendingRsvps = data.rsvps.filter(r => r.attendance === 'tidak_hadir');
  const totalAttendingGuests = attendingRsvps.reduce((acc, curr) => acc + curr.guestCount, 0);
  const totalWishes = data.wishes.length;

  return {
    totalGuests,
    totalOpened,
    totalRsvp,
    attendingCount: attendingRsvps.length,
    notAttendingCount: notAttendingRsvps.length,
    totalAttendingGuests,
    totalWishes,
  };
}

// COUPLE CONFIG OPERATIONS
export function getCouple(): WeddingData['couple'] {
  const data = readData();
  if (data.couple) {
    return data.couple;
  }
  return weddingConfig.couple;
}

export function saveCouple(coupleData: WeddingData['couple']): WeddingData['couple'] {
  const data = readData();
  data.couple = {
    ...weddingConfig.couple,
    ...coupleData,
    groom: {
      ...weddingConfig.couple.groom,
      ...(coupleData?.groom || {}),
    },
    bride: {
      ...weddingConfig.couple.bride,
      ...(coupleData?.bride || {}),
    },
  };
  writeData(data);
  return data.couple;
}

// MUSIC OPERATIONS
export function getMusic(): WeddingData['music'] {
  const data = readData();
  if (data.music && data.music.url) {
    return data.music;
  }
  return weddingConfig.music;
}

export function saveMusic(musicData: WeddingData['music']): WeddingData['music'] {
  const data = readData();
  data.music = {
    url: musicData.url || weddingConfig.music.url,
    title: musicData.title || weddingConfig.music.title,
  };
  writeData(data);
  return data.music;
}

export function getAvailableMusicTracks(): { id: string; name: string; title: string; url: string }[] {
  const musicDir = path.join(process.cwd(), 'public', 'music');
  const tracks: { id: string; name: string; title: string; url: string }[] = [];

  const knownTitles: Record<string, string> = {
    'music001.mp3': 'Romantic Wedding Melody 01 (Soft Acoustic & Piano)',
    'music002.mp3': 'Romantic Wedding Melody 02 (Classic Wedding Instrumental)',
  };

  try {
    if (fs.existsSync(musicDir)) {
      const files = fs.readdirSync(musicDir);
      for (const file of files) {
        if (/\.(mp3|wav|ogg|m4a)$/i.test(file)) {
          const id = path.parse(file).name;
          const title = knownTitles[file] || `Lagu Pernikahan - ${id.toUpperCase()}`;
          tracks.push({
            id,
            name: file,
            title,
            url: `/music/${file}`,
          });
        }
      }
    }
  } catch (err) {
    console.error('Error reading music dir:', err);
  }

  // Fallback if directory read failed
  if (tracks.length === 0) {
    tracks.push(
      { id: 'music001', name: 'music001.mp3', title: 'Romantic Wedding Melody 01', url: '/music/music001.mp3' },
      { id: 'music002', name: 'music002.mp3', title: 'Romantic Wedding Melody 02', url: '/music/music002.mp3' }
    );
  }

  return tracks;
}
