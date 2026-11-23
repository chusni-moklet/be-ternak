-- ==============================================================================
-- PetaPakan AI - Database Schema with PostGIS Support
-- Sistem Pemetaan Potensi Wilayah & Rekomendasi Pakan Ternak Alternatif Berbasis AI
-- Spesialisasi: Komoditas Unggas Seluruh Indonesia
-- ==============================================================================

-- 1. Aktivasi Ekstensi PostGIS & UUID
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Buat Tabel Regions (Wilayah Potensi Peternakan Unggas)
CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    island TEXT, -- e.g. 'Jawa', 'Sumatera', 'Sulawesi', 'Kalimantan', 'Bali & NTB'
    center_point GEOGRAPHY(POINT, 4326) NOT NULL,
    avg_temp_celsius NUMERIC(4, 1) NOT NULL,
    market_potential_score INT NOT NULL CHECK (market_potential_score BETWEEN 0 AND 100),
    market_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index spasial GiST untuk regions
CREATE INDEX IF NOT EXISTS idx_regions_center_point ON regions USING GIST (center_point);

-- 3. Buat Tabel Feed Sources (Titik Sumber Pakan Alternatif Unggas)
CREATE TABLE IF NOT EXISTS feed_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    feed_material TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g. 'Limbah Pertanian', 'Limbah Agroindustri', 'Limbah Perikanan & Ternak', 'Hijauan & Karotenoid', 'Mineral & Suplemen'
    target_livestock TEXT[] NOT NULL, -- e.g. ARRAY['Ayam Petelur (Layer)', 'Ayam Broiler (Pedaging)', 'Ayam Kampung / Joper', 'Burung Puyuh (Layer/Pedaging)']
    estimated_price_per_kg NUMERIC(10, 2) NOT NULL,
    availability_status TEXT NOT NULL, -- e.g. 'Melimpah', 'Tersedia', 'Musiman', 'Terbatas'
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    contact_info TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false, -- Status verifikasi lapangan/kontak
    source_type TEXT NOT NULL DEFAULT 'komunitas' CHECK (source_type IN ('survey_lapangan', 'google_places', 'komunitas', 'osm_data', 'data_pemerintah')), -- Asal sumber data
    last_verified_at TIMESTAMPTZ, -- Waktu terakhir stok & harga dikonfirmasi
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Pastikan kolom verifikasi tetap ditambahkan bila tabel feed_sources sudah dibuat sebelumnya
ALTER TABLE feed_sources ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE feed_sources ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'komunitas';
ALTER TABLE feed_sources ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;

-- Index spasial GiST untuk feed_sources
CREATE INDEX IF NOT EXISTS idx_feed_sources_location ON feed_sources USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_feed_sources_verified ON feed_sources (is_verified);

-- 4. Fungsi RPC: get_nearby_feed_sources
-- Drop terlebih dahulu karena struktur kolom RETURN TABLE diperbarui dengan status verifikasi
DROP FUNCTION IF EXISTS get_nearby_feed_sources(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION);

