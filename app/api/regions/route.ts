import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_REGIONS } from '@/lib/mock-data';
import { Region, SupabaseRegionRow } from '@/lib/types';

export async function GET() {
  try {
    let regions: Region[] = [];
    let usedSupabase = false;

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('regions')
        .select('id, name, island, avg_temp_celsius, market_potential_score, market_notes, center_point');

      if (!error && Array.isArray(data) && data.length > 0) {
        regions = (data as SupabaseRegionRow[]).map((item) => {
          let lat = -8.0983;
          let lng = 112.1681;
          if (item.center_point && typeof item.center_point === 'object' && item.center_point.coordinates) {
            lng = item.center_point.coordinates[0];
            lat = item.center_point.coordinates[1];
          }
          return {
            id: item.id,
            name: item.name,
            island: item.island || 'Jawa',
            lat,
            lng,
            avg_temp_celsius: Number(item.avg_temp_celsius),
            market_potential_score: Number(item.market_potential_score),
            market_notes: item.market_notes || '',
          };
        });
        usedSupabase = true;
      }
    }

    if (!usedSupabase || regions.length === 0) {
      regions = INITIAL_REGIONS;
    }

    return NextResponse.json({
      success: true,
      data: regions,
      isSupabaseActive: usedSupabase,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil data wilayah.';
    console.error('[PetaPakan AI] Error pada GET /api/regions:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

