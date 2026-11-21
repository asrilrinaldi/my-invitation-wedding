import fs from 'fs';
import path from 'path';
import { Guest, RSVP, Wish, WeddingData } from './types';
import { weddingConfig } from './data';
import { supabase, isSupabaseConfigured } from './supabase';

interface DatabaseSchema {
  guests: Guest[];
  rsvps: RSVP[];
  wishes: Wish[];
  couple?: WeddingData['couple'];
  music?: WeddingData['music'];
  event?: WeddingData['event'];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'wedding-data.json');

const INITIAL_DATA: DatabaseSchema = {
  guests: [
    {
      id: "gst-testing-001",
      name: "Tamu Testing",
      slug: "tamu-testing",
      category: "VIP",
      phoneNumber: "081234567890",
      customNote: "Tamu khusus untuk pengujian tautan undangan personal",
      hasOpened: false,
      pax: 2,
      createdAt: new Date().toISOString(),
    },
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
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
    }
  } catch (err) {
    // Read-only filesystem handling on serverless platforms
  }
}

function readData(): DatabaseSchema {
  ensureDataFile();
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw) as DatabaseSchema;
    }
    return INITIAL_DATA;
  } catch (error) {
    console.error('Error reading wedding database:', error);
    return INITIAL_DATA;
  }
}

function writeData(data: DatabaseSchema): void {
  ensureDataFile();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to local JSON database (possibly read-only filesystem):', err);
  }
}

// Map Supabase snake_case row to TypeScript Guest interface
function mapSupabaseGuest(row: Record<string, any>): Guest {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category || 'Umum',
    phoneNumber: row.phone_number || '',
    customNote: row.custom_note || '',
    hasOpened: Boolean(row.has_opened),
    isCheckedIn: Boolean(row.is_checked_in),
    checkedInAt: row.checked_in_at || undefined,
    pax: row.pax !== null && row.pax !== undefined ? Number(row.pax) : 1,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

// Map Supabase snake_case row to TypeScript RSVP interface
function mapSupabaseRsvp(row: Record<string, any>): RSVP {
  return {
    id: row.id,
    guestName: row.guest_name,
    attendance: row.attendance,
    guestCount: Number(row.guest_count) || 1,
    message: row.message || '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

// Map Supabase snake_case row to TypeScript Wish interface
function mapSupabaseWish(row: Record<string, any>): Wish {
  return {
    id: row.id,
    name: row.name,
    relationship: row.relationship || 'Tamu',
    message: row.message || '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

// Deterministic unique pass code generator for guests
export function generateGuestCode(name: string): string {
  let hash = 0;
  const str = (name || 'Tamu').trim().toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const codeNum = Math.abs(hash % 90000) + 10000;
  return `AS-${codeNum}`;
}

// ============================================================
// GUEST OPERATIONS (DUAL ENGINE: SUPABASE + LOCAL JSON)
// ============================================================

export async function getGuests(): Promise<Guest[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase getGuests error:', error);
      } else if (data) {
        return data.map(mapSupabaseGuest);
      }
    } catch (err) {
      console.error('Supabase getGuests exception:', err);
    }
  }

  // Fallback to local JSON
  const local = readData();
  return (local.guests || []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getGuestBySlug(slug: string): Promise<Guest | undefined> {
  const clean = decodeURIComponent(slug).toLowerCase().trim();
  const cleanSlug = clean.replace(/[\s_]+/g, '-');
  const cleanName = clean.replace(/[-_]+/g, ' ');

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Exact match on slug
      const { data: bySlug } = await supabase
        .from('guests')
        .select('*')
        .eq('slug', cleanSlug)
        .maybeSingle();

      if (bySlug) return mapSupabaseGuest(bySlug);

      // 2. Case-insensitive name match
      const { data: byName } = await supabase
        .from('guests')
        .select('*')
        .ilike('name', cleanName)
        .maybeSingle();

      if (byName) return mapSupabaseGuest(byName);
    } catch (err) {
      console.error('Supabase getGuestBySlug exception:', err);
    }
  }

  // Fallback to local JSON
  const local = readData();
  return (local.guests || []).find(
    (g) =>
      g.slug.toLowerCase() === cleanSlug ||
      g.slug.toLowerCase() === clean ||
      g.name.toLowerCase().trim() === cleanName ||
      g.name.toLowerCase().trim() === clean
  );
}

export async function saveGuest(
  guestData: Omit<Guest, 'id' | 'createdAt'> & { id?: string }
): Promise<Guest> {
  const id = guestData.id || `gst-${Date.now()}`;
  const name = guestData.name.trim();
  const slug = guestData.slug
    ? guestData.slug.toLowerCase().trim().replace(/\s+/g, '-')
    : name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const category = guestData.category || 'Umum';
  const phoneNumber = guestData.phoneNumber || '';
  const customNote = guestData.customNote || '';
  const createdAt = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        id,
        name,
        slug,
        category,
        phone_number: phoneNumber,
        custom_note: customNote,
        has_opened: false,
        created_at: createdAt,
      };

      const { data, error } = await supabase
        .from('guests')
        .upsert(payload)
        .select()
        .single();

      if (error) {
        console.error('Supabase saveGuest error:', error);
      } else if (data) {
        return mapSupabaseGuest(data);
      }
    } catch (err) {
      console.error('Supabase saveGuest exception:', err);
    }
  }

  // Fallback to local JSON
  const local = readData();
  const newGuest: Guest = {
    id,
    name,
    slug,
    category,
    phoneNumber,
    customNote,
    hasOpened: false,
    createdAt,
  };

  const existingIdx = (local.guests || []).findIndex((g) => g.id === newGuest.id);
  if (existingIdx >= 0) {
    local.guests[existingIdx] = { ...local.guests[existingIdx], ...newGuest };
  } else {
    local.guests.unshift(newGuest);
  }

  writeData(local);
  return newGuest;
}

