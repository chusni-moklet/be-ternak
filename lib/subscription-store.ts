import {
  UserProfile,
  SubscriptionTransaction,
  SubscriptionPlanType,
  PaymentMethod,
  SavedRansum,
  LayerSimulationScenario,
  FeedSource,
} from './types';
import { INITIAL_FEED_SOURCES } from './mock-data';

// ============================================================================
// Initial Mock Users
// ============================================================================

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin-01',
    name: 'Budi Santoso, S.Pt',
    email: 'admin@petapakan.id',
    phone: '081234567890',
    role: 'admin',
    business_name: 'PetaPakan AI Executive Operations',
    location_address: 'Gedung Pusat Agritech Indonesia, Jakarta Selatan',
    lat: -6.2088,
    lng: 106.8456,
    subscription_status: 'active',
    subscription_plan: 'free',
    subscription_paid_amount: 0,
    is_verified: true,
    verified_at: '2025-01-01T00:00:00Z',
    verified_by: 'System Superadmin',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'usr-farmer-01',
    name: 'H. Subur Widodo',
    email: 'suburfarm.blitar@gmail.com',
    phone: '081334567891',
    role: 'peternak',
    business_name: 'Subur Makmur Layer Farm',
    location_address: 'Desa Kanigoro, Kec. Kanigoro, Kab. Blitar, Jawa Timur',
    lat: -8.1283,
    lng: 112.2181,
    livestock_types: ['Ayam Petelur (Layer)'],
    poultry_capacity: 5000,
    subscription_status: 'active',
    subscription_plan: 'peternak_pro',
    subscription_paid_amount: 99000,
    subscription_expires_at: '2026-12-31T23:59:59Z',
    is_verified: true,
    verified_at: '2026-11-01T10:15:00Z',
    verified_by: 'Budi Santoso, S.Pt (Admin)',
    created_at: '2026-10-15T08:00:00Z',
  },
  {
    id: 'usr-farmer-02',
    name: 'Ahmad Fauzi',
    email: 'fauzi.joper@yahoo.co.id',
    phone: '085211223344',
    role: 'peternak',
    business_name: 'Kandang Berkah Joper Ciamis',
    location_address: 'Kec. Cijeungjing, Kab. Ciamis, Jawa Barat',
    lat: -7.3374,
    lng: 108.3851,
    livestock_types: ['Ayam Kampung / Joper'],
    poultry_capacity: 2500,
    subscription_status: 'pending_verification',
    subscription_plan: 'peternak_starter',
    subscription_paid_amount: 49000,
    subscription_expires_at: null,
    is_verified: false,
    verified_at: null,
    verified_by: null,
    created_at: '2026-11-19T14:30:00Z',
  },
  {
    id: 'usr-supplier-01',
    name: 'Hj. Rohmah',
    email: 'barokah.dedak@gmail.com',
    phone: '081298765432',
    role: 'pemilik_pakan',
    business_name: 'UD Barokah Dedak & Bekatul Pasuruan',
    location_address: 'Jl. Raya Grati No. 45, Kec. Grati, Pasuruan, Jawa Timur',
    lat: -7.7295,
    lng: 113.018,
    feed_materials: ['Dedak Padi Halus', 'Bekatul Super'],
    supply_capacity_ton_month: 25,
    subscription_status: 'active',
    subscription_plan: 'pemasok_umkm',
    subscription_paid_amount: 79000,
    subscription_expires_at: '2026-12-15T23:59:59Z',
    is_verified: true,
    verified_at: '2026-11-10T09:00:00Z',
    verified_by: 'Budi Santoso, S.Pt (Admin)',
    created_at: '2026-10-20T11:00:00Z',
  },
  {
    id: 'usr-supplier-02',
    name: 'Ir. Hendra Kusuma',
    email: 'sinaragro.malang@outlook.com',
    phone: '087812349988',
    role: 'pemilik_pakan',
    business_name: 'PT Sinar Agro Mandiri (Ampas Tahu & Maggot BSF)',
    location_address: 'Kecamatan Lawang, Kab. Malang, Jawa Timur',
    lat: -7.838,
    lng: 112.699,
    feed_materials: ['Ampas Tahu Kering Pres', 'Tepung Maggot BSF'],
    supply_capacity_ton_month: 40,
    subscription_status: 'pending_verification',
    subscription_plan: 'pemasok_pro',
    subscription_paid_amount: 149000,
    subscription_expires_at: null,
    is_verified: false,
    verified_at: null,
    verified_by: null,
    created_at: '2026-11-20T08:15:00Z',
  },
];

