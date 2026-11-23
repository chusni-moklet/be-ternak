import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_FEED_SOURCES, calculateHaversineDistance } from '@/lib/mock-data';
import { FeedSource, SupabaseFeedRow } from '@/lib/types';
import { mapSupabaseFeedRow } from '@/lib/utils';

// In-memory cache for newly added points when running in offline/demo mode without Supabase
const inMemoryFeedSources: FeedSource[] = [...INITIAL_FEED_SOURCES];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const radiusParam = searchParams.get('radiusKm');

    let feeds: FeedSource[] = [];
    let usedSupabase = false;

    if (latParam && lngParam && radiusParam && isSupabaseConfigured && supabaseAdmin) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      const radiusMeters = parseFloat(radiusParam) * 1000;

      const { data, error } = await supabaseAdmin.rpc('get_nearby_feed_sources', {
        user_lat: lat,
        user_lng: lng,
        radius_meters: radiusMeters,
      });

      if (!error && Array.isArray(data)) {
        feeds = (data as SupabaseFeedRow[]).map(mapSupabaseFeedRow);
        usedSupabase = true;
      }
    }

    if (!usedSupabase) {
      if (latParam && lngParam) {
        const lat = parseFloat(latParam);
        const lng = parseFloat(lngParam);
        const radius = radiusParam ? parseFloat(radiusParam) : 30;

        feeds = inMemoryFeedSources
          .map((item) => ({
            ...item,
            distance_km: calculateHaversineDistance(lat, lng, item.lat, item.lng),
          }))
          .filter((item) => (item.distance_km ?? 999) <= radius)
          .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
      } else {
        feeds = inMemoryFeedSources;
      }
    }

    return NextResponse.json({
      success: true,
      data: feeds,
      total: feeds.length,
      isSupabaseActive: usedSupabase,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat titik pakan.';
    console.error('[PetaPakan AI] Error pada GET /api/feed-sources:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      feed_material,
      category = 'Limbah Pertanian',
      target_livestock = ['Ayam Kampung / Joper'],
      estimated_price_per_kg,
      availability_status = 'Tersedia',
      lat,
      lng,
      contact_info = '',
      region_id = null,
      is_verified = false,
      source_type = 'komunitas',
    } = body;

    if (!name || !feed_material || typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: 'Nama, bahan pakan, dan koordinat (lat, lng) wajib diisi.' },
        { status: 400 }
      );
    }

    const price = Number(estimated_price_per_kg) || 0;
    const livestockArr = Array.isArray(target_livestock) ? target_livestock : [target_livestock];
    const verifiedBool = Boolean(is_verified);
    const verifiedAt = verifiedBool ? new Date().toISOString() : null;

    let newSource: FeedSource;
    let savedToSupabase = false;

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        // Format PostGIS WKT Point: POINT(lng lat)
        const wktPoint = `POINT(${lng} ${lat})`;

        const { data, error } = await supabaseAdmin
          .from('feed_sources')
          .insert([
            {
              name,
              feed_material,
              category,
              target_livestock: livestockArr,
              estimated_price_per_kg: price,
              availability_status,
              location: wktPoint,
              contact_info,
              region_id: region_id || null,
              is_verified: verifiedBool,
              source_type,
              last_verified_at: verifiedAt,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          newSource = {
            id: data.id,
            region_id: data.region_id,
            name: data.name,
            feed_material: data.feed_material,
            category: data.category,
            target_livestock: data.target_livestock,
            estimated_price_per_kg: Number(data.estimated_price_per_kg),
            availability_status: data.availability_status,
            contact_info: data.contact_info,
            is_verified: Boolean(data.is_verified),
            source_type: data.source_type,
            last_verified_at: data.last_verified_at,
            lat,
            lng,
          };
          savedToSupabase = true;
        } else {
          console.warn('[PetaPakan AI] Gagal menyimpan ke Supabase, fallback simpan in-memory:', error);
        }
      } catch (dbErr) {
        console.warn('[PetaPakan AI] Error saat menyimpan ke Supabase:', dbErr);
      }
    }

    if (!savedToSupabase) {
      const generatedId = `feed-user-${Date.now()}`;
      newSource = {
        id: generatedId,
        region_id: region_id || undefined,
        name,
        feed_material,
        category,
        target_livestock: livestockArr,
        estimated_price_per_kg: price,
        availability_status,
        contact_info,
        is_verified: verifiedBool,
        source_type,
        last_verified_at: verifiedAt,
        lat,
        lng,
        created_at: new Date().toISOString(),
      };
      // Tambahkan ke in-memory cache
      inMemoryFeedSources.unshift(newSource);
    }

    return NextResponse.json({
      success: true,
      message: 'Titik pakan alternatif berhasil ditambahkan!',
      data: newSource!,
      savedToSupabase,
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat menambahkan titik pakan.';
    console.error('[PetaPakan AI] Error pada POST /api/feed-sources:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, is_verified = true, source_type } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'ID titik pakan wajib diisi.' }, { status: 400 });
    }

    const verifiedBool = Boolean(is_verified);
    const verifiedAt = verifiedBool ? new Date().toISOString() : null;
    let updatedSupabase = false;

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const updateFields: Record<string, unknown> = {
          is_verified: verifiedBool,
          last_verified_at: verifiedAt,
        };
        if (source_type) updateFields.source_type = source_type;

        const { error } = await supabaseAdmin
          .from('feed_sources')
          .update(updateFields)
          .eq('id', id);

        if (!error) {
          updatedSupabase = true;
        }
      } catch (dbErr) {
        console.warn('[PetaPakan AI] Error updating verification in Supabase:', dbErr);
      }
    }

    // Update in-memory list regardless so local/demo state stays synced
    const idx = inMemoryFeedSources.findIndex((item) => item.id === id);
    if (idx !== -1) {
      inMemoryFeedSources[idx] = {
        ...inMemoryFeedSources[idx],
        is_verified: verifiedBool,
        last_verified_at: verifiedAt,
        ...(source_type ? { source_type } : {}),
      };
    }

    return NextResponse.json({
      success: true,
      id,
      is_verified: verifiedBool,
      last_verified_at: verifiedAt,
      source_type: source_type || inMemoryFeedSources[idx]?.source_type,
      updatedSupabase,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui status verifikasi.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

