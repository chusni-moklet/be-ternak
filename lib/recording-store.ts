import {
  KandangUnit,
  DailyRecordingLog,
  CreateKandangPayload,
  CreateRecordingPayload,
  KandangHouseType,
} from './types';

export const STORAGE_KEY_KANDANG = 'be_ternak_kandang_units';
export const STORAGE_KEY_RECORDINGS = 'be_ternak_daily_recordings';

// ============================================================================
// Initial Mock Kandang Units
// ============================================================================

export const INITIAL_KANDANG_UNITS: KandangUnit[] = [
  {
    id: 'kandang-subur-01',
    user_id: 'usr-farmer-01',
    name: 'Kandang A',
    house_type: 'Open House',
    strain: 'ISA Brown',
    initial_population: 2500,
    current_population: 2490,
    chick_in_date: '2026-02-10',
    age_weeks: 41,
    created_at: '2026-02-10T08:00:00Z',
  },
  {
    id: 'kandang-subur-02',
    user_id: 'usr-farmer-01',
    name: 'Kandang B',
    house_type: 'Semi-Closed',
    strain: 'Lohmann Brown',
    initial_population: 2500,
    current_population: 2488,
    chick_in_date: '2026-03-01',
    age_weeks: 38,
    created_at: '2026-03-01T08:00:00Z',
  },
  {
    id: 'kandang-ahmad-01',
    user_id: 'usr-farmer-02',
    name: 'Kandang Utama Ahmad',
    house_type: 'Open House',
    strain: 'ISA Brown',
    initial_population: 2500,
    current_population: 2485,
    chick_in_date: '2026-04-15',
    age_weeks: 32,
    created_at: '2026-04-15T08:00:00Z',
  },
];

// ============================================================================
// Initial Mock 10-Day Daily Recording Logs
// ============================================================================

const RAW_LOGS_KANDANG_A: Array<{
  date: string;
  dead: number;
  cull: number;
  eggKg: number;
  eggCount: number;
  brokenKg: number;
  feedKg: number;
  feedType: string;
  note: string;
}> = [
  { date: '2026-11-15', dead: 1, cull: 0, eggKg: 137.5, eggCount: 2200, brokenKg: 1.2, feedKg: 275, feedType: 'Ransum be-ternak AI #1', note: 'Normal' },
  { date: '2026-11-16', dead: 0, cull: 1, eggKg: 138.8, eggCount: 2220, brokenKg: 1.0, feedKg: 275, feedType: 'Ransum be-ternak AI #1', note: 'Normal' },
  { date: '2026-11-17', dead: 2, cull: 0, eggKg: 136.2, eggCount: 2180, brokenKg: 1.5, feedKg: 274, feedType: 'Ransum be-ternak AI #1', note: 'Vitamin Anti-Stres' },
  { date: '2026-11-18', dead: 1, cull: 0, eggKg: 139.4, eggCount: 2230, brokenKg: 0.9, feedKg: 275, feedType: 'Ransum be-ternak AI #1', note: 'Normal' },
  { date: '2026-11-19', dead: 0, cull: 0, eggKg: 140.0, eggCount: 2240, brokenKg: 1.1, feedKg: 276, feedType: 'Ransum be-ternak AI #1', note: 'Normal' },
  { date: '2026-11-20', dead: 1, cull: 1, eggKg: 137.0, eggCount: 2190, brokenKg: 1.4, feedKg: 274, feedType: 'Ransum be-ternak AI #1', note: 'Heat Stress' },
  { date: '2026-11-21', dead: 0, cull: 0, eggKg: 139.5, eggCount: 2232, brokenKg: 1.0, feedKg: 275, feedType: 'Ransum be-ternak AI #1', note: 'Normal' },
  { date: '2026-11-22', dead: 1, cull: 0, eggKg: 141.0, eggCount: 2256, brokenKg: 0.8, feedKg: 276, feedType: 'Ransum be-ternak AI #1', note: 'Normal' },
  { date: '2026-11-23', dead: 0, cull: 1, eggKg: 140.2, eggCount: 2244, brokenKg: 1.1, feedKg: 275, feedType: 'Ransum be-ternak AI #1', note: 'Normal' },
  { date: '2026-11-24', dead: 1, cull: 0, eggKg: 141.2, eggCount: 2260, brokenKg: 0.9, feedKg: 276, feedType: 'Ransum be-ternak AI #1', note: 'Normal' },
];