// ============================================================================
// Initial Mock Subscription Transactions
// ============================================================================

export const INITIAL_TRANSACTIONS: SubscriptionTransaction[] = [
  {
    id: 'tx-2026-001',
    user_id: 'usr-farmer-01',
    user_name: 'H. Subur Widodo',
    user_role: 'peternak',
    business_name: 'Subur Makmur Layer Farm',
    plan_id: 'peternak_pro',
    plan_name: 'Paket Pro Peternak Mandiri (30 Hari)',
    amount: 99000,
    payment_method: 'bank_transfer_bca',
    payment_ref: 'BCA-TRX-774910',
    status: 'approved',
    notes: 'Pembayaran transfer valid ke rekening BCA PT PetaPakan AI.',
    created_at: '2026-11-01T09:40:00Z',
    verified_at: '2026-11-01T10:15:00Z',
    verified_by: 'Budi Santoso, S.Pt (Admin)',
  },
  {
    id: 'tx-2026-002',
    user_id: 'usr-supplier-01',
    user_name: 'Hj. Rohmah',
    user_role: 'pemilik_pakan',
    business_name: 'UD Barokah Dedak & Bekatul Pasuruan',
    plan_id: 'pemasok_umkm',
    plan_name: 'Paket Mitra Suplai UMKM (30 Hari)',
    amount: 79000,
    payment_method: 'qris',
    payment_ref: 'QRIS-NMD-881903',
    status: 'approved',
    notes: 'QRIS settlement terkonfirmasi otomatis via gateway.',
    created_at: '2026-11-10T08:50:00Z',
    verified_at: '2026-11-10T09:00:00Z',
    verified_by: 'Budi Santoso, S.Pt (Admin)',
  },
  {
    id: 'tx-2026-003',
    user_id: 'usr-farmer-02',
    user_name: 'Ahmad Fauzi',
    user_role: 'peternak',
    business_name: 'Kandang Berkah Joper Ciamis',
    plan_id: 'peternak_starter',
    plan_name: 'Paket Starter Peternak (30 Hari)',
    amount: 49000,
    payment_method: 'bank_transfer_mandiri',
    payment_ref: 'MANDIRI-MBK-55201',
    status: 'pending',
    notes: 'Menunggu pengecekan mutasi rekening Bank Mandiri oleh Admin.',
    created_at: '2026-11-19T14:35:00Z',
    verified_at: null,
    verified_by: null,
  },
  {
    id: 'tx-2026-004',
    user_id: 'usr-supplier-02',
    user_name: 'Ir. Hendra Kusuma',
    user_role: 'pemilik_pakan',
    business_name: 'PT Sinar Agro Mandiri (Ampas Tahu & Maggot BSF)',
    plan_id: 'pemasok_pro',
    plan_name: 'Paket Prioritas Agroindustri (30 Hari)',
    amount: 149000,
    payment_method: 'qris',
    payment_ref: 'QRIS-SINARAGRO-99321',
    status: 'pending',
    notes: 'Bukti transfer QRIS terunggah. Membutuhkan verifikasi admin untuk mengaktifkan centang hijau pakan di peta.',
    created_at: '2026-11-20T08:20:00Z',
    verified_at: null,
    verified_by: null,
  },
];

// ============================================================================
// Initial Mock Saved Ransum (Resep AI Peternak)
// ============================================================================

