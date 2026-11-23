import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FeedSource, SupabaseFeedRow } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function getCategoryBadgeColor(category: string): { bg: string; text: string; border: string; dot: string } {
  switch (category) {
    case 'Limbah Pertanian':
      return {
        bg: 'bg-amber-950/40',
        text: 'text-amber-400',
        border: 'border-amber-800/40',
        dot: 'bg-amber-400',
      };
    case 'Limbah Agroindustri':
      return {
        bg: 'bg-blue-950/40',
        text: 'text-blue-400',
        border: 'border-blue-800/40',
        dot: 'bg-blue-400',
      };
    case 'Limbah Perikanan & Ternak':
    case 'Limbah Perkebunan':
      return {
        bg: 'bg-orange-950/40',
        text: 'text-orange-400',
        border: 'border-orange-800/40',
        dot: 'bg-orange-400',
      };
    case 'Hijauan & Karotenoid':
    case 'Hijauan Alternatif':
      return {
        bg: 'bg-emerald-950/40',
        text: 'text-emerald-400',
        border: 'border-emerald-800/40',
        dot: 'bg-emerald-400',
      };
    case 'Mineral & Suplemen':
      return {
        bg: 'bg-violet-950/40',
        text: 'text-violet-300',
        border: 'border-violet-800/40',
        dot: 'bg-violet-400',
      };
    default:
      return {
        bg: 'bg-teal-950/40',
        text: 'text-teal-400',
        border: 'border-teal-800/40',
        dot: 'bg-teal-400',
      };
  }
}

export function getAvailabilityBadgeColor(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case 'Melimpah':
      return {
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-300',
        border: 'border-emerald-500/30',
      };
    case 'Tersedia':
      return {
        bg: 'bg-teal-500/15',
        text: 'text-teal-300',
        border: 'border-teal-500/30',
      };
    case 'Musiman':
      return {
        bg: 'bg-amber-500/15',
        text: 'text-amber-300',
        border: 'border-amber-500/30',
      };
    case 'Terbatas':
    default:
      return {
        bg: 'bg-rose-500/15',
        text: 'text-rose-300',
        border: 'border-rose-500/30',
      };
  }
}

export function createWhatsAppLink(contactInfo: string, feedMaterial: string): string | null {
  if (!contactInfo) return null;
  // Extract digits from contact string
  const digits = contactInfo.replace(/\D/g, '');
  if (!digits || digits.length < 8) return null;

  let phone = digits;
  if (phone.startsWith('0')) {
    phone = '62' + phone.substring(1);
  } else if (!phone.startsWith('62')) {
    phone = '62' + phone;
  }

  const message = encodeURIComponent(
    `Halo, saya menemukan kontak Anda melalui platform be-ternak untuk bahan pakan "${feedMaterial}". Apakah pasokan masih tersedia untuk pemesanan? Terima kasih.`
  );

  return `https://wa.me/${phone}?text=${message}`;
}

export function mapSupabaseFeedRow(item: SupabaseFeedRow): FeedSource {
  return {
    id: item.id,
    region_id: item.region_id ?? undefined,
    name: item.name,
    feed_material: item.feed_material,
    category: item.category,
    target_livestock: item.target_livestock,
    estimated_price_per_kg: Number(item.estimated_price_per_kg),
    availability_status: item.availability_status,
    contact_info: item.contact_info ?? undefined,
    is_verified: Boolean(item.is_verified),
    source_type: item.source_type ?? 'komunitas',
    last_verified_at: item.last_verified_at ?? null,
    lat: Number(item.lat),
    lng: Number(item.lng),
    distance_km: item.distance_km != null ? Number(item.distance_km) : undefined,
  };
}

export function getSourceTypeLabel(sourceType?: string): string {
  switch (sourceType) {
    case 'survey_lapangan':
      return 'Survei Lapangan';
    case 'google_places':
      return 'Google Places';
    case 'osm_data':
      return 'OpenStreetMap';
    case 'data_pemerintah':
      return 'Data Pemerintah';
    case 'komunitas':
    default:
      return 'Komunitas Peternak';
  }
}

export function formatVerifiedDate(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}


