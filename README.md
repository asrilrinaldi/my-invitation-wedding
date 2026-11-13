# Website Undangan Pernikahan Dinamis - Asril & Sisi

Website undangan pernikahan digital modern dan interaktif dengan arsitektur **Next.js 14**, **Tailwind CSS**, dan **File-based Database**.

---

## 💍 Informasi Pasangan & Acara

- **Mempelai Pria:** Asril Rinaldi (Putra Bpk. Nowendri & Ibu Surastini)
- **Mempelai Wanita:** Sisi Dian Yuriska (Putri Bpk. Sistarudin & Ibu Dian)
- **Tanggal Acara:** Minggu, 20 Juni 2027
- **Lokasi:** Jalan Dipangga Satya, Gg Mandiri V No.12, Pramuka, Rajabasa, Bandar Lampung
- **Google Maps:** [https://maps.app.goo.gl/FSQsgALZbZJLTy6R7](https://maps.app.goo.gl/FSQsgALZbZJLTy6R7)
- **Amplop Digital:** BCA `123456789` a.n. **Asril Rinaldi** + QRIS Standar Nasional

---

## 🚀 Cara Menjalankan

### 1. Jalankan Mode Pengembangan (Dev Server)
```bash
npm run dev
```
Buka browser di: [http://localhost:3000](http://localhost:3000)

### 2. Build untuk Produksi
```bash
npm run build
npm start
```

---

## 📱 Panduan URL & Fitur

1. **Undangan Standar:**
   - Akses: `http://localhost:3000`
2. **Undangan Khusus Nama Tamu (Personalized URL):**
   - Akses Path: `http://localhost:3000/to/budi-santoso`
   - Akses Query: `http://localhost:3000/?to=Bpk.+Budi+Santoso`
   - *Nama tamu akan otomatis muncul di cover amplop, ucapan pembuka, dan form RSVP!*
3. **Dashboard Admin Pengantin:**
   - Akses: `http://localhost:3000/admin`
   - **Fitur Admin:**
     - Statistik ringkasan (Total tamu diundang, tamu yang hadir, estimasi porsi makanan/pax, total doa masuk).
     - Tambah daftar tamu undangan baru.
     - **Generator WhatsApp 1-Klik**: Menghasilkan pesan undangan resmi yang siap dikirim langsung ke WhatsApp tamu.
     - Rekap tabel data konfirmasi kehadiran (RSVP).
     - Moderasi & hapus ucapan doa (buku tamu).

---

## 📂 Struktur File Penting

- `context.md` : Rangkuman data lengkap pasangan & acara.
- `src/lib/data.ts` : Konfigurasi data mempelai, jadwal acara, rekening, dan love story.
- `src/lib/db.ts` : Sistem database JSON lokal (zero-setup, tersimpan di `data/wedding-data.json`).
- `public/music/music001.mp3` : Musik latar romantis yang diputar saat tombol "Buka Undangan" diklik.
- `public/images/` : Aset gambar profil mempelai, QRIS template, dan galeri pre-wedding.
- `Foto Pasangan/` : Folder tempat menaruh foto asli Anda untuk menggantikan foto placeholder.