const RAW_LOGS_KANDANG_B: Array<{
  date: string;
  dead: number;
  cull: number;
  eggKg: number;
  eggCount: number;
  brokenKg: number;
  feedKg: number;
  feedType: string;
  note: string;
}> = [
  { date: '2026-11-15', dead: 1, cull: 0, eggKg: 139.0, eggCount: 2224, brokenKg: 1.0, feedKg: 274, feedType: 'Ransum be-ternak AI #2', note: 'Normal' },
  { date: '2026-11-16', dead: 0, cull: 0, eggKg: 140.5, eggCount: 2248, brokenKg: 0.9, feedKg: 275, feedType: 'Ransum be-ternak AI #2', note: 'Normal' },
  { date: '2026-11-17', dead: 2, cull: 1, eggKg: 138.0, eggCount: 2208, brokenKg: 1.2, feedKg: 273, feedType: 'Ransum be-ternak AI #2', note: 'Vitamin Anti-Stres' },
  { date: '2026-11-18', dead: 1, cull: 0, eggKg: 141.2, eggCount: 2260, brokenKg: 0.8, feedKg: 275, feedType: 'Ransum be-ternak AI #2', note: 'Normal' },
  { date: '2026-11-19', dead: 0, cull: 1, eggKg: 141.8, eggCount: 2268, brokenKg: 1.0, feedKg: 275, feedType: 'Ransum be-ternak AI #2', note: 'Normal' },
  { date: '2026-11-20', dead: 1, cull: 0, eggKg: 139.8, eggCount: 2236, brokenKg: 1.3, feedKg: 274, feedType: 'Ransum be-ternak AI #2', note: 'Heat Stress' },
  { date: '2026-11-21', dead: 0, cull: 0, eggKg: 142.0, eggCount: 2272, brokenKg: 0.9, feedKg: 275, feedType: 'Ransum be-ternak AI #2', note: 'Normal' },
  { date: '2026-11-22', dead: 2, cull: 0, eggKg: 142.5, eggCount: 2280, brokenKg: 0.7, feedKg: 276, feedType: 'Ransum be-ternak AI #2', note: 'Normal' },
  { date: '2026-11-23', dead: 1, cull: 0, eggKg: 143.0, eggCount: 2288, brokenKg: 0.8, feedKg: 276, feedType: 'Ransum be-ternak AI #2', note: 'Normal' },
  { date: '2026-11-24', dead: 1, cull: 1, eggKg: 142.8, eggCount: 2284, brokenKg: 0.8, feedKg: 275, feedType: 'Ransum be-ternak AI #2', note: 'Normal' },
];

const RAW_LOGS_KANDANG_AHMAD: Array<{
  date: string;
  dead: number;
  cull: number;
  eggKg: number;
  eggCount: number;
  brokenKg: number;
  feedKg: number;
  feedType: string;
  note: string;
}> = [
  { date: '2026-11-15', dead: 2, cull: 0, eggKg: 132.5, eggCount: 2120, brokenKg: 1.5, feedKg: 275, feedType: 'Pakan Pabrikan Komplit', note: 'Normal' },
  { date: '2026-11-16', dead: 1, cull: 1, eggKg: 133.0, eggCount: 2128, brokenKg: 1.4, feedKg: 275, feedType: 'Pakan Pabrikan Komplit', note: 'Normal' },
  { date: '2026-11-17', dead: 2, cull: 0, eggKg: 131.8, eggCount: 2108, brokenKg: 1.6, feedKg: 274, feedType: 'Pakan Pabrikan Komplit', note: 'Vitamin Anti-Stres' },
  { date: '2026-11-18', dead: 1, cull: 0, eggKg: 134.0, eggCount: 2144, brokenKg: 1.2, feedKg: 275, feedType: 'Pakan Pabrikan Komplit', note: 'Normal' },
  { date: '2026-11-19', dead: 0, cull: 1, eggKg: 134.5, eggCount: 2152, brokenKg: 1.3, feedKg: 275, feedType: 'Pakan Pabrikan Komplit', note: 'Normal' },
  { date: '2026-11-20', dead: 2, cull: 1, eggKg: 132.0, eggCount: 2112, brokenKg: 1.8, feedKg: 273, feedType: 'Pakan Pabrikan Komplit', note: 'Heat Stress' },
  { date: '2026-11-21', dead: 1, cull: 0, eggKg: 135.0, eggCount: 2160, brokenKg: 1.1, feedKg: 274, feedType: 'Pakan Pabrikan Komplit', note: 'Normal' },
  { date: '2026-11-22', dead: 1, cull: 0, eggKg: 135.5, eggCount: 2168, brokenKg: 1.0, feedKg: 275, feedType: 'Pakan Pabrikan Komplit', note: 'Normal' },
  { date: '2026-11-23', dead: 1, cull: 0, eggKg: 136.0, eggCount: 2176, brokenKg: 1.1, feedKg: 275, feedType: 'Pakan Pabrikan Komplit', note: 'Normal' },
  { date: '2026-11-24', dead: 1, cull: 0, eggKg: 136.5, eggCount: 2184, brokenKg: 1.0, feedKg: 276, feedType: 'Pakan Pabrikan Komplit', note: 'Normal' },
];

