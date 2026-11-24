import { NextRequest, NextResponse } from 'next/server';
import { activateUserOnServer, loadUsersFromServer } from '@/lib/server-user-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';

    if (!token && !email) {
      return NextResponse.json(
        { success: false, error: 'Token atau email aktivasi wajib disertakan.' },
        { status: 400 }
      );
    }

    const result = await activateUserOnServer(token, email);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: unknown) {
    console.error('Error in GET /api/auth/activate:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Terjadi kesalahan server saat aktivasi.',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, email } = body;

    if (!token && !email) {
      return NextResponse.json(
        { success: false, error: 'Token atau email aktivasi wajib disertakan.' },
        { status: 400 }
      );
    }

    const result = await activateUserOnServer(token || '', email || '');
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: unknown) {
    console.error('Error in POST /api/auth/activate:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Terjadi kesalahan server saat aktivasi.',
      },
      { status: 500 }
    );
  }
}