export async function markGuestOpened(identifier: string): Promise<boolean> {
  const clean = decodeURIComponent(identifier).toLowerCase().trim();
  const cleanSlug = clean.replace(/\s+/g, '-');

  if (isSupabaseConfigured && supabase) {
    try {
      // Find guest
      const { data: guests } = await supabase
        .from('guests')
        .select('id, has_opened, slug, name')
        .or(`slug.eq.${cleanSlug},name.ilike.${clean},id.eq.${clean}`)
        .limit(1);

      if (guests && guests.length > 0) {
        const g = guests[0];
        if (!g.has_opened) {
          await supabase.from('guests').update({ has_opened: true }).eq('id', g.id);
        }
        return true;
      }
    } catch (err) {
      console.error('Supabase markGuestOpened exception:', err);
    }
  }

  // Fallback to local JSON
  const local = readData();
  const guest = (local.guests || []).find(
    (g) =>
      g.slug.toLowerCase() === clean ||
      g.slug.toLowerCase() === cleanSlug ||
      g.name.toLowerCase().trim() === clean ||
      g.id.toLowerCase() === clean
  );

  if (guest && !guest.hasOpened) {
    guest.hasOpened = true;
    writeData(local);
    return true;
  }
  return Boolean(guest?.hasOpened);
}

export async function deleteGuest(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('guests').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.error('Supabase deleteGuest exception:', err);
    }
  }

  // Fallback to local JSON
  const local = readData();
  const initialLen = (local.guests || []).length;
  local.guests = (local.guests || []).filter((g) => g.id !== id);
  if (local.guests.length !== initialLen) {
    writeData(local);
    return true;
  }
  return false;
}

