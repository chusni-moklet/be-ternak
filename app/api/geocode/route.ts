import { NextRequest, NextResponse } from 'next/server';
import { GeocodeResult } from '@/lib/types';

interface NominatimAddress {
  village?: string;
  suburb?: string;
  neighbourhood?: string;
  hamlet?: string;
  city_district?: string;
  district?: string;
  city?: string;
  town?: string;
  county?: string;
  municipality?: string;
  state?: string;
}

interface NominatimItem {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name?: string;
  addresstype?: string;
  type?: string;
  address?: NominatimAddress;
}

interface PhotonFeature {
  properties: {
    osm_id?: number;
    name?: string;
    city?: string;
    county?: string;
    district?: string;
    state?: string;
    countrycode?: string;
    osm_value?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

function formatIndonesianPlaceName(addr?: NominatimAddress, fallbackName?: string, displayName?: string): string {
  if (!addr) {
    return fallbackName || displayName?.split(',').slice(0, 3).join(', ') || 'Lokasi Indonesia';
  }
  const primary =
    addr.village ||
    addr.suburb ||
    addr.hamlet ||
    addr.neighbourhood ||
    addr.city_district ||
    addr.district ||
    fallbackName;
  const secondary = addr.city || addr.town || addr.county || addr.municipality;
  const province = addr.state;

  const parts = [primary, secondary, province].filter((p): p is string => Boolean(p));
  // Deduplicate adjacent identical segments (e.g. "Kota Malang, Kota Malang")
  const uniqueParts = parts.filter((val, idx) => parts.indexOf(val) === idx);
  return uniqueParts.join(', ') || displayName?.split(',').slice(0, 3).join(', ') || 'Lokasi Indonesia';
}

function translateAdminType(rawType?: string): string {
  switch (rawType) {
    case 'village':
      return 'Desa / Kelurahan';
    case 'suburb':
    case 'quarter':
    case 'neighbourhood':
      return 'Kelurahan / Kawasan';
    case 'hamlet':
      return 'Dusun';
    case 'city_district':
    case 'district':
      return 'Kecamatan';
    case 'city':
    case 'town':
      return 'Kota';
    case 'county':
      return 'Kabupaten';
    case 'state':
      return 'Provinsi';
    default:
      return 'Wilayah Indonesia';
  }
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 4500): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  // Mode 1: Reverse Geocode + Live Temperature from coordinates
  if (latParam && lngParam) {
    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json({ error: 'Koordinat tidak valid' }, { status: 400 });
    }

    const [geoRes, weatherRes] = await Promise.allSettled([
      fetchWithTimeout(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'PetaPakanAI/1.0 (https://petapakan.id)',
            'Accept-Language': 'id,en',
          },
        },
        3500
      ),
      fetchWithTimeout(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m`,
        {},
        3000
      ),
    ]);

    let placeName: string | null = null;
    if (geoRes.status === 'fulfilled' && geoRes.value.ok) {
      const geoData = (await geoRes.value.json()) as NominatimItem;
      placeName = formatIndonesianPlaceName(geoData.address, geoData.name, geoData.display_name);
    }

    let temperature: number | null = null;
    if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
      const weatherData = (await weatherRes.value.json()) as {
        current?: { temperature_2m?: number };
      };
      if (typeof weatherData.current?.temperature_2m === 'number') {
        temperature = Math.round(weatherData.current.temperature_2m * 10) / 10;
      }
    }

    return NextResponse.json({
      success: true,
      placeName,
      temperature,
    });
  }

  // Mode 2: Forward Geocoding Search across all Indonesia
  if (!q || q.length < 2) {
    return NextResponse.json({ success: true, results: [] });
  }

  let results: GeocodeResult[] = [];

  // Primary: OpenStreetMap Nominatim (filtered to Indonesia: countrycodes=id)
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=id&addressdetails=1&limit=8&q=${encodeURIComponent(q)}`;
    const res = await fetchWithTimeout(
      nominatimUrl,
      {
        headers: {
          'User-Agent': 'PetaPakanAI/1.0 (https://petapakan.id)',
          'Accept-Language': 'id,en',
        },
      },
      4500
    );

    if (res.ok) {
      const items = (await res.json()) as NominatimItem[];
      results = items.map((item) => {
        const name = formatIndonesianPlaceName(item.address, item.name, item.display_name);
        const typeLabel = translateAdminType(item.addresstype || item.type);
        const state = item.address?.state;
        return {
          id: `osm-${item.place_id}`,
          name,
          sublabel: state && !name.endsWith(state) ? `${typeLabel} • ${state}` : typeLabel,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        };
      });
    }
  } catch (err) {
    console.warn('[PetaPakan AI] Nominatim error, trying Photon fallback:', err);
  }

  // Fallback: Photon Komoot (when Nominatim fails or returns empty)
  if (results.length === 0) {
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=-2.5&lon=118&limit=10`;
      const res = await fetchWithTimeout(photonUrl, {}, 4000);
      if (res.ok) {
        const json = (await res.json()) as { features?: PhotonFeature[] };
        const idFeatures = (json.features || []).filter(
          (f) => f.properties.countrycode === 'ID'
        );
        results = idFeatures.slice(0, 8).map((f, idx) => {
          const p = f.properties;
          const parts = [p.name, p.city || p.county || p.district, p.state].filter(
            (v): v is string => Boolean(v)
          );
          const unique = parts.filter((val, i) => parts.indexOf(val) === i);
          return {
            id: `photon-${p.osm_id || idx}`,
            name: unique.join(', ') || q,
            sublabel: translateAdminType(p.osm_value),
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
          };
        });
      }
    } catch (err) {
      console.warn('[PetaPakan AI] Photon fallback error:', err);
    }
  }

  // Deduplicate results with identical display names and close coords
  const deduped: GeocodeResult[] = [];
  for (const r of results) {
    const exists = deduped.some(
      (d) =>
        d.name.toLowerCase() === r.name.toLowerCase() &&
        Math.abs(d.lat - r.lat) < 0.02 &&
        Math.abs(d.lng - r.lng) < 0.02
    );
    if (!exists) deduped.push(r);
  }

  return NextResponse.json({
    success: true,
    results: deduped,
  });
}