CREATE OR REPLACE FUNCTION get_nearby_feed_sources(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION
)
RETURNS TABLE (
    id UUID,
    region_id UUID,
    name TEXT,
    feed_material TEXT,
    category TEXT,
    target_livestock TEXT[],
    estimated_price_per_kg NUMERIC,
    availability_status TEXT,
    contact_info TEXT,
    is_verified BOOLEAN,
    source_type TEXT,
    last_verified_at TIMESTAMPTZ,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    distance_km DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        fs.id,
        fs.region_id,
        fs.name,
        fs.feed_material,
        fs.category,
        fs.target_livestock,
        fs.estimated_price_per_kg,
        fs.availability_status,
        fs.contact_info,
        fs.is_verified,
        fs.source_type,
        fs.last_verified_at,
        ST_Y(fs.location::geometry) AS lat,
        ST_X(fs.location::geometry) AS lng,
        ROUND((ST_Distance(fs.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) / 1000.0)::numeric, 2)::DOUBLE PRECISION AS distance_km
    FROM feed_sources fs
    WHERE ST_DWithin(
        fs.location,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
        radius_meters
    )
    ORDER BY distance_km ASC;
$$;

-- 5. Data Awal (Seeding) untuk Sentra Unggas Seluruh Indonesia & Pakan Unggas
DO $$
DECLARE
    blitar_id UUID := gen_random_uuid();
    grati_id UUID := gen_random_uuid();
    malang_id UUID := gen_random_uuid();
    ciamis_id UUID := gen_random_uuid();
    bogor_id UUID := gen_random_uuid();
    boyolali_id UUID := gen_random_uuid();
    sidrap_id UUID := gen_random_uuid();
    deliserdang_id UUID := gen_random_uuid();
    lampung_id UUID := gen_random_uuid();
    tanahlaut_id UUID := gen_random_uuid();
    tabanan_id UUID := gen_random_uuid();
    lombok_id UUID := gen_random_uuid();
BEGIN
    -- Bersihkan data lama jika ingin reset
    DELETE FROM feed_sources;
    DELETE FROM regions;

    -- 1. Blitar, Jawa Timur (Ibukota Telur Indonesia)
    INSERT INTO regions (id, name, island, center_point, avg_temp_celsius, market_potential_score, market_notes)
    VALUES (
        blitar_id,
        'Kabupaten Blitar, Jawa Timur',
        'Jawa',
        ST_SetSRID(ST_MakePoint(112.1681, -8.0983), 4326)::geography,
        26.5,
        96,
        'Ibukota Telur Nasional — penyuplai 30% kebutuhan telur ayam ras Indonesia. Sentra ayam petelur (layer) dan puyuh terbesar.'
    );

    -- 2. Grati & Pasuruan, Jawa Timur
    INSERT INTO regions (id, name, island, center_point, avg_temp_celsius, market_potential_score, market_notes)
    VALUES (
        grati_id,
        'Kecamatan Grati & Pasuruan, Jawa Timur',
        'Jawa',
        ST_SetSRID(ST_MakePoint(113.0167, -7.7289), 4326)::geography,
        31.0,
        90,
        'Kawasan lumbung jagung pakan ternak Pantura dan sentra ayam pedaging (broiler) serta ayam kampung super (Joper).'
    );

    -- 3. Lawang & Malang, Jawa Timur
    INSERT INTO regions (id, name, island, center_point, avg_temp_celsius, market_potential_score, market_notes)
    VALUES (
        malang_id,
        'Kecamatan Lawang & Malang, Jawa Timur',
        'Jawa',
        ST_SetSRID(ST_MakePoint(112.6947, -7.8355), 4326)::geography,
        23.5,
        93,
        'Kawasan agroklimat sejuk dataran tinggi ideal untuk pembibitan DOC, ayam petelur bebas heat stress, dan bebek petelur.'
    );

    -- 4. Ciamis, Jawa Barat
    INSERT INTO regions (id, name, island, center_point, avg_temp_celsius, market_potential_score, market_notes)
    VALUES (
        ciamis_id,
        'Kabupaten Ciamis & Tasikmalaya, Jawa Barat',
        'Jawa',
        ST_SetSRID(ST_MakePoint(108.3551, -7.3274), 4326)::geography,
        27.0,
        94,
        'Sentra ayam pedaging (broiler) dan plasma unggas Priangan Timur. Produsen ayam kampung asli galur Sentul.'
    );

    -- 5. Bogor, Jawa Barat
    INSERT INTO regions (id, name, island, center_point, avg_temp_celsius, market_potential_score, market_notes)
    VALUES (
        bogor_id,
        'Kabupaten Bogor, Jawa Barat',
        'Jawa',
        ST_SetSRID(ST_MakePoint(106.8060, -6.5971), 4326)::geography,
        26.0,
        92,
        'Pusat integrasi perunggasan Jabodetabek, industri pakan ternak modern, dan pusat riset inovasi pakan unggas IPB University.'
    );

    -- 6. Boyolali, Jawa Tengah
    INSERT INTO regions (id, name, island, center_point, avg_temp_celsius, market_potential_score, market_notes)
    VALUES (
        boyolali_id,
        'Kabupaten Boyolali & Solo, Jawa Tengah',
        'Jawa',
        ST_SetSRID(ST_MakePoint(110.5944, -7.5361), 4326)::geography,
        26.8,
        91,
        'Sentra populasi ayam petelur dan ayam kampung Soloraya dengan akses pasokan jagung dan bekatul melimpah.'
    );

    -- 7. Sidrap, Sulawesi Selatan
    INSERT INTO regions (id, name, island, center_point, avg_temp_celsius, market_potential_score, market_notes)
    VALUES (
        sidrap_id,
        'Kabupaten Sidrap (Sidenreng Rappang), Sulawesi Selatan',
        'Sulawesi',
        ST_SetSRID(ST_MakePoint(119.9167, -3.8833), 4326)::geography,
        28.0,
        95,
        'Lumbung telur dan sentra industri ayam petelur (layer) terbesar di Indonesia Timur. Menyuplai telur ke Papua, Maluku, dan Kalimantan.'
    );

    -- 8. Deli Serdang, Sumatera Utara
    INSERT INTO regions (id, name, island, center_point, avg_temp_celsius, market_potential_score, market_notes)
    VALUES (
        deliserdang_id,
        'Kabupaten Deli Serdang, Sumatera Utara',
        'Sumatera',
        ST_SetSRID(ST_MakePoint(98.7188, 3.5186), 4326)::geography,
        28.5,
        93,
        'Kawasan populasi ayam ras pedaging dan petelur terbesar di Sumatera. Dekat dengan pelabuhan dan pabrik bungkil sawit/kelapa.'
    );

    -- 9. Lampung Selatan, Lampung
    INSERT INTO regions (id, name, island, center_point, avg_temp_celsius, market_potential_score, market_notes)
    VALUES (
        lampung_id,
        'Kabupaten Lampung Selatan, Lampung',
        'Sumatera',
        ST_SetSRID(ST_MakePoint(105.4000, -5.4500), 4326)::geography,
        29.0,
        91,
        'Pintu gerbang jalur pasokan jagung pipil pakan unggas nasional dan sentra peternakan itik/bebek petelur.'
    );

    -- 10. Tanah Laut (Pelaihari), Kalimantan Selatan
    INSERT INTO regions (id, name, island, center_point, avg_temp_celsius, market_potential_score, market_notes)
    VALUES (
        tanahlaut_id,
        'Kabupaten Tanah Laut (Pelaihari), Kalimantan Selatan',
        'Kalimantan',
        ST_SetSRID(ST_MakePoint(114.8667, -3.7917), 4326)::geography,
        28.5,
        89,
        'Sentra peternakan ayam potong broiler dan budidaya itik Alabio unggulan Kalimantan Selatan.'
    );

    -- 11. Tabanan, Bali
    INSERT INTO regions (id, name, island, center_point, avg_temp_celsius, market_potential_score, market_notes)
    VALUES (
        tabanan_id,
        'Kabupaten Tabanan, Bali',
        'Bali & NTB',
        ST_SetSRID(ST_MakePoint(115.1217, -8.5392), 4326)::geography,
        26.0,
        90,
        'Lumbung padi dan sentra peternakan ayam buras serta itik Bali dengan permintaan tinggi dari sektor pariwisata kuliner.'
    );

    -- 12. Lombok Tengah, NTB
    INSERT INTO regions (id, name, island, center_point, avg_temp_celsius, market_potential_score, market_notes)
    VALUES (
        lombok_id,
        'Kabupaten Lombok Tengah, Nusa Tenggara Barat',
        'Bali & NTB',
        ST_SetSRID(ST_MakePoint(116.2767, -8.7067), 4326)::geography,
        28.0,
        88,
        'Sentra produksi ayam kampung lokal (bahan baku Ayam Taliwang) dan itik petelur pulau Lombok.'
    );

    -- ===================
    -- FEED SOURCES SEEDING
    -- ===================

    -- 1. Jagung Pipil Giling (Blitar)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        blitar_id,
        'Sentra Jagung Giling Srengat',
        'Jagung Pipil Kering Giling Halus (KA < 14%)',
        'Limbah Pertanian',
        ARRAY['Ayam Petelur (Layer)', 'Ayam Broiler (Pedaging)', 'Ayam Kampung / Joper', 'Burung Puyuh (Layer/Pedaging)'],
        5200.00,
        'Melimpah',
        ST_SetSRID(ST_MakePoint(112.0720, -8.0850), 4326)::geography,
        'H. Suwardi (0812-3344-9901) - Srengat, Blitar'
    );

    -- 2. Maggot BSF Kering (Blitar)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        blitar_id,
        'Biotech Larva Nusantara Blitar',
        'Maggot BSF Kering (Protein Kasar 42-45%)',
        'Limbah Perikanan & Ternak',
        ARRAY['Ayam Kampung / Joper', 'Ayam Petelur (Layer)', 'Bebek / Itik (Petelur & Pedaging)', 'Burung Puyuh (Layer/Pedaging)'],
        6800.00,
        'Melimpah',
        ST_SetSRID(ST_MakePoint(112.1850, -8.1120), 4326)::geography,
        'Mas Dian - 0821-4455-8811 (Kanigoro, Blitar)'
    );

    -- 3. Tepung Kulit Kerang (Blitar)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        blitar_id,
        'UD Mineral Unggas Jaya Talun',
        'Tepung Kulit Kerang / Grit Kalsium Tinggi (Ca 38%)',
        'Mineral & Suplemen',
        ARRAY['Ayam Petelur (Layer)', 'Bebek / Itik (Petelur & Pedaging)', 'Burung Puyuh (Layer/Pedaging)'],
        1800.00,
        'Melimpah',
        ST_SetSRID(ST_MakePoint(112.2450, -8.0950), 4326)::geography,
        'Pak Bambang (0813-8899-7722) - Talun, Blitar'
    );

    -- 4. Dedak Padi Super (Grati Pasuruan)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        grati_id,
        'Penggilingan Padi Sri Rejeki Grati',
        'Dedak Padi Bekatul Super (Serat Kasar Rendah < 8%)',
        'Limbah Pertanian',
        ARRAY['Ayam Kampung / Joper', 'Ayam Broiler (Pedaging)', 'Bebek / Itik (Petelur & Pedaging)'],
        3300.00,
        'Melimpah',
        ST_SetSRID(ST_MakePoint(113.0240, -7.7350), 4326)::geography,
        'Pak Sugeng (0813-9876-5402) - Grati, Pasuruan'
    );

    -- 5. Tepung Ikan Rucah (Pasuruan)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        grati_id,
        'Tepung Ikan Pesisir Lekok Pasuruan',
        'Tepung Ikan Rucah Murni (Protein Kasar 52%)',
        'Limbah Perikanan & Ternak',
        ARRAY['Ayam Broiler (Pedaging)', 'Ayam Kampung / Joper', 'Bebek / Itik (Petelur & Pedaging)'],
        9500.00,
        'Tersedia',
        ST_SetSRID(ST_MakePoint(113.0180, -7.6950), 4326)::geography,
        'Cak Mansur (0856-7788-2233) - Lekok, Pasuruan'
    );

    -- 6. Ampas Tahu Fermentasi Kering (Malang)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        malang_id,
        'Sentra Olahan Tahu Lawang Asri',
        'Ampas Tahu Fermentasi Ragi & Kering Oven (PK 22%)',
        'Limbah Agroindustri',
        ARRAY['Ayam Kampung / Joper', 'Bebek / Itik (Petelur & Pedaging)'],
        1900.00,
        'Tersedia',
        ST_SetSRID(ST_MakePoint(112.6980, -7.8290), 4326)::geography,
        'Bu Siti Rahayu (0812-3344-5566) - Lawang, Malang'
    );

    -- 7. Tepung Indigofera & Azolla (Malang)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        malang_id,
        'Kebun Herbal Unggas Wonosari',
        'Tepung Daun Indigofera & Azolla (Karotenoid Telur)',
        'Hijauan & Karotenoid',
        ARRAY['Ayam Petelur (Layer)', 'Ayam Kampung / Joper', 'Bebek / Itik (Petelur & Pedaging)'],
        4200.00,
        'Melimpah',
        ST_SetSRID(ST_MakePoint(112.6850, -7.8420), 4326)::geography,
        'Kang Wahyu (0857-1122-3344) - Wonosari, Malang'
    );

    -- 8. Bungkil Kedelai Ekstraksi Lokal (Ciamis)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        ciamis_id,
        'Kemitraan Petani Bungkil Kedelai Ciamis',
        'Bungkil Kedelai Ekstraksi Lokal (SBM PK 44%)',
        'Limbah Agroindustri',
        ARRAY['Ayam Broiler (Pedaging)', 'Ayam Petelur (Layer)', 'Ayam Kampung / Joper'],
        7800.00,
        'Tersedia',
        ST_SetSRID(ST_MakePoint(108.3610, -7.3320), 4326)::geography,
        'Kang Deden (0812-8877-6655) - Baregbeg, Ciamis'
    );

    -- 9. Jagung Kuning Pipil Sidrap (Sulawesi Selatan)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        sidrap_id,
        'Lumbung Pakan Mandiri Maritengngae',
        'Jagung Kuning Pipil Sidrap Grade A & Bekatul Murni',
        'Limbah Pertanian',
        ARRAY['Ayam Petelur (Layer)', 'Ayam Broiler (Pedaging)', 'Burung Puyuh (Layer/Pedaging)'],
        4900.00,
        'Melimpah',
        ST_SetSRID(ST_MakePoint(119.9230, -3.8910), 4326)::geography,
        'H. Rustam (0813-5566-7788) - Maritengngae, Sidrap'
    );

    -- 10. Maggot BSF Dramaga (Bogor)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        bogor_id,
        'Rumah Maggot BSF Dramaga Bogor',
        'Maggot BSF Kering & Prepupa Segar (Protein 43%)',
        'Limbah Perikanan & Ternak',
        ARRAY['Ayam Kampung / Joper', 'Ayam Broiler (Pedaging)', 'Burung Puyuh (Layer/Pedaging)'],
        7200.00,
        'Melimpah',
        ST_SetSRID(ST_MakePoint(106.7320, -6.5580), 4326)::geography,
        'Kang Reza (0812-9001-2233) - Dramaga, Bogor'
    );

    -- 11. Biskuit Afkir Mojosongo (Boyolali)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        boyolali_id,
        'Pabrik Pakan Mandiri Mojosongo',
        'Biskuit Afkir & Residu Roti Kering Giling (Energi Tinggi)',
        'Limbah Agroindustri',
        ARRAY['Ayam Broiler (Pedaging)', 'Ayam Kampung / Joper', 'Bebek / Itik (Petelur & Pedaging)'],
        3100.00,
        'Melimpah',
        ST_SetSRID(ST_MakePoint(110.6010, -7.5420), 4326)::geography,
        'Pak Joko (0818-4455-6677) - Mojosongo, Boyolali'
    );

    -- 12. Bungkil Inti Sawit Sunggal (Deli Serdang)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        deliserdang_id,
        'Agro Sawit Protein Sunggal',
        'Bungkil Inti Sawit Terfermentasi Probiotik Unggas',
        'Limbah Agroindustri',
        ARRAY['Ayam Kampung / Joper', 'Bebek / Itik (Petelur & Pedaging)'],
        2100.00,
        'Melimpah',
        ST_SetSRID(ST_MakePoint(98.6920, 3.5350), 4326)::geography,
        'Bang Siregar (0812-7788-9911) - Sunggal, Deli Serdang'
    );

    -- 13. Silo Jagung Natar (Lampung Selatan)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        lampung_id,
        'Silo Jagung Nusantara Natar',
        'Jagung Kuning Pipil Kering Oven (KA 13%)',
        'Limbah Pertanian',
        ARRAY['Ayam Broiler (Pedaging)', 'Ayam Petelur (Layer)', 'Ayam Kampung / Joper'],
        4700.00,
        'Melimpah',
        ST_SetSRID(ST_MakePoint(105.2920, -5.3950), 4326)::geography,
        'Pak Hendro (0812-7901-5544) - Natar, Lampung Selatan'
    );

    -- 14. Jagung & Dedak Pelaihari (Tanah Laut)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        tanahlaut_id,
        'Sentra Jagung Pakan Pelaihari',
        'Jagung Pipil Kuning Lokal & Dedak Halus',
        'Limbah Pertanian',
        ARRAY['Ayam Broiler (Pedaging)', 'Ayam Kampung / Joper', 'Bebek / Itik (Petelur & Pedaging)'],
        5300.00,
        'Melimpah',
        ST_SetSRID(ST_MakePoint(114.8420, -3.8050), 4326)::geography,
        'Pak Ridwan (0812-5100-9922) - Pelaihari, Tanah Laut'
    );

    -- 15. Bekatul Padi Organik Tabanan (Bali)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        tabanan_id,
        'Subak Padi Lestari Penebel Tabanan',
        'Bekatul Padi Organik Super Halus',
        'Limbah Pertanian',
        ARRAY['Bebek / Itik (Petelur & Pedaging)', 'Ayam Kampung / Joper', 'Ayam Petelur (Layer)'],
        3500.00,
        'Melimpah',
        ST_SetSRID(ST_MakePoint(115.1410, -8.4980), 4326)::geography,
        'Bli Made (0812-3800-4455) - Penebel, Tabanan'
    );

    -- 16. Lumbung Jagung & Dedak Praya (Lombok Tengah)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        lombok_id,
        'Lumbung Jagung & Bekatul Praya',
        'Jagung Giling Halus & Dedak Padi Praya',
        'Limbah Pertanian',
        ARRAY['Ayam Kampung / Joper', 'Ayam Broiler (Pedaging)', 'Bebek / Itik (Petelur & Pedaging)'],
        4800.00,
        'Melimpah',
        ST_SetSRID(ST_MakePoint(116.2710, -8.7120), 4326)::geography,
        'Lalu Ahmad (0818-0366-5544) - Praya, Lombok Tengah'
    );

    -- 17. Tepung Ikan & Kerang Pujut (Lombok Tengah)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        lombok_id,
        'Sentra Tepung Ikan & Cangkang Kerang Kuta Mandalika',
        'Tepung Ikan Rucah Kering & Grit Kalsium Kerang',
        'Limbah Perikanan & Ternak',
        ARRAY['Ayam Kampung / Joper', 'Ayam Petelur (Layer)', 'Bebek / Itik (Petelur & Pedaging)'],
        6500.00,
        'Tersedia',
        ST_SetSRID(ST_MakePoint(116.2840, -8.7850), 4326)::geography,
        'Bang Zulkifli (0852-3911-8800) - Pujut, Lombok Tengah'
    );

    -- 18. Maggot BSF & Ampas Kedelai Sawojajar / Kedungkandang (Kota Malang)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        malang_id,
        'Sentra Maggot & Bungkil Kedungkandang',
        'Maggot BSF Kering & Ampas Kedelai Sanan Malang',
        'Limbah Perikanan & Ternak',
        ARRAY['Ayam Kampung / Joper', 'Ayam Petelur (Layer)', 'Burung Puyuh (Layer/Pedaging)'],
        5800.00,
        'Melimpah',
        ST_SetSRID(ST_MakePoint(112.6620, -7.9810), 4326)::geography,
        'Mas Hendri (0812-3210-7788) - Sawojajar / Kedungkandang, Malang'
    );

    -- 19. Jagung Giling & Bekatul Pakisaji (Malang)
    INSERT INTO feed_sources (
        region_id, name, feed_material, category, target_livestock, estimated_price_per_kg, availability_status, location, contact_info
    ) VALUES (
        malang_id,
        'Penggilingan Jagung & Bekatul Pakisaji',
        'Jagung Giling Halus & Bekatul Segar Malang',
        'Limbah Pertanian',
        ARRAY['Ayam Broiler (Pedaging)', 'Ayam Petelur (Layer)', 'Bebek / Itik (Petelur & Pedaging)'],
        4600.00,
        'Melimpah',
        ST_SetSRID(ST_MakePoint(112.5960, -8.0480), 4326)::geography,
        'Pak Agus (0813-3456-8890) - Pakisaji, Malang'
    );

    -- Tetapkan status verifikasi awal agar UI dapat membedakan titik Terverifikasi vs Perlu Konfirmasi
    UPDATE feed_sources
    SET
        is_verified = true,
        source_type = 'survey_lapangan',
        last_verified_at = NOW() - INTERVAL '3 days'
    WHERE category IN ('Limbah Pertanian', 'Mineral & Suplemen');

    UPDATE feed_sources
    SET
        is_verified = false,
        source_type = 'google_places',
        last_verified_at = NULL
    WHERE category IN ('Limbah Agroindustri');

    UPDATE feed_sources
    SET
        is_verified = false,
        source_type = 'komunitas',
        last_verified_at = NULL
    WHERE category IN ('Limbah Perikanan & Ternak', 'Hijauan & Karotenoid');