export const INITIAL_SAVED_RANSUMS: SavedRansum[] = [
  {
    id: 'ransum-01',
    user_id: 'usr-farmer-01',
    title: 'Ransum Layer Murah Hemat Jagung 40% (Blitar)',
    livestock_type: 'Ayam Petelur (Layer)',
    total_cost_per_kg: 5400,
    savings_percent: '34% Hemat vs Konsentrat Komersial',
    ingredients: [
      { bahan: 'Jagung Pipil Kering Blitar', persentase: 45, peran: 'Sumber Energi Karbohidrat' },
      { bahan: 'Dedak Padi Halus (Kec. Kanigoro)', persentase: 20, peran: 'Serat & Pengisi Murah' },
      { bahan: 'Bungkil Kedelai / SBM', persentase: 15, peran: 'Protein Kasar Utama (PK 46%)' },
      { bahan: 'Tepung Ikan Limbah Pantai Prigi', persentase: 8, peran: 'Asam Amino Lisin & Metionin' },
      { bahan: 'Grit Cangkang Kupang Laut', persentase: 10, peran: 'Kalsium Kerabang Telur (Ca >38%)' },
      { bahan: 'Premix Mineral & Vitamin', persentase: 2, peran: 'Mikronutrisi & Elektrolit' },
    ],
    created_at: '2026-11-05T10:00:00Z',
  },
  {
    id: 'ransum-02',
    user_id: 'usr-farmer-02',
    title: 'Ransum Starter Joper Probiotik Ciamis',
    livestock_type: 'Ayam Kampung / Joper',
    total_cost_per_kg: 4850,
    savings_percent: '42% Penghematan Siklus Pembesaran',
    ingredients: [
      { bahan: 'Dedak Fermentasi EM4', persentase: 30, peran: 'Pemecah Asam Fitat & Serat Kasar' },
      { bahan: 'Jagung Halus Priangan', persentase: 40, peran: 'Energi Metabolis (EM 3.200 kcal)' },
      { bahan: 'Tepung Maggot BSF Kering', persentase: 15, peran: 'Protein Kasar Hewani 44%' },
      { bahan: 'Ampas Tahu Kering Pres', persentase: 12, peran: 'Protein Nabati Murah' },
      { bahan: 'Tepung Daun Kelor / Indigofera', persentase: 3, peran: 'Karotenoid & Antioksidan Alami' },
    ],
    created_at: '2026-11-19T15:00:00Z',
  },
];

// ============================================================================
// LocalStorage Persistence Helpers
// ============================================================================

const STORAGE_KEY_USERS = 'petapakan_users_v1';
const STORAGE_KEY_TXS = 'petapakan_txs_v1';
const STORAGE_KEY_RANSUMS = 'petapakan_ransums_v1';
const STORAGE_KEY_ACTIVE_USER = 'petapakan_active_user_id_v1';
const STORAGE_KEY_SIMULATIONS = 'petapakan_layer_simulations_v1';
const STORAGE_KEY_FEEDS = 'petapakan_feed_sources_v2';

