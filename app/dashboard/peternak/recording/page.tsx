'use client';

import React, { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
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
} from '@/lib/types';
import {
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

export default function DailyRecordingPage() {
  // 1. Data User & Akun Aktif
  const [users, setUsers] = useState<UserProfile[]>(() => loadUsersFromStorage());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const loaded = loadUsersFromStorage();
    return loaded.find((u) => u.role === 'peternak') || loaded[1] || null;
  });

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
  const [newKandangPop, setNewKandangPop] = useState<number>(2500);
  const [newKandangDate, setNewKandangDate] = useState('2026-11-24');
  const [newKandangAge, setNewKandangAge] = useState<number>(20);

  // 4. Form Input Recording Harian
  const [recordDate, setRecordDate] = useState<string>('2026-11-24');
  const [recordKandangId, setRecordKandangId] = useState<string>('');
  const [recordDead, setRecordDead] = useState<number>(0);
  const [recordCull, setRecordCull] = useState<number>(0);
  const [recordEggKg, setRecordEggKg] = useState<number>(140);
  const [recordEggCount, setRecordEggCount] = useState<number>(2240);
  const [recordBrokenKg, setRecordBrokenKg] = useState<number>(1.0);
  const [recordFeedKg, setRecordFeedKg] = useState<number>(275);
  const [recordFeedType, setRecordFeedType] = useState<string>('Ransum be-ternak AI #1');
  const [recordCondition, setRecordCondition] = useState<string>('Normal');
  const [recordNotes, setRecordNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Table filter query
  const [searchTableQuery, setSearchTableQuery] = useState('');

  // 5. Inisialisasi Data berdasarkan Akun Peternak
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
        : loadedUsers.find((u) => u.role === 'peternak') || loadedUsers[1] || null;

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
    }

    setFeedbackNotice({
      type: 'info',
      message: `Beralih ke akun ${target.name} (${target.business_name})`,
    });
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  // Kandang Aktif terpilih untuk info live di Form Input
  const activeInputKandang = useMemo(() => {
    return kandangs.find((k) => k.id === recordKandangId) || kandangs[0];
  }, [kandangs, recordKandangId]);

  // Live Calculations pada Form Input
  const liveFormPreview = useMemo(() => {
    if (!activeInputKandang) {
      return { finalPop: 0, hdp: 0, intake: 0, fcr: 0 };
    }
    const currentPop = activeInputKandang.current_population || activeInputKandang.initial_population;
    const finalPop = Math.max(0, currentPop - (Number(recordDead) || 0) - (Number(recordCull) || 0));
    const hdp = finalPop > 0 ? Number(((Number(recordEggCount) / finalPop) * 100).toFixed(1)) : 0;
    const intake = finalPop > 0 ? Number(((Number(recordFeedKg) * 1000) / finalPop).toFixed(1)) : 0;
    const totalEgg = Number(recordEggKg) + Number(recordBrokenKg);
    const fcr = totalEgg > 0 ? Number((Number(recordFeedKg) / totalEgg).toFixed(2)) : 0;

    return { finalPop, hdp, intake, fcr };
  }, [activeInputKandang, recordDead, recordCull, recordEggCount, recordFeedKg, recordEggKg, recordBrokenKg]);

  // Auto-sync Egg Kg & Egg Count (~62.5g/butir)
  const handleEggKgChange = (val: number) => {
    setRecordEggKg(val);
    if (val > 0) {
      const estimatedCount = Math.round((val * 1000) / 62.5);
      setRecordEggCount(estimatedCount);
    }
  };

  const handleEggCountChange = (val: number) => {
    setRecordEggCount(val);
    if (val > 0) {
      const estimatedKg = Number(((val * 62.5) / 1000).toFixed(1));
      setRecordEggKg(estimatedKg);
    }
  };

  // Filtered recordings sesuai dropdown unit kandang
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
    // Urutkan dari tanggal terbaru ke terlama untuk tampilan tabel
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [recordings, selectedKandangId, searchTableQuery]);

  // Filtered kandangs sesuai akun
  const userKandangs = useMemo(() => {
    return kandangs.filter((k) => k.user_id === currentUser?.id);
  }, [kandangs, currentUser]);

  // 6. Kalkulasi 4 KPI Utama
  const kpiData = useMemo(() => {
    const activeUnits =
      selectedKandangId === 'all'
        ? userKandangs
        : userKandangs.filter((k) => k.id === selectedKandangId);

    const initialPopTotal = activeUnits.reduce((acc, k) => acc + k.initial_population, 0);
    const currentPopTotal = activeUnits.reduce((acc, k) => acc + (k.current_population || k.initial_population), 0);

    const dayaHidupPercent =
      initialPopTotal > 0 ? Number(((currentPopTotal / initialPopTotal) * 100).toFixed(1)) : 100;

    // Ambil log yang relevan
    const relevantLogs =
      selectedKandangId === 'all'
        ? recordings
        : recordings.filter((r) => r.kandang_id === selectedKandangId);

    // Total deplesi kumulatif dari log
    const totalDead = relevantLogs.reduce((acc, r) => acc + r.dead_count, 0);
    const totalCull = relevantLogs.reduce((acc, r) => acc + r.cull_count, 0);
    const totalDeplesi = totalDead + totalCull;
    const deplesiPercent =
      initialPopTotal > 0 ? Number(((totalDeplesi / initialPopTotal) * 100).toFixed(2)) : 0;

    // Log terbaru (untuk data produksi telur hari ini)
    // Kelompokkan per tanggal terbaru
    const dates = Array.from(new Set(relevantLogs.map((r) => r.date))).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
    const latestDate = dates[0];

    const latestLogs = relevantLogs.filter((r) => r.date === latestDate);
    const latestEggKg = latestLogs.reduce((acc, r) => acc + r.intact_egg_kg, 0);
    const latestEggCount = latestLogs.reduce((acc, r) => acc + r.intact_egg_count, 0);
    const latestBrokenKg = latestLogs.reduce((acc, r) => acc + r.broken_egg_kg, 0);
    const latestFeedKg = latestLogs.reduce((acc, r) => acc + r.feed_kg, 0);

    const latestPop = latestLogs.reduce((acc, r) => acc + r.final_population, 0);
    const latestHdp = latestPop > 0 ? Number(((latestEggCount / latestPop) * 100).toFixed(1)) : 0;
    const latestFeedIntake = latestPop > 0 ? Number(((latestFeedKg * 1000) / latestPop).toFixed(1)) : 0;
    const latestTotalEgg = latestEggKg + latestBrokenKg;
    const latestFcr = latestTotalEgg > 0 ? Number((latestFeedKg / latestTotalEgg).toFixed(2)) : 0;
    const avgEggWeight = latestEggCount > 0 ? Number(((latestEggKg * 1000) / latestEggCount).toFixed(1)) : 62.5;

    // Telur retak kumulatif
    const totalBrokenKg = relevantLogs.reduce((acc, r) => acc + r.broken_egg_kg, 0);
    const totalIntactKg = relevantLogs.reduce((acc, r) => acc + r.intact_egg_kg, 0);
    const totalEggAll = totalBrokenKg + totalIntactKg;
    const brokenPercent = totalEggAll > 0 ? Number(((totalBrokenKg / totalEggAll) * 100).toFixed(2)) : 0;

    return {
      currentPopTotal,
      initialPopTotal,
      dayaHidupPercent,
      totalDead,
      totalCull,
      totalDeplesi,
      deplesiPercent,
      latestDate: latestDate || '2026-11-24',
      latestEggKg: Number(latestEggKg.toFixed(1)),
      latestEggCount,
      latestBrokenKg: Number(latestBrokenKg.toFixed(1)),
      latestFeedKg: Number(latestFeedKg.toFixed(1)),
      latestHdp,
      latestFeedIntake,
      latestFcr,
      avgEggWeight,
      totalBrokenKg: Number(totalBrokenKg.toFixed(1)),
      brokenPercent,
    };
  }, [selectedKandangId, userKandangs, recordings]);

  // 7. Data Grafik Tren 10 Hari Terakhir
  const chartData = useMemo(() => {
    const relevantLogs =
      selectedKandangId === 'all'
        ? recordings
        : recordings.filter((r) => r.kandang_id === selectedKandangId);

    // Ambil tanggal unik terurut dari lama ke baru
    const dates = Array.from(new Set(relevantLogs.map((r) => r.date))).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    // Ambil maksimal 10 hari terakhir
    const last10Dates = dates.slice(-10);

    return last10Dates.map((d) => {
      const logsOnDate = relevantLogs.filter((r) => r.date === d);
      const totalEggCount = logsOnDate.reduce((acc, l) => acc + l.intact_egg_count, 0);
      const totalPop = logsOnDate.reduce((acc, l) => acc + l.final_population, 0);
      const totalEggKg = logsOnDate.reduce((acc, l) => acc + (l.intact_egg_kg + l.broken_egg_kg), 0);
      const totalFeedKg = logsOnDate.reduce((acc, l) => acc + l.feed_kg, 0);

      const hdp = totalPop > 0 ? Number(((totalEggCount / totalPop) * 100).toFixed(1)) : 0;
      const fcr = totalEggKg > 0 ? Number((totalFeedKg / totalEggKg).toFixed(2)) : 0;

      // Format label hari & tanggal (contoh: "18 Nov")
      const dateObj = new Date(d);
      const label = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

      return {
        date: d,
        label,
        hdp,
        fcr,
      };
    });
  }, [recordings, selectedKandangId]);

  // 8. Handler: Tambah Unit Kandang
  const handleCreateKandang = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
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
      setFeedbackNotice({ type: 'error', message: 'Gagal membuat kandang baru.' });
    }
  };

  // 9. Handler: Hapus Unit Kandang
  const handleDeleteKandang = () => {
    if (!targetKandangToDelete) return;
    const target = kandangs.find((k) => k.id === targetKandangToDelete);
    if (!target) return;

    const res = deleteKandangUnit(targetKandangToDelete);
    if (!res.success) {
      setFeedbackNotice({ type: 'error', message: res.message || 'Gagal menghapus kandang.' });
      return;
    }

    if (currentUser) {
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
    }

    setIsDeleteKandangOpen(false);
    setFeedbackNotice({
      type: 'success',
      message: `✓ Unit kandang "${target.name}" beserta ${res.deletedLogsCount} riwayat log recording berhasil dihapus.`,
    });
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  // 10. Handler: Simpan Recording Harian
  const handleSaveRecording = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
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
        notes: recordNotes,
      };

      const saved = addDailyRecording(currentUser.id, payload);

      // Refresh state
      const updatedUnits = loadKandangUnits(currentUser.id);
      const updatedLogs = loadDailyRecordings(currentUser.id);
      setKandangs(updatedUnits);
      setRecordings(updatedLogs);

      // Reset form ringan
      setRecordDead(0);
      setRecordCull(0);
      setRecordNotes('');

      setFeedbackNotice({
        type: 'success',
        message: `✓ Recording tanggal ${saved.date} untuk ${saved.kandang_name} berhasil disimpan! (HDP: ${saved.hdp_percent}%, FCR: ${saved.fcr})`,
      });
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan recording.';
      setFeedbackNotice({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 11. Handler: Hapus Baris Log
  const handleDeleteLog = (logId: string, date: string, kandangName: string) => {
    if (confirm(`Hapus catatan recording tanggal ${date} untuk ${kandangName}?`)) {
      deleteDailyRecording(logId);
      if (currentUser) {
        setKandangs(loadKandangUnits(currentUser.id));
        setRecordings(loadDailyRecordings(currentUser.id));
      }
      setFeedbackNotice({
        type: 'info',
        message: `Catatan recording tanggal ${date} berhasil dihapus dan populasi telah direkalkulasi.`,
      });
      setTimeout(() => setFeedbackNotice(null), 3000);
    }
  };

  // 12. Handler: Export CSV
  const handleExportCsv = () => {
    const csvContent = exportRecordingsToCsv(filteredRecordings);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `recording_harian_layer_${selectedKandangId}_${recordDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFeedbackNotice({
      type: 'success',
      message: '✓ File CSV riwayat recording harian berhasil diunduh.',
    });
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070d0b] text-white flex items-center justify-center">
        <p className="text-sm text-slate-400">Memuat Portal Peternak be-ternak...</p>
      </div>
    );
  }

  // Sidebar Menu Config
  const sideMenuItems = [
    {
      group: 'MANAJEMEN KANDANG',
      items: [
        {
          id: 'overview',
          label: 'Ringkasan Kandang',
          icon: LayoutDashboard,
          badge: null,
          badgeColor: '',
          href: '/dashboard/peternak',
        },
        {
          id: 'recipes',
          label: 'Resep Ransum AI',
          icon: BookOpen,
          badge: isMounted ? `${savedRansums.length} Resep` : null,
          badgeColor: 'bg-emerald-950 text-emerald-400 border border-emerald-500/20',
          href: '/dashboard/peternak',
        },
        {
          id: 'nearby_feeds',
          label: 'Pakan Sekitar Kandang',
          icon: Layers,
          badge: 'Radius 15km',
          badgeColor: 'bg-slate-800 text-slate-300',
          href: '/dashboard/peternak',
        },
        {
          id: 'simulasi',
          label: 'Simulasi Usaha Layer',
          icon: Calculator,
          badge: 'Baru',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold',
          href: '/dashboard/peternak/simulasi',
        },
        {
          id: 'recording',
          label: 'Recording Harian',
          icon: ClipboardList,
          badge: 'Harian',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold',
          href: '/dashboard/peternak/recording',
          active: true,
        },
      ],
    },
    {
      group: 'KEANGGOTAAN & BIAYA',
      items: [
        {
          id: 'subscription',
          label: 'Langganan & Pembayaran',
          icon: CreditCard,
          badge: currentUser.is_verified ? 'Pro Aktif' : 'Pending',
          badgeColor: currentUser.is_verified
            ? 'bg-emerald-500/20 text-emerald-300'
            : 'bg-amber-500/20 text-amber-300 animate-pulse',
          href: '/dashboard/peternak',
        },
        {
          id: 'verification_status',
          label: 'Status Verifikasi Akun',
          icon: ShieldCheck,
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
    <div className="h-screen bg-[#070d0b] text-slate-100 flex flex-col font-sans overflow-hidden">
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
            Recording Layer
          </span>
          <span
            suppressHydrationWarning
            className="text-xs font-bold text-white truncate max-w-[130px]"
          >
            {currentUser?.name}
          </span>
        </div>
      </div>

      {/* Main Body Split Screen: Sidebar + Content */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* ================================================================= */}
        {/* SIDE MENU (SIDEBAR)                                               */}
        {/* ================================================================= */}
        <aside
          className={`
            fixed lg:sticky top-16 lg:top-0 bottom-0 left-0 z-40
            w-72 h-[calc(100vh-4rem)] bg-[#0A1410] backdrop-blur-md
            border-r border-[#1E352B] flex flex-col justify-between
            transition-transform duration-300 ease-in-out shrink-0
            ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Top: Profile Card & Switcher */}
          <div className="p-4 border-b border-[#1E352B] space-y-3">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900/60 border border-emerald-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-md text-xl">
                👨‍🌾
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 suppressHydrationWarning className="text-xs font-bold text-white truncate">
                    {currentUser?.name}
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                </div>
                <p suppressHydrationWarning className="text-[10px] text-emerald-300 font-semibold truncate">
                  {currentUser?.business_name}
                </p>
                <p suppressHydrationWarning className="text-[9px] text-slate-400 truncate">
                  Populasi: {(currentUser?.poultry_capacity || 5000).toLocaleString('id-ID')} Ekor Layer
                </p>
              </div>
            </div>

            {/* Switcher Akun Demo Peternak */}
            <div className="bg-[#0F1D17] p-2 rounded-xl border border-[#1E352B] space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-400 block px-1">
                Pilih Akun Demo Peternak:
              </span>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                {users
                  .filter((u) => u.role === 'peternak')
                  .map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectFarmer(u.id)}
                      className={`px-2 py-1.5 rounded-lg truncate text-left font-medium transition-all cursor-pointer ${
                        currentUser.id === u.id
                          ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <div className="truncate font-semibold">{u.name.split(' ')[0]}</div>
                      <div className="text-[9px] opacity-80">
                        {(u.poultry_capacity || 0).toLocaleString('id-ID')} ekor
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Navigation Menu Groups */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {sideMenuItems.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
                  {group.group}
                </span>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.active || false;

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25 border border-emerald-400/40'
                            : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${item.badgeColor}`}
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
          </div>

          {/* Bottom Sidebar Info */}
          <div className="p-3 border-t border-[#1E352B] bg-[#0A1410]/60 text-center">
            <span className="text-[10px] text-slate-400">
              be-ternak • Recording Presisi
            </span>
          </div>
        </aside>

        {/* Mobile Backdrop Overlay */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ================================================================= */}
        {/* MAIN RECORDING CONTENT                                            */}
        {/* ================================================================= */}
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 space-y-6 w-full">
          {/* Breadcrumb & Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Link
                  href="/dashboard/peternak"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Portal Peternak
                </Link>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span className="text-emerald-400 font-semibold">Recording Harian</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <ClipboardList className="w-6 h-6 text-emerald-400" />
                <span>Recording Harian Produksi & Pakan Layer</span>
              </h1>
              <p className="text-xs text-slate-400">
                Pencatatan mortalitas, afkir, produksi telur butir/kg, intake pakan harian, FCR presisi, dan status unit kandang.
              </p>
            </div>

            {/* Header Right Actions: Filter Kandang, Tambah Kandang, Hapus Kandang & Export */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Dropdown Kandang */}
              <div className="flex items-center gap-1.5 bg-[#0F1D17] border border-[#1E352B] rounded-xl px-3 py-1.5 text-xs text-slate-300">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <select
                  value={selectedKandangId}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setIsAddKandangOpen(true);
                    } else {
                      setSelectedKandangId(e.target.value);
                    }
                  }}
                  className="bg-transparent text-white font-semibold outline-hidden cursor-pointer"
                >
                  <option value="all" className="bg-[#0A1410] text-white">
                    Semua Unit Kandang ({userKandangs.length})
                  </option>
                  {userKandangs.map((k) => (
                    <option key={k.id} value={k.id} className="bg-[#0A1410] text-white">
                      {k.name} ({k.current_population.toLocaleString('id-ID')} ekor)
                    </option>
                  ))}
                  <option value="__add_new__" className="bg-emerald-950 text-emerald-300 font-bold">
                    + Tambah Kandang Baru...
                  </option>
                </select>
              </div>

              {/* Tombol Tambah Kandang */}
              <button
                onClick={() => setIsAddKandangOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kandang</span>
              </button>

              {/* Tombol Hapus Kandang */}
              <button
                onClick={() => setIsDeleteKandangOpen(true)}
                title="Kelola & Hapus Unit Kandang"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800/60 text-xs font-semibold transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hapus Kandang</span>
              </button>

              {/* Tombol Export CSV */}
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0F1D17] hover:bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Toast Notification Banner */}
          {feedbackNotice && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between shadow-lg transition-all ${
                feedbackNotice.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                  : feedbackNotice.type === 'error'
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                  : 'bg-teal-950/80 border-teal-500/50 text-teal-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {feedbackNotice.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : feedbackNotice.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                ) : (
                  <Info className="w-5 h-5 text-teal-400 shrink-0" />
                )}
                <p className="text-xs sm:text-sm font-medium">{feedbackNotice.message}</p>
              </div>
              <button
                onClick={() => setFeedbackNotice(null)}
                className="p-1 rounded-lg hover:bg-black/20 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* =============================================================== */}
          {/* 4 KARTU KPI UTAMA (SEJAJAR DI ATAS)                             */}
          {/* =============================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Populasi Hidup Saat Ini */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1D17] border border-[#1E352B] shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Populasi Hidup Saat Ini</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <HeartPulse className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {kpiData.currentPopTotal.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-slate-400">ekor</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-[#1E352B]/60">
                <span className="text-emerald-400 font-bold">
                  Daya Hidup: {kpiData.dayaHidupPercent}%
                </span>
                <span className="text-slate-400">
                  Awal: {kpiData.initialPopTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* KPI 2: Produksi Telur Terbaru */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1D17] border border-[#1E352B] shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Produksi Telur Harian</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Egg className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {kpiData.latestEggKg.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-slate-400">
                  kg ({kpiData.latestEggCount.toLocaleString('id-ID')} btr)
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-[#1E352B]/60">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {kpiData.latestHdp}% HDP
                </span>
                <span className="text-slate-400">
                  Avg: {kpiData.avgEggWeight}g/btr
                </span>
              </div>
            </div>

            {/* KPI 3: Pakan & FCR Harian */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1D17] border border-[#1E352B] shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">FCR & Efisiensi Pakan</span>
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                  <Scale className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {kpiData.latestFcr}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    kpiData.latestFcr <= 2.1
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : kpiData.latestFcr <= 2.3
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {kpiData.latestFcr <= 2.1
                    ? 'Sangat Efisien'
                    : kpiData.latestFcr <= 2.3
                    ? 'Normal'
                    : 'Boros Pakan'}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-[#1E352B]/60">
                <span className="text-slate-300 font-medium">
                  {kpiData.latestFeedKg} kg pakan
                </span>
                <span className="text-teal-400 font-semibold">
                  Intake: {kpiData.latestFeedIntake} g/ekor
                </span>
              </div>
            </div>

            {/* KPI 4: Deplesi & Telur Retak */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1D17] border border-[#1E352B] shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Deplesi & Telur Retak</span>
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {kpiData.totalDeplesi.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-rose-400 font-semibold">
                  ekor ({kpiData.deplesiPercent}%)
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-[#1E352B]/60">
                <span className="text-slate-400">
                  Mati: {kpiData.totalDead} • Afkir: {kpiData.totalCull}
                </span>
                <span className="text-amber-400 font-semibold">
                  Retak: {kpiData.latestBrokenKg} kg ({kpiData.brokenPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* LAYOUT 2 KOLOM: FORM INPUT (KIRI) & GRAFIK + TABEL (KANAN)       */}
          {/* =============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ============================================================= */}
            {/* KOLOM KIRI (4 Kolom): FORM INPUT RECORDING HARIAN             */}
            {/* ============================================================= */}
            <div className="lg:col-span-5 bg-[#0F1D17] p-5 sm:p-6 rounded-3xl border border-[#1E352B] shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E352B]">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-white">Form Input Recording</h2>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Auto-Calculated
                </span>
              </div>

              <form onSubmit={handleSaveRecording} className="space-y-4 text-xs">
                {/* 1. Tanggal Catat & Unit Kandang */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Tanggal Catat:
                    </label>
                    <input
                      type="date"
                      value={recordDate}
                      onChange={(e) => setRecordDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#070d0b] border border-[#1E352B] text-white focus:border-emerald-500 outline-hidden font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Unit Kandang:
                    </label>
                    <select
                      value={recordKandangId}
                      onChange={(e) => setRecordKandangId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#070d0b] border border-[#1E352B] text-white focus:border-emerald-500 outline-hidden font-medium cursor-pointer"
                      required
                    >
                      {userKandangs.map((k) => (
                        <option key={k.id} value={k.id} className="bg-[#0A1410] text-white">
                          {k.name} ({k.current_population.toLocaleString('id-ID')} ekor)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Info Populasi Aktif Kandang Terpilih */}
                {activeInputKandang && (
                  <div className="p-2.5 rounded-xl bg-[#0A1410] border border-[#1E352B] flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      Populasi Aktif {activeInputKandang.name}:
                    </span>
                    <span className="font-bold text-emerald-300">
                      {activeInputKandang.current_population.toLocaleString('id-ID')} ekor
                    </span>
                  </div>
                )}

                {/* 2. Deplesi: Ayam Mati & Ayam Afkir */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Ayam Mati (Ekor):
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={recordDead}
                      onChange={(e) => setRecordDead(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-xl bg-[#070d0b] border border-[#1E352B] text-white focus:border-emerald-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Ayam Afkir (Ekor):
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={recordCull}
                      onChange={(e) => setRecordCull(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-xl bg-[#070d0b] border border-[#1E352B] text-white focus:border-emerald-500 outline-hidden"
                    />
                  </div>
                </div>

                {/* 3. Produksi Telur Utuh (Kg & Butir) */}
                <div className="p-3 rounded-2xl bg-[#0A1410] border border-[#1E352B] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-bold flex items-center gap-1.5">
                      <Egg className="w-3.5 h-3.5 text-amber-400" />
                      Produksi Telur Utuh:
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      Est. HDP: {liveFormPreview.hdp}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">
                        Berat Utuh (kg):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={recordEggKg}
                        onChange={(e) => handleEggKgChange(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-[#070d0b] border border-[#1E352B] text-white focus:border-emerald-500 outline-hidden font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">
                        Jumlah Butir:
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={recordEggCount}
                        onChange={(e) => handleEggCountChange(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-[#070d0b] border border-[#1E352B] text-white focus:border-emerald-500 outline-hidden font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Telur Retak / Bentes */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Telur Retak / Bentes (kg):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={recordBrokenKg}
                    onChange={(e) => setRecordBrokenKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070d0b] border border-[#1E352B] text-white focus:border-emerald-500 outline-hidden"
                  />
                </div>

                {/* 5. Pakan Terpakai & Jenis Ransum */}
                <div className="p-3 rounded-2xl bg-[#0A1410] border border-[#1E352B] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-bold flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-teal-400" />
                      Konsumsi Pakan:
                    </span>
                    <span className="text-[11px] text-teal-300 font-semibold">
                      Intake: {liveFormPreview.intake} g/ekor • FCR: {liveFormPreview.fcr}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">
                        Pakan Terpakai (kg):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={recordFeedKg}
                        onChange={(e) => setRecordFeedKg(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-[#070d0b] border border-[#1E352B] text-white focus:border-emerald-500 outline-hidden font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">
                        Jenis Ransum:
                      </label>
                      <select
                        value={recordFeedType}
                        onChange={(e) => setRecordFeedType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#070d0b] border border-[#1E352B] text-white focus:border-emerald-500 outline-hidden cursor-pointer"
                      >
                        {savedRansums.map((r) => (
                          <option key={r.id} value={r.title} className="bg-[#0A1410] text-white">
                            {r.title} (Rp {r.total_cost_per_kg.toLocaleString('id-ID')}/kg)
                          </option>
                        ))}
                        <option value="Ransum be-ternak AI #1" className="bg-[#0A1410] text-white">
                          Ransum be-ternak AI #1
                        </option>
                        <option value="Ransum be-ternak AI #2" className="bg-[#0A1410] text-white">
                          Ransum be-ternak AI #2
                        </option>
                        <option value="Pakan Pabrikan Komplit" className="bg-[#0A1410] text-white">
                          Pakan Pabrikan Komplit
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 6. Catatan Kondisi Kandang */}
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold">
                    Kondisi Kandang & Perlakuan:
                  </label>
                  {/* Preset Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Normal',
                      'Vitamin Anti-Stres',
                      'Vaksin ND-IB',
                      'Heat Stress',
                      'Sakit / Isolasi',
                    ].map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setRecordCondition(cond)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          recordCondition === cond
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                            : 'bg-[#0A1410] text-slate-400 hover:text-white border border-[#1E352B]'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={recordNotes}
                    onChange={(e) => setRecordNotes(e.target.value)}
                    placeholder="Catatan tambahan (opsional, misal: pembersihan litter...)"
                    className="w-full px-3 py-2 rounded-xl bg-[#070d0b] border border-[#1E352B] text-white focus:border-emerald-500 outline-hidden text-xs mt-1"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/25 border border-emerald-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Recording Harian'}</span>
                </button>
              </form>
            </div>

            {/* ============================================================= */}
            {/* KOLOM KANAN (7 Kolom): UNIT KANDANG, GRAFIK & TABEL RIWAYAT   */}
            {/* ============================================================= */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* SECTION: STATUS UNIT KANDANG AKTIF (GRID CARDS) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>Unit Kandang Aktif ({userKandangs.length} Unit)</span>
                  </h3>
                  <button
                    onClick={() => setIsAddKandangOpen(true)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Unit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {userKandangs.map((k) => {
                    const isSelected = selectedKandangId === k.id;
                    const popNow = k.current_population || k.initial_population;
                    const dayaHidup = Number(((popNow / k.initial_population) * 100).toFixed(1));

                    return (
                      <div
                        key={k.id}
                        onClick={() => setSelectedKandangId(isSelected ? 'all' : k.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#0F1D17] to-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                            : 'bg-[#0F1D17] border-[#1E352B] hover:border-emerald-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{k.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                              {k.house_type}
                            </span>
                          </div>
                          {userKandangs.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTargetKandangToDelete(k.id);
                                setIsDeleteKandangOpen(true);
                              }}
                              title="Hapus unit kandang ini"
                              className="p-1 rounded-lg hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="mt-2 text-xs text-slate-400">
                          <span>{k.strain}</span> • <span>{k.age_weeks} Minggu</span>
                        </div>

                        <div className="mt-3 flex items-baseline justify-between">
                          <span className="text-lg font-extrabold text-white">
                            {popNow.toLocaleString('id-ID')}
                            <span className="text-xs font-normal text-slate-400 ml-1">
                              / {k.initial_population.toLocaleString('id-ID')} ekor
                            </span>
                          </span>
                          <span className="text-xs font-bold text-emerald-400">
                            {dayaHidup}%
                          </span>
                        </div>

                        {/* Progress Bar Daya Hidup */}
                        <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                            style={{ width: `${Math.min(100, dayaHidup)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: GRAFIK TREN PERFORMA 10 HARI TERAKHIR (RECHARTS) */}
              <div className="p-5 rounded-3xl bg-[#0F1D17] border border-[#1E352B] shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1E352B]">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>Tren Performa HDP (%) vs FCR Harian (10 Hari Terakhir)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Garis hijau menunjukkan HDP (%) dan garis kuning menunjukkan FCR (pakan / kg telur)
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      HDP (%)
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      FCR Harian
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full">
                  {isMounted && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E352B" opacity={0.6} />
                        <XAxis
                          dataKey="label"
                          stroke="#64748b"
                          tick={{ fill: '#94a3b8', fontSize: 11 }}
                        />
                        {/* Y-Axis Kiri: HDP (%) */}
                        <YAxis
                          yAxisId="left"
                          domain={[80, 100]}
                          stroke="#10b981"
                          tick={{ fill: '#10b981', fontSize: 11 }}
                          unit="%"
                        />
                        {/* Y-Axis Kanan: FCR */}
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          domain={[1.6, 2.4]}
                          stroke="#f59e0b"
                          tick={{ fill: '#f59e0b', fontSize: 11 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0A1410',
                            borderColor: '#1E352B',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                          formatter={(val: any, name: any) => {
                            if (name === 'HDP (%)') return [`${val}%`, 'HDP (%)'];
                            if (name === 'FCR Harian') return [val, 'FCR Harian'];
                            return [val, name];
                          }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="hdp"
                          name="HDP (%)"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          dot={{ fill: '#10b981', r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="fcr"
                          name="FCR Harian"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          dot={{ fill: '#f59e0b', r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500">
                      Memuat grafik tren recording...
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: TABEL LOG RIWAYAT RECORDING HARIAN */}
              <div className="p-5 rounded-3xl bg-[#0F1D17] border border-[#1E352B] shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E352B]">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>Log Riwayat Recording ({filteredRecordings.length} Catatan)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Daftar rekapan harian berurutan dari tanggal terbaru ke terlama
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Cari tanggal / ransum..."
                      value={searchTableQuery}
                      onChange={(e) => setSearchTableQuery(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-[#070d0b] border border-[#1E352B] text-white text-xs outline-hidden focus:border-emerald-500 w-44"
                    />
                    <button
                      onClick={handleExportCsv}
                      className="p-2 rounded-xl bg-[#0A1410] border border-[#1E352B] hover:border-emerald-500/40 text-emerald-400 transition-all cursor-pointer"
                      title="Download CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto no-scrollbar rounded-xl border border-[#1E352B]">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0A1410] text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#1E352B]">
                      <tr>
                        <th className="px-3 py-3">Tanggal</th>
                        <th className="px-3 py-3">Kandang</th>
                        <th className="px-3 py-3 text-right">Populasi</th>
                        <th className="px-3 py-3 text-center">Mati/Afkir</th>
                        <th className="px-3 py-3 text-right">Telur (kg/btr)</th>
                        <th className="px-3 py-3 text-center">HDP</th>
                        <th className="px-3 py-3 text-right">Pakan (Intake)</th>
                        <th className="px-3 py-3 text-center">FCR</th>
                        <th className="px-3 py-3">Kondisi</th>
                        <th className="px-2 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E352B]/60">
                      {filteredRecordings.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                            Belum ada riwayat recording untuk filter ini.
                          </td>
                        </tr>
                      ) : (
                        filteredRecordings.map((r) => (
                          <tr key={r.id} className="hover:bg-[#0A1410]/80 transition-colors">
                            <td className="px-3 py-2.5 font-medium text-white whitespace-nowrap">
                              {r.date}
                            </td>
                            <td className="px-3 py-2.5 font-semibold text-emerald-300 whitespace-nowrap">
                              {r.kandang_name}
                            </td>
                            <td className="px-3 py-2.5 text-right font-medium whitespace-nowrap">
                              {r.final_population.toLocaleString('id-ID')}
                            </td>
                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                              <span
                                className={`text-[11px] font-semibold ${
                                  r.dead_count > 0 ? 'text-rose-400' : 'text-slate-400'
                                }`}
                              >
                                {r.dead_count}
                              </span>
                              <span className="text-slate-500 mx-0.5">/</span>
                              <span
                                className={`text-[11px] font-semibold ${
                                  r.cull_count > 0 ? 'text-amber-400' : 'text-slate-400'
                                }`}
                              >
                                {r.cull_count}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right whitespace-nowrap">
                              <span className="font-bold text-white">{r.intact_egg_kg} kg</span>
                              <span className="text-[10px] text-slate-400 block">
                                {r.intact_egg_count} btr
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                {r.hdp_percent}%
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right whitespace-nowrap">
                              <span className="font-medium text-white">{r.feed_kg} kg</span>
                              <span className="text-[10px] text-teal-400 block">
                                {r.feed_intake_gram} g/ekor
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center whitespace-nowrap font-bold">
                              <span
                                className={`${
                                  r.fcr <= 2.1
                                    ? 'text-emerald-400'
                                    : r.fcr <= 2.3
                                    ? 'text-teal-400'
                                    : 'text-amber-400'
                                }`}
                              >
                                {r.fcr}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-[11px] whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                                {r.condition_note}
                              </span>
                            </td>
                            <td className="px-2 py-2.5 text-center whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteLog(r.id, r.date, r.kandang_name)}
                                title="Hapus baris ini"
                                className="p-1 rounded-md hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ===================================================================== */}
      {/* MODAL: TAMBAH UNIT KANDANG BARU                                       */}
      {/* ===================================================================== */}
      {isAddKandangOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0F1D17] border border-[#1E352B] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E352B]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Tambah Unit Kandang Baru</h3>
              </div>
              <button
                onClick={() => setIsAddKandangOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateKandang} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nama Unit Kandang:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kandang C, Kandang Barat"
                  value={newKandangName}
                  onChange={(e) => setNewKandangName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#070d0b] border border-[#1E352B] text-white focus:border-emerald-500 outline-hidden font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tipe Kandang:
                  </label>
                  <select
                    value={newKandangType}
                    onChange={(e) => setNewKandangType(e.target.value as KandangHouseType)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070d0b] border border-[#1E352B] text-white focus:border-emerald-500 outline-hidden font-medium cursor-pointer"
                  >
                    <option value="Open House">Open House</option>
                    <option value="Semi-Closed">Semi-Closed</option>
                    <option value="Closed House">Closed House</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Strain Ayam:
                  </label>
                  <input
                    type="text"
                    value={newKandangStrain}
                    onChange={(e) => setNewKandangStrain(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070d0b] border border-[#1E352B] text-white focus:border-emerald-500 outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Populasi Awal (Ekor):
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={newKandangPop}
                    onChange={(e) => setNewKandangPop(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070d0b] border border-[#1E352B] text-white focus:border-emerald-500 outline-hidden font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Umur Saat Ini (Minggu):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={newKandangAge}
                    onChange={(e) => setNewKandangAge(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070d0b] border border-[#1E352B] text-white focus:border-emerald-500 outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tanggal Chick-In / Pullet:
                </label>
                <input
                  type="date"
                  value={newKandangDate}
                  onChange={(e) => setNewKandangDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#070d0b] border border-[#1E352B] text-white focus:border-emerald-500 outline-hidden"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1E352B]">
                <button
                  type="button"
                  onClick={() => setIsAddKandangOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  Simpan Unit Kandang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: HAPUS UNIT KANDANG                                             */}
      {/* ===================================================================== */}
      {isDeleteKandangOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0F1D17] border border-rose-900/60 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E352B]">
              <div className="flex items-center gap-2 text-rose-400">
                <Trash2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Hapus Unit Kandang</h3>
              </div>
              <button
                onClick={() => setIsDeleteKandangOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Pilih unit kandang yang ingin dihapus. Menghapus unit kandang juga akan menghapus seluruh data log recording yang terkait secara permanen.
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Pilih Kandang:
                </label>
                <select
                  value={targetKandangToDelete}
                  onChange={(e) => setTargetKandangToDelete(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#070d0b] border border-[#1E352B] text-white focus:border-rose-500 outline-hidden cursor-pointer"
                >
                  {userKandangs.map((k) => {
                    const logsCount = recordings.filter((r) => r.kandang_id === k.id).length;
                    return (
                      <option key={k.id} value={k.id} className="bg-[#0A1410] text-white">
                        {k.name} ({logsCount} catatan recording)
                      </option>
                    );
                  })}
                </select>
              </div>

              {userKandangs.length <= 1 && (
                <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-300 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Proteksi: Peternakan wajib memiliki minimal 1 unit kandang aktif. Unit terakhir tidak dapat dihapus.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1E352B]">
                <button
                  type="button"
                  onClick={() => setIsDeleteKandangOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={userKandangs.length <= 1}
                  onClick={handleDeleteKandang}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Ya, Hapus Kandang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
