import {
  KandangUnit,
  DailyRecordingLog,
  CreateKandangPayload,
  CreateRecordingPayload,
  KandangHouseType,
} from './types';

export const STORAGE_KEY_KANDANG = 'be_ternak_kandang_units_v2';
export const STORAGE_KEY_RECORDINGS = 'be_ternak_daily_recordings_v2';

// ============================================================================
// Inisialisasi Bersih Tanpa Data Dummy (Siap untuk Input Data Real)
// ============================================================================

export const INITIAL_KANDANG_UNITS: KandangUnit[] = [];
export const INITIAL_RECORDING_LOGS: DailyRecordingLog[] = [];

// ============================================================================
// Storage Functions for Kandang Units
// ============================================================================

export function loadKandangUnits(userId?: string): KandangUnit[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    // Bersihkan key lama jika ada
    if (localStorage.getItem('be_ternak_kandang_units')) {
      localStorage.removeItem('be_ternak_kandang_units');
    }
    const raw = localStorage.getItem(STORAGE_KEY_KANDANG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_KANDANG, JSON.stringify([]));
      return [];
    }
    let list: KandangUnit[] = JSON.parse(raw);
    // Bersihkan dummy lawas jika tersimpan di browser
    list = list.filter(
      (k) => !['kandang-subur-01', 'kandang-subur-02', 'kandang-ahmad-01'].includes(k.id)
    );
    return userId ? list.filter((k) => k.user_id === userId) : list;
  } catch (e) {
    console.error('Failed to load kandang units from localStorage', e);
    return [];
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
    initial_population: Number(payload.initial_population) || 1000,
    current_population: Number(payload.initial_population) || 1000,
    chick_in_date: payload.chick_in_date || new Date().toISOString().split('T')[0],
    age_weeks: Number(payload.age_weeks) || 20,
    created_at: new Date().toISOString(),
  };

  const updated = [newUnit, ...allUnits];
  saveKandangUnitsToStorage(updated);
  return newUnit;
}

export function deleteKandangUnit(kandangId: string): { success: boolean; message?: string; deletedLogsCount: number } {
  const allUnits = loadKandangUnits();
  const target = allUnits.find((k) => k.id === kandangId);
  if (!target) {
    return { success: false, message: 'Unit kandang tidak ditemukan.', deletedLogsCount: 0 };
  }

  // Hapus kandang
  const remainingUnits = allUnits.filter((k) => k.id !== kandangId);
  saveKandangUnitsToStorage(remainingUnits);

  // Hapus juga semua log recording yang terikat ke kandang ini
  const allLogs = loadDailyRecordings();
  const remainingLogs = allLogs.filter((l) => l.kandang_id !== kandangId);
  const deletedLogsCount = allLogs.length - remainingLogs.length;
  saveDailyRecordingsToStorage(remainingLogs);

  return { success: true, deletedLogsCount };
}

// ============================================================================
// Storage Functions for Daily Recordings
// ============================================================================

export function loadDailyRecordings(userId?: string, kandangId?: string): DailyRecordingLog[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    // Bersihkan key lama jika ada
    if (localStorage.getItem('be_ternak_daily_recordings')) {
      localStorage.removeItem('be_ternak_daily_recordings');
    }
    const raw = localStorage.getItem(STORAGE_KEY_RECORDINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RECORDINGS, JSON.stringify([]));
      return [];
    }
    let list: DailyRecordingLog[] = JSON.parse(raw);
    // Bersihkan dummy lawas jika tersimpan di browser
    list = list.filter(
      (l) =>
        !l.kandang_id.startsWith('kandang-subur') &&
        !l.kandang_id.startsWith('kandang-ahmad') &&
        !['usr-farmer-01', 'usr-farmer-02'].includes(l.user_id)
    );
    if (userId) {
      list = list.filter((l) => l.user_id === userId);
    }
    if (kandangId && kandangId !== 'all') {
      list = list.filter((l) => l.kandang_id === kandangId);
    }
    return list;
  } catch (e) {
    console.error('Failed to load daily recordings from localStorage', e);
    return [];
  }
}

export function saveDailyRecordingsToStorage(logs: DailyRecordingLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_RECORDINGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save daily recordings to localStorage', e);
  }
}

/**
 * Tambah baris recording harian baru
 */