export async function checkInGuest(
  identifier: string,
  pax?: number
): Promise<{
  success: boolean;
  guest?: Guest;
  rsvp?: RSVP;
  alreadyCheckedIn?: boolean;
  message?: string;
}> {
  const allGuests = await getGuests();
  const raw = (identifier || '').trim();
  if (!raw) {
    return { success: false, message: 'Kode atau nama tamu kosong' };
  }

  let found: Guest | undefined;

  // 1. Structured payload: WEDDING-PASS:ASRIL-SISI|TAMU:...|KODE:...
  if (raw.includes('WEDDING-PASS:')) {
    const tamuMatch = raw.match(/TAMU:([^|]+)/i);
    if (tamuMatch && tamuMatch[1]) {
      const tamuName = tamuMatch[1].trim().toLowerCase();
      found = allGuests.find((g) => g.name.toLowerCase() === tamuName);
    }
    if (!found) {
      const kodeMatch = raw.match(/KODE:([^|]+)/i);
      if (kodeMatch && kodeMatch[1]) {
        const k = kodeMatch[1].trim().toLowerCase();
        found = allGuests.find((g) => generateGuestCode(g.name).toLowerCase() === k);
      }
    }
  }

  // 2. URL parsing: https://.../?to=Budi or /to/budi
  if (!found && (raw.startsWith('http://') || raw.startsWith('https://'))) {
    try {
      const url = new URL(raw);
      const toParam = url.searchParams.get('to') || url.searchParams.get('guest');
      if (toParam) {
        const clean = toParam.trim().toLowerCase();
        found = allGuests.find(
          (g) =>
            g.name.toLowerCase() === clean ||
            g.slug.toLowerCase() === clean.replace(/\s+/g, '-')
        );
      }
      if (!found) {
        const matchTo = url.pathname.match(/\/to\/([^/]+)/);
        if (matchTo && matchTo[1]) {
          const s = decodeURIComponent(matchTo[1]).toLowerCase();
          found = allGuests.find((g) => g.slug.toLowerCase() === s);
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Direct Match: ID, Slug, Name, or AS-XXXX
  if (!found) {
    const clean = raw.toLowerCase();
    const cleanSlug = clean.replace(/\s+/g, '-');
    found = allGuests.find(
      (g) =>
        g.id.toLowerCase() === clean ||
        g.slug.toLowerCase() === clean ||
        g.slug.toLowerCase() === cleanSlug ||
        g.name.toLowerCase().trim() === clean
    );
  }

  // 4. Code Match: AS-XXXX
  if (!found) {
    const clean = raw.toLowerCase();
    found = allGuests.find((g) => generateGuestCode(g.name).toLowerCase() === clean);
  }

  // 5. Partial Name Match
  if (!found) {
    const clean = raw.toLowerCase();
    if (clean.length >= 3) {
      found = allGuests.find(
        (g) =>
          g.name.toLowerCase().includes(clean) || clean.includes(g.name.toLowerCase())
      );
    }
  }

  if (!found) {
    return { success: false, message: 'Data tamu tidak ditemukan dalam daftar undangan' };
  }

  // Check matching RSVP
  const allRsvps = await getRSVPs();
  const rsvp = allRsvps.find(
    (r) => r.guestName.toLowerCase().trim() === found!.name.toLowerCase().trim()
  );

  const alreadyCheckedIn = Boolean(found.isCheckedIn);
  const now = new Date().toISOString();

  let finalPax = found.pax || 1;
  if (pax !== undefined && pax > 0) {
    finalPax = pax;
  } else if (!found.pax && rsvp) {
    finalPax = rsvp.guestCount || 1;
  }

  if (!alreadyCheckedIn || (pax !== undefined && pax !== found.pax)) {
    found.isCheckedIn = true;
    if (!found.checkedInAt) found.checkedInAt = now;
    found.hasOpened = true;
    found.pax = finalPax;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('guests')
          .update({
            is_checked_in: true,
            checked_in_at: found.checkedInAt,
            has_opened: true,
            pax: finalPax,
          })
          .eq('id', found.id);
      } catch (err) {
        console.error('Supabase checkInGuest update error:', err);
      }
    }

    // Also update local JSON
    const local = readData();
    const localG = (local.guests || []).find((g) => g.id === found!.id);
    if (localG) {
      localG.isCheckedIn = true;
      localG.checkedInAt = found.checkedInAt;
      localG.hasOpened = true;
      localG.pax = finalPax;
      writeData(local);
    }
  }

  return {
    success: true,
    guest: found,
    rsvp,
    alreadyCheckedIn,
    message: alreadyCheckedIn
      ? `Tamu ini sudah pernah check-in pada ${new Date(found.checkedInAt || now).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
      : 'Check-in berhasil! Selamat datang.',
  };
}

export async function undoCheckInGuest(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('guests')
        .update({ is_checked_in: false, checked_in_at: null })
        .eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.error('Supabase undoCheckInGuest exception:', err);
    }
  }

  // Fallback to local JSON
  const local = readData();
  const guest = (local.guests || []).find((g) => g.id === id);
  if (guest && guest.isCheckedIn) {
    guest.isCheckedIn = false;
    guest.checkedInAt = undefined;
    writeData(local);
    return true;
  }
  return false;
}

// ============================================================
// RSVP OPERATIONS (DUAL ENGINE: SUPABASE + LOCAL JSON)
// ============================================================

export async function getRSVPs(): Promise<RSVP[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase getRSVPs error:', error);
      } else if (data) {
        return data.map(mapSupabaseRsvp);
      }
    } catch (err) {
      console.error('Supabase getRSVPs exception:', err);
    }
  }

  // Fallback to local JSON
  const local = readData();
  return (local.rsvps || []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function saveRSVP(
  rsvpData: Omit<RSVP, 'id' | 'createdAt'>
): Promise<RSVP> {
  const id = `rsvp-${Date.now()}`;
  const guestName = rsvpData.guestName.trim();
  const attendance = rsvpData.attendance;
  const guestCount = Number(rsvpData.guestCount) || 1;
  const message = rsvpData.message?.trim() || '';
  const createdAt = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        id,
        guest_name: guestName,
        attendance,
        guest_count: guestCount,
        message,
        created_at: createdAt,
      };

      const { data, error } = await supabase
        .from('rsvps')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Supabase saveRSVP error:', error);
      } else if (data) {
        // Also mark guest as opened in Supabase
        await markGuestOpened(guestName);
        return mapSupabaseRsvp(data);
      }
    } catch (err) {
      console.error('Supabase saveRSVP exception:', err);
    }
  }

  // Fallback to local JSON
  const local = readData();
  const newRsvp: RSVP = {
    id,
    guestName,
    attendance,
    guestCount,
    message,
    createdAt,
  };

  local.rsvps = local.rsvps || [];
  local.rsvps.unshift(newRsvp);

  // Automatically mark guest as opened in guest list
  const cleanName = guestName.toLowerCase();
  const cleanSlug = cleanName.replace(/\s+/g, '-');
  const guest = (local.guests || []).find(
    (g) =>
      g.name.toLowerCase().trim() === cleanName ||
      g.slug.toLowerCase() === cleanSlug
  );
  if (guest) {
    guest.hasOpened = true;
  }

  writeData(local);
  return newRsvp;
}

// ============================================================
// WISHES OPERATIONS (DUAL ENGINE: SUPABASE + LOCAL JSON)
// ============================================================

export async function getWishes(): Promise<Wish[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase getWishes error:', error);
      } else if (data) {
        return data.map(mapSupabaseWish);
      }
    } catch (err) {
      console.error('Supabase getWishes exception:', err);
    }
  }

  // Fallback to local JSON
  const local = readData();
  return (local.wishes || []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function saveWish(
  wishData: Omit<Wish, 'id' | 'createdAt'>
): Promise<Wish> {
  const id = `wish-${Date.now()}`;
  const name = wishData.name.trim();
  const relationship = wishData.relationship || 'Tamu';
  const message = wishData.message.trim();
  const createdAt = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        id,
        name,
        relationship,
        message,
        created_at: createdAt,
      };

      const { data, error } = await supabase
        .from('wishes')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Supabase saveWish error:', error);
      } else if (data) {
        // Also mark guest as opened in Supabase
        await markGuestOpened(name);
        return mapSupabaseWish(data);
      }
    } catch (err) {
      console.error('Supabase saveWish exception:', err);
    }
  }

  // Fallback to local JSON
  const local = readData();
  const newWish: Wish = {
    id,
    name,
    relationship,
    message,
    createdAt,
  };

  local.wishes = local.wishes || [];
  local.wishes.unshift(newWish);

  // Automatically mark guest as opened in guest list
  const cleanName = name.toLowerCase();
  const cleanSlug = cleanName.replace(/\s+/g, '-');
  const guest = (local.guests || []).find(
    (g) =>
      g.name.toLowerCase().trim() === cleanName ||
      g.slug.toLowerCase() === cleanSlug
  );
  if (guest) {
    guest.hasOpened = true;
  }

  writeData(local);
  return newWish;
}

export async function deleteWish(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('wishes').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.error('Supabase deleteWish exception:', err);
    }
  }

  // Fallback to local JSON
  const local = readData();
  const initialLen = (local.wishes || []).length;
  local.wishes = (local.wishes || []).filter((w) => w.id !== id);
  if (local.wishes.length !== initialLen) {
    writeData(local);
    return true;
  }
  return false;
}

// ============================================================
// ADMIN STATS
// ============================================================

export async function getStats() {
  const [guests, rsvps, wishes] = await Promise.all([
    getGuests(),
    getRSVPs(),
    getWishes(),
  ]);

  const totalGuests = guests.length;
  const totalOpened = guests.filter((g) => g.hasOpened).length;
  const totalRsvp = rsvps.length;
  const attendingRsvps = rsvps.filter((r) => r.attendance === 'hadir');
  const notAttendingRsvps = rsvps.filter((r) => r.attendance === 'tidak_hadir');
  const totalAttendingGuests = attendingRsvps.reduce(
    (acc, curr) => acc + curr.guestCount,
    0
  );
  const totalWishes = wishes.length;

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

// ============================================================
// COUPLE & MUSIC CONFIG (DUAL ENGINE)
// ============================================================

export async function getCouple(): Promise<WeddingData['couple']> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('wedding_config')
        .select('value')
        .eq('key', 'couple')
        .maybeSingle();

      if (data && data.value) {
        return {
          ...weddingConfig.couple,
          ...data.value,
          groom: { ...weddingConfig.couple.groom, ...(data.value.groom || {}) },
          bride: { ...weddingConfig.couple.bride, ...(data.value.bride || {}) },
        };
      }
    } catch (err) {
      console.error('Supabase getCouple exception:', err);
    }
  }

  const local = readData();
  if (local.couple) return local.couple;
  return weddingConfig.couple;
}

export async function saveCouple(
  coupleData: WeddingData['couple']
): Promise<WeddingData['couple']> {
  const merged: WeddingData['couple'] = {
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

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('wedding_config')
        .upsert({ key: 'couple', value: merged, updated_at: new Date().toISOString() });
    } catch (err) {
      console.error('Supabase saveCouple exception:', err);
    }
  }

  const local = readData();
  local.couple = merged;
  writeData(local);
  return merged;
}

export async function getMusic(): Promise<WeddingData['music']> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('wedding_config')
        .select('value')
        .eq('key', 'music')
        .maybeSingle();

      if (data && data.value && data.value.url) {
        return data.value;
      }
    } catch (err) {
      console.error('Supabase getMusic exception:', err);
    }
  }

  const local = readData();
  if (local.music && local.music.url) {
    return local.music;
  }
  return weddingConfig.music;
}

export async function saveMusic(
  musicData: WeddingData['music']
): Promise<WeddingData['music']> {
  const updated = {
    url: musicData.url || weddingConfig.music.url,
    title: musicData.title || weddingConfig.music.title,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('wedding_config')
        .upsert({ key: 'music', value: updated, updated_at: new Date().toISOString() });
    } catch (err) {
      console.error('Supabase saveMusic exception:', err);
    }
  }

  const local = readData();
  local.music = updated;
  writeData(local);
  return updated;
}

export async function getEvent(): Promise<WeddingData['event']> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('wedding_config')
        .select('value')
        .eq('key', 'event')
        .maybeSingle();

      if (data && data.value) {
        return {
          ...weddingConfig.event,
          ...data.value,
        };
      }
    } catch (err) {
      console.error('Supabase getEvent exception:', err);
    }
  }

  const local = readData();
  if (local.event) {
    return {
      ...weddingConfig.event,
      ...local.event,
    };
  }
  return weddingConfig.event;
}

export async function saveEvent(
  eventData: Partial<WeddingData['event']>
): Promise<WeddingData['event']> {
  const current = await getEvent();
  const merged: WeddingData['event'] = {
    ...current,
    ...eventData,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('wedding_config')
        .upsert({ key: 'event', value: merged, updated_at: new Date().toISOString() });
    } catch (err) {
      console.error('Supabase saveEvent exception:', err);
    }
  }

  const local = readData();
  local.event = merged;
  writeData(local);
  return merged;
}

export function getAvailableMusicTracks(): {
  id: string;
  name: string;
  title: string;
  url: string;
}[] {
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
