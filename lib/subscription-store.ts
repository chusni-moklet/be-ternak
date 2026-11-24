import {
  UserProfile,
  SubscriptionTransaction,
  SubscriptionPlanType,
  PaymentMethod,
  SavedRansum,
  LayerSimulationScenario,
  FeedSource,
  RegisterPayload,
} from './types';
import { INITIAL_FEED_SOURCES } from './mock-data';

// ============================================================================
// Initial Users (HANYA AKUN ADMIN RESMI - SEMUA DATA DUMMY DIHAPUS)
// ============================================================================

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin-01',
    name: 'Administrator be-ternak',
    email: 'chusniarin12@gmail.com',
    password: 'skylandO2',
    phone: '081234567890',
    role: 'admin',
    business_name: 'be-ternak Central Administration',
    location_address: 'Gedung Pusat Agritech Indonesia, Jakarta Selatan',
    lat: -6.2088,
    lng: 106.8456,
    subscription_status: 'active',
    subscription_plan: 'free',
    subscription_paid_amount: 0,
    is_verified: true,
    admin_verified: true,
    email_verified_at: '2025-01-01T00:00:00Z',
    verified_at: '2025-01-01T00:00:00Z',
    verified_by: 'System Superadmin',
    created_at: '2025-01-01T00:00:00Z',
  },
];

// Fallback profile peternak saat belum ada akun peternak yang didaftarkan
export const DEFAULT_FARMER_PROFILE: UserProfile = {
  id: 'usr-farmer-local',
  name: 'Peternak Layer',
  email: 'peternak@be-ternak.id',
  phone: '081234567890',
  role: 'peternak',
  business_name: 'Peternakan Layer Saya',
  location_address: 'Indonesia',
  lat: -8.1283,
  lng: 112.2181,
  livestock_types: ['Ayam Petelur (Layer)'],
  poultry_capacity: 0,
  subscription_status: 'active',
  subscription_plan: 'peternak_starter',
  subscription_paid_amount: 0,
  is_verified: true,
  admin_verified: true,
  email_verified_at: '2026-01-01T00:00:00Z',
  verified_at: '2026-01-01T00:00:00Z',
  verified_by: 'System',
  created_at: '2026-01-01T00:00:00Z',
};

// Fallback profile pemasok pakan saat belum ada akun pemasok yang didaftarkan
export const DEFAULT_SUPPLIER_PROFILE: UserProfile = {
  id: 'usr-supplier-local',
  name: 'Pemilik Pakan',
  email: 'pemasok@be-ternak.id',
  phone: '081234567890',
  role: 'pemilik_pakan',
  business_name: 'Sentra Pakan Alternatif',
  location_address: 'Indonesia',
  lat: -7.7295,
  lng: 113.018,
  feed_materials: [],
  supply_capacity_ton_month: 0,
  subscription_status: 'active',
  subscription_plan: 'pemasok_umkm',
  subscription_paid_amount: 0,
  is_verified: true,
  admin_verified: true,
  email_verified_at: '2026-01-01T00:00:00Z',
  verified_at: '2026-01-01T00:00:00Z',
  verified_by: 'System',
  created_at: '2026-01-01T00:00:00Z',
};

// ============================================================================
// Initial Clean Subscription Transactions (Kosong untuk Data Riil)
// ============================================================================

export const INITIAL_TRANSACTIONS: SubscriptionTransaction[] = [];

// ============================================================================
// Initial Clean Saved Ransum (Kosong untuk Data Riil)
// ============================================================================

export const INITIAL_SAVED_RANSUMS: SavedRansum[] = [];

// ============================================================================
// LocalStorage Persistence Helpers
// ============================================================================

