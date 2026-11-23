import { NextRequest, NextResponse } from 'next/server';
import {
  verifySubscriptionTransaction,
  submitSubscriptionPayment,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
} from '@/lib/subscription-store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let transactions = INITIAL_TRANSACTIONS;
    let users = INITIAL_USERS;

    // Coba baca dari Supabase jika configured
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        let query = supabaseAdmin
          .from('subscription_transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (userId) query = query.eq('user_id', userId);
        if (status) query = query.eq('status', status);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          transactions = data;
        }

        const { data: usersData } = await supabaseAdmin.from('users_profile').select('*');
        if (usersData && usersData.length > 0) {
          users = usersData;
        }
      } catch (err) {
        console.warn('[API Subscriptions] Fallback to in-memory store:', err);
      }
    }

    // Hitung statistik keuangan langganan
    const totalRevenue = transactions
      .filter((t) => t.status === 'approved')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    const pendingCount = transactions.filter((t) => t.status === 'pending').length;
    const verifiedUsersCount = users.filter((u) => u.is_verified).length;
    const activeSubscribersCount = users.filter(
      (u) => u.subscription_status === 'active' && u.role !== 'admin'
    ).length;

    return NextResponse.json({
      success: true,
      data: transactions,
      stats: {
        totalRevenue,
        pendingCount,
        verifiedUsersCount,
        activeSubscribersCount,
        totalUsers: users.length,
      },
      isSupabaseActive: isSupabaseConfigured,
    });
  } catch (error) {
    console.error('Error in GET /api/subscriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data transaksi langganan' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, planId, amount, paymentMethod, paymentRef } = body;

    if (!userId || !planId || !amount || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Semua field pembayaran wajib diisi.' },
        { status: 400 }
      );
    }

    // Jika Supabase aktif, simpan transaksi ke Supabase
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: txData, error: txErr } = await supabaseAdmin
          .from('subscription_transactions')
          .insert({
            user_id: userId,
            plan_id: planId,
            amount,
            payment_method: paymentMethod,
            payment_ref: paymentRef || `TRX-${Date.now()}`,
            status: 'pending',
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!txErr && txData) {
          // Update status user menjadi pending_verification
          await supabaseAdmin
            .from('users_profile')
            .update({
              subscription_status: 'pending_verification',
              subscription_plan: planId,
              subscription_paid_amount: amount,
            })
            .eq('id', userId);

          return NextResponse.json({
            success: true,
            message: 'Pembayaran langganan berhasil diserahkan. Menunggu verifikasi Admin.',
            data: txData,
          });
        }
      } catch (err) {
        console.warn('[API Subscriptions POST] Supabase failed, fallback to store:', err);
      }
    }

    // In-memory / store fallback
    const newTx = submitSubscriptionPayment(
      userId,
      planId,
      Number(amount),
      paymentMethod,
      paymentRef
    );

    return NextResponse.json({
      success: true,
      message: 'Pembayaran langganan berhasil diserahkan. Menunggu verifikasi Admin.',
      data: newTx,
    });
  } catch (error: unknown) {
    console.error('Error in POST /api/subscriptions:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Gagal memproses pembayaran langganan.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, approved, adminName = 'Budi Santoso, S.Pt (Admin)' } = body;

    if (!transactionId || approved === undefined) {
      return NextResponse.json(
        { success: false, error: 'transactionId dan approved status wajib disertakan.' },
        { status: 400 }
      );
    }

    // Jika Supabase aktif
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const now = new Date();
        const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const { data: tx, error: txError } = await supabaseAdmin
          .from('subscription_transactions')
          .update({
            status: approved ? 'approved' : 'rejected',
            verified_at: now.toISOString(),
            verified_by: adminName,
            notes: approved
              ? `Pembayaran telah diverifikasi sah oleh ${adminName}.`
              : `Pembayaran ditolak oleh ${adminName}.`,
          })
          .eq('id', transactionId)
          .select()
          .single();

        if (!txError && tx) {
          // Update status user
          await supabaseAdmin
            .from('users_profile')
            .update({
              subscription_status: approved ? 'active' : 'rejected',
              is_verified: approved,
              verified_at: approved ? now.toISOString() : null,
              verified_by: approved ? adminName : null,
              subscription_expires_at: approved ? expiry.toISOString() : null,
            })
            .eq('id', tx.user_id);

          // Jika user adalah pemilik pakan, otomatis tandai titik pakan miliknya menjadi terverifikasi
          if (approved) {
            await supabaseAdmin
              .from('feed_sources')
              .update({
                is_verified: true,
                last_verified_at: now.toISOString(),
                source_type: 'survey_lapangan',
              })
              .eq('supplier_id', tx.user_id);
          }

          return NextResponse.json({
            success: true,
            message: approved
              ? 'Langganan dan akun berhasil diverifikasi aktif!'
              : 'Pembayaran langganan berhasil ditolak.',
            data: tx,
          });
        }
      } catch (err) {
        console.warn('[API Subscriptions PATCH] Supabase fallback to store:', err);
      }
    }

    // In-memory fallback
    const result = verifySubscriptionTransaction(transactionId, Boolean(approved), adminName);

    return NextResponse.json({
      success: true,
      message: approved
        ? 'Langganan dan akun berhasil diverifikasi aktif!'
        : 'Pembayaran langganan berhasil ditolak.',
      data: result,
    });
  } catch (error: unknown) {
    console.error('Error in PATCH /api/subscriptions:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Gagal memverifikasi transaksi.' },
      { status: 500 }
    );
  }
}
