'use client';

import React, { useState, useEffect, useMemo, useSyncExternalStore, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import {
  UserProfile,
  KandangUnit,
  DailyRecordingLog,
  CreateKandangPayload,
  CreateRecordingPayload,
  KandangHouseType,
  SavedRansum,
  HealthScanResult,
} from '@/lib/types';
import {
  INITIAL_USERS,
  DEFAULT_FARMER_PROFILE,
  loadUsersFromStorage,
  getActiveUserId,
  setActiveUserId,
  loadSavedRansumsFromStorage,
} from '@/lib/subscription-store';
import {
  loadKandangUnits,
  createKandangUnit,
  deleteKandangUnit,
  loadDailyRecordings,
  addDailyRecording,
  deleteDailyRecording,
  exportRecordingsToCsv,
} from '@/lib/recording-store';
import {
  VISION_SAMPLE_PRESETS,
  VisionSamplePreset,
} from '@/lib/sample-vision-presets';
import UnverifiedAccountNotice from '@/components/ui/UnverifiedAccountNotice';
import {
  ScanEye,
  ClipboardList,
  CalendarCheck,
  Plus,
  Trash2,
  Download,
  Filter,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Egg,
  Scale,
  Activity,
  ShieldCheck,
  HeartPulse,
  Sparkles,
  Building2,
  Layers,
  BookOpen,
  Calculator,
  CreditCard,
  LayoutDashboard,
  Menu,
  X,
  Info,
  Calendar,
  Clock,
  ArrowUpDown,
  Camera,
  Upload,
  RefreshCw,
  Stethoscope,
  Check,
  Eye,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

interface DailyRecordingPageProps {
  initialTab?: 'recording' | 'health';
}

export default function DailyRecordingPage({ initialTab = 'recording' }: DailyRecordingPageProps) {
  // Active sub-menu tab: 'recording' vs 'health'
  const [activeTab, setActiveTab] = useState<'recording' | 'health'>(initialTab);

  // 1. Data User & Akun Aktif (Inisialisasi bersih dengan fallback standar)
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_FARMER_PROFILE);

  // Client mounted flag
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 2. Data Kandang & Recording
  const [kandangs, setKandangs] = useState<KandangUnit[]>([]);
  const [recordings, setRecordings] = useState<DailyRecordingLog[]>([]);
  const [selectedKandangId, setSelectedKandangId] = useState<string>('all');
  const [savedRansums, setSavedRansums] = useState<SavedRansum[]>([]);

  // 3. Modals State
  const [isAddKandangOpen, setIsAddKandangOpen] = useState(false);
  const [isDeleteKandangOpen, setIsDeleteKandangOpen] = useState(false);
  const [targetKandangToDelete, setTargetKandangToDelete] = useState<string>('');
  const [feedbackNotice, setFeedbackNotice] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Form Tambah Kandang
  const [newKandangName, setNewKandangName] = useState('');
  const [newKandangType, setNewKandangType] = useState<KandangHouseType>('Open House');
  const [newKandangStrain, setNewKandangStrain] = useState('ISA Brown');
  const [newKandangPop, setNewKandangPop] = useState<number>(2000);
  const [newKandangDate, setNewKandangDate] = useState('2026-11-24');
  const [newKandangAge, setNewKandangAge] = useState<number>(20);

  // 4. Form Input Recording Harian (Default Kosong / 0 untuk Input Data Riil)
  const [recordDate, setRecordDate] = useState<string>('2026-11-24');
  const [recordKandangId, setRecordKandangId] = useState<string>('');
  const [recordDead, setRecordDead] = useState<number>(0);
  const [recordCull, setRecordCull] = useState<number>(0);
  const [recordEggKg, setRecordEggKg] = useState<number>(0);
  const [recordEggCount, setRecordEggCount] = useState<number>(0);
  const [recordBrokenKg, setRecordBrokenKg] = useState<number>(0);
  const [recordFeedKg, setRecordFeedKg] = useState<number>(0);
  const [recordFeedType, setRecordFeedType] = useState<string>('Ransum be-ternak AI #1');
  const [recordCondition, setRecordCondition] = useState<string>('Normal');
  const [recordNotes, setRecordNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 5. State AI Health Vision Scanner
  const [scanImageBase64, setScanImageBase64] = useState<string | null>(null);
  const [scanImagePreview, setScanImagePreview] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<HealthScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Table filter query
  const [searchTableQuery, setSearchTableQuery] = useState('');

  // 6. Inisialisasi Data berdasarkan Akun Peternak
  useEffect(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      setRecordDate(today);
      setNewKandangDate(today);
    } catch {}

    const loadedUsers = loadUsersFromStorage();
    setUsers(loadedUsers);
    const activeId = getActiveUserId();
    const activeUser = loadedUsers.find((u) => u.id === activeId);
    const userToUse =
      activeUser && activeUser.role === 'peternak'
        ? activeUser
        : loadedUsers.find((u) => u.role === 'peternak') || DEFAULT_FARMER_PROFILE;

    if (userToUse) {
      setCurrentUser(userToUse);
      const loadedUnits = loadKandangUnits(userToUse.id);
      const loadedLogs = loadDailyRecordings(userToUse.id);
      const loadedRansums = loadSavedRansumsFromStorage();

      setKandangs(loadedUnits);
      setRecordings(loadedLogs);
      setSavedRansums(loadedRansums);

      if (loadedUnits.length > 0) {
        setRecordKandangId(loadedUnits[0].id);
        setTargetKandangToDelete(loadedUnits[0].id);
      }
    }

    // Cek jika ada hasil AI Health Scan yang ditransfer dari halaman /dashboard/peternak/health-scan
    try {
      const pendingCond = localStorage.getItem('petapakan_pending_ai_condition');
      const pendingNote = localStorage.getItem('petapakan_pending_ai_note');
      if (pendingCond) {
        setRecordCondition(pendingCond);
        localStorage.removeItem('petapakan_pending_ai_condition');
      }
      if (pendingNote) {
        setRecordNotes(pendingNote);
        localStorage.removeItem('petapakan_pending_ai_note');
        setFeedbackNotice({
          type: 'success',
          message: '✓ Hasil diagnosis AI berhasil dimuat ke Form Recording Harian!',
        });
        setTimeout(() => setFeedbackNotice(null), 4000);
        setTimeout(() => {
          const formElem = document.getElementById('form-recording-harian');
          if (formElem) {
            formElem.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      }
    } catch {}
  }, []);

  // Helper Switcher Akun Demo
  const handleSelectFarmer = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    setActiveUserId(userId);
    setCurrentUser(target);
    setSelectedKandangId('all');

    const loadedUnits = loadKandangUnits(userId);
    const loadedLogs = loadDailyRecordings(userId);
    setKandangs(loadedUnits);
    setRecordings(loadedLogs);

    if (loadedUnits.length > 0) {
      setRecordKandangId(loadedUnits[0].id);
      setTargetKandangToDelete(loadedUnits[0].id);
    } else {
      setRecordKandangId('');
      setTargetKandangToDelete('');
    }

    setFeedbackNotice({
      type: 'info',
      message: `Beralih ke profil peternak: ${target.name} (${target.business_name})`,
    });
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  // Live Auto-Calculate Jumlah Butir dari Kg Telur (~62.5 gr per butir)
  const handleEggKgChange = (val: number) => {
    setRecordEggKg(val);
    if (val > 0) {
      const estCount = Math.round((val * 1000) / 62.5);
      setRecordEggCount(estCount);
    }
  };

  // Filtered kandangs sesuai akun
  const userKandangs = useMemo(() => {
    return kandangs.filter((k) => k.user_id === currentUser.id);
  }, [kandangs, currentUser]);

  // Current selected kandang unit for live form input
  const activeFormKandang = useMemo(() => {
    return userKandangs.find((k) => k.id === recordKandangId) || userKandangs[0] || null;
  }, [userKandangs, recordKandangId]);

  // Live preview metrics di form recording
  const formPreview = useMemo(() => {
    const pop = activeFormKandang?.current_population || activeFormKandang?.initial_population || 0;
    const effectivePop = Math.max(0, pop - (Number(recordDead) || 0) - (Number(recordCull) || 0));
    const hdp = Number(effectivePop > 0 ? (((Number(recordEggCount) || 0) / effectivePop) * 100).toFixed(1) : 0);
    const feedIntake = Number(effectivePop > 0 ? (((Number(recordFeedKg) || 0) * 1000) / effectivePop).toFixed(1) : 0);
    const fcr = Number(Number(recordEggKg) > 0 ? ((Number(recordFeedKg) || 0) / Number(recordEggKg)).toFixed(2) : 0);

    return { effectivePop, hdp, feedIntake, fcr };
  }, [activeFormKandang, recordDead, recordCull, recordEggCount, recordFeedKg, recordEggKg]);

  // Filtered recordings sesuai pilihan unit kandang & pencarian
  const filteredRecordings = useMemo(() => {
    let list = recordings;
    if (selectedKandangId !== 'all') {
      list = list.filter((r) => r.kandang_id === selectedKandangId);
    }
    if (searchTableQuery.trim()) {
      const q = searchTableQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.date.includes(q) ||
          r.kandang_name.toLowerCase().includes(q) ||
          r.condition_note.toLowerCase().includes(q) ||
          r.feed_type.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [recordings, selectedKandangId, searchTableQuery]);

  // 7. Kalkulasi 4 KPI Utama
  const kpiData = useMemo(() => {
    const activeUnits =
      selectedKandangId === 'all'
        ? userKandangs
        : userKandangs.filter((k) => k.id === selectedKandangId);

    const initialPopTotal = activeUnits.reduce((acc, k) => acc + k.initial_population, 0);
    const currentPopTotal = activeUnits.reduce((acc, k) => acc + (k.current_population || k.initial_population), 0);
    const survivalRate = initialPopTotal > 0 ? (currentPopTotal / initialPopTotal) * 100 : 100;

    const relevantLogs =
      selectedKandangId === 'all'
        ? recordings
        : recordings.filter((r) => r.kandang_id === selectedKandangId);

    const latestLogsByKandang = new Map<string, DailyRecordingLog>();
    const sortedChronological = [...relevantLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    sortedChronological.forEach((log) => {
      latestLogsByKandang.set(log.kandang_id, log);
    });

    let todayEggKg = 0;
    let todayEggCount = 0;
    let todayFeedKg = 0;
    let todayBrokenKg = 0;
    let totalDeadAccum = 0;
    let totalCullAccum = 0;

    relevantLogs.forEach((l) => {
      totalDeadAccum += l.dead_count;
      totalCullAccum += l.cull_count;
    });

    latestLogsByKandang.forEach((l) => {
      todayEggKg += l.intact_egg_kg;
      todayEggCount += l.intact_egg_count;
      todayFeedKg += l.feed_kg;
      todayBrokenKg += l.broken_egg_kg;
    });

    const avgEggWeight = todayEggCount > 0 ? (todayEggKg * 1000) / todayEggCount : 62.5;
    const todayHdp = currentPopTotal > 0 ? (todayEggCount / currentPopTotal) * 100 : 0;
    const feedIntakeGram = currentPopTotal > 0 ? (todayFeedKg * 1000) / currentPopTotal : 0;
    const fcr = todayEggKg > 0 ? todayFeedKg / todayEggKg : 2.05;

    let fcrStatus: 'Sangat Efisien' | 'Normal' | 'Boros Pakan' = 'Normal';
    let fcrBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (fcr <= 2.10) {
      fcrStatus = 'Sangat Efisien';
      fcrBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    } else if (fcr <= 2.30) {
      fcrStatus = 'Normal';
      fcrBadgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    } else {
      fcrStatus = 'Boros Pakan';
      fcrBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    }

    const deplesiRate = initialPopTotal > 0 ? ((totalDeadAccum + totalCullAccum) / initialPopTotal) * 100 : 0;
    const brokenRate = (todayEggKg + todayBrokenKg) > 0 ? (todayBrokenKg / (todayEggKg + todayBrokenKg)) * 100 : 0;

    return {
      initialPopTotal,
      currentPopTotal,
      survivalRate,
      todayEggKg,
      todayEggCount,
      avgEggWeight,
      todayHdp,
      todayFeedKg,
      feedIntakeGram,
      fcr,
      fcrStatus,
      fcrBadgeColor,
      totalDeadAccum,
      totalCullAccum,
      deplesiRate,
      todayBrokenKg,
      brokenRate,
    };
  }, [userKandangs, recordings, selectedKandangId]);

  // 8. Grafik Tren HDP & Target Breeder (88-92%)
  const chartHdpData = useMemo(() => {
    const logs =
      selectedKandangId === 'all'
        ? recordings
        : recordings.filter((r) => r.kandang_id === selectedKandangId);

    const mapByDate = new Map<string, { totalEggs: number; totalPop: number; totalFeed: number }>();
    logs.forEach((l) => {
      const prev = mapByDate.get(l.date) || { totalEggs: 0, totalPop: 0, totalFeed: 0 };
      mapByDate.set(l.date, {
        totalEggs: prev.totalEggs + l.intact_egg_count,
        totalPop: prev.totalPop + (l.final_population || 2500),
        totalFeed: prev.totalFeed + l.feed_kg,
      });
    });

    const dates = Array.from(mapByDate.keys()).sort();
    return dates.map((d) => {
      const info = mapByDate.get(d)!;
      const hdp = info.totalPop > 0 ? Number(((info.totalEggs / info.totalPop) * 100).toFixed(1)) : 0;
      const fcr = info.totalEggs > 0 ? Number((info.totalFeed / (info.totalEggs * 0.0625)).toFixed(2)) : 2.05;
      const dObj = new Date(d);
      const label = isNaN(dObj.getTime())
        ? d
        : dObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      return {
        date: d,
        label,
        hdp,
        target_min: 88,
        target_max: 92,
        feedKg: Math.round(info.totalFeed),
        fcr,
      };
    });
  }, [recordings, selectedKandangId]);

  // 9. Client-Side Image Compression (Max 800px untuk inferensi cepat Groq Vision <3s)
  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => reject(new Error('Gagal memproses file citra.'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
      reader.readAsDataURL(file);
    });
  };

  // Handler Upload Foto dari Perangkat / Kamera
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setScanError(null);
      setSelectedPresetId(null);
      const compressedDataUrl = await compressImageFile(file);
      setScanImagePreview(compressedDataUrl);
      setScanImageBase64(compressedDataUrl);
    } catch (err: unknown) {
      setScanError((err as Error)?.message || 'Gagal mengompres gambar.');
    }
  };

  // Handler Pilih Preset Sampel Diagnostik
  const handleSelectPreset = (preset: VisionSamplePreset) => {
    setSelectedPresetId(preset.id);
    setScanImagePreview(preset.dataUrl);
    setScanImageBase64(preset.dataUrl);
    setScanError(null);
    setScanResult(null);
  };

  // Handler Eksekusi Scan AI Health Vision via Groq
  const handleExecuteScan = async () => {
    if (!scanImageBase64) {
      setScanError('Silakan pilih foto unggas atau sampel preset terlebih dahulu.');
      return;
    }

    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const targetUnit = userKandangs.find((k) => k.id === recordKandangId) || userKandangs[0];
      const payload = {
        imageBase64: scanImageBase64,
        mimeType: 'image/jpeg',
        coopName: targetUnit?.name || 'Kandang Layer Aktif',
        strain: targetUnit?.strain || 'ISA Brown',
      };

      const res = await fetch('/api/ai/health-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server merespon error: ${res.status}`);
      }

      const resData = await res.json();
      const diagnosis = resData.data || resData.diagnosis;
      if (!resData.success || !diagnosis) {
        throw new Error(resData.error || 'Gagal memproses hasil diagnosis visual.');
      }

      setScanResult(diagnosis);
      setFeedbackNotice({
        type: 'success',
        message: `✓ Diagnosis AI berhasil: ${diagnosis.status_kondisi} (${diagnosis.tingkat_risiko})`,
      });
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch (err: unknown) {
      console.error('Scan Error:', err);
      setScanError((err as Error)?.message || 'Terjadi kesalahan saat memanggil AI Vision.');
    } finally {
      setIsScanning(false);
    }
  };

  // Handler Terapkan Hasil Scan AI ke Form Recording
  const handleApplyToForm = () => {
    if (!scanResult) return;

    let matchedCondition = 'Normal';
    const statusLower = scanResult.status_kondisi.toLowerCase();
    if (statusLower.includes('heat') || statusLower.includes('panting') || statusLower.includes('panas')) {
      matchedCondition = 'Heat Stress';
    } else if (statusLower.includes('feses') || statusLower.includes('diare') || statusLower.includes('cerna') || statusLower.includes('snot') || scanResult.tingkat_risiko === 'Kritis') {
      matchedCondition = 'Sakit / Perlu Karantina';
    } else if (statusLower.includes('vitamin') || scanResult.tingkat_risiko === 'Waspada') {
      matchedCondition = 'Vitamin Anti-Stres';
    }

    setRecordCondition(matchedCondition);

    const aiNote = `[AI Vision Groq]: ${scanResult.status_kondisi} (${scanResult.tingkat_risiko}) - Gejala: ${scanResult.dugaan_gejala}. Tindakan: ${scanResult.rekomendasi_tindakan}`;
    setRecordNotes(aiNote);

    try {
      localStorage.setItem('petapakan_pending_ai_condition', matchedCondition);
      localStorage.setItem('petapakan_pending_ai_note', aiNote);
    } catch {}

    if (initialTab === 'health') {
      window.location.href = '/dashboard/peternak/recording';
      return;
    }

    setActiveTab('recording');

    setFeedbackNotice({
      type: 'success',
      message: '✓ Hasil diagnosis & saran tindakan AI berhasil diterapkan ke Form Recording Harian!',
    });
    setTimeout(() => setFeedbackNotice(null), 4000);

    // Scroll halus ke form recording
    setTimeout(() => {
      const formElem = document.getElementById('form-recording-harian');
      if (formElem) {
        formElem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // 10. Handler: Tambah Unit Kandang
  const handleCreateKandang = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKandangName.trim()) {
      setFeedbackNotice({ type: 'error', message: 'Nama unit kandang wajib diisi.' });
      return;
    }

    try {
      const payload: CreateKandangPayload = {
        name: newKandangName.trim(),
        house_type: newKandangType,
        strain: newKandangStrain.trim(),
        initial_population: Number(newKandangPop) || 2000,
        chick_in_date: newKandangDate,
        age_weeks: Number(newKandangAge) || 20,
      };

      const created = createKandangUnit(currentUser.id, payload);
      const updatedUnits = loadKandangUnits(currentUser.id);
      setKandangs(updatedUnits);
      setIsAddKandangOpen(false);
      setNewKandangName('');

      setFeedbackNotice({
        type: 'success',
        message: `✓ Unit kandang "${created.name}" (${created.initial_population.toLocaleString('id-ID')} ekor) berhasil ditambahkan!`,
      });
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch {
      setFeedbackNotice({ type: 'error', message: 'Gagal membuat unit kandang.' });
    }
  };

  // 11. Handler: Hapus Unit Kandang
  const handleDeleteKandang = () => {
    if (!targetKandangToDelete) return;
    const target = kandangs.find((k) => k.id === targetKandangToDelete);
    if (!target) return;

    const res = deleteKandangUnit(targetKandangToDelete);
    if (!res.success) {
      setFeedbackNotice({ type: 'error', message: res.message || 'Gagal menghapus kandang.' });
      return;
    }

    const updatedUnits = loadKandangUnits(currentUser.id);
    const updatedLogs = loadDailyRecordings(currentUser.id);
    setKandangs(updatedUnits);
    setRecordings(updatedLogs);
    if (selectedKandangId === targetKandangToDelete) {
      setSelectedKandangId('all');
    }
    if (recordKandangId === targetKandangToDelete && updatedUnits.length > 0) {
      setRecordKandangId(updatedUnits[0].id);
    }

    setIsDeleteKandangOpen(false);
    setFeedbackNotice({
      type: 'success',
      message: `✓ Unit kandang "${target.name}" beserta ${res.deletedLogsCount} riwayat log recording berhasil dihapus.`,
    });
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  // 12. Handler: Simpan Recording Harian
  const handleSaveRecording = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordKandangId) {
      setFeedbackNotice({ type: 'error', message: 'Silakan pilih unit kandang terlebih dahulu.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateRecordingPayload = {
        kandang_id: recordKandangId,
        date: recordDate,
        dead_count: Number(recordDead) || 0,
        cull_count: Number(recordCull) || 0,
        intact_egg_kg: Number(recordEggKg) || 0,
        intact_egg_count: Number(recordEggCount) || 0,
        broken_egg_kg: Number(recordBrokenKg) || 0,
        feed_kg: Number(recordFeedKg) || 0,
        feed_type: recordFeedType,
        condition_note: recordCondition,
        notes: recordNotes.trim(),
      };

      const res = addDailyRecording(currentUser.id, payload);
      const updatedLogs = loadDailyRecordings(currentUser.id);
      const updatedUnits = loadKandangUnits(currentUser.id);
      setRecordings(updatedLogs);
      setKandangs(updatedUnits);

      setFeedbackNotice({
        type: 'success',
        message: `✓ Log recording harian tanggal ${res.date} berhasil disimpan! (HDP: ${res.hdp_percent}%, FCR: ${res.fcr})`,
      });
      setTimeout(() => setFeedbackNotice(null), 4000);

      setRecordDead(0);
      setRecordCull(0);
      setRecordNotes('');
    } catch (err: unknown) {
      setFeedbackNotice({ type: 'error', message: (err as Error)?.message || 'Gagal menyimpan recording.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 13. Handler: Hapus Baris Recording
  const handleDeleteLog = (logId: string) => {
    deleteDailyRecording(logId);
    const updatedLogs = loadDailyRecordings(currentUser.id);
    const updatedUnits = loadKandangUnits(currentUser.id);
    setRecordings(updatedLogs);
    setKandangs(updatedUnits);
    setFeedbackNotice({ type: 'info', message: 'Log recording berhasil dihapus.' });
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  // 14. Handler: Export CSV
  const handleExportCsv = () => {
    const csvContent = exportRecordingsToCsv(recordings);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Recording_Layer_${currentUser.business_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Split Navigation Menu Sidebar Items
  const navMenuItems = [
    {
      group: 'MANAJEMEN KANDANG',
      items: [
        {
          label: 'Ringkasan Kandang',
          icon: LayoutDashboard,
          active: false,
          badge: null,
          href: '/dashboard/peternak',
        },
        {
          label: 'Resep Ransum AI',
          icon: BookOpen,
          active: false,
          badge: `${savedRansums.length} Resep`,
          href: '/dashboard/peternak',
        },
        {
          label: 'Pakan Sekitar Kandang',
          icon: Layers,
          active: false,
          badge: 'Radius 15km',
          href: '/dashboard/peternak',
        },
        {
          label: 'Simulasi Usaha Layer',
          icon: Calculator,
          active: false,
          badge: 'Baru',
          href: '/dashboard/peternak/simulasi',
        },
        {
          label: 'Recording Harian',
          icon: ClipboardList,
          active: initialTab === 'recording',
          badge: 'Harian',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold',
          href: '/dashboard/peternak/recording',
        },
        {
          label: 'AI Health Scan',
          icon: ScanEye,
          active: initialTab === 'health',
          badge: 'AI Vision',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold',
          href: '/dashboard/peternak/health-scan',
        },
      ],
    },
    {
      group: 'KEANGGOTAAN & BIAYA',
      items: [
        {
          label: 'Langganan & Pembayaran',
          icon: CreditCard,
          active: false,
          badge: currentUser.subscription_status === 'active' ? 'Pro Aktif' : 'Menunggu',
          badgeColor: currentUser.subscription_status === 'active'
            ? 'bg-emerald-500/20 text-emerald-300'
            : 'bg-amber-500/20 text-amber-300',
          href: '/dashboard/peternak',
        },
        {
          label: 'Status Verifikasi Akun',
          icon: ShieldCheck,
          active: false,
          badge: currentUser.is_verified ? 'Terverifikasi' : 'Perlu Verif',
          badgeColor: currentUser.is_verified
            ? 'bg-emerald-500/20 text-emerald-300'
            : 'bg-amber-500/20 text-amber-300',
          href: '/dashboard/peternak',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#070d0b] text-slate-100 flex flex-col font-sans">
      <Navbar currentRegionName={currentUser.business_name} />

      {/* Mobile Menu Header Toggle */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0a1410] border-b border-emerald-950/80 shrink-0">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>{isMobileMenuOpen ? 'Tutup Menu' : 'Menu Peternak'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            {activeTab === 'health' ? 'AI Vision' : 'Recording'}
          </span>
          <span
            suppressHydrationWarning
            className="text-xs font-bold text-white truncate max-w-[130px]"
          >
            {currentUser.name}
          </span>
        </div>
      </div>

      {/* Main Body Split Screen: Sidebar + Content */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* ================================================================= */}
        {/* SIDE MENU (SIDEBAR)                                               */}
        {/* ================================================================= */}
        <aside
          className={`${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:static z-40 top-[57px] bottom-0 left-0 w-72 bg-[#0A1410] border-r border-[#1E352B] flex flex-col shrink-0 overflow-y-auto`}
        >
          {/* Top: Profile Card */}
          <div className="p-4 border-b border-[#1E352B]">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900/60 border border-emerald-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-md text-xl">
                👨‍🌾
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 suppressHydrationWarning className="text-xs font-bold text-white truncate">
                    {currentUser.name}
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                </div>
                <p suppressHydrationWarning className="text-[10px] text-emerald-300 font-semibold truncate">
                  {currentUser.business_name}
                </p>
                <p suppressHydrationWarning className="text-[9px] text-slate-400 truncate">
                  {currentUser.poultry_capacity ? `Kapasitas: ${currentUser.poultry_capacity.toLocaleString('id-ID')} Ekor` : 'Unit Peternakan Unggas'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-5 flex-1">
            {navMenuItems.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <span className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  {group.group}
                </span>
                <div className="space-y-0.5 pt-1">
                  {group.items.map((item, itemIdx) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={itemIdx}
                        href={item.href}
                        onClick={(e) => {
                          setIsMobileMenuOpen(false);
                          if ((item as any).onClick) {
                            (item as any).onClick();
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          item.active
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                            : 'text-slate-300 hover:bg-[#13231C] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${item.active ? 'text-slate-950' : 'text-emerald-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md ${
                              item.active
                                ? 'bg-slate-950/20 text-slate-950 border border-slate-950/30'
                                : (item as any).badgeColor ||
                                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom Quick Hub Links */}
          <div className="p-3 border-t border-[#1E352B] bg-[#08120e]">
            <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Pintasan Platform
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <Link
                href="/dashboard/peternak/simulasi"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-[#0F1D17] hover:bg-[#162a21] text-[11px] font-medium text-emerald-300 border border-emerald-500/20 transition-colors"
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Simulasi HPP</span>
              </Link>
              <Link
                href="/peta"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-[#0F1D17] hover:bg-[#162a21] text-[11px] font-medium text-slate-300 hover:text-white border border-[#1E352B] transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Peta Pakan</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}

        {/* ================================================================= */}
        {/* MAIN DASHBOARD CONTENT AREA                                       */}
        {/* ================================================================= */}
        <main className="flex-1 overflow-y-auto bg-[#060D0A] p-4 lg:p-6 space-y-6">
          {currentUser && !currentUser.is_verified ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Link href="/dashboard/peternak" className="hover:text-emerald-400">
                  Portal Peternak
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-emerald-400 font-semibold">
                  {activeTab === 'recording' ? 'Recording Harian Layer' : 'AI Health Vision Scan'}
                </span>
              </div>
              <UnverifiedAccountNotice
                user={currentUser}
                featureName={activeTab === 'recording' ? 'Recording Harian Layer' : 'AI Health Vision Scan'}
                onRefresh={() => {
                  const loaded = loadUsersFromStorage();
                  const activeId = getActiveUserId();
                  const activeUser = loaded.find((u) => u.id === activeId);
                  if (activeUser) setCurrentUser(activeUser);
                }}
              />
            </div>
          ) : (
            <>
              {/* Breadcrumb & Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E352B]">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Link href="/dashboard/peternak" className="hover:text-emerald-400">
                  Portal Peternak
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-emerald-400 font-semibold">
                  {activeTab === 'recording' ? 'Recording Harian Layer' : 'AI Health Vision Scan'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  {activeTab === 'recording' ? (
                    <>
                      <ClipboardList className="w-6 h-6 text-emerald-400 shrink-0" />
                      Recording Harian & Analitik Layer
                    </>
                  ) : (
                    <>
                      <ScanEye className="w-6 h-6 text-emerald-400 shrink-0" />
                      AI Health Vision Scanner Layer
                    </>
                  )}
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {activeTab === 'recording' ? 'Log & Performa Harian' : 'Groq Vision AI Active'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeTab === 'recording'
                  ? 'Pencatatan produksi telur harian (HDP, FCR, Deplesi) dan monitoring tren performa kandang layer'
                  : 'Monitoring kesehatan ayam layer berbasis AI Vision multimodal (Groq) & deteksi gejala klinis secara instan'}
              </p>
            </div>

            {/* Header Right Actions: Filter Kandang + Tambah + Hapus + Export */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Unit Kandang Filter Dropdown */}
              <div className="flex items-center gap-1.5 bg-[#0F1D17] px-3 py-1.5 rounded-xl border border-[#1E352B]">
                <Filter className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-medium text-slate-400">Unit:</span>
                <select
                  value={selectedKandangId}
                  onChange={(e) => setSelectedKandangId(e.target.value)}
                  className="bg-transparent text-xs text-emerald-300 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#0A1410] text-slate-200">
                    Semua Kandang ({userKandangs.length})
                  </option>
                  {userKandangs.map((k) => (
                    <option key={k.id} value={k.id} className="bg-[#0A1410] text-slate-200">
                      {k.name} ({k.house_type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tombol Tambah Kandang */}
              <button
                onClick={() => setIsAddKandangOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Kandang</span>
              </button>

              {/* Tombol Hapus Kandang */}
              <button
                onClick={() => setIsDeleteKandangOpen(true)}
                disabled={userKandangs.length <= 1}
                title={userKandangs.length <= 1 ? 'Minimal harus tersisa 1 unit kandang' : 'Hapus unit kandang'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 font-semibold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Kandang</span>
              </button>

              {/* Tombol Export CSV */}
              {activeTab === 'recording' && (
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F1D17] hover:bg-[#162A21] text-slate-300 hover:text-white border border-[#1E352B] font-semibold text-xs transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              )}
            </div>
          </div>



          {/* Feedback Banner Notification */}
          {feedbackNotice && (
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
                feedbackNotice.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : feedbackNotice.type === 'error'
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  : 'bg-blue-950/60 border-blue-500/40 text-blue-200'
              }`}
            >
              <span>{feedbackNotice.message}</span>
              <button onClick={() => setFeedbackNotice(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 1: RECORDING HARIAN & ANALITIK (TAMPIL LANGSUNG DI ATAS)     */}
          {/* ================================================================= */}
          {activeTab === 'recording' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* SECTION: STATUS UNIT KANDANG AKTIF (GRID CARDS) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    Status Unit Kandang Aktif ({userKandangs.length} Unit)
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    Klik kartu untuk memfilter log & grafik secara langsung
                  </span>
                </div>

                {userKandangs.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#0F1D17] border border-[#1E352B] text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Belum Ada Unit Kandang</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                        Mulai dengan menambahkan unit kandang pertama Anda (nama kandang, strain ayam, populasi awal, dan umur) untuk mencatat recording harian.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddKandangOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Tambah Unit Kandang Pertama</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {userKandangs.map((k) => {
                      const isSelected = selectedKandangId === k.id;
                      const livePop = k.current_population || k.initial_population;
                      const rate = k.initial_population > 0 ? ((livePop / k.initial_population) * 100).toFixed(1) : '100';

                      return (
                        <div
                          key={k.id}
                          onClick={() => setSelectedKandangId(isSelected ? 'all' : k.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#122b20] to-[#0A1410] border-emerald-500 shadow-lg shadow-emerald-500/10'
                              : 'bg-[#0F1D17] hover:bg-[#13261e] border-[#1E352B]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-sm font-bold text-white">{k.name}</h3>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    k.house_type === 'Closed House'
                                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                      : k.house_type === 'Semi-Closed'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  }`}
                                >
                                  {k.house_type}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Strain: <span className="text-slate-300 font-semibold">{k.strain}</span> • Umur: {k.age_weeks} Minggu
                              </p>
                            </div>

                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-slate-950">
                                Aktif
                              </span>
                            )}
                          </div>

                          {/* Population bar */}
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Populasi Hidup:</span>
                              <span className="font-bold text-emerald-300">
                                {livePop.toLocaleString('id-ID')} / {k.initial_population.toLocaleString('id-ID')} ekor
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${Math.min(100, Math.max(0, Number(rate)))}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-slate-500">
                              <span>Daya Hidup: {rate}%</span>
                              <span>Chick-in: {k.chick_in_date}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION: 4 KARTU KPI UTAMA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Card 1: Populasi Hidup */}
                <div className="p-4 rounded-2xl bg-[#0F1D17] border border-[#1E352B] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Populasi Hidup</span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-white">
                        {kpiData.currentPopTotal.toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs text-slate-400">ekor</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {kpiData.survivalRate.toFixed(1)}% Daya Hidup
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Awal: {kpiData.initialPopTotal.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Produksi Telur */}
                <div className="p-4 rounded-2xl bg-[#0F1D17] border border-[#1E352B] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Produksi Telur Terbaru</span>
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Egg className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-white">
                        {kpiData.todayEggKg.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-400">kg/hari</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        HDP {kpiData.todayHdp.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {kpiData.todayEggCount.toLocaleString('id-ID')} butir ({kpiData.avgEggWeight.toFixed(1)}g)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Pakan & FCR Harian */}
                <div className="p-4 rounded-2xl bg-[#0F1D17] border border-[#1E352B] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Pakan & FCR Harian</span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Scale className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-white">
                        {kpiData.fcr.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400">FCR</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${kpiData.fcrBadgeColor}`}>
                        {kpiData.fcrStatus}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {kpiData.todayFeedKg} kg ({kpiData.feedIntakeGram.toFixed(0)} g/ekor)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Deplesi & Telur Retak */}
                <div className="p-4 rounded-2xl bg-[#0F1D17] border border-[#1E352B] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Deplesi & Telur Retak</span>
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-white">
                        {(kpiData.totalDeadAccum + kpiData.totalCullAccum).toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs text-slate-400">ekor deplesi</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Deplesi {kpiData.deplesiRate.toFixed(2)}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Retak {kpiData.todayBrokenKg.toFixed(1)} kg ({kpiData.brokenRate.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK SHORTCUT BANNER KE AI HEALTH SCAN */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#0F1D17] to-slate-900/60 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                    <ScanEye className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Periksa Kesehatan Ayam dengan AI Vision?</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-slate-950">
                        Groq Vision
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Foto ayam panting (heat stress), mata berair, atau kotoran encer untuk memperoleh diagnosis dokter hewan instan.
                    </span>
                  </div>
                </div>
                <Link
                  href="/dashboard/peternak/health-scan"
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>Buka AI Health Scanner</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* SECTION: FORM INPUT RECORDING & GRAFIK (2 KOLOM LANGSUNG TERLIHAT) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* KOLOM KIRI (5 Kolom): FORM INPUT RECORDING HARIAN */}
                <div
                  id="form-recording-harian"
                  className="lg:col-span-5 bg-[#0F1D17] border border-[#1E352B] rounded-2xl p-4 lg:p-5 space-y-4 shadow-xl"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#1E352B]">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-emerald-400" />
                      <h2 className="text-sm font-bold text-white">Input Recording Harian</h2>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(recordDate).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <form onSubmit={handleSaveRecording} className="space-y-3.5 text-xs">
                    {/* Tanggal & Pilihan Unit Kandang */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          Tanggal Catat:
                        </label>
                        <input
                          type="date"
                          value={recordDate}
                          onChange={(e) => setRecordDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#091510] border border-[#1E352B] text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                          Unit Kandang:
                        </label>
                        <select
                          value={recordKandangId}
                          onChange={(e) => setRecordKandangId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#091510] border border-[#1E352B] text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
                          required
                          disabled={userKandangs.length === 0}
                        >
                          {userKandangs.length === 0 ? (
                            <option value="">-- Belum ada unit kandang --</option>
                          ) : (
                            userKandangs.map((k) => (
                              <option key={k.id} value={k.id}>
                                {k.name} ({k.current_population || k.initial_population} ekor)
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Populasi Berjalan Info Pill */}
                    {activeFormKandang && (
                      <div className="p-2.5 rounded-xl bg-[#09140f] border border-[#1E352B] flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Populasi Aktif Kandang:</span>
                        <span className="font-bold text-emerald-300">
                          {(activeFormKandang.current_population || activeFormKandang.initial_population).toLocaleString('id-ID')} ekor
                        </span>
                      </div>
                    )}

                    {/* Mortalitas: Ayam Mati & Afkir */}
                    <div className="p-3 rounded-xl bg-[#09140f] border border-[#1E352B] space-y-2">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                        Kematian & Afkir (Deplesi Hari Ini):
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300">Ayam Mati (ekor):</label>
                          <input
                            type="number"
                            min="0"
                            value={recordDead}
                            onChange={(e) => setRecordDead(Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#0F1D17] border border-[#1E352B] text-white focus:outline-none focus:border-rose-500 font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300">Ayam Afkir (ekor):</label>
                          <input
                            type="number"
                            min="0"
                            value={recordCull}
                            onChange={(e) => setRecordCull(Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#0F1D17] border border-[#1E352B] text-white focus:outline-none focus:border-rose-500 font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Produksi Telur Utuh (Kg & Butir) */}
                    <div className="p-3 rounded-xl bg-[#09140f] border border-[#1E352B] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                          Produksi Telur Utuh:
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400">
                          Live HDP: {formPreview.hdp}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300">Berat Total (kg):</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={recordEggKg}
                            onChange={(e) => handleEggKgChange(Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#0F1D17] border border-[#1E352B] text-white focus:outline-none focus:border-amber-500 font-bold"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300">Jumlah Butir (est):</label>
                          <input
                            type="number"
                            min="0"
                            value={recordEggCount}
                            onChange={(e) => setRecordEggCount(Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#0F1D17] border border-[#1E352B] text-white focus:outline-none focus:border-amber-500 font-bold"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1 pt-1">
                        <label className="text-[11px] text-slate-300">Telur Retak / Bentes (kg):</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={recordBrokenKg}
                          onChange={(e) => setRecordBrokenKg(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0F1D17] border border-[#1E352B] text-slate-300 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Konsumsi Pakan & Resep */}
                    <div className="p-3 rounded-xl bg-[#09140f] border border-[#1E352B] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                          Konsumsi Pakan Hari Ini:
                        </span>
                        <span className="text-[10px] font-bold text-emerald-300">
                          Est. FCR: {formPreview.fcr} ({formPreview.feedIntake} g/ekor)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300">Jumlah Pakan (kg):</label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={recordFeedKg}
                            onChange={(e) => setRecordFeedKg(Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#0F1D17] border border-[#1E352B] text-white focus:outline-none focus:border-emerald-500 font-bold"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300">Resep Ransum:</label>
                          <select
                            value={recordFeedType}
                            onChange={(e) => setRecordFeedType(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-[#0F1D17] border border-[#1E352B] text-slate-200 focus:outline-none focus:border-emerald-500 text-xs truncate"
                          >
                            <option value="Ransum be-ternak AI #1">Ransum be-ternak AI #1</option>
                            <option value="Ransum be-ternak AI #2">Ransum be-ternak AI #2</option>
                            {savedRansums.map((r) => (
                              <option key={r.id} value={r.title}>
                                {r.title}
                              </option>
                            ))}
                            <option value="Konsentrat Pabrikan Komplit">Konsentrat Pabrikan Komplit</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Kondisi Kandang & Catatan Tambahan (Bisa auto-fill dari AI Health Vision) */}
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                          <span>Kondisi Umum / Status Cuaca:</span>
                          {recordCondition !== 'Normal' && (
                            <span className="text-[10px] text-amber-400 font-bold">
                              Status Khusus Terpilih
                            </span>
                          )}
                        </label>
                        <select
                          value={recordCondition}
                          onChange={(e) => setRecordCondition(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#091510] border border-[#1E352B] text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
                        >
                          <option value="Normal">Normal (Sehat Optimal)</option>
                          <option value="Vitamin Anti-Stres">Diberikan Vitamin Anti-Stres</option>
                          <option value="Heat Stress">Heat Stress (Suhu Siang Panas)</option>
                          <option value="Vaksin ND-IB">Jadwal Vaksinasi ND-IB</option>
                          <option value="Sakit / Perlu Karantina">Sakit / Perlu Karantina & Pengobatan</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-emerald-400" />
                            Catatan Khusus (Tersinkron AI Vision):
                          </span>
                          {recordNotes && (
                            <button
                              type="button"
                              onClick={() => setRecordNotes('')}
                              className="text-[10px] text-slate-400 hover:text-rose-400"
                            >
                              Hapus Catatan
                            </button>
                          )}
                        </label>
                        <textarea
                          rows={3}
                          value={recordNotes}
                          onChange={(e) => setRecordNotes(e.target.value)}
                          placeholder="Catatan tambahan penanganan pakan, kebersihan kotoran, atau hasil AI Vision..."
                          className="w-full px-3 py-2 rounded-xl bg-[#091510] border border-[#1E352B] text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                        />
                      </div>
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || userKandangs.length === 0}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span>
                        {userKandangs.length === 0
                          ? '+ Tambah Unit Kandang Terlebih Dahulu'
                          : isSubmitting
                          ? 'Menyimpan Recording...'
                          : 'Simpan Log Recording Harian'}
                      </span>
                    </button>
                  </form>
                </div>

                {/* KOLOM KANAN (7 Kolom): GRAFIK TREN HDP & FCR HARIAN */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Chart 1: Tren HDP (%) vs Target Standar Breeder */}
                  <div className="p-4 rounded-2xl bg-[#0F1D17] border border-[#1E352B] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1E352B]">
                      <div>
                        <h3 className="text-xs font-bold text-white flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          Tren Hen-Day Production (HDP %) vs Standar Breeder
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          Standar puncak produksi strain Lohmann & ISA Brown (88% - 92%)
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Realisasi HDP
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <span className="w-2.5 h-0.5 bg-amber-400" /> Target Min (88%)
                        </span>
                      </div>
                    </div>

                    <div className="h-56 w-full pt-2">
                      {chartHdpData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartHdpData}>
                            <defs>
                              <linearGradient id="colorHdp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E352B" />
                            <XAxis dataKey="label" stroke="#64748B" fontSize={10} />
                            <YAxis domain={[75, 100]} stroke="#64748B" fontSize={10} unit="%" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#0A1410',
                                borderColor: '#1E352B',
                                borderRadius: '12px',
                                fontSize: '11px',
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="target_min"
                              stroke="#F59E0B"
                              strokeDasharray="4 4"
                              strokeWidth={1.5}
                              dot={false}
                              name="Target Min Breeder (88%)"
                            />
                            <Area
                              type="monotone"
                              dataKey="hdp"
                              stroke="#10B981"
                              strokeWidth={2.5}
                              fillOpacity={1}
                              fill="url(#colorHdp)"
                              name="HDP Aktual (%)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-slate-500">
                          Belum ada data rekaman untuk ditampilkan pada grafik.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chart 2: Konsumsi Pakan (kg) & FCR Harian */}
                  <div className="p-4 rounded-2xl bg-[#0F1D17] border border-[#1E352B] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1E352B]">
                      <div>
                        <h3 className="text-xs font-bold text-white flex items-center gap-2">
                          <Scale className="w-4 h-4 text-emerald-400" />
                          Konsumsi Pakan Harian & Efisiensi FCR
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          Rasio konversi pakan terhadap bobot telur (Target FCR &le; 2.15)
                        </p>
                      </div>
                    </div>

                    <div className="h-52 w-full pt-2">
                      {chartHdpData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartHdpData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E352B" />
                            <XAxis dataKey="label" stroke="#64748B" fontSize={10} />
                            <YAxis yAxisId="left" stroke="#64748B" fontSize={10} unit=" kg" />
                            <YAxis yAxisId="right" orientation="right" domain={[1.8, 2.5]} stroke="#F59E0B" fontSize={10} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#0A1410',
                                borderColor: '#1E352B',
                                borderRadius: '12px',
                                fontSize: '11px',
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="feedKg"
                              stroke="#34D399"
                              strokeWidth={2}
                              dot={{ r: 3 }}
                              name="Pakan Terpakai (kg)"
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="fcr"
                              stroke="#F59E0B"
                              strokeWidth={2}
                              dot={{ r: 3 }}
                              name="FCR Harian"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-slate-500">
                          Belum ada data pakan untuk ditampilkan.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: TABEL RIWAYAT RECORDING HARIAN */}
              <div className="rounded-2xl bg-[#0F1D17] border border-[#1E352B] p-4 lg:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1E352B]">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">
                      Riwayat Log Recording Kandang ({filteredRecordings.length} Entri)
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Cari tanggal / catatan..."
                      value={searchTableQuery}
                      onChange={(e) => setSearchTableQuery(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-[#091510] border border-[#1E352B] text-slate-200 text-xs focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#1E352B] text-slate-400 font-semibold text-[11px] bg-[#09140f]">
                        <th className="py-2.5 px-3">Tanggal</th>
                        <th className="py-2.5 px-3">Kandang</th>
                        <th className="py-2.5 px-3 text-right">Populasi</th>
                        <th className="py-2.5 px-3 text-right">Mati / Afkir</th>
                        <th className="py-2.5 px-3 text-right">Telur Utuh</th>
                        <th className="py-2.5 px-3 text-right">HDP (%)</th>
                        <th className="py-2.5 px-3 text-right">Pakan (kg)</th>
                        <th className="py-2.5 px-3 text-right">FCR</th>
                        <th className="py-2.5 px-3">Kondisi / Catatan AI</th>
                        <th className="py-2.5 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E352B]">
                      {filteredRecordings.length > 0 ? (
                        filteredRecordings.map((log) => (
                          <tr key={log.id} className="hover:bg-[#12241b] transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-slate-200 whitespace-nowrap">
                              {log.date}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-emerald-300 whitespace-nowrap">
                              {log.kandang_name}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-300">
                              {log.final_population.toLocaleString('id-ID')}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {log.dead_count > 0 || log.cull_count > 0 ? (
                                <span className="text-rose-400 font-bold">
                                  {log.dead_count} / {log.cull_count}
                                </span>
                              ) : (
                                <span className="text-slate-500">0</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-white whitespace-nowrap">
                              {log.intact_egg_kg.toFixed(1)} kg ({log.intact_egg_count.toLocaleString('id-ID')} btr)
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  log.hdp_percent >= 88
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {log.hdp_percent.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-semibold text-slate-300">
                              {log.feed_kg} kg
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  log.fcr <= 2.10
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-blue-500/20 text-blue-300'
                                }`}
                              >
                                {log.fcr.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 max-w-xs">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-slate-300 text-[11px] truncate">
                                  {log.condition_note}
                                </span>
                                {log.notes && (
                                  <span className="text-[10px] text-slate-400 truncate" title={log.notes}>
                                    {log.notes}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => handleDeleteLog(log.id)}
                                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                                title="Hapus baris log ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-slate-500">
                            Tidak ada riwayat recording yang cocok dengan filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: AI HEALTH VISION SCANNER (FULL SCREEN EXPERIENCE)         */}
          {/* ================================================================= */}
          {activeTab === 'health' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* STATUS UNIT KANDANG AKTIF RINGKAS */}
              <div className="p-3.5 rounded-2xl bg-[#0F1D17] border border-[#1E352B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Target Pemeriksaan:{' '}
                      <span className="text-emerald-400 font-black">
                        {activeFormKandang?.name || 'Kandang Utama'}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Tipe: {activeFormKandang?.house_type || 'Open House'} • Strain: {activeFormKandang?.strain || 'ISA Brown'} • Populasi:{' '}
                      {(activeFormKandang?.current_population || 2500).toLocaleString('id-ID')} ekor
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Ganti Unit Kandang:</span>
                  <select
                    value={recordKandangId}
                    onChange={(e) => setRecordKandangId(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#091510] border border-[#1E352B] text-emerald-300 text-xs font-semibold focus:outline-none"
                  >
                    {userKandangs.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name} ({k.house_type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DEDICATED AI HEALTH VISION SCANNER CARD */}
              <div className="rounded-2xl bg-gradient-to-br from-[#0c2419] via-[#0F1D17] to-[#0A1410] border-2 border-emerald-500/40 p-4 lg:p-6 shadow-2xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-950">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-lg">
                      <ScanEye className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-black text-white">AI Health Vision Scanner</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                          Groq Multimodal
                        </span>
                      </div>
                      <p className="text-xs text-emerald-300/80">
                        Pemeriksaan klinis veteriner otomatis berbasis citra visual (mata, jengger, paruh panting, bulu, feses)
                      </p>
                    </div>
                  </div>

                  {/* Scan button */}
                  <button
                    onClick={handleExecuteScan}
                    disabled={isScanning || !scanImageBase64}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Menganalisis Klinis...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Mulai Analisis AI Sekarang</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Presets and Upload Input */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Kolom Kiri: Pilihan Sampel Preset & Upload */}
                  <div className="lg:col-span-7 space-y-4">
                    <div>
                      <span className="text-[11px] font-bold text-slate-300 block mb-2 uppercase tracking-wider">
                        Pilih Sampel Preset Klinis (Uji Coba Langsung 1-Klik):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {VISION_SAMPLE_PRESETS.map((preset) => {
                          const isSelected = selectedPresetId === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleSelectPreset(preset)}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
                                  : 'bg-[#091510] hover:bg-[#11241c] border-[#1E352B]'
                              }`}
                            >
                              <div>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border inline-block mb-1.5 ${preset.badgeColor}`}>
                                  {preset.badge}
                                </span>
                                <div className="text-xs font-bold text-white line-clamp-1">
                                  {preset.title}
                                </div>
                                <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                                  {preset.sublabel}
                                </div>
                              </div>
                              <div className="mt-2.5 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
                                <span>Pilih Preset</span>
                                {isSelected ? <Check className="w-4 h-4 text-emerald-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Upload Foto Mandiri */}
                    <div className="pt-1">
                      <span className="text-[11px] font-bold text-slate-300 block mb-2 uppercase tracking-wider">
                        Atau Ambil Foto Langsung dari Kandang Anda:
                      </span>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0F1D17] hover:bg-[#162A21] border border-[#1E352B] text-slate-200 text-xs font-semibold cursor-pointer shadow-md"
                        >
                          <Upload className="w-4 h-4 text-emerald-400" />
                          <span>Upload File Foto (Galeri/PC)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (fileInputRef.current) {
                              fileInputRef.current.setAttribute('capture', 'environment');
                              fileInputRef.current.click();
                            }
                          }}
                          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0F1D17] hover:bg-[#162A21] border border-[#1E352B] text-slate-200 text-xs font-semibold cursor-pointer shadow-md"
                        >
                          <Camera className="w-4 h-4 text-emerald-400" />
                          <span>Buka Kamera HP Langsung</span>
                        </button>
                      </div>
                    </div>

                    {scanError && (
                      <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{scanError}</span>
                      </div>
                    )}
                  </div>

                  {/* Kolom Kanan: Preview Citra & Scanning Animation */}
                  <div className="lg:col-span-5 flex flex-col justify-center">
                    <div className="relative w-full h-52 sm:h-56 rounded-2xl bg-slate-950 border border-emerald-900/60 overflow-hidden flex items-center justify-center shadow-inner">
                      {scanImagePreview ? (
                        <>
                          <img
                            src={scanImagePreview}
                            alt="Preview Scanner"
                            className="w-full h-full object-contain"
                          />

                          {/* Scanning Laser Line Effect */}
                          {isScanning && (
                            <div className="absolute inset-0 pointer-events-none">
                              <div className="w-full h-1 bg-gradient-to-r from-emerald-500 via-emerald-300 to-emerald-500 shadow-lg shadow-emerald-400 animate-pulse relative top-1/2 -translate-y-1/2" />
                              <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
                            </div>
                          )}

                          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-900/80 text-emerald-300 border border-emerald-500/30">
                            {isScanning ? 'Menganalisis Visual...' : 'Citra Siap Di-scan'}
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6 text-slate-500 space-y-1.5">
                          <Camera className="w-10 h-10 mx-auto text-slate-600" />
                          <p className="text-xs font-semibold text-slate-400">Belum ada foto yang dipilih</p>
                          <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
                            Pilih salah satu sampel di samping atau upload foto ayam Anda untuk memulai diagnosis
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Diagnosis Result View */}
                {scanResult && (
                  <div className="mt-4 p-5 rounded-2xl bg-[#07130e] border border-emerald-500/40 space-y-4 animate-in fade-in slide-in-from-top-2 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <Stethoscope className="w-6 h-6 text-emerald-400 shrink-0" />
                        <div>
                          <span className="text-[11px] text-slate-400 font-semibold block">
                            Hasil Analisis Klinis Dokter Hewan AI:
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-white">
                            {scanResult.status_kondisi}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            scanResult.tingkat_risiko === 'Kritis'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : scanResult.tingkat_risiko === 'Waspada'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          Tingkat Risiko: {scanResult.tingkat_risiko}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-900/60 px-2 py-1 rounded-md border border-slate-800">
                          {scanResult.model_used || 'Groq Vision'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                      <div className="p-3.5 rounded-xl bg-[#0c1a14] border border-[#1E352B] space-y-1.5">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <Eye className="w-4 h-4" />
                          Dugaan Temuan Visual Klinis:
                        </span>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          {scanResult.dugaan_gejala}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#0c1a14] border border-[#1E352B] space-y-1.5">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <HeartPulse className="w-4 h-4" />
                          Rekomendasi Tindakan Veteriner:
                        </span>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          {scanResult.rekomendasi_tindakan}
                        </p>
                      </div>
                    </div>

                    {/* Tombol Terapkan ke Form Recording */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#1E352B]">
                      <span className="text-[11px] text-slate-400">
                        Klik tombol di bawah untuk langsung menyinkronkan status kondisi & rekomendasi ini ke Form Recording.
                      </span>
                      <button
                        type="button"
                        onClick={handleApplyToForm}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Terapkan Hasil ke Form Recording Harian →</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODAL: TAMBAH KANDANG BARU                                        */}
          {/* ================================================================= */}
          {isAddKandangOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#0A1410] border border-emerald-500/40 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-[#1E352B]">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Tambah Unit Kandang Baru</h3>
                  </div>
                  <button
                    onClick={() => setIsAddKandangOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateKandang} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Nama Unit Kandang:</label>
                    <input
                      type="text"
                      placeholder="Contoh: Kandang C (Closed House)"
                      value={newKandangName}
                      onChange={(e) => setNewKandangName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0F1D17] border border-[#1E352B] text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">Tipe Kandang:</label>
                      <select
                        value={newKandangType}
                        onChange={(e) => setNewKandangType(e.target.value as KandangHouseType)}
                        className="w-full px-3 py-2 rounded-xl bg-[#0F1D17] border border-[#1E352B] text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Open House">Open House</option>
                        <option value="Semi-Closed">Semi-Closed</option>
                        <option value="Closed House">Closed House</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">Strain Ayam:</label>
                      <input
                        type="text"
                        value={newKandangStrain}
                        onChange={(e) => setNewKandangStrain(e.target.value)}
                        placeholder="ISA Brown / Lohmann"
                        className="w-full px-3 py-2 rounded-xl bg-[#0F1D17] border border-[#1E352B] text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">Populasi Awal (ekor):</label>
                      <input
                        type="number"
                        min="100"
                        value={newKandangPop}
                        onChange={(e) => setNewKandangPop(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-[#0F1D17] border border-[#1E352B] text-white focus:outline-none focus:border-emerald-500 font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">Umur (Minggu):</label>
                      <input
                        type="number"
                        min="1"
                        value={newKandangAge}
                        onChange={(e) => setNewKandangAge(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-[#0F1D17] border border-[#1E352B] text-white focus:outline-none focus:border-emerald-500 font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Tanggal Chick-In / Pullet In:</label>
                    <input
                      type="date"
                      value={newKandangDate}
                      onChange={(e) => setNewKandangDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0F1D17] border border-[#1E352B] text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E352B]">
                    <button
                      type="button"
                      onClick={() => setIsAddKandangOpen(false)}
                      className="px-3 py-2 rounded-xl text-slate-400 hover:text-white"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                    >
                      Simpan Unit Kandang
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODAL: HAPUS UNIT KANDANG                                         */}
          {/* ================================================================= */}
          {isDeleteKandangOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#0A1410] border border-rose-600/40 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-[#1E352B]">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <h3 className="text-sm font-bold text-white">Konfirmasi Hapus Unit Kandang</h3>
                  </div>
                  <button
                    onClick={() => setIsDeleteKandangOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <p className="text-slate-300">
                    Pilih unit kandang yang ingin dihapus. Semua riwayat recording harian pada unit kandang ini akan ikut terhapus.
                  </p>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Pilih Unit Kandang:</label>
                    <select
                      value={targetKandangToDelete}
                      onChange={(e) => setTargetKandangToDelete(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0F1D17] border border-[#1E352B] text-white focus:outline-none focus:border-rose-500 font-bold"
                    >
                      {userKandangs.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.name} ({k.house_type} - {k.current_population || k.initial_population} ekor)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-[11px] leading-relaxed">
                    ⚠️ <strong>Perhatian:</strong> Tindakan ini permanen. Minimal harus tersisa 1 unit kandang aktif di peternakan Anda.
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E352B]">
                    <button
                      type="button"
                      onClick={() => setIsDeleteKandangOpen(false)}
                      className="px-3 py-2 rounded-xl text-slate-400 hover:text-white"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteKandang}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/30"
                    >
                      Hapus Permanen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          </>
          )}
        </main>
      </div>
    </div>
  );
}
