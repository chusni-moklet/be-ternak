# PetaPakan AI 🌾

> **Sistem Pemetaan Potensi Wilayah & Rekomendasi Pakan Ternak Alternatif Berbasis AI**

Aplikasi web Full-Stack modern yang mengintegrasikan pemetaan spasial agroklimat dengan kecerdasan buatan Google Gemini untuk menganalisis potensi ketersediaan limbah pertanian/agroindustri lokal, menghitung formulasi ransum pakan presisi, teknik pengolahan silase/fermentasi, dan strategi komersialisasi peternakan.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript, Turbopack)
- **Styling & UI:** Tailwind CSS v4, Lucide Icons, Glassmorphism Dark Mode dengan aksen Emerald/Hijau Agronomi
- **Database & Spasial:** Supabase (PostgreSQL + Ekstensi PostGIS `ST_DWithin`, `ST_Distance`)
- **Peta Interaktif:** Leaflet (`react-leaflet` + CartoDB Dark Matter / OpenStreetMap) dengan dynamic import (`ssr: false`), custom HTML markers, dan radius circle interaktif
- **AI Engine:** Google Gemini API (`@google/genai` dengan model `gemini-2.5-flash` / output JSON terstruktur)

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Salin Environment Variables
Salin berkas `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Isi konfigurasi Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```
> **Catatan:** Jika API keys belum diisi, aplikasi tetap dapat dijalankan langsung dengan **mode simulasi agronomis presisi** bawaan untuk wilayah Jawa Timur (Grati, Pasuruan & Lawang, Malang).

### 2. Setup Database Supabase & PostGIS
1. Buka dashboard Supabase Anda.
2. Masuk ke menu **SQL Editor**.
3. Buka file `supabase/schema.sql` pada proyek ini, salin seluruh isinya, dan klik **Run**.
4. Skrip tersebut akan:
   - Mengaktifkan ekstensi `postgis` & `uuid-ossp`.
   - Membuat tabel `regions` dan `feed_sources` dengan index GiST spasial.
   - Membuat fungsi RPC `get_nearby_feed_sources(user_lat, user_lng, radius_meters)`.
   - Mengisi data awal (seeding) untuk **Kecamatan Grati, Pasuruan** dan **Kecamatan Lawang, Malang** beserta titik pakan riil (tebon jagung, dedak padi, ampas tahu, kulit kopi fermentasi, kulit ari kedelai, dll).

### 3. Jalankan Aplikasi Secara Lokal
```bash
# Jalankan mode development
npm run dev

# Atau build & jalankan mode production
npm run build
npm run start
```
Buka browser di `http://localhost:3000`.

---

## 🗺️ Fitur Utama

1. **Peta Interaktif Spasial (Leaflet + PostGIS):**
   - Multi-layer tile map: *OpenStreetMap Dark Inverted* & *Esri World Imagery Satellite*.
   - Slider radius pemantauan pakan interaktif (5 km – 30 km).
   - Pencarian geocoding cerdas untuk seluruh wilayah Indonesia (provinsi, kabupaten, kecamatan, hingga desa) + 12 sentra unggas nasional.
   - Deteksi lokasi kandang presisi dengan W3C Browser Geolocation API.
   - Titik pakan dengan custom marker, kategori nutrisi, status verifikasi resmi, dan 1-Click WhatsApp Direct Order ke penyuplai.

2. **Kecerdasan Buatan Nutrisi Unggas (Google Gemini 2.5 Flash):**
   - Formulasi ransum presisi monogastrik (Protein Kasar, Energi Metabolis EM kcal/kg, Serat Kasar < 5.5%, Kalsium & Fosfor kerabang).
   - Analisis iklim mikro & peringatan mitigasi agroklimat *Heat Stress* otomatis berbasis data suhu real-time Open-Meteo.
   - Panduan pengolahan silase & fermentasi probiotik (EM4/Aspergillus) untuk memecah asam fitat dan serat kasar.
   - Strategi komersialisasi pasar unggas lokal.

3. **Multi-Role Portal dengan Side Menu Modern:**
   - 🛡️ **Panel Admin (`/admin`):** Antrean verifikasi bukti transfer langganan, aktivasi lisensi 30 hari, manajemen pengguna (peternak & pemasok), audit finansial proposal, dan toggle verifikasi lencana centang hijau.
   - 👨‍🌾 **Portal Peternak (`/dashboard/peternak`):** Profil kandang, kalkulator penghematan biaya pakan bulanan, resep ransum AI tersimpan, direktori pakan terdekat, dan pembayaran langganan (Starter Rp 49rb / Pro Rp 99rb).
   - 🌾 **Portal Pemilik Pakan (`/dashboard/pemasok`):** Manajemen katalog limbah agroindustri (harga/kg, stok tonase), statistik tayangan peta, leads pesanan WhatsApp, dan sertifikasi kemitraan resmi (UMKM Rp 79rb / Agroindustri Rp 149rb).

4. **Product Requirements Document (PRD):**
   - Dokumentasi lengkap siap proposal hibah / investasi di berkas [`PRD.md`](./PRD.md).