export function addDailyRecording(
  userId: string,
  payload: CreateRecordingPayload
): DailyRecordingLog {
  const allUnits = loadKandangUnits();
  const kandang = allUnits.find((k) => k.id === payload.kandang_id);
  if (!kandang) {
    throw new Error('Unit kandang yang dipilih tidak ditemukan.');
  }

  // Hitung populasi berjalan
  const currentPop = kandang.current_population || kandang.initial_population;
  const deadCount = Number(payload.dead_count) || 0;
  const cullCount = Number(payload.cull_count) || 0;
  const newFinalPop = Math.max(0, currentPop - deadCount - cullCount);

  // Kalkulasi metriks teknis
  const intactEggKg = Number(payload.intact_egg_kg) || 0;
  const intactEggCount = Number(payload.intact_egg_count) || 0;
  const brokenEggKg = Number(payload.broken_egg_kg) || 0;
  const feedKg = Number(payload.feed_kg) || 0;

  const totalEggKg = intactEggKg + brokenEggKg;
  const fcr = totalEggKg > 0 ? Number((feedKg / totalEggKg).toFixed(2)) : 0;
  const hdp = newFinalPop > 0 ? Number(((intactEggCount / newFinalPop) * 100).toFixed(1)) : 0;
  const feedIntake = newFinalPop > 0 ? Number(((feedKg * 1000) / newFinalPop).toFixed(1)) : 0;
  const avgWeight = intactEggCount > 0 ? Number(((intactEggKg * 1000) / intactEggCount).toFixed(1)) : 62.5;

  const newLog: DailyRecordingLog = {
    id: `rec-${payload.kandang_id}-${Date.now()}`,
    user_id: userId,
    kandang_id: payload.kandang_id,
    kandang_name: kandang.name,
    date: payload.date,
    dead_count: deadCount,
    cull_count: cullCount,
    final_population: newFinalPop,
    intact_egg_kg: intactEggKg,
    intact_egg_count: intactEggCount,
    avg_egg_weight_gram: avgWeight,
    broken_egg_kg: brokenEggKg,
    hdp_percent: hdp,
    feed_kg: feedKg,
    feed_type: payload.feed_type || 'Ransum be-ternak AI #1',
    feed_intake_gram: feedIntake,
    fcr: fcr,
    condition_note: payload.condition_note || 'Normal',
    notes: payload.notes?.trim() || undefined,
    created_at: new Date().toISOString(),
  };

  const allLogs = loadDailyRecordings();
  const updatedLogs = [newLog, ...allLogs];
  saveDailyRecordingsToStorage(updatedLogs);

  // Perbarui populasi aktif kandang
  kandang.current_population = newFinalPop;
  const updatedUnits = allUnits.map((k) => (k.id === kandang.id ? kandang : k));
  saveKandangUnitsToStorage(updatedUnits);

  return newLog;
}

/**
 * Rekalkulasi kronologis populasi kandang setelah log dihapus
 */
export function recalculateKandangChronology(kandangId: string): void {
  const allUnits = loadKandangUnits();
  const kandang = allUnits.find((k) => k.id === kandangId);
  if (!kandang) return;

  const allLogs = loadDailyRecordings();
  const kandangLogs = allLogs
    .filter((l) => l.kandang_id === kandangId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningPop = kandang.initial_population;
  const updatedLogsMap = new Map<string, DailyRecordingLog>();

  kandangLogs.forEach((log) => {
    runningPop = Math.max(0, runningPop - log.dead_count - log.cull_count);
    const hdp = runningPop > 0 ? Number(((log.intact_egg_count / runningPop) * 100).toFixed(1)) : 0;
    const feedIntake = runningPop > 0 ? Number(((log.feed_kg * 1000) / runningPop).toFixed(1)) : 0;

    updatedLogsMap.set(log.id, {
      ...log,
      final_population: runningPop,
      hdp_percent: hdp,
      feed_intake_gram: feedIntake,
    });
  });

  const updatedAllLogs = allLogs.map((l) => (updatedLogsMap.has(l.id) ? updatedLogsMap.get(l.id)! : l));
  saveDailyRecordingsToStorage(updatedAllLogs);

  kandang.current_population = runningPop;
  saveKandangUnitsToStorage(allUnits.map((k) => (k.id === kandang.id ? kandang : k)));
}

export function deleteDailyRecording(recordingId: string): void {
  const allLogs = loadDailyRecordings();
  const target = allLogs.find((l) => l.id === recordingId);
  if (!target) return;

  const remaining = allLogs.filter((l) => l.id !== recordingId);
  saveDailyRecordingsToStorage(remaining);

  // Jalankan rekalkulasi kronologis agar populasi log berikutnya tetap presisi
  recalculateKandangChronology(target.kandang_id);
}

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
    'Jenis Ransum',
    'Feed Intake (g/ekor)',
    'FCR',
    'Kondisi',
    'Catatan Khusus',
  ];

  const rows = recordings.map((r) => [
    r.date,
    `"${r.kandang_name.replace(/"/g, '""')}"`,
    r.final_population,
    r.dead_count,
    r.cull_count,
    r.intact_egg_kg.toFixed(2),
    r.intact_egg_count,
    r.broken_egg_kg.toFixed(2),
    r.hdp_percent.toFixed(1),
    r.feed_kg.toFixed(1),
    `"${r.feed_type.replace(/"/g, '""')}"`,
    r.feed_intake_gram.toFixed(1),
    r.fcr.toFixed(2),
    `"${r.condition_note.replace(/"/g, '""')}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
