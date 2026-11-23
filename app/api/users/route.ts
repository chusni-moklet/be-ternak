import { NextRequest, NextResponse } from 'next/server';
import {
  toggleUserVerification,
  INITIAL_USERS,
} from '@/lib/subscription-store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    let users = INITIAL_USERS;

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        let query = supabaseAdmin.from('users_profile').select('*').order('created_at', { ascending: false });
        if (role) query = query.eq('role', role);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          users = data;
        }
      } catch (err) {
        console.warn('[API Users] Fallback to mock store:', err);
      }
    }

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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, adminName = 'Budi Santoso, S.Pt (Admin)' } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId wajib disertakan.' },
        { status: 400 }
      );
    }

    if (action === 'toggle_verification') {
      const updatedUser = toggleUserVerification(userId, adminName);
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