function generateInitialLogs(
  userId: string,
  kandangId: string,
  kandangName: string,
  initialPop: number,
  raw: typeof RAW_LOGS_KANDANG_A
): DailyRecordingLog[] {
  let runningPop = initialPop;
  return raw.map((item, idx) => {
    runningPop = runningPop - (item.dead + item.cull);
    const totalEggKg = item.eggKg + item.brokenKg;
    const fcr = totalEggKg > 0 ? Number((item.feedKg / totalEggKg).toFixed(2)) : 0;
    const hdp = runningPop > 0 ? Number(((item.eggCount / runningPop) * 100).toFixed(1)) : 0;
    const feedIntake = runningPop > 0 ? Number(((item.feedKg * 1000) / runningPop).toFixed(1)) : 0;
    const avgWeight = item.eggCount > 0 ? Number(((item.eggKg * 1000) / item.eggCount).toFixed(1)) : 62.5;

    return {
      id: `rec-${kandangId}-${idx + 1}`,
      user_id: userId,
      kandang_id: kandangId,
      kandang_name: kandangName,
      date: item.date,
      dead_count: item.dead,
      cull_count: item.cull,
      final_population: runningPop,
      intact_egg_kg: item.eggKg,
      intact_egg_count: item.eggCount,
      avg_egg_weight_gram: avgWeight,
      broken_egg_kg: item.brokenKg,
      hdp_percent: hdp,
      feed_kg: item.feedKg,
      feed_type: item.feedType,
      feed_intake_gram: feedIntake,
      fcr: fcr,
      condition_note: item.note,
      notes: idx === 2 ? 'Pemberian vitamin anti-stres karena cuaca terik.' : undefined,
      created_at: `${item.date}T17:00:00Z`,
    };
  });
}

export const INITIAL_RECORDING_LOGS: DailyRecordingLog[] = [
  ...generateInitialLogs('usr-farmer-01', 'kandang-subur-01', 'Kandang A', 2500, RAW_LOGS_KANDANG_A),
  ...generateInitialLogs('usr-farmer-01', 'kandang-subur-02', 'Kandang B', 2500, RAW_LOGS_KANDANG_B),
  ...generateInitialLogs('usr-farmer-02', 'kandang-ahmad-01', 'Kandang Utama Ahmad', 2500, RAW_LOGS_KANDANG_AHMAD),
];

// ============================================================================
// Storage Functions for Kandang Units
// ============================================================================

export function loadKandangUnits(userId?: string): KandangUnit[] {
  if (typeof window === 'undefined') {
    return userId ? INITIAL_KANDANG_UNITS.filter((k) => k.user_id === userId) : INITIAL_KANDANG_UNITS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_KANDANG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_KANDANG, JSON.stringify(INITIAL_KANDANG_UNITS));
      return userId ? INITIAL_KANDANG_UNITS.filter((k) => k.user_id === userId) : INITIAL_KANDANG_UNITS;
    }
    const list: KandangUnit[] = JSON.parse(raw);
    return userId ? list.filter((k) => k.user_id === userId) : list;
  } catch (e) {
    console.error('Failed to load kandang units from localStorage', e);
    return userId ? INITIAL_KANDANG_UNITS.filter((k) => k.user_id === userId) : INITIAL_KANDANG_UNITS;
  }
}

export function saveKandangUnitsToStorage(units: KandangUnit[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_KANDANG, JSON.stringify(units));
  } catch (e) {
    console.error('Failed to save kandang units to localStorage', e);
  }
}

export function createKandangUnit(userId: string, payload: CreateKandangPayload): KandangUnit {
  const allUnits = loadKandangUnits();
  const newUnit: KandangUnit = {
    id: `kandang-${Date.now()}`,
    user_id: userId,
    name: payload.name.trim(),
    house_type: payload.house_type,
    strain: payload.strain.trim() || 'ISA Brown',
    initial_population: Number(payload.initial_population) || 2000,
    current_population: Number(payload.initial_population) || 2000,
    chick_in_date: payload.chick_in_date || new Date().toISOString().split('T')[0],
    age_weeks: Number(payload.age_weeks) || 20,
    created_at: new Date().toISOString(),
  };

  const updated = [newUnit, ...allUnits];
  saveKandangUnitsToStorage(updated);
  return newUnit;
}