const STORAGE_KEY_USERS = 'be_ternak_users_v2';
const STORAGE_KEY_TXS = 'be_ternak_txs_v2';
const STORAGE_KEY_RANSUMS = 'be_ternak_ransums_v2';
const STORAGE_KEY_ACTIVE_USER = 'be_ternak_active_user_id_v2';
const STORAGE_KEY_SIMULATIONS = 'be_ternak_layer_simulations_v2';
const STORAGE_KEY_FEEDS = 'be_ternak_feed_sources_v3';

// Bersihkan cache legacy dummy di browser lama
if (typeof window !== 'undefined') {
  try {
    const legacyKeys = [
      'petapakan_users_v1',
      'petapakan_txs_v1',
      'petapakan_ransums_v1',
      'petapakan_active_user_id_v1',
      'petapakan_layer_simulations_v1',
      'petapakan_feed_sources_v2',
      'be_ternak_kandang_units',
      'be_ternak_daily_recordings',
    ];
    legacyKeys.forEach((key) => localStorage.removeItem(key));
  } catch {}
}

export const SEEDED_FEED_SOURCES: FeedSource[] = [
  ...INITIAL_FEED_SOURCES,
];

export function loadFeedSourcesFromStorage(): FeedSource[] {
  if (typeof window === 'undefined') return SEEDED_FEED_SOURCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FEEDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_FEEDS, JSON.stringify(SEEDED_FEED_SOURCES));
      return SEEDED_FEED_SOURCES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse feeds from storage', e);
    return SEEDED_FEED_SOURCES;
  }
}

export function saveFeedSourcesToStorage(feeds: FeedSource[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_FEEDS, JSON.stringify(feeds));
  } catch (e) {
    console.error('Failed to save feeds to storage', e);
  }
}

export function addFeedSourceToStorage(newFeed: FeedSource): FeedSource {
  const current = loadFeedSourcesFromStorage();
  const updated = [newFeed, ...current.filter((f) => f.id !== newFeed.id)];
  saveFeedSourcesToStorage(updated);
  return newFeed;
}

export function verifyFeedSourceInStorage(
  feedId: string,
  approved: boolean,
  adminName: string = 'Budi Santoso, S.Pt (Admin)'
): FeedSource {
  const feeds = loadFeedSourcesFromStorage();
  const index = feeds.findIndex((f) => f.id === feedId);
  if (index === -1) throw new Error('Titik pakan tidak ditemukan.');

  const feed = feeds[index];
  feed.is_verified = approved;
  feed.last_verified_at = approved ? new Date().toISOString() : null;
  feed.source_type = approved ? 'diverifikasi_admin' : 'ditolak_admin';
  feed.verified_by = approved ? adminName : null;

  feeds[index] = feed;
  saveFeedSourcesToStorage(feeds);
  return feed;
}

export function deleteFeedSourceFromStorage(feedId: string): void {
  const current = loadFeedSourcesFromStorage();
  const updated = current.filter((f) => f.id !== feedId);
  saveFeedSourcesToStorage(updated);
}

export function loadSimulationScenariosFromStorage(userId?: string): LayerSimulationScenario[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SIMULATIONS);
    if (!raw) return [];
    const list: LayerSimulationScenario[] = JSON.parse(raw);
    if (userId) {
      return list.filter((s) => s.user_id === userId);
    }
    return list;
  } catch (e) {
    console.error('Failed to parse simulations from storage', e);
    return [];
  }
}

