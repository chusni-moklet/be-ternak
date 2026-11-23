import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { analyzeAreaWithGemini, isGeminiConfigured, isGroqConfigured, isAiConfigured } from '@/lib/gemini';
import { INITIAL_FEED_SOURCES, calculateHaversineDistance } from '@/lib/mock-data';
import { FeedSource, LivestockType, SupabaseFeedRow } from '@/lib/types';
import { mapSupabaseFeedRow } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      lat,
      lng,
      radiusKm = 15,
      livestockType = 'Ayam Petelur (Layer)',
      regionName,
      avgTemp,
    } = body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: 'Koordinat lat dan lng wajib diisi dengan tipe angka.' },
        { status: 400 }
      );
    }

    let nearbyFeeds: FeedSource[] = [];
    let usedSupabase = false;

    // 1. Ambil data titik pakan terdekat
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const radiusMeters = radiusKm * 1000;
        const { data, error } = await supabaseAdmin.rpc('get_nearby_feed_sources', {
          user_lat: lat,
          user_lng: lng,
          radius_meters: radiusMeters,
        });

        if (!error && Array.isArray(data)) {
          nearbyFeeds = (data as SupabaseFeedRow[]).map(mapSupabaseFeedRow);
          usedSupabase = true;
        } else {
          console.warn('[PetaPakan AI] Supabase RPC failed or returned error, fallback to local distance calc:', error);
        }
      } catch (dbErr) {
        console.warn('[PetaPakan AI] Error contacting Supabase:', dbErr);
      }
    }

    // Fallback: Jika Supabase belum aktif atau error, hitung jarak secara lokal
    if (!usedSupabase) {
      nearbyFeeds = INITIAL_FEED_SOURCES.map((item) => {
        const dist = calculateHaversineDistance(lat, lng, item.lat, item.lng);
        return {
          ...item,
          distance_km: dist,
        };
      })
        .filter((item) => (item.distance_km ?? 999) <= radiusKm)
        .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
    }

    // 2. Analisis AI menggunakan Gemini API
    const analysis = await analyzeAreaWithGemini(
      lat,
      lng,
      radiusKm,
      livestockType as LivestockType,
      nearbyFeeds,
      regionName,
      avgTemp
    );

    const isAiLive = isAiConfigured && !analysis.is_mock;
    const aiEngineName = analysis.ai_engine || (isGroqConfigured ? 'Groq AI' : isGeminiConfigured ? 'Gemini AI' : 'Simulasi AI');

    return NextResponse.json({
      success: true,
      data: analysis,
      nearbyFeeds,
      isSupabaseActive: usedSupabase,
      isGeminiActive: isAiLive,
      isAiActive: isAiLive,
      aiEngine: aiEngineName,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan internal server.';
    console.error('[PetaPakan AI] Error pada /api/analyze-area:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

