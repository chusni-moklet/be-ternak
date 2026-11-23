import { Region, FeedSource, AiAnalysisResult, LivestockType } from './types';

// Wilayah Pusat Peternakan Unggas di Seluruh Indonesia
export const INITIAL_REGIONS: Region[] = [
  // --- JAWA TIMUR ---
  {
    id: 'region-blitar-01',
    name: 'Kabupaten Blitar, Jawa Timur',
    island: 'Jawa',
    lat: -8.0983,
    lng: 112.1681,
    avg_temp_celsius: 26.5,
    market_potential_score: 96,
    market_notes: 'Ibukota Telur Nasional — penyuplai 30% kebutuhan telur ayam ras Indonesia. Sentra peternakan ayam petelur (layer) dan puyuh terbesar.',
  },
  {
    id: 'region-grati-02',
    name: 'Kecamatan Grati & Pasuruan, Jawa Timur',
    island: 'Jawa',
    lat: -7.7289,
    lng: 113.0167,
    avg_temp_celsius: 31.0,
    market_potential_score: 90,
    market_notes: 'Kawasan lumbung jagung pakan ternak Pantura dan sentra ayam pedaging (broiler) serta ayam kampung super (Joper).',
  },
  {
    id: 'region-malang-03',
    name: 'Kecamatan Lawang & Malang, Jawa Timur',
    island: 'Jawa',
    lat: -7.8355,
    lng: 112.6947,
    avg_temp_celsius: 23.5,
    market_potential_score: 93,
    market_notes: 'Kawasan agroklimat sejuk dataran tinggi ideal untuk pembibitan (Breeding Farm DOC), ayam petelur bebas heat stress, dan bebek petelur.',
  },

  // --- JAWA BARAT & BANTEN ---
  {
    id: 'region-ciamis-04',
    name: 'Kabupaten Ciamis & Tasikmalaya, Jawa Barat',
    island: 'Jawa',
    lat: -7.3274,
    lng: 108.3551,
    avg_temp_celsius: 27.0,
    market_potential_score: 94,
    market_notes: 'Sentra ayam pedaging (broiler) dan plasma unggas Priangan Timur. Produsen ayam kampung asli galur Sentul.',
  },
  {
    id: 'region-bogor-05',
    name: 'Kabupaten Bogor, Jawa Barat',
    island: 'Jawa',
    lat: -6.5971,
    lng: 106.8060,
    avg_temp_celsius: 26.0,
    market_potential_score: 92,
    market_notes: 'Pusat integrasi perunggasan Jabodetabek, industri pakan ternak modern, dan pusat riset inovasi pakan unggas IPB University.',
  },

  // --- JAWA TENGAH & DIY ---
  {
    id: 'region-boyolali-06',
    name: 'Kabupaten Boyolali & Solo, Jawa Tengah',
    island: 'Jawa',
    lat: -7.5361,
    lng: 110.5944,
    avg_temp_celsius: 26.8,
    market_potential_score: 91,
    market_notes: 'Sentra populasi ayam petelur dan ayam kampung Soloraya dengan akses pasokan jagung dan bekatul melimpah.',
  },

  // --- SUMATERA ---
  {
    id: 'region-deliserdang-07',
    name: 'Kabupaten Deli Serdang, Sumatera Utara',
    island: 'Sumatera',
    lat: 3.5186,
    lng: 98.7188,
    avg_temp_celsius: 28.5,
    market_potential_score: 93,
    market_notes: 'Kawasan populasi ayam ras pedaging dan petelur terbesar di Sumatera. Dekat dengan pelabuhan dan pabrik bungkil sawit/kelapa.',
  },
  {
    id: 'region-lampung-08',
    name: 'Kabupaten Lampung Selatan, Lampung',
    island: 'Sumatera',
    lat: -5.4500,
    lng: 105.4000,
    avg_temp_celsius: 29.0,
    market_potential_score: 91,
    market_notes: 'Pintu gerbang jalur pasokan jagung pipil pakan unggas nasional dan sentra peternakan itik/bebek petelur.',
  },

  // --- SULAWESI ---
  {
    id: 'region-sidrap-09',
    name: 'Kabupaten Sidrap (Sidenreng Rappang), Sulawesi Selatan',
    island: 'Sulawesi',
    lat: -3.8833,
    lng: 119.9167,
    avg_temp_celsius: 28.0,
    market_potential_score: 95,
    market_notes: 'Lumbung telur dan sentra industri ayam petelur (layer) terbesar di Indonesia Timur. Menyuplai telur ke Papua, Maluku, dan Kalimantan.',
  },

  // --- KALIMANTAN ---
  {
    id: 'region-tanahlaut-10',
    name: 'Kabupaten Tanah Laut (Pelaihari), Kalimantan Selatan',
    island: 'Kalimantan',
    lat: -3.7917,
    lng: 114.8667,
    avg_temp_celsius: 28.5,
    market_potential_score: 89,
    market_notes: 'Sentra peternakan ayam potong broiler dan budidaya itik Alabio unggulan Kalimantan Selatan.',
  },

  // --- BALI & NUSA TENGGARA ---
  {
    id: 'region-tabanan-11',
    name: 'Kabupaten Tabanan, Bali',
    island: 'Bali & NTB',
    lat: -8.5392,
    lng: 115.1217,
    avg_temp_celsius: 26.0,
    market_potential_score: 90,
    market_notes: 'Lumbung padi dan sentra peternakan ayam buras serta itik Bali dengan permintaan tinggi dari sektor pariwisata kuliner.',
  },
  {
    id: 'region-lombok-12',
    name: 'Kabupaten Lombok Tengah, Nusa Tenggara Barat',
    island: 'Bali & NTB',
    lat: -8.7067,
    lng: 116.2767,
    avg_temp_celsius: 28.0,
    market_potential_score: 88,
    market_notes: 'Sentra produksi ayam kampung lokal (bahan baku Ayam Taliwang) dan itik petelur pulau Lombok.',
  },
];