export const SEEDED_FEED_SOURCES: FeedSource[] = [
  {
    id: 'feed-barokah-01',
    supplier_id: 'usr-supplier-01',
    supplier_name: 'UD Barokah Dedak & Bekatul Pasuruan',
    name: 'Dedak Padi Super Halus & Bekatul',
    feed_material: 'Dedak Padi Hasil Gilingan Padi Segar (Kadar Air < 13%)',
    category: 'Limbah Pertanian',
    target_livestock: ['Ayam Petelur (Layer)', 'Ayam Broiler (Pedaging)', 'Bebek / Itik (Petelur & Pedaging)'],
    estimated_price_per_kg: 3200,
    availability_status: 'Melimpah',
    stock_ton: 15.5,
    lat: -7.7295,
    lng: 113.018,
    contact_info: 'Hj. Rohmah (081298765432) - UD Barokah Dedak',
    is_verified: true,
    source_type: 'diverifikasi_admin',
    last_verified_at: '2026-11-10T09:00:00Z',
    created_at: '2026-10-25T08:00:00Z',
  },
  {
    id: 'feed-barokah-02',
    supplier_id: 'usr-supplier-01',
    supplier_name: 'UD Barokah Dedak & Bekatul Pasuruan',
    name: 'Tepung Maggot BSF Kering Berprotein 44%',
    feed_material: 'Prepupa Maggot BSF Oven Higienis untuk Pengganti Tepung Ikan',
    category: 'Limbah Perikanan & Ternak',
    target_livestock: ['Ayam Broiler (Pedaging)', 'Ayam Kampung / Joper'],
    estimated_price_per_kg: 18500,
    availability_status: 'Tersedia',
    stock_ton: 4.2,
    lat: -7.7310,
    lng: 113.021,
    contact_info: 'Hj. Rohmah (081298765432) - UD Barokah Dedak',
    is_verified: true,
    source_type: 'diverifikasi_admin',
    last_verified_at: '2026-11-15T10:00:00Z',
    created_at: '2026-11-01T09:00:00Z',
  },
  {
    id: 'feed-barokah-03',
    supplier_id: 'usr-supplier-01',
    supplier_name: 'UD Barokah Dedak & Bekatul Pasuruan',
    name: 'Ampas Tahu Segar Harian',
    feed_material: 'Ampas Tahu Segar Harian (Kadar Air 75%) Sumber Protein Nabati',
    category: 'Limbah Agroindustri',
    target_livestock: ['Ayam Petelur (Layer)', 'Bebek / Itik (Petelur & Pedaging)'],
    estimated_price_per_kg: 500,
    availability_status: 'Tersedia',
    stock_ton: 1.0,
    lat: -7.7280,
    lng: 113.015,
    contact_info: 'Hj. Rohmah (081298765432) - UD Barokah Dedak',
    is_verified: true,
    source_type: 'diverifikasi_admin',
    last_verified_at: '2026-11-16T11:00:00Z',
    created_at: '2026-11-02T10:00:00Z',
  },
  {
    id: 'feed-barokah-04',
    supplier_id: 'usr-supplier-01',
    supplier_name: 'UD Barokah Dedak & Bekatul Pasuruan',
    name: 'Ampas Tahu Putih Kering Pres Mesin',
    feed_material: 'Ampas Tahu Rendah Air (Pres Hidrolik) Sumber Protein Nabati 24%',
    category: 'Limbah Agroindustri',
    target_livestock: ['Ayam Petelur (Layer)', 'Ayam Kampung / Joper'],
    estimated_price_per_kg: 1800,
    availability_status: 'Melimpah',
    stock_ton: 22.0,
    lat: -7.7290,
    lng: 113.019,
    contact_info: 'Hj. Rohmah (081298765432) - UD Barokah Dedak',
    is_verified: false, // PENGAJUAN BARU MENUNGGU VERIFIKASI ADMIN!
    source_type: 'pengajuan_pemasok',
    last_verified_at: null,
    created_at: '2026-11-20T14:00:00Z',
  },
  {
    id: 'feed-sinar-01',
    supplier_id: 'usr-supplier-02',
    supplier_name: 'PT Sinar Agro Mandiri',
    name: 'Tepung Daun Indigofera & Gamal Halus',
    feed_material: 'Konsentrat Hijauan Leguminosa Kering (Protein Kasar >22%)',
    category: 'Hijauan & Karotenoid',
    target_livestock: ['Ayam Petelur (Layer)', 'Burung Puyuh (Layer/Pedaging)'],
    estimated_price_per_kg: 2400,
    availability_status: 'Tersedia',
    stock_ton: 8.5,
    lat: -7.9830,
    lng: 112.631,
    contact_info: 'Ir. Hendra Kusuma (087812349988) - PT Sinar Agro',
    is_verified: false, // PENGAJUAN BARU MENUNGGU VERIFIKASI ADMIN!
    source_type: 'pengajuan_pemasok',
    last_verified_at: null,
    created_at: '2026-11-21T09:30:00Z',
  },
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
    return JSON.parse(raw);
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

export function loadTransactionsFromStorage(): SubscriptionTransaction[] {
  if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TXS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
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
    return JSON.parse(raw);
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