export function saveSimulationScenarioToStorage(scenario: LayerSimulationScenario): void {
  if (typeof window === 'undefined') return;
  try {
    const current = loadSimulationScenariosFromStorage();
    const filtered = current.filter((s) => s.id !== scenario.id);
    const updated = [scenario, ...filtered];
    localStorage.setItem(STORAGE_KEY_SIMULATIONS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save simulation to storage', e);
  }
}

export function deleteSimulationScenarioFromStorage(scenarioId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = loadSimulationScenariosFromStorage();
    const updated = current.filter((s) => s.id !== scenarioId);
    localStorage.setItem(STORAGE_KEY_SIMULATIONS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete simulation from storage', e);
  }
}

export function loadUsersFromStorage(): UserProfile[] {
  if (typeof window === 'undefined') return INITIAL_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    let users: UserProfile[] = JSON.parse(raw);
    // Filter dan buang seluruh user dummy lama
    users = users.filter(
      (u) =>
        u.id !== 'usr-farmer-01' &&
        u.id !== 'usr-farmer-02' &&
        u.id !== 'usr-supplier-01' &&
        u.id !== 'usr-supplier-02'
    );
    // Sinkronisasi akun admin utama (chusniarin12@gmail.com) agar selalu aktif & terverifikasi
    const adminIndex = users.findIndex(
      (u) => u.email.toLowerCase() === 'chusniarin12@gmail.com' || u.id === 'usr-admin-01'
    );
    if (adminIndex === -1) {
      const merged = [INITIAL_USERS[0], ...users];
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(merged));
      return merged;
    } else {
      // Pastikan nama, email & password admin selalu terupdate sesuai instruksi
      users[adminIndex].name = 'Administrator be-ternak';
      users[adminIndex].business_name = 'be-ternak Central Administration';
      users[adminIndex].email = 'chusniarin12@gmail.com';
      users[adminIndex].password = 'skylandO2';
      users[adminIndex].is_verified = true;
      users[adminIndex].role = 'admin';
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      return users;
    }
  } catch {
    return INITIAL_USERS;
  }
}

export function saveUsersToStorage(users: UserProfile[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users:', e);
  }
}

export function getActiveUser(): UserProfile | null {
  const users = loadUsersFromStorage();
  const activeId = getActiveUserId();
  return (
    users.find((u) => u.id === activeId) ||
    users.find((u) => u.role === 'peternak') ||
    users.find((u) => u.role === 'pemilik_pakan') ||
    users[0] ||
    null
  );
}

export function registerUser(payload: RegisterPayload): UserProfile {
  const users = loadUsersFromStorage();

  // Validasi unik email
  const existing = users.find(
    (u) => u.email.toLowerCase() === payload.email.toLowerCase().trim()
  );
  if (existing) {
    throw new Error('Email sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.');
  }

  const rolePrefix = payload.role === 'peternak' ? 'farmer' : 'supplier';
  const newId = `usr-${rolePrefix}-${Date.now().toString().slice(-5)}`;

  const newUser: UserProfile = {
    id: newId,
    name: payload.name.trim(),
    email: payload.email.toLowerCase().trim(),
    password: payload.password,
    phone: payload.phone.trim(),
    role: payload.role,
    business_name: payload.business_name.trim(),
    location_address: payload.location_address.trim(),
    lat: payload.lat ?? (payload.role === 'peternak' ? -8.1283 : -7.7295),
    lng: payload.lng ?? (payload.role === 'peternak' ? 112.2181 : 113.018),
    livestock_types: payload.livestock_types ?? (payload.role === 'peternak' ? ['Ayam Petelur (Layer)'] : undefined),
    poultry_capacity: payload.poultry_capacity ?? (payload.role === 'peternak' ? 3000 : undefined),
    feed_materials: payload.feed_materials ?? (payload.role === 'pemilik_pakan' ? ['Dedak Padi Halus'] : undefined),
    supply_capacity_ton_month: payload.supply_capacity_ton_month ?? (payload.role === 'pemilik_pakan' ? 20 : undefined),
    subscription_status: 'pending_verification',
    subscription_plan: payload.role === 'peternak' ? 'peternak_starter' : 'pemasok_umkm',
    subscription_paid_amount: 0,
    subscription_expires_at: null,
    is_verified: false, // BELUM AKTIF: Wajib diverifikasi Admin + diklik link email
    admin_verified: false, // Menunggu persetujuan Admin
    activation_token: null,
    activation_sent_at: null,
    email_verified_at: null,
    verified_at: null,
    verified_by: null,
    created_at: new Date().toISOString(),
  };

  const updatedUsers = [newUser, ...users];
  saveUsersToStorage(updatedUsers);
  setActiveUserId(newUser.id);
  return newUser;
}