END $$;

-- ==============================================================================
-- 6. Tabel Users Profile & Subscription System (Admin, Peternak, Pemilik Pakan)
-- ==============================================================================

-- Buat Tabel users_profile
CREATE TABLE IF NOT EXISTS users_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'peternak', 'pemilik_pakan')),
    business_name TEXT NOT NULL,
    location_address TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    livestock_types TEXT[], -- Khusus Peternak
    poultry_capacity INT, -- Kapasitas Ekor Unggas
    feed_materials TEXT[], -- Khusus Pemilik Pakan
    supply_capacity_ton_month NUMERIC(10, 2), -- Kapasitas Suplai (ton/bulan)
    subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (
        subscription_status IN ('inactive', 'pending_verification', 'active', 'rejected', 'expired')
    ),
    subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (
        subscription_plan IN ('free', 'peternak_starter', 'peternak_pro', 'pemasok_umkm', 'pemasok_pro')
    ),
    subscription_paid_amount NUMERIC(12, 2) DEFAULT 0,
    subscription_expires_at TIMESTAMPTZ,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Hubungkan feed_sources ke pemilik pakan (supplier)
ALTER TABLE feed_sources ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES users_profile(id) ON DELETE SET NULL;

-- Buat Tabel subscription_transactions
CREATE TABLE IF NOT EXISTS subscription_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('qris', 'bank_transfer_bca', 'bank_transfer_mandiri', 'bank_transfer_bri')),
    payment_ref TEXT NOT NULL,
    proof_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    verified_at TIMESTAMPTZ,
    verified_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_profile_role ON users_profile(role);
CREATE INDEX IF NOT EXISTS idx_users_profile_subscription ON users_profile(subscription_status);
CREATE INDEX IF NOT EXISTS idx_subscription_tx_status ON subscription_transactions(status);