// Data Titik Sumber Pakan Khusus Unggas di Berbagai Wilayah Indonesia
const RAW_FEED_SOURCES: FeedSource[] = [
  // --- Blitar & Jawa Timur ---
  {
    id: 'feed-puyuh-001',
    region_id: 'region-blitar-01',
    name: 'Sentra Jagung Giling Srengat',
    feed_material: 'Jagung Pipil Kering Giling Halus (KA < 14%)',
    category: 'Limbah Pertanian',
    target_livestock: ['Ayam Petelur (Layer)', 'Ayam Broiler (Pedaging)', 'Ayam Kampung / Joper', 'Burung Puyuh (Layer/Pedaging)'],
    estimated_price_per_kg: 5200,
    availability_status: 'Melimpah',
    lat: -8.0850,
    lng: 112.0720,
    contact_info: 'H. Suwardi (0812-3344-9901) - Srengat, Blitar',
  },
  {
    id: 'feed-puyuh-002',
    region_id: 'region-blitar-01',
    name: 'Biotech Larva Nusantara Blitar',
    feed_material: 'Maggot BSF Kering (Protein Kasar 42-45%)',
    category: 'Limbah Perikanan & Ternak',
    target_livestock: ['Ayam Kampung / Joper', 'Ayam Petelur (Layer)', 'Bebek / Itik (Petelur & Pedaging)', 'Burung Puyuh (Layer/Pedaging)'],
    estimated_price_per_kg: 6800,
    availability_status: 'Melimpah',
    lat: -8.1120,
    lng: 112.1850,
    contact_info: 'Mas Dian - 0821-4455-8811 (Kanigoro, Blitar)',
  },
  {
    id: 'feed-puyuh-003',
    region_id: 'region-blitar-01',
    name: 'UD Mineral Unggas Jaya Talun',
    feed_material: 'Tepung Kulit Kerang / Grit Kalsium Tinggi (Ca 38%)',
    category: 'Mineral & Suplemen',
    target_livestock: ['Ayam Petelur (Layer)', 'Bebek / Itik (Petelur & Pedaging)', 'Burung Puyuh (Layer/Pedaging)'],
    estimated_price_per_kg: 1800,
    availability_status: 'Melimpah',
    lat: -8.0950,
    lng: 112.2450,
    contact_info: 'Pak Bambang (0813-8899-7722) - Talun, Blitar',
  },

  // --- Grati & Pasuruan ---
  {
    id: 'feed-grati-001',
    region_id: 'region-grati-02',
    name: 'Penggilingan Padi Sri Rejeki Grati',
    feed_material: 'Dedak Padi Bekatul Super (Serat Kasar Rendah < 8%)',
    category: 'Limbah Pertanian',
    target_livestock: ['Ayam Kampung / Joper', 'Ayam Broiler (Pedaging)', 'Bebek / Itik (Petelur & Pedaging)'],
    estimated_price_per_kg: 3300,
    availability_status: 'Melimpah',
    lat: -7.7350,
    lng: 113.0240,
    contact_info: 'Pak Sugeng (0813-9876-5402) - Grati, Pasuruan',
  },
  {
    id: 'feed-grati-002',
    region_id: 'region-grati-02',
    name: 'Tepung Ikan Pesisir Lekok Pasuruan',
    feed_material: 'Tepung Ikan Rucah Murni (Protein Kasar 52%)',
    category: 'Limbah Perikanan & Ternak',
    target_livestock: ['Ayam Broiler (Pedaging)', 'Ayam Kampung / Joper', 'Bebek / Itik (Petelur & Pedaging)'],
    estimated_price_per_kg: 9500,
    availability_status: 'Tersedia',
    lat: -7.6950,
    lng: 113.0180,
    contact_info: 'Cak Mansur (0856-7788-2233) - Lekok, Pasuruan',
  },

  // --- Lawang & Malang ---
  {
    id: 'feed-lawang-001',
    region_id: 'region-malang-03',
    name: 'Sentra Olahan Tahu Lawang Asri',
    feed_material: 'Ampas Tahu Fermentasi Ragi & Kering Oven (PK 22%)',
    category: 'Limbah Agroindustri',
    target_livestock: ['Ayam Kampung / Joper', 'Bebek / Itik (Petelur & Pedaging)'],
    estimated_price_per_kg: 1900,
    availability_status: 'Tersedia',
    lat: -7.8290,
    lng: 112.6980,
    contact_info: 'Bu Siti Rahayu (0812-3344-5566) - Lawang, Malang',
  },
  {
    id: 'feed-lawang-002',
    region_id: 'region-malang-03',
    name: 'Kebun Herbal Unggas Wonosari',
    feed_material: 'Tepung Daun Indigofera & Azolla (Karotenoid Telur)',
    category: 'Hijauan & Karotenoid',
    target_livestock: ['Ayam Petelur (Layer)', 'Ayam Kampung / Joper', 'Bebek / Itik (Petelur & Pedaging)'],
    estimated_price_per_kg: 4200,
    availability_status: 'Melimpah',
    lat: -7.8420,
    lng: 112.6850,
    contact_info: 'Kang Wahyu (0857-1122-3344) - Wonosari, Malang',
  },

  // --- Ciamis & Jawa Barat ---
  {
    id: 'feed-ciamis-001',
    region_id: 'region-ciamis-04',
    name: 'Kemitraan Petani Bungkil Kedelai Ciamis',
    feed_material: 'Bungkil Kedelai Ekstraksi Lokal (SBM PK 44%)',
    category: 'Limbah Agroindustri',
    target_livestock: ['Ayam Broiler (Pedaging)', 'Ayam Petelur (Layer)', 'Ayam Kampung / Joper'],
    estimated_price_per_kg: 7800,
    availability_status: 'Tersedia',
    lat: -7.3320,
    lng: 108.3610,
    contact_info: 'Kang Deden (0812-8877-6655) - Baregbeg, Ciamis',
  },
  {
    id: 'feed-ciamis-002',
    region_id: 'region-ciamis-04',
    name: 'Penggilingan Padi & Dedak Cikoneng',
    feed_material: 'Dedak Bekatul Padi Halus Grade A',
    category: 'Limbah Pertanian',
    target_livestock: ['Ayam Kampung / Joper', 'Bebek / Itik (Petelur & Pedaging)', 'Ayam Petelur (Layer)'],
    estimated_price_per_kg: 3400,
    availability_status: 'Melimpah',
    lat: -7.3095,
    lng: 108.2880,
    contact_info: 'Mang Ujang (0852-2233-4411) - Cikoneng, Ciamis',
  },

  // --- Bogor, Jawa Barat ---
  {
    id: 'feed-bogor-001',
    region_id: 'region-bogor-05',
    name: 'Rumah Maggot BSF Dramaga Bogor',
    feed_material: 'Maggot BSF Kering & Prepupa Segar (Protein 43%)',
    category: 'Limbah Perikanan & Ternak',
    target_livestock: ['Ayam Kampung / Joper', 'Ayam Broiler (Pedaging)', 'Burung Puyuh (Layer/Pedaging)'],
    estimated_price_per_kg: 7200,
    availability_status: 'Melimpah',
    lat: -6.5580,
    lng: 106.7320,
    contact_info: 'Kang Reza (0812-9001-2233) - Dramaga, Bogor',
  },
  {
    id: 'feed-bogor-002',
    region_id: 'region-bogor-05',
    name: 'Sentra Onggok & Ampas Tahu Cibinong',
    feed_material: 'Ampas Tahu Terfermentasi Kering + Premix Enzim',
    category: 'Limbah Agroindustri',
    target_livestock: ['Bebek / Itik (Petelur & Pedaging)', 'Ayam Kampung / Joper'],
    estimated_price_per_kg: 2200,
    availability_status: 'Tersedia',
    lat: -6.4890,
    lng: 106.8450,
    contact_info: 'Pak Tatang (0813-1122-8899) - Cibinong, Bogor',
  },

  // --- Boyolali & Jawa Tengah ---
  {
    id: 'feed-boyolali-001',
    region_id: 'region-boyolali-06',
    name: 'Pabrik Pakan Mandiri Mojosongo',
    feed_material: 'Biskuit Afkir & Residu Roti Kering Giling (Energi Tinggi)',
    category: 'Limbah Agroindustri',
    target_livestock: ['Ayam Broiler (Pedaging)', 'Ayam Kampung / Joper', 'Bebek / Itik (Petelur & Pedaging)'],
    estimated_price_per_kg: 3100,
    availability_status: 'Melimpah',
    lat: -7.5420,
    lng: 110.6010,
    contact_info: 'Pak Joko (0818-4455-6677) - Mojosongo, Boyolali',
  },
  {
    id: 'feed-boyolali-002',
    region_id: 'region-boyolali-06',
    name: 'Koperasi Jagung Pakan Teras Boyolali',
    feed_material: 'Jagung Pipil Kering Giling Mesh Halus',
    category: 'Limbah Pertanian',
    target_livestock: ['Ayam Petelur (Layer)', 'Ayam Broiler (Pedaging)', 'Burung Puyuh (Layer/Pedaging)'],
    estimated_price_per_kg: 5100,
    availability_status: 'Melimpah',
    lat: -7.5610,
    lng: 110.6350,
    contact_info: 'Pak Hartono (0812-2655-7744) - Teras, Boyolali',
  },

  // --- Deli Serdang & Sumatera Utara ---
  {
    id: 'feed-medan-001',
    region_id: 'region-deliserdang-07',
    name: 'Agro Sawit Protein Sunggal',
    feed_material: 'Bungkil Inti Sawit Terfermentasi Probiotik Unggas',
    category: 'Limbah Agroindustri',
    target_livestock: ['Ayam Kampung / Joper', 'Bebek / Itik (Petelur & Pedaging)'],
    estimated_price_per_kg: 2100,
    availability_status: 'Melimpah',
    lat: 3.5350,
    lng: 98.6920,
    contact_info: 'Bang Siregar (0812-7788-9911) - Sunggal, Deli Serdang',
  },
  {
    id: 'feed-medan-002',
    region_id: 'region-deliserdang-07',
    name: 'Tepung Ikan Pesisir Percut Sei Tuan',
    feed_material: 'Tepung Ikan Laut Segar Giling (Protein Kasar 54%)',
    category: 'Limbah Perikanan & Ternak',
    target_livestock: ['Ayam Broiler (Pedaging)', 'Ayam Petelur (Layer)', 'Bebek / Itik (Petelur & Pedaging)'],
    estimated_price_per_kg: 9200,
    availability_status: 'Tersedia',
    lat: 3.6020,
    lng: 98.7650,
    contact_info: 'Pak Lubis (0813-6234-9900) - Percut, Deli Serdang',
  },

  // --- Lampung Selatan, Lampung ---
  {
    id: 'feed-lampung-001',
    region_id: 'region-lampung-08',
    name: 'Silo Jagung Nusantara Natar',
    feed_material: 'Jagung Kuning Pipil Kering Oven (KA 13%)',
    category: 'Limbah Pertanian',
    target_livestock: ['Ayam Broiler (Pedaging)', 'Ayam Petelur (Layer)', 'Ayam Kampung / Joper'],
    estimated_price_per_kg: 4700,
    availability_status: 'Melimpah',
    lat: -5.3950,
    lng: 105.2920,
    contact_info: 'Pak Hendro (0812-7901-5544) - Natar, Lampung Selatan',
  },
  {
    id: 'feed-lampung-002',
    region_id: 'region-lampung-08',
    name: 'UD Tepung Gaplek & Onggok Kalianda',
    feed_material: 'Onggok Singkong Terfermentasi Asam Laktat',
    category: 'Limbah Agroindustri',
    target_livestock: ['Bebek / Itik (Petelur & Pedaging)', 'Ayam Kampung / Joper'],
    estimated_price_per_kg: 1650,
    availability_status: 'Melimpah',
    lat: -5.5210,
    lng: 105.4580,
    contact_info: 'Mas Eko (0853-7711-2200) - Kalianda, Lampung Selatan',
  },

  // --- Sidrap & Sulawesi Selatan ---
  {
    id: 'feed-sidrap-001',
    region_id: 'region-sidrap-09',
    name: 'Lumbung Pakan Mandiri Maritengngae',
    feed_material: 'Jagung Kuning Pipil Sidrap Grade A & Bekatul Murni',
    category: 'Limbah Pertanian',
    target_livestock: ['Ayam Petelur (Layer)', 'Ayam Broiler (Pedaging)', 'Burung Puyuh (Layer/Pedaging)'],
    estimated_price_per_kg: 4900,
    availability_status: 'Melimpah',
    lat: -3.8910,
    lng: 119.9230,
    contact_info: 'H. Rustam (0813-5566-7788) - Maritengngae, Sidrap',
  },
  {
    id: 'feed-sidrap-002',
    region_id: 'region-sidrap-09',
    name: 'Sentra Tepung Ikan & Kerang Panca Rijang',
    feed_material: 'Tepung Cangkang Kerang & Tepung Ikan Rucah Campur',
    category: 'Mineral & Suplemen',
    target_livestock: ['Ayam Petelur (Layer)', 'Bebek / Itik (Petelur & Pedaging)', 'Burung Puyuh (Layer/Pedaging)'],
    estimated_price_per_kg: 2600,
    availability_status: 'Melimpah',
    lat: -3.8450,
    lng: 119.8650,
    contact_info: 'Daeng Syamsul (0821-8899-3311) - Panca Rijang, Sidrap',
  },

  // --- Tanah Laut (Pelaihari), Kalimantan Selatan ---
  {
    id: 'feed-kalsel-001',
    region_id: 'region-tanahlaut-10',
    name: 'Sentra Jagung Pakan Pelaihari',
    feed_material: 'Jagung Pipil Kuning Lokal & Dedak Halus',
    category: 'Limbah Pertanian',
    target_livestock: ['Ayam Broiler (Pedaging)', 'Ayam Kampung / Joper', 'Bebek / Itik (Petelur & Pedaging)'],
    estimated_price_per_kg: 5300,
    availability_status: 'Melimpah',
    lat: -3.8050,
    lng: 114.8420,
    contact_info: 'Pak Ridwan (0812-5100-9922) - Pelaihari, Tanah Laut',
  },
  {
    id: 'feed-kalsel-002',
    region_id: 'region-tanahlaut-10',
    name: 'Koperasi Pakan Itik Alabio Kurau',
    feed_material: 'Tepung Keong Sawah & Ikan Rawa Kering (Protein 46%)',
    category: 'Limbah Perikanan & Ternak',
    target_livestock: ['Bebek / Itik (Petelur & Pedaging)', 'Ayam Kampung / Joper'],
    estimated_price_per_kg: 6200,
    availability_status: 'Tersedia',
    lat: -3.7480,
    lng: 114.8210,
    contact_info: 'H. Rusdi (0852-4888-7733) - Kurau, Tanah Laut',
  },

  // --- Tabanan, Bali ---
  {
    id: 'feed-bali-001',
    region_id: 'region-tabanan-11',
    name: 'Subak Padi Lestari Penebel Tabanan',
    feed_material: 'Bekatul Padi Organik Super Halus',
    category: 'Limbah Pertanian',
    target_livestock: ['Bebek / Itik (Petelur & Pedaging)', 'Ayam Kampung / Joper', 'Ayam Petelur (Layer)'],
    estimated_price_per_kg: 3500,
    availability_status: 'Melimpah',
    lat: -8.4980,
    lng: 115.1410,
    contact_info: 'Bli Made (0812-3800-4455) - Penebel, Tabanan',
  },
  {
    id: 'feed-bali-002',
    region_id: 'region-tabanan-11',
    name: 'Kebun Azolla & Kelapa Selemadeg',
    feed_material: 'Bungkil Kelapa Peras & Tepung Azolla Segar',
    category: 'Hijauan & Karotenoid',
    target_livestock: ['Bebek / Itik (Petelur & Pedaging)', 'Ayam Kampung / Joper'],
    estimated_price_per_kg: 2400,
    availability_status: 'Tersedia',
    lat: -8.5220,
    lng: 115.0510,
    contact_info: 'Pak Nyoman (0819-9911-2233) - Selemadeg, Tabanan',
  },

  // --- Lombok Tengah, NTB ---
  {
    id: 'feed-lombok-001',
    region_id: 'region-lombok-12',
    name: 'Lumbung Jagung & Bekatul Praya',
    feed_material: 'Jagung Giling Halus & Dedak Padi Praya',
    category: 'Limbah Pertanian',
    target_livestock: ['Ayam Kampung / Joper', 'Ayam Broiler (Pedaging)', 'Bebek / Itik (Petelur & Pedaging)'],
    estimated_price_per_kg: 4800,
    availability_status: 'Melimpah',
    lat: -8.7120,
    lng: 116.2710,
    contact_info: 'Lalu Ahmad (0818-0366-5544) - Praya, Lombok Tengah',
  },
  {
    id: 'feed-lombok-002',
    region_id: 'region-lombok-12',
    name: 'Sentra Tepung Ikan & Cangkang Kerang Kuta Mandalika',
    feed_material: 'Tepung Ikan Rucah Kering & Grit Kalsium Kerang',
    category: 'Limbah Perikanan & Ternak',
    target_livestock: ['Ayam Kampung / Joper', 'Ayam Petelur (Layer)', 'Bebek / Itik (Petelur & Pedaging)'],
    estimated_price_per_kg: 6500,
    availability_status: 'Tersedia',
    lat: -8.7850,
    lng: 116.2840,
    contact_info: 'Bang Zulkifli (0852-3911-8800) - Pujut, Lombok Tengah',
  },
  {
    id: 'feed-lombok-003',
    region_id: 'region-lombok-12',
    name: 'Biofarm Maggot BSF Kopang',
    feed_material: 'Maggot BSF Kering & Daun Kelor Tepung',
    category: 'Hijauan & Karotenoid',
    target_livestock: ['Ayam Kampung / Joper', 'Burung Puyuh (Layer/Pedaging)'],
    estimated_price_per_kg: 5900,
    availability_status: 'Tersedia',
    lat: -8.6450,
    lng: 116.3320,
    contact_info: 'Mas Rizky (0878-6455-2211) - Kopang, Lombok Tengah',
  },

  // --- Kota Malang & Malang Raya (Sawojajar, Dinoyo, Pakisaji) ---
  {
    id: 'feed-kotamalang-001',
    region_id: 'region-malang-03',
    name: 'Sentra Maggot & Bungkil Kedungkandang',
    feed_material: 'Maggot BSF Kering & Ampas Kedelai Sanan Malang',
    category: 'Limbah Perikanan & Ternak',
    target_livestock: ['Ayam Kampung / Joper', 'Ayam Petelur (Layer)', 'Burung Puyuh (Layer/Pedaging)'],
    estimated_price_per_kg: 5800,
    availability_status: 'Melimpah',
    lat: -7.9810,
    lng: 112.6620,
    contact_info: 'Mas Hendri (0812-3210-7788) - Sawojajar / Kedungkandang, Malang',
  },
  {
    id: 'feed-kotamalang-002',
    region_id: 'region-malang-03',
    name: 'Penggilingan Jagung & Bekatul Pakisaji',
    feed_material: 'Jagung Giling Halus & Bekatul Segar Malang',
    category: 'Limbah Pertanian',
    target_livestock: ['Ayam Broiler (Pedaging)', 'Ayam Petelur (Layer)', 'Bebek / Itik (Petelur & Pedaging)'],
    estimated_price_per_kg: 4600,
    availability_status: 'Melimpah',
    lat: -8.0480,
    lng: 112.5960,
    contact_info: 'Pak Agus (0813-3456-8890) - Pakisaji, Malang',
  },
];