export function loginUser(email: string, password: string): UserProfile {
  const cleanEmail = email.toLowerCase().trim();
  const users = loadUsersFromStorage();

  // Khusus Kredensial Admin Utama
  if (
    (cleanEmail === 'chusniarin12@gmail.com' || cleanEmail === 'admin@petapakan.id') &&
    password === 'skylandO2'
  ) {
    let admin = users.find(
      (u) => u.email.toLowerCase() === 'chusniarin12@gmail.com' || u.role === 'admin'
    );
    if (!admin) {
      admin = INITIAL_USERS[0];
      users.unshift(admin);
      saveUsersToStorage(users);
    }
    setActiveUserId(admin.id);
    return admin;
  }

  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    throw new Error('Email tidak ditemukan. Pastikan email Anda sudah terdaftar.');
  }

  // Cek kecocokan password
  const defaultPassword = user.role === 'peternak' ? 'peternak123' : 'pemasok123';
  if (user.password && user.password !== password) {
    throw new Error('Password salah. Silakan periksa kembali kata sandi Anda.');
  } else if (!user.password && password !== defaultPassword && password !== '123456') {
    throw new Error('Password salah. Silakan coba kembali.');
  }

  setActiveUserId(user.id);
  return user;
}

export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_USER);
  } catch (e) {
    console.error('Failed to logout:', e);
  }
}

export function loadTransactionsFromStorage(): SubscriptionTransaction[] {
  if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TXS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    let txs: SubscriptionTransaction[] = JSON.parse(raw);
    // Hapus seluruh dummy transaksi lama
    txs = txs.filter((t) => !t.id.startsWith('tx-2026-'));
    return txs;
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactionsToStorage(txs: SubscriptionTransaction[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(txs));
  } catch (e) {
    console.error('Failed to save txs:', e);
  }
}

export function loadSavedRansumsFromStorage(): SavedRansum[] {
  if (typeof window === 'undefined') return INITIAL_SAVED_RANSUMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RANSUMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RANSUMS, JSON.stringify(INITIAL_SAVED_RANSUMS));
      return INITIAL_SAVED_RANSUMS;
    }
    let list: SavedRansum[] = JSON.parse(raw);
    // Hapus seluruh resep pakan dummy lama
    list = list.filter((r) => r.id !== 'ransum-01' && r.id !== 'ransum-02');
    return list;
  } catch {
    return INITIAL_SAVED_RANSUMS;
  }
}

export function saveRansumsToStorage(ransums: SavedRansum[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_RANSUMS, JSON.stringify(ransums));
  } catch (e) {
    console.error('Failed to save ransums:', e);
  }
}

export function getActiveUserId(): string {
  if (typeof window === 'undefined') return 'usr-admin-01';
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_USER) || 'usr-admin-01';
  } catch {
    return 'usr-admin-01';
  }
}

export function setActiveUserId(userId: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_USER, userId);
  } catch (e) {
    console.error('Failed to set active user:', e);
  }
}

// ============================================================================
// Core Subscription Operations
// ============================================================================

/**
 * Peternak atau Pemilik Pakan mengajukan pembayaran biaya langganan
 */
