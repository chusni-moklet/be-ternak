import fs from 'fs';
import path from 'path';
import os from 'os';
import { UserProfile } from '@/lib/types';
import { INITIAL_USERS } from '@/lib/subscription-store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

// Di serverless environment seperti Vercel (AWS Lambda), direktori /var/task adalah read-only.
// Gunakan os.tmpdir() (/tmp) jika di serverless, atau process.cwd()/data jika di local.
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NETLIFY ||
  (process.env.NODE_ENV === 'production' && !process.env.LOCAL_DEV)
);

const DATA_DIR = isServerless
  ? path.join(os.tmpdir(), 'beternak-data')
  : path.join(process.cwd(), 'data');

const USERS_FILE = path.join(DATA_DIR, 'users-store.json');

// In-memory cache fallback yang selalu aman dan tidak pernah crash
let inMemoryUsers: UserProfile[] = [...INITIAL_USERS];

function ensureDataDir(): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return true;
  } catch (err) {
    // Di lingkungan read-only seperti /var/task, jangan crash
    return false;
  }
}

export function loadUsersFromServer(): UserProfile[] {
  try {
    if (ensureDataDir() && fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryUsers = parsed;
        return parsed;
      }
    }
  } catch (err) {
    // Silently fallback to in-memory / INITIAL_USERS
  }
  return inMemoryUsers.length > 0 ? inMemoryUsers : [...INITIAL_USERS];
}

export function saveUsersToServer(users: UserProfile[]): void {
  inMemoryUsers = [...users];
  try {
    if (ensureDataDir()) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    }
  } catch (err) {
    // In-memory array sudah tersimpan, tidak crash jika file write gagal
  }
}

export async function upsertUserOnServer(user: UserProfile): Promise<UserProfile> {
  try {
    const users = loadUsersFromServer();
    const index = users.findIndex(
      (u) => u.id === user.id || (u.email && u.email.toLowerCase() === user.email.toLowerCase())
    );

    if (index >= 0) {
      users[index] = { ...users[index], ...user, updated_at: new Date().toISOString() };
    } else {
      users.unshift({ ...user, created_at: user.created_at || new Date().toISOString() });
    }

    saveUsersToServer(users);

    // Sync dengan Supabase jika aktif
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from('users_profile').upsert({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          business_name: user.business_name,
          location_address: user.location_address,
          is_verified: user.is_verified,
          admin_verified: user.admin_verified,
          activation_token: user.activation_token,
          subscription_status: user.subscription_status,
        }, { onConflict: 'id' });
      } catch (e) {
        console.warn('[server-user-store] Supabase upsert notice:', e);
      }
    }

    return index >= 0 ? users[index] : users[0];
  } catch (err) {
    console.warn('[server-user-store] Upsert error fallback:', err);
    return user;
  }
}

export async function activateUserOnServer(
  token: string,
  email?: string
): Promise<{ success: boolean; message: string; user?: UserProfile }> {
  const users = loadUsersFromServer();
  const cleanEmail = email ? email.toLowerCase().trim() : '';

  // 1. Cari berdasarkan token DAN email
  let userIndex = users.findIndex((u) => {
    if (cleanEmail && u.email.toLowerCase().trim() !== cleanEmail) return false;
    return u.activation_token === token;
  });

  // 2. Jika token tidak pas, cari berdasarkan email jika user sudah diapprove admin atau sudah aktif
  if (userIndex === -1 && cleanEmail) {
    userIndex = users.findIndex((u) => {
      const matchEmail = u.email.toLowerCase().trim() === cleanEmail;
      return matchEmail && (u.admin_verified || u.is_verified);
    });
  }

  // 3. Cari berdasarkan token saja
  if (userIndex === -1 && token) {
    userIndex = users.findIndex((u) => u.activation_token === token);
  }

  // 4. Jika di server JSON belum ketemu, coba cari di Supabase
  if (userIndex === -1 && isSupabaseConfigured && supabaseAdmin) {
    try {
      let query = supabaseAdmin.from('users_profile').select('*');
      if (cleanEmail) {
        query = query.eq('email', cleanEmail);
      } else if (token) {
        query = query.eq('activation_token', token);
      }
      const { data } = await query.limit(1);
      if (data && data.length > 0) {
        const found = data[0] as UserProfile;
        users.unshift(found);
        userIndex = 0;
      }
    } catch {}
  }

  if (userIndex === -1) {
    return {
      success: false,
      message: 'Tautan aktivasi tidak valid, telah kedaluwarsa, atau akun belum disetujui Admin.',
    };
  }

  const user = users[userIndex];

  // Aktifkan akun
  const now = new Date();
  const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  user.is_verified = true;
  user.admin_verified = true;
  user.subscription_status = 'active';
  user.email_verified_at = now.toISOString();
  user.verified_at = now.toISOString();
  user.verified_by = user.verified_by || 'Link Verifikasi Email';
  user.subscription_expires_at = expiry.toISOString();
  user.updated_at = now.toISOString();

  users[userIndex] = user;
  saveUsersToServer(users);

  // Sync Supabase
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      await supabaseAdmin.from('users_profile').upsert({
        id: user.id,
        is_verified: true,
        admin_verified: true,
        subscription_status: 'active',
        email_verified_at: user.email_verified_at,
        verified_at: user.verified_at,
      }, { onConflict: 'id' });
    } catch {}
  }

  return {
    success: true,
    message: `Selamat! Akun "${user.name}" (${user.business_name}) berhasil diaktivasi dan siap digunakan.`,
    user,
  };
}