// Lengkapi status verifikasi & sumber data secara konsisten dengan schema.sql
export const INITIAL_FEED_SOURCES: FeedSource[] = RAW_FEED_SOURCES.map((item) => {
  if (item.category === 'Limbah Pertanian' || item.category === 'Mineral & Suplemen') {
    return {
      ...item,
      is_verified: true,
      source_type: 'survey_lapangan',
      last_verified_at: '2026-11-08T08:00:00Z',
    };
  }
  if (item.category === 'Limbah Agroindustri') {
    return {
      ...item,
      is_verified: false,
      source_type: 'google_places',
      last_verified_at: null,
    };
  }
  return {
    ...item,
    is_verified: false,
    source_type: 'komunitas',
    last_verified_at: null,
  };
});

// Formula Haversine jarak dalam km
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

// Generator simulasi cerdas spesifik untuk komoditas UNGGAS di seluruh Indonesia
export function generateMockAiAnalysis(
  lat: number,
  lng: number,
  radiusKm: number,
  livestockType: LivestockType,
  nearbyFeeds: FeedSource[],
  customRegionName?: string,
  customAvgTemp?: number
): AiAnalysisResult {
  // Temukan nama wilayah terdekat
  let closestRegion = INITIAL_REGIONS[0];
  let minDistance = 99999;
  for (const reg of INITIAL_REGIONS) {
    const d = calculateHaversineDistance(lat, lng, reg.lat, reg.lng);
    if (d < minDistance) {
      minDistance = d;
      closestRegion = reg;
    }
  }

  const regionName =
    customRegionName ||
    (minDistance < 60 ? closestRegion.name : `Koordinat (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
  const avgTemp =
    typeof customAvgTemp === 'number'
      ? customAvgTemp
      : minDistance < 60
      ? closestRegion.avg_temp_celsius
      : 28.0;

  // Formula nutrisi presisi khusus komoditas unggas
  const isLayer = livestockType.includes('Petelur') || livestockType.includes('Puyuh');
  const isBroiler = livestockType.includes('Broiler');

  const pkRequirement = isBroiler ? '21% - 22.5%' : isLayer ? '17.5% - 18.5%' : '16% - 18%';
  const emRequirement = isBroiler ? '3.050 - 3.150 kcal/kg' : isLayer ? '2.750 - 2.850 kcal/kg' : '2.800 - 2.950 kcal/kg';

  return {
    is_mock: true,
    analyzed_at: new Date().toISOString(),
    source_feed_count: nearbyFeeds.length,
    ringkasan_wilayah: {
      status_wilayah: `Sentra Agroklimat Unggas Nasional (${closestRegion.island || 'Indonesia'})`,
      analisis_iklim: `Suhu rata-rata wilayah berada pada level ${avgTemp}°C. ${
        avgTemp > 28
          ? 'Kondisi suhu tropis cenderung memicu Heat Stress pada unggas (frekuensi nafas cepat/panting). Diperlukan pakan berkepadatan nutrisi tinggi, penambahan elektrolit/vitamin C, serta pemberian pakan di jam sejuk (pagi & malam).'
          : 'Suhu lingkungan sangat ideal (comfort zone unggas 20-25°C), metabolisme pakan optimal, dan FCR (Feed Conversion Ratio) dapat mencapai performa puncak tanpa gangguan stres panas.'
      }`,
      ketersediaan_pakan: `Terdeteksi ${nearbyFeeds.length} titik pakan alternatif unggas di radius ${radiusKm} km. Potensi dominan: Jagung pipil giling, maggot BSF protein tinggi, dedak padi bekatul halus, dan tepung kalsium kerang.`,
      skor_kesesuaian: closestRegion.market_potential_score || 92,
    },
    rekomendasi_ransum: [
      {
        nama_ransum: `Ransum Presisi ${livestockType} Mandiri Berbasis Bahan Lokal`,
        target_ternak: livestockType,
        komposisi: [
          {
            bahan: 'Jagung Kuning Pipil Giling (KA < 14%)',
            persentase: 50,
            peran_nutrisi: 'Sumber Energi Karbohidrat Utama (EM 3.350 kcal/kg)',
          },
          {
            bahan: 'Maggot BSF Kering / Tepung Ikan Lokal',
            persentase: 18,
            peran_nutrisi: 'Super Protein Hewani & Asam Amino Esensial Lisin/Metionin',
          },
          {
            bahan: 'Bekatul / Dedak Padi Super Halus',
            persentase: 18,
            peran_nutrisi: 'Sumber Energi Tambahan & Serat Halus Ramah Usus Unggas',
          },
          {
            bahan: 'Bungkil Kedelai (SBM) / Ampas Tahu Fermentasi Kering',
            persentase: 10,
            peran_nutrisi: 'Protein Nabati Penyeimbang & Asam Lemak',
          },
          {
            bahan: isLayer ? 'Tepung Kulit Kerang / Grit Kalsium + Premix' : 'Mineral Premix Unggas + Vitamin',
            persentase: 4,
            peran_nutrisi: isLayer ? 'Kalsium Murni (Ca 38%) Pembentuk Kerabang Telur Kokoh' : 'Katalisator Pertumbuhan Tulang & Kekebalan',
          },
        ],
        kandungan_nutrisi: {
          protein_kasar_est: pkRequirement,
          energi_metabolis_est: emRequirement,
          serat_kasar_est: '< 5.5% (Aman untuk pencernaan unggas)',
          kalsium_fosfor_est: isLayer ? 'Ca: 3.5% - 4.0% | P: 0.45%' : 'Ca: 0.9% - 1.1% | P: 0.45%',
        },
        estimasi_biaya_per_kg: 5600,
        penghematan_komersial: 'Hemat 30% - 38% dibanding pakan konsentrat pabrik komersial (Rp 8.500 - 9.800/kg)',
      },
      {
        nama_ransum: `Formulasi Pakan Unggas Finisher / Penggemukan Hemat Biaya`,
        target_ternak: livestockType,
        komposisi: [
          {
            bahan: 'Jagung Giling Halus',
            persentase: 45,
            peran_nutrisi: 'Energi Metabolis Pokok',
          },
          {
            bahan: 'Biskuit / Roti Afkir Kering Giling',
            persentase: 20,
            peran_nutrisi: 'Pengganti Sebagian Jagung Berbiaya Rendah',
          },
          {
            bahan: 'Maggot BSF Segar / Tepung Ikan Rucah',
            persentase: 20,
            peran_nutrisi: 'Booster Pembentukan Massa Daging Dada',
          },
          {
            bahan: 'Tepung Daun Indigofera / Azolla',
            persentase: 10,
            peran_nutrisi: 'Sumber Karotenoid Pewarna Alami Kulit & Kuning Telur',
          },
          {
            bahan: 'Premix Mineral & Probiotik Asam Laktat',
            persentase: 5,
            peran_nutrisi: 'Optimasi Penyerapan Nutrisi Usus Unggas',
          },
        ],
        kandungan_nutrisi: {
          protein_kasar_est: '18% - 19.5%',
          energi_metabolis_est: '3.000 - 3.100 kcal/kg',
          serat_kasar_est: '< 6.0%',
          kalsium_fosfor_est: 'Ca: 1.0% | P: 0.5%',
        },
        estimasi_biaya_per_kg: 4850,
        penghematan_komersial: '42% lebih hemat untuk siklus penggemukan unggas potong',
      },
    ],
    tips_pengolahan: [
      {
        metode: 'Fermentasi Bekatul / Dedak Padi dengan Probiotik Unggas',
        bahan_target: 'Dedak padi halus, air bersih, tetes tebu/molases, dan bakteri asam laktat (Lactobacillus)',
        tahapan: [
          'Campurkan dedak padi dengan air hangat hingga kelembapan mencapai 40-50% (bila dikepal tidak pecah dan tidak menetes air).',
          'Larutkan probiotik khusus unggas dan molases (1-2%), lalu semprotkan merata ke tumpukan dedak.',
          'Masukkan ke dalam tong plastik kedap udara (anaerob), tutup rapat dan inkubasi selama 3-5 hari.',
          'Dedak fermentasi yang berhasil beraroma harum manis seperti tape/roti dan bebas dari bau tengik.',
        ],
        manfaat: 'Menurunkan kadar asam fitat (antinutrisi pengikat mineral) hingga 65% dan mendongkrak daya cerna protein unggas.',
        perhatian: 'Hindari penggunaan dedak yang sudah berkutu, apek, atau terpapar jamur Aspergillus flavus (aflatoksin sangat beracun bagi unggas).',
      },
      {
        metode: 'Pengeringan & Penepungan Maggot BSF (Black Soldier Fly)',
        bahan_target: 'Larva maggot BSF hidup fase prepupa',
        tahapan: [
          'Bersihkan maggot hidup dari residu media sampah dengan air mengalir.',
          'Rebus cepat dalam air mendidih selama 2-3 menit untuk mematikan mikroba patogen luar.',
          'Tiriskan dan sangrai atau oven pada suhu 60-70°C hingga kadar air di bawah 10% (renyah).',
          'Giling menggunakan mesin penepung (mesh 40) menjadi tepung maggot berprotein 42-45%.',
        ],
        manfaat: 'Menghasilkan pengganti tepung ikan impor dengan kandungan asam laurat tinggi sebagai antibakteri alami saluran pencernaan unggas.',
        perhatian: 'Simpan tepung maggot dalam wadah kedap udara dengan silica gel agar tidak menggumpal dan tidak tengik.',
      },
    ],
    strategi_pasar: {
      potensi_lokal: `Pasar produk unggas (daging & telur) di kawasan ${regionName} memiliki permintaan harian yang sangat stabil dengan perputaran modal cepat (cash flow 35-45 hari untuk broiler, harian untuk telur).`,
      saluran_pemasaran: [
        'Kemitraan pasokan telur segar langsung ke agen grosir pasar induk, bakery, dan toko kelontong modern.',
        'Penjualan karkas ayam beku/segar ke rumah makan, warung pecel lele/ayam, dan pedagang pasar tradisional.',
        'Pemanfaatan branding "Ayam Kampung / Telur Omega Pakan Maggot Alami" dengan nilai jual premium 25-40% lebih tinggi.',
        'Penjualan kotoran unggas (kohe) kering terfermentasi ke perkebunan hortikultura lokal sebagai pupuk organik bernilai tambah.',
      ],
      efisiensi_usaha: 'Pengurangan biaya ransum mandiri memangkas biaya pakan unggas dari Rp 8.800/kg menjadi Rp 5.600/kg, menghasilkan tambahan margin laba bersih Rp 3.200 - Rp 4.500 per ekor ayam atau butir telur.',
      rekomendasi_aksi: [
        'Bentuk kemitraan kelompok peternak untuk membeli jagung pipil dan bungkil kedelai secara kolektif langsung dari petani/produsen.',
        'Kembangkan budidaya maggot BSF mandiri memanfaatkan limbah sayur pasar untuk menekan 100% biaya protein hewani.',
        'Gunakan timbangan pakan presisi harian dan catat FCR mingguan untuk memantau efisiensi metabolisme ransum.',
      ],
    },
  };
}
