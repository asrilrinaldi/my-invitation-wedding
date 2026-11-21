-- ============================================================
-- SKEMA DATABASE SUPABASE UNTUK UNDANGAN PERNIKAHAN ASRIL & SISI
-- Jalankan skrip ini langsung di menu: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================

-- 1. TABEL DAFTAR TAMU UNDANGAN (guests)
create table if not exists guests (
  id text primary key,
  name text not null,
  slug text not null unique,
  category text default 'Umum',
  phone_number text default '',
  custom_note text default '',
  has_opened boolean default false,
  is_checked_in boolean default false,
  checked_in_at timestamptz,
  pax integer default 1,
  created_at timestamptz default now()
);

create index if not exists idx_guests_slug on guests (slug);
create index if not exists idx_guests_name on guests (name);

-- 2. TABEL KONFIRMASI KEHADIRAN (rsvps)
create table if not exists rsvps (
  id text primary key,
  guest_name text not null,
  attendance text not null check (attendance in ('hadir', 'tidak_hadir', 'ragu')),
  guest_count integer default 1,
  message text,
  created_at timestamptz default now()
);

-- 3. TABEL BUKU UCAPAN & DOA (wishes)
create table if not exists wishes (
  id text primary key,
  name text not null,
  relationship text default 'Tamu',
  message text not null,
  created_at timestamptz default now()
);

-- 4. TABEL KONFIGURASI DINAMIS (wedding_config)
create table if not exists wedding_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- 5. PENGATURAN HAK AKSES ROW LEVEL SECURITY (RLS)
-- Mengizinkan pembacaan & pengisian data oleh tamu undangan secara publik
alter table guests enable row level security;
alter table rsvps enable row level security;
alter table wishes enable row level security;
alter table wedding_config enable row level security;

-- Drop existing policies if any
drop policy if exists "Public Guests Policy" on guests;
drop policy if exists "Public RSVPs Policy" on rsvps;
drop policy if exists "Public Wishes Policy" on wishes;
drop policy if exists "Public Config Policy" on wedding_config;

-- Create permissive policies for wedding app
create policy "Public Guests Policy" on guests for all using (true) with check (true);
create policy "Public RSVPs Policy" on rsvps for all using (true) with check (true);
create policy "Public Wishes Policy" on wishes for all using (true) with check (true);
create policy "Public Config Policy" on wedding_config for all using (true) with check (true);

-- 6. SEED DATA AWAL (MEMIGRASIKAN DATA LOKAL KE SUPABASE)
insert into guests (id, name, slug, category, phone_number, custom_note, has_opened, is_checked_in, pax, checked_in_at, created_at)
values
  ('gst-testing-001', 'Tamu Testing', 'tamu-testing', 'VIP', '081234567890', 'Tamu khusus untuk pengujian tautan undangan personal', false, false, 2, null, '2026-11-21T10:00:00.000Z'),
  ('gst-1794591459875', 'Sisi Dian Yuriska', 'sisi-dian-yuriska', 'Teman', '08974436879', '', true, true, 1, '2026-11-20T18:10:28.701Z', '2026-11-13T17:37:39.875Z'),
  ('gst-1', 'Bpk. Budi Santoso & Keluarga', 'budi-santoso', 'Keluarga', '081234567890', '', true, false, 3, null, '2026-11-13T15:31:39.124Z'),
  ('gst-2', 'Siti Rahmawati, S.Kom', 'siti-rahmawati', 'Sahabat', '089876543210', '', true, false, 1, null, '2026-11-13T15:31:39.126Z'),
  ('gst-3', 'Rizky Pratama', 'rizky-pratama', 'Rekan Kerja', '082112345678', '', true, false, 1, null, '2026-11-13T15:31:39.126Z')
on conflict (id) do nothing;

insert into rsvps (id, guest_name, attendance, guest_count, message, created_at)
values
  ('rsvp-1794591698698', 'Asril Rinaldi', 'hadir', 1, '', '2026-11-13T17:41:38.698Z'),
  ('rsvp-1', 'Bpk. Budi Santoso & Keluarga', 'hadir', 3, 'Insya Allah kami sekeluarga hadir mendoakan langsung kedua mempelai.', '2026-11-12T15:31:39.126Z'),
  ('rsvp-2', 'Siti Rahmawati, S.Kom', 'hadir', 1, 'Selamat ya Sisi dan Asril! Pasti hadir!', '2026-11-13T03:31:39.126Z')
on conflict (id) do nothing;

insert into wishes (id, name, relationship, message, created_at)
values
  ('wish-1794643376579', 'Mahesa', 'Sahabat', 'login mobile legend yok', '2026-11-14T08:02:56.579Z'),
  ('wish-1794643357320', 'Budi', 'Tamu', 'testt juga', '2026-11-14T08:02:37.320Z'),
  ('wish-1794643343337', 'Prabowo Subianto', 'Sahabat', 'testtttttttt', '2026-11-14T08:02:23.337Z'),
  ('wish-1794643315242', 'gibran', 'Sahabat', 'info loker', '2026-11-14T08:01:55.242Z'),
  ('wish-1794643304322', 'Prabowo Subianto', 'Sahabat', 'selamat bro', '2026-11-14T08:01:44.322Z'),
  ('wish-1794592971797', 'testing', 'Sahabat', 'selamat ya', '2026-11-13T18:02:51.797Z')
on conflict (id) do nothing;

insert into wedding_config (key, value)
values
  ('couple', '{
    "heroPhoto": "/foto-pasangan/DSC_0228-2.jpg",
    "groom": {
      "fullName": "Asril Rinaldi S.Kom.",
      "nickname": "Asril",
      "father": "Bapak Nowendri",
      "mother": "Ibu Surastini",
      "photo": "/foto-pasangan/foto-pria.jpg",
      "instagram": "as.rinald"
    },
    "bride": {
      "fullName": "Sisi Dian Yuriska S.Pd.",
      "nickname": "Sisi",
      "father": "Bapak Sistarudin",
      "mother": "Ibu Rosdianah",
      "photo": "/foto-pasangan/foto-wanita.jpg",
      "instagram": "s.yuriska"
    }
  }'::jsonb),
  ('music', '{
    "url": "/music/music001.mp3",
    "title": "Romantic Wedding Melody 01 (Soft Acoustic & Piano)"
  }'::jsonb),
  ('event', '{
    "date": "2027-06-20T08:00:00+07:00",
    "displayDate": "Minggu, 20 Juni 2027",
    "akadTime": "08:00 - 10:00 WIB",
    "resepsiTime": "11:00 - 17:00 WIB",
    "locationName": "Kediaman Mempelai",
    "address": "Jalan Dipangga Satya, Gg Mandiri V No.12, Pramuka, Rajabasa, Bandar Lampung",
    "gmapsUrl": "https://maps.app.goo.gl/FSQsgALZbZJLTy6R7",
    "gmapsEmbedUrl": "https://maps.google.com/maps?q=Jalan%20Dipangga%20Satya%2C%20Gg%20Mandiri%20V%20No.12%2C%20Pramuka%2C%20Rajabasa%2C%20Bandar%20Lampung&t=&z=16&ie=UTF8&iwloc=&output=embed"
  }'::jsonb)
on conflict (key) do nothing;
