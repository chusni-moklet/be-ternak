export type LivestockType =
  | 'Ayam Broiler (Pedaging)'
  | 'Ayam Petelur (Layer)'
  | 'Ayam Kampung / Joper'
  | 'Bebek / Itik (Petelur & Pedaging)'
  | 'Burung Puyuh (Layer/Pedaging)';

export type FeedCategory =
  | 'Limbah Pertanian'
  | 'Limbah Agroindustri'
  | 'Limbah Perikanan & Ternak'
  | 'Hijauan & Karotenoid'
  | 'Mineral & Suplemen'
  | 'Lainnya';

export type AvailabilityStatus =
  | 'Melimpah'
  | 'Tersedia'
  | 'Musiman'
  | 'Terbatas';

export type FeedSourceType =
  | 'survey_lapangan'
  | 'google_places'
  | 'komunitas'
  | 'osm_data'
  | 'data_pemerintah';

export interface Region {
  id: string;
  name: string;
  island?: string;
  lat: number;
  lng: number;
  avg_temp_celsius: number;
  market_potential_score: number;
  market_notes: string;
}

export interface GeocodeResult {
  id: string;
  name: string;
  sublabel: string;
  lat: number;
  lng: number;
}

export interface UserGeoLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
  placeName?: string | null;
}

export interface FeedSource {
  id: string;
  region_id?: string;
  name: string;
  feed_material: string;
  category: FeedCategory | string;
  target_livestock: string[];
  estimated_price_per_kg: number;
  availability_status: AvailabilityStatus | string;
  lat: number;
  lng: number;
  distance_km?: number;
  contact_info?: string;
  is_verified?: boolean;
  source_type?: FeedSourceType | string;
  last_verified_at?: string | null;
  created_at?: string;
}

export interface RansumComposition {
  bahan: string;
  persentase: number;
  peran_nutrisi: string;
}

export interface RansumItem {
  nama_ransum: string;
  target_ternak: string;
  komposisi: RansumComposition[];
  kandungan_nutrisi: {
    protein_kasar_est: string;
    energi_metabolis_est: string; // EM (kcal/kg) khas nutrisi unggas
    tdn_energi_est?: string;
    serat_kasar_est: string;
    kalsium_fosfor_est?: string;
  };
  estimasi_biaya_per_kg: number;
  penghematan_komersial: string;
}

export interface ProcessingTip {
  metode: string;
  bahan_target: string;
  tahapan: string[];
  manfaat: string;
  perhatian: string;
}

export interface MarketStrategy {
  potensi_lokal: string;
  saluran_pemasaran: string[];
  efisiensi_usaha: string;
  rekomendasi_aksi: string[];
}

export interface RegionSummary {
  analisis_iklim: string;
  ketersediaan_pakan: string;
  skor_kesesuaian: number;
  status_wilayah: string;
}

export interface AiAnalysisResult {
  ringkasan_wilayah: RegionSummary;
  rekomendasi_ransum: RansumItem[];
  tips_pengolahan: ProcessingTip[];
  strategi_pasar: MarketStrategy;
  source_feed_count: number;
  analyzed_at: string;
  is_mock?: boolean;
}

export interface AnalyzeAreaPayload {
  lat: number;
  lng: number;
  radiusKm: number;
  livestockType: LivestockType;
}

export interface CreateFeedSourcePayload {
  name: string;
  feed_material: string;
  category: string;
  target_livestock: string[];
  estimated_price_per_kg: number;
  availability_status: string;
  lat: number;
  lng: number;
  contact_info?: string;
  region_id?: string;
  is_verified?: boolean;
  source_type?: FeedSourceType | string;
}

export interface SupabaseFeedRow {
  id: string;
  region_id?: string | null;
  name: string;
  feed_material: string;
  category: string;
  target_livestock: string[];
  estimated_price_per_kg: number | string;
  availability_status: string;
  contact_info?: string | null;
  is_verified?: boolean | null;
  source_type?: string | null;
  last_verified_at?: string | null;
  lat: number | string;
  lng: number | string;
  distance_km?: number | string | null;
}

export interface SupabaseRegionRow {
  id: string;
  name: string;
  island?: string | null;
  avg_temp_celsius: number | string;
  market_potential_score: number | string;
  market_notes?: string | null;
  center_point?: {
    coordinates?: [number, number];
  } | null;
}

// ============================================================================
// Multi-Role Dashboard & Subscription Types
// ============================================================================

export type UserRole = 'admin' | 'peternak' | 'pemilik_pakan';

export type SubscriptionPlanType =
  | 'free'
  | 'peternak_starter'
  | 'peternak_pro'
  | 'pemasok_umkm'
  | 'pemasok_pro';

export type SubscriptionStatus =
  | 'inactive'
  | 'pending_verification'
  | 'active'
  | 'rejected'
  | 'expired';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  business_name: string; // Nama Peternakan atau Nama Usaha Pakan
  location_address: string;
  lat: number;
  lng: number;
  livestock_types?: string[]; // Khusus Peternak (e.g. ['Ayam Petelur (Layer)'])
  poultry_capacity?: number; // Kapasitas populasi unggas (ekor)
  feed_materials?: string[]; // Khusus Pemilik Pakan (e.g. ['Dedak Padi', 'Ampas Tahu'])
  supply_capacity_ton_month?: number; // Kapasitas suplai limbah (ton/bulan)
  subscription_status: SubscriptionStatus;
  subscription_plan: SubscriptionPlanType;
  subscription_paid_amount: number;
  subscription_expires_at?: string | null;
  is_verified: boolean;
  verified_at?: string | null;
  verified_by?: string | null;
  created_at: string;
}

export type PaymentMethod =
  | 'qris'
  | 'bank_transfer_bca'
  | 'bank_transfer_mandiri'
  | 'bank_transfer_bri';

export interface SubscriptionTransaction {
  id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  business_name: string;
  plan_id: SubscriptionPlanType;
  plan_name: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_ref: string;
  proof_image_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  verified_at?: string | null;
  verified_by?: string | null;
}

export interface SavedRansum {
  id: string;
  user_id: string;
  title: string;
  livestock_type: string;
  total_cost_per_kg: number;
  savings_percent: string;
  ingredients: {
    bahan: string;
    persentase: number;
    peran: string;
  }[];
  created_at: string;
}