export function deleteKandangUnit(kandangId: string): { success: boolean; deletedLogsCount: number; message?: string } {
  const allUnits = loadKandangUnits();
  const target = allUnits.find((k) => k.id === kandangId);
  if (!target) {
    return { success: false, deletedLogsCount: 0, message: 'Kandang tidak ditemukan.' };
  }

  // Proteksi: jangan biarkan user menghapus kandang jika hanya tersisa 1 unit milik user tersebut
  const userKandangs = allUnits.filter((k) => k.user_id === target.user_id);
  if (userKandangs.length <= 1) {
    return {
      success: false,
      deletedLogsCount: 0,
      message: 'Gagal menghapus: Minimal harus memiliki 1 unit kandang aktif.',
    };
  }

  const updatedUnits = allUnits.filter((k) => k.id !== kandangId);
  saveKandangUnitsToStorage(updatedUnits);

  // Hapus semua log yang berelasi dengan kandang ini
  const allLogs = loadDailyRecordings();
  const remainingLogs = allLogs.filter((l) => l.kandang_id !== kandangId);
  const deletedCount = allLogs.length - remainingLogs.length;
  saveDailyRecordingsToStorage(remainingLogs);

  return { success: true, deletedLogsCount: deletedCount };
}

// ============================================================================
// Storage Functions for Daily Recordings
// ============================================================================

export function loadDailyRecordings(userId?: string, kandangId?: string): DailyRecordingLog[] {
  if (typeof window === 'undefined') {
    let list = INITIAL_RECORDING_LOGS;
    if (userId) list = list.filter((l) => l.user_id === userId);
    if (kandangId && kandangId !== 'all') list = list.filter((l) => l.kandang_id === kandangId);
    return list;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RECORDINGS, JSON.stringify(INITIAL_RECORDING_LOGS));
      let list = INITIAL_RECORDING_LOGS;
      if (userId) list = list.filter((l) => l.user_id === userId);
      if (kandangId && kandangId !== 'all') list = list.filter((l) => l.kandang_id === kandangId);
      return list;
    }
    let list: DailyRecordingLog[] = JSON.parse(raw);
    if (userId) list = list.filter((l) => l.user_id === userId);
    if (kandangId && kandangId !== 'all') list = list.filter((l) => l.kandang_id === kandangId);
    // Sort chronological: terlama ke terbaru (default)
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (e) {
    console.error('Failed to load recordings from localStorage', e);
    let list = INITIAL_RECORDING_LOGS;
    if (userId) list = list.filter((l) => l.user_id === userId);
    if (kandangId && kandangId !== 'all') list = list.filter((l) => l.kandang_id === kandangId);
    return list;
  }
}

export function saveDailyRecordingsToStorage(logs: DailyRecordingLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_RECORDINGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save recordings to localStorage', e);
  }
}

/**
 * Rekalkulasi kronologis seluruh log untuk unit kandang tertentu.
 * Menghitung populasi berjalan, HDP, intake pakan, dan FCR secara berurutan.
 */