export function submitSubscriptionPayment(
  userId: string,
  planId: SubscriptionPlanType,
  amount: number,
  paymentMethod: PaymentMethod,
  paymentRef: string
): SubscriptionTransaction {
  const users = loadUsersFromStorage();
  const txs = loadTransactionsFromStorage();

  const user = users.find((u) => u.id === userId);
  if (!user) {
    throw new Error('User tidak ditemukan.');
  }

  const planNames: Record<SubscriptionPlanType, string> = {
    free: 'Paket Gratis',
    peternak_starter: 'Paket Starter Peternak (30 Hari)',
    peternak_pro: 'Paket Pro Peternak Mandiri (30 Hari)',
    pemasok_umkm: 'Paket Mitra Suplai UMKM (30 Hari)',
    pemasok_pro: 'Paket Prioritas Agroindustri (30 Hari)',
  };

  const newTx: SubscriptionTransaction = {
    id: `tx-${Date.now().toString().slice(-6)}`,
    user_id: user.id,
    user_name: user.name,
    user_role: user.role,
    business_name: user.business_name,
    plan_id: planId,
    plan_name: planNames[planId] || planId,
    amount,
    payment_method: paymentMethod,
    payment_ref: paymentRef || `TRX-${Date.now().toString().slice(-4)}`,
    status: 'pending',
    notes: 'Menunggu konfirmasi verifikasi dari Admin.',
    created_at: new Date().toISOString(),
    verified_at: null,
    verified_by: null,
  };

  // Update user subscription status to pending
  user.subscription_status = 'pending_verification';
  user.subscription_plan = planId;
  user.subscription_paid_amount = amount;

  saveUsersToStorage(users);
  saveTransactionsToStorage([newTx, ...txs]);

  return newTx;
}

/**
 * Admin memverifikasi pembayaran langganan (Disetujui / Ditolak)
 */
export function verifySubscriptionTransaction(
  transactionId: string,
  approved: boolean,
  adminName: string = 'Budi Santoso, S.Pt (Admin)'
): { transaction: SubscriptionTransaction; user: UserProfile } {
  const users = loadUsersFromStorage();
  const txs = loadTransactionsFromStorage();

  const txIndex = txs.findIndex((t) => t.id === transactionId);
  if (txIndex === -1) {
    throw new Error('Transaksi langganan tidak ditemukan.');
  }

  const tx = txs[txIndex];
  const userIndex = users.findIndex((u) => u.id === tx.user_id);
  if (userIndex === -1) {
    throw new Error('User terkait transaksi tidak ditemukan.');
  }

  const user = users[userIndex];
  const now = new Date();

  if (approved) {
    tx.status = 'approved';
    tx.verified_at = now.toISOString();
    tx.verified_by = adminName;
    tx.notes = `Pembayaran telah diverifikasi sah oleh ${adminName}. Akses fitur diaktifkan.`;

    // 30 hari masa aktif
    const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    user.subscription_status = 'active';
    user.subscription_plan = tx.plan_id;
    user.is_verified = true;
    user.verified_at = now.toISOString();
    user.verified_by = adminName;
    user.subscription_expires_at = expiryDate.toISOString();
  } else {
    tx.status = 'rejected';
    tx.verified_at = now.toISOString();
    tx.verified_by = adminName;
    tx.notes = `Pembayaran ditolak oleh ${adminName}. Bukti mutasi tidak valid.`;

    user.subscription_status = 'rejected';
    user.is_verified = false;
  }

  txs[txIndex] = tx;
  users[userIndex] = user;

  saveTransactionsToStorage(txs);
  saveUsersToStorage(users);

  return { transaction: tx, user };
}

/**
 * Admin manual toggle verifikasi user
 */
export function toggleUserVerification(
  userId: string,
  adminName: string = 'Budi Santoso, S.Pt (Admin)'
): UserProfile {
  const users = loadUsersFromStorage();
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) throw new Error('User tidak ditemukan.');

  const user = users[userIndex];
  const isNowVerified = !user.is_verified;

  user.is_verified = isNowVerified;
  user.verified_at = isNowVerified ? new Date().toISOString() : null;
  user.verified_by = isNowVerified ? adminName : null;

  if (isNowVerified && user.subscription_status !== 'active') {
    user.subscription_status = 'active';
    const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    user.subscription_expires_at = expiry.toISOString();
  }

  users[userIndex] = user;
  saveUsersToStorage(users);
  return user;
}

/**
 * Admin menyetujui / menolak pendaftaran akun pengguna baru
 * Perhatian: Akun baru BELUM aktif (is_verified = false) sampai pendaftar mengeklik link aktivasi dari email!
 */
