import { NextRequest, NextResponse } from 'next/server';
import {
  toggleUserVerification,
  INITIAL_USERS,
} from '@/lib/subscription-store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { loadUsersFromServer, upsertUserOnServer } from '@/lib/server-user-store';
import { UserProfile } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const emailMap = new Map<string, UserProfile>();

    // 1. Masukkan akun admin default
    INITIAL_USERS.forEach((u) => emailMap.set(u.email.toLowerCase(), u));

    // 2. Masukkan akun dari server file/memory store
    const serverUsers = loadUsersFromServer();
    serverUsers.forEach((u) => {
      emailMap.set(u.email.toLowerCase(), {
        ...emailMap.get(u.email.toLowerCase()),
        ...u,
      });
    });

    // 3. Masukkan data real-time dari Supabase PostgreSQL (Cloud Database)
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        let query = supabaseAdmin
          .from('users_profile')
          .select('*')
          .order('created_at', { ascending: false });
        if (role) query = query.eq('role', role);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          data.forEach((d: any) => {
            const cleanEmail = (d.email || '').toLowerCase().trim();
            if (cleanEmail) {
              const existing = emailMap.get(cleanEmail);
              emailMap.set(cleanEmail, {
                ...existing,
                id: d.id || existing?.id || `usr-${Date.now()}`,
                name: d.name || existing?.name || 'Pengguna be-ternak',
                email: d.email,
                phone: d.phone || existing?.phone || '',
                role: d.role || existing?.role || 'peternak',
                business_name: d.business_name || existing?.business_name || d.name,
                location_address: d.location_address || existing?.location_address || '',
                lat: d.lat ?? existing?.lat ?? -8.1283,
                lng: d.lng ?? existing?.lng ?? 112.2181,
                livestock_types: d.livestock_types ?? existing?.livestock_types,
                poultry_capacity: d.poultry_capacity ?? existing?.poultry_capacity,
                feed_materials: d.feed_materials ?? existing?.feed_materials,
                supply_capacity_ton_month: d.supply_capacity_ton_month ?? existing?.supply_capacity_ton_month,
                subscription_status: d.subscription_status || existing?.subscription_status || 'pending_verification',
                subscription_plan: d.subscription_plan || existing?.subscription_plan || 'free',
                subscription_paid_amount: d.subscription_paid_amount ?? existing?.subscription_paid_amount ?? 0,
                subscription_expires_at: d.subscription_expires_at ?? existing?.subscription_expires_at,
                is_verified: Boolean(d.is_verified),
                admin_verified: Boolean(d.is_verified || d.subscription_status === 'active' || existing?.admin_verified),
                verified_at: d.verified_at ?? existing?.verified_at,
                verified_by: d.verified_by ?? existing?.verified_by,
                created_at: d.created_at || existing?.created_at || new Date().toISOString(),
              });
            }
          });
        }
      } catch (err) {
        console.warn('[API Users] Supabase query notice:', err);
      }
    }

    let users = Array.from(emailMap.values());
    if (role) {
      users = users.filter((u) => u.role === role);
    }

    return NextResponse.json({
      success: true,
      data: users,
      isSupabaseActive: isSupabaseConfigured,
    });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data pengguna.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userPayload: UserProfile = body.user || body;

    if (!userPayload.email || !userPayload.name) {
      return NextResponse.json(
        { success: false, error: 'Nama dan email wajib diisi.' },
        { status: 400 }
      );
    }

    const savedUser = await upsertUserOnServer(userPayload);

    return NextResponse.json({
      success: true,
      message: `Data pengguna "${savedUser.name}" berhasil disinkronkan ke server & cloud database.`,
      data: savedUser,
    });
  } catch (error: unknown) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Gagal menyimpan data pengguna.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, adminName = 'Administrator be-ternak' } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId wajib disertakan.' },
        { status: 400 }
      );
    }

    if (action === 'toggle_verification') {
      const updatedUser = toggleUserVerification(userId, adminName);
      await upsertUserOnServer(updatedUser);
      return NextResponse.json({
        success: true,
        message: `Status verifikasi ${updatedUser.name} diperbarui menjadi: ${
          updatedUser.is_verified ? 'Terverifikasi' : 'Belum Diverifikasi'
        }`,
        data: updatedUser,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Aksi tidak dikenali.' },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error('Error in PATCH /api/users:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Gagal memperbarui pengguna.' },
      { status: 500 }
    );
  }
}