export function recalculateKandangChronology(kandangId: string): void {
  const allUnits = loadKandangUnits();
  const kandang = allUnits.find((k) => k.id === kandangId);
  if (!kandang) return;

  const allLogs = loadDailyRecordings();
  const targetLogs = allLogs
    .filter((l) => l.kandang_id === kandangId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningPop = kandang.initial_population;
  const recalculatedTarget = targetLogs.map((log) => {
    runningPop = runningPop - (log.dead_count + log.cull_count);
    const totalEggKg = log.intact_egg_kg + log.broken_egg_kg;
    const fcr = totalEggKg > 0 ? Number((log.feed_kg / totalEggKg).toFixed(2)) : 0;
    const hdp = runningPop > 0 ? Number(((log.intact_egg_count / runningPop) * 100).toFixed(1)) : 0;
    const feedIntake = runningPop > 0 ? Number(((log.feed_kg * 1000) / runningPop).toFixed(1)) : 0;
    const avgWeight = log.intact_egg_count > 0 ? Number(((log.intact_egg_kg * 1000) / log.intact_egg_count).toFixed(1)) : 62.5;

    return {
      ...log,
      final_population: runningPop,
      hdp_percent: hdp,
      feed_intake_gram: feedIntake,
      fcr: fcr,
      avg_egg_weight_gram: avgWeight,
    };
  });

  // Update kandang current_population ke populasi akhir terbaru
  kandang.current_population = runningPop;
  saveKandangUnitsToStorage(allUnits);

  // Simpan ulang semua logs
  const otherLogs = allLogs.filter((l) => l.kandang_id !== kandangId);
  saveDailyRecordingsToStorage([...otherLogs, ...recalculatedTarget]);
}

/**
 * Simpan log recording harian baru, kemudian jalankan rekalkulasi kronologis.
 */
export function addDailyRecording(userId: string, payload: CreateRecordingPayload): DailyRecordingLog {
  const allUnits = loadKandangUnits(userId);
  const kandang = allUnits.find((k) => k.id === payload.kandang_id);
  if (!kandang) {
    throw new Error('Unit kandang tidak valid.');
  }

  const allLogs = loadDailyRecordings();
  const totalEggKg = payload.intact_egg_kg + payload.broken_egg_kg;
  const fcr = totalEggKg > 0 ? Number((payload.feed_kg / totalEggKg).toFixed(2)) : 0;
  const avgWeight =
    payload.intact_egg_count > 0
      ? Number(((payload.intact_egg_kg * 1000) / payload.intact_egg_count).toFixed(1))
      : 62.5;

  const newLog: DailyRecordingLog = {
    id: `rec-${Date.now()}`,
    user_id: userId,
    kandang_id: payload.kandang_id,
    kandang_name: kandang.name,
    date: payload.date,
    dead_count: Number(payload.dead_count) || 0,
    cull_count: Number(payload.cull_count) || 0,
    final_population: kandang.current_population - ((Number(payload.dead_count) || 0) + (Number(payload.cull_count) || 0)),
    intact_egg_kg: Number(payload.intact_egg_kg) || 0,
    intact_egg_count: Number(payload.intact_egg_count) || 0,
    avg_egg_weight_gram: avgWeight,
    broken_egg_kg: Number(payload.broken_egg_kg) || 0,
    hdp_percent: 0, // Akan dihitung ulang secara presisi di recalculate
    feed_kg: Number(payload.feed_kg) || 0,
    feed_type: payload.feed_type || 'Ransum be-ternak AI #1',
    feed_intake_gram: 0, // Akan dihitung ulang
    fcr: fcr,
    condition_note: payload.condition_note || 'Normal',
    notes: payload.notes?.trim() || undefined,
    created_at: new Date().toISOString(),
  };

  // Simpan log baru
  saveDailyRecordingsToStorage([...allLogs, newLog]);

  // Rekalkulasi kronologis kandang tersebut
  recalculateKandangChronology(payload.kandang_id);

  // Return log yang telah diperbarui
  const reloaded = loadDailyRecordings().find((l) => l.id === newLog.id);
  return reloaded || newLog;
}

/**
 * Hapus satu baris log recording, lalu rekalkulasi kronologis kandang terkait.
 */
export function deleteDailyRecording(recordingId: string): void {
  const allLogs = loadDailyRecordings();
  const target = allLogs.find((l) => l.id === recordingId);
  if (!target) return;

  const remaining = allLogs.filter((l) => l.id !== recordingId);
  saveDailyRecordingsToStorage(remaining);

  // Jalankan rekalkulasi kronologis agar populasi log berikutnya tetap presisi
  recalculateKandangChronology(target.kandang_id);
}

/**
 * Export data recording ke format CSV
 */
export function exportRecordingsToCsv(recordings: DailyRecordingLog[]): string {
  const headers = [
    'Tanggal',
    'Kandang',
    'Populasi Akhir',
    'Mati (ekor)',
    'Afkir (ekor)',
    'Telur Utuh (kg)',
    'Telur Utuh (butir)',
    'Telur Retak (kg)',
    'HDP (%)',
    'Pakan Terpakai (kg)',
    'Feed Intake (gr/ekor)',
    'Jenis Ransum',
    'FCR',
    'Kondisi',
    'Catatan Tambahan',
  ];

  const rows = recordings.map((r) => [
    `"${r.date}"`,
    `"${r.kandang_name}"`,
    r.final_population,
    r.dead_count,
    r.cull_count,
    r.intact_egg_kg,
    r.intact_egg_count,
    r.broken_egg_kg,
    r.hdp_percent,
    r.feed_kg,
    r.feed_intake_gram,
    `"${r.feed_type}"`,
    r.fcr,
    `"${r.condition_note}"`,
    `"${r.notes || '-'}"`,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