export function verifyUserInStorage(
  userId: string,
  approve: boolean,
  adminName: string = 'Administrator be-ternak'
): UserProfile {
  const users = loadUsersFromStorage();
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) throw new Error('Pengguna tidak ditemukan.');

  const user = users[userIndex];
  if (approve) {
    // Admin menyetujui, generate token aktivasi unik untuk dikirim via email
    const token = 'act-' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    user.admin_verified = true;
    user.admin_verified_at = new Date().toISOString();
    user.admin_verified_by = adminName;
    user.activation_token = token;
    user.activation_sent_at = new Date().toISOString();
    user.is_verified = false; // Tetap false hingga pendaftar mengeklik tautan email!
    user.subscription_status = 'pending_verification';
  } else {
    user.admin_verified = false;
    user.is_verified = false;
    user.verified_at = null;
    user.verified_by = null;
    user.activation_token = null;
    user.subscription_status = 'rejected';
  }

  users[userIndex] = user;
  saveUsersToStorage(users);
  return user;
}

/**
 * Buat atau ambil URL aktivasi email untuk pengguna
 */
export function getActivationUrl(user: UserProfile): string {
  const token = user.activation_token || 'pending';
  return `/activate?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;
}

/**
 * Mengirim ulang / memperbarui token aktivasi email
 */
export function resendActivationLink(userId: string): { user: UserProfile; activationUrl: string } {
  const users = loadUsersFromStorage();
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) throw new Error('Pengguna tidak ditemukan.');

  const user = users[userIndex];
  if (!user.admin_verified) {
    throw new Error('Akun ini belum disetujui oleh Administrator.');
  }

  // Generate token baru
  user.activation_token = 'act-' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  user.activation_sent_at = new Date().toISOString();

  users[userIndex] = user;
  saveUsersToStorage(users);

  return {
    user,
    activationUrl: getActivationUrl(user),
  };
}

/**
 * Aktivasi akun setelah pengguna mengeklik tautan yang dikirim melalui email pendaftar
 */
export function activateUserByToken(
  token: string,
  email?: string
): { success: boolean; message: string; user?: UserProfile } {
  const users = loadUsersFromStorage();

  const userIndex = users.findIndex((u) => {
    if (email && u.email.toLowerCase() !== email.toLowerCase().trim()) return false;
    return u.activation_token === token;
  });

  if (userIndex === -1) {
    // Cek apakah user dengan email tersebut sudah aktif sebelumnya
    if (email) {
      const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
      if (existing && existing.is_verified) {
        return {
          success: true,
          message: 'Akun Anda sudah aktif dan terverifikasi sebelumnya.',
          user: existing,
        };
      }
    }
    return {
      success: false,
      message: 'Tautan aktivasi tidak valid, telah kedaluwarsa, atau akun belum disetujui Admin.',
    };
  }

  const user = users[userIndex];

  if (!user.admin_verified) {
    return {
      success: false,
      message: 'Akun ini belum disetujui oleh Administrator be-ternak.',
    };
  }

  if (user.is_verified) {
    setActiveUserId(user.id);
    return {
      success: true,
      message: 'Akun Anda sudah aktif dan terverifikasi.',
      user,
    };
  }

  // Berhasil diaktivasi melalui link email!
  const now = new Date();
  const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  user.is_verified = true;
  user.subscription_status = 'active';
  user.email_verified_at = now.toISOString();
  user.verified_at = now.toISOString();
  user.verified_by = 'Link Verifikasi Email';
  user.subscription_expires_at = expiry.toISOString();

  users[userIndex] = user;
  saveUsersToStorage(users);
  setActiveUserId(user.id);

  return {
    success: true,
    message: `Selamat! Akun ${user.name} (${user.business_name}) berhasil diaktivasi dan siap digunakan.`,
    user,
  };
}
