'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import {
  SubscriptionTransaction,
  UserProfile,
  FeedSource,
} from '@/lib/types';
import {
  loadTransactionsFromStorage,
  loadUsersFromStorage,
  verifySubscriptionTransaction,
  toggleUserVerification,
  verifyUserInStorage,
  loadFeedSourcesFromStorage,
  verifyFeedSourceInStorage,
  deleteFeedSourceFromStorage,
} from '@/lib/subscription-store';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Users,
  Coins,
  Store,
  Check,
  X,
  CreditCard,
  Phone,
  Mail,
  RefreshCw,
  Sparkles,
  MapPin,
  FileCheck,
  LayoutDashboard,
  Layers,
  Map,
  Menu,
  ChevronRight,
  Search,
  ExternalLink,
  Trash2,
} from 'lucide-react';

type AdminTab = 'overview' | 'verification' | 'users' | 'feeds' | 'reports' | 'payments';

export default function AdminDashboardPage() {
  const [transactions, setTransactions] = useState<SubscriptionTransaction[]>(() =>
    loadTransactionsFromStorage()
  );
  const [users, setUsers] = useState<UserProfile[]>(() => loadUsersFromStorage());
  const [feedSources, setFeedSources] = useState<FeedSource[]>(() => loadFeedSourcesFromStorage());

  // Side Menu Active Section
  const [activeTab, setActiveTab] = useState<AdminTab>('verification');

  // Sub-tab di Menu Verifikasi: 'payments' (Biaya Langganan) | 'feeds' (Pengajuan Bahan Pakan) | 'users' (Pendaftaran Pengguna Baru)
  const [verificationSubTab, setVerificationSubTab] = useState<'payments' | 'feeds' | 'users'>('payments');

  // SSR hydration safety
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mobile Side Menu Open/Close
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filters & State
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'peternak' | 'pemilik_pakan'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [feedFilter, setFeedFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Manual refresh helper
  const refreshData = () => {
    const loadedTxs = loadTransactionsFromStorage();
    const loadedUsers = loadUsersFromStorage();
    const loadedFeeds = loadFeedSourcesFromStorage();
    setTransactions([...loadedTxs]);
    setUsers([...loadedUsers]);
    setFeedSources([...loadedFeeds]);
    setNotification({
      type: 'info',
      message: 'Data transaksi, pengguna, dan titik pakan berhasil disinkronisasi.',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Sinkronisasi realtime jika ada pengajuan pakan atau pembayaran baru dari portal lain
  useEffect(() => {
    const handleSync = () => {
      setTransactions([...loadTransactionsFromStorage()]);
      setUsers([...loadUsersFromStorage()]);
      setFeedSources([...loadFeedSourcesFromStorage()]);
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  // Handler Verifikasi / Tolak Pembayaran
  const handleVerify = (txId: string, approve: boolean) => {
    setProcessingId(txId);
    try {
      const res = verifySubscriptionTransaction(
        txId,
        approve,
        'Budi Santoso, S.Pt (Admin)'
      );

      refreshData();
      setNotification({
        type: approve ? 'success' : 'info',
        message: approve
          ? `Berhasil memverifikasi langganan ${res.user.name} (${res.user.business_name}). Akun & titik pakan kini aktif terverifikasi!`
          : `Pembayaran langganan untuk ${res.user.name} berhasil ditolak.`,
      });

      setTimeout(() => setNotification(null), 5000);
    } catch (err: unknown) {
      alert(`Gagal memproses verifikasi: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Handler Toggle Verifikasi User Manual
  const handleToggleUser = (userId: string) => {
    try {
      const updated = toggleUserVerification(userId, 'Budi Santoso, S.Pt (Admin)');
      refreshData();
      setNotification({
        type: 'success',
        message: `Status verifikasi ${updated.name} diubah menjadi: ${
          updated.is_verified ? 'Terverifikasi (Aktif)' : 'Belum Diverifikasi'
        }`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  // Handler Verifikasi Pengajuan Titik Pakan oleh Admin
  const handleVerifyFeed = (feedId: string, approve: boolean) => {
    setProcessingId(feedId);
    try {
      const updated = verifyFeedSourceInStorage(feedId, approve, 'Budi Santoso, S.Pt (Admin)');
      const loadedFeeds = loadFeedSourcesFromStorage();
      setFeedSources([...loadedFeeds]);

      setNotification({
        type: approve ? 'success' : 'info',
        message: approve
          ? `Titik pakan "${updated.name}" dari ${updated.supplier_name || 'Pemilik Pakan'} berhasil diverifikasi! Kini aktif dengan badge centang hijau resmi di peta & katalog.`
          : `Pengajuan titik pakan "${updated.name}" berhasil ditolak/dinonaktifkan.`,
      });

      setTimeout(() => setNotification(null), 5000);
    } catch (err: unknown) {
      alert(`Gagal memverifikasi titik pakan: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Handler Hapus Titik Pakan Manual
  const handleDeleteFeed = (feedId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data titik pakan ini dari peta?')) return;
    try {
      deleteFeedSourceFromStorage(feedId);
      setFeedSources([...loadFeedSourcesFromStorage()]);
      setNotification({
        type: 'info',
        message: 'Titik pakan berhasil dihapus dari database spasial.',
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  // Handler Toggle Verifikasi Titik Pakan Manual
  const handleToggleFeed = (feedId: string) => {
    const feed = feedSources.find((f) => f.id === feedId);
    if (!feed) return;
    const newStatus = !feed.is_verified;
    verifyFeedSourceInStorage(feedId, newStatus, 'Administrator be-ternak');
    setFeedSources([...loadFeedSourcesFromStorage()]);
    setNotification({
      type: 'success',
      message: `Status verifikasi titik pakan "${feed.name}" diubah menjadi: ${
        newStatus ? 'Terverifikasi (Centang Hijau Aktif)' : 'Belum Diverifikasi'
      }`,
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handler Verifikasi Pendaftaran Pengguna Baru oleh Admin
  const handleVerifyUser = (userId: string, approve: boolean) => {
    setProcessingId(userId);
    try {
      const updated = verifyUserInStorage(userId, approve, 'Administrator be-ternak');
      const loadedUsers = loadUsersFromStorage();
      setUsers([...loadedUsers]);

      setNotification({
        type: approve ? 'success' : 'info',
        message: approve
          ? `Akun "${updated.name}" (${updated.business_name}) berhasil diverifikasi & diaktifkan!`
          : `Pendaftaran akun "${updated.name}" ditolak / dinonaktifkan.`,
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: unknown) {
      alert(`Gagal memproses verifikasi user: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Perhitungan Metrik Admin
  const totalRevenue = transactions
    .filter((t) => t.status === 'approved')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const pendingTxs = transactions.filter((t) => t.status === 'pending');
  const pendingFeeds = feedSources.filter((f) => !f.is_verified);
  const pendingUsers = users.filter((u) => !u.is_verified && u.role !== 'admin');
  const totalPendingVerification = pendingTxs.length + pendingFeeds.length + pendingUsers.length;

  const totalFarmers = users.filter((u) => u.role === 'peternak');
  const totalSuppliers = users.filter((u) => u.role === 'pemilik_pakan');
  const verifiedUsersCount = users.filter((u) => u.is_verified && u.role !== 'admin').length;

  const filteredTransactions = transactions.filter((t) => {
    if (txStatusFilter === 'all') return true;
    return t.status === txStatusFilter;
  });

  const filteredUsers = users.filter((u) => {
    if (u.role === 'admin') return false;
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.business_name.toLowerCase().includes(q) ||
        u.location_address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredFeeds = feedSources.filter((f) => {
    if (feedFilter === 'all') return true;
    if (feedFilter === 'pending') return !f.is_verified;
    if (feedFilter === 'verified') return f.is_verified;
    return true;
  });

  // Navigasi Side Menu Items
  const sideMenuItems = [
    {
      group: 'OPERASIONAL & VERIFIKASI',
      items: [
        {
          id: 'verification',
          label: 'Verifikasi & Validasi',
          icon: Clock,
          badge: mounted && totalPendingVerification > 0 ? `${totalPendingVerification} Pending` : null,
          badgeColor: 'bg-amber-400 text-slate-950 animate-pulse font-bold',
        },
        {
          id: 'users',
          label: 'Kelola Pengguna',
          icon: Users,
          badge: `${users.filter((u) => u.role !== 'admin').length} Akun`,
          badgeColor: 'bg-slate-800 text-slate-300',
        },
        {
          id: 'feeds',
          label: 'Titik Pakan Spasial',
          icon: Layers,
          badge: pendingFeeds.length > 0 ? `${pendingFeeds.length} Perlu Cek` : `${feedSources.length} Titik`,
          badgeColor:
            pendingFeeds.length > 0
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
              : 'bg-emerald-950 text-emerald-400 border border-emerald-500/20',
        },
      ],
    },
    {
      group: 'ANALITIK & FINANSIAL',
      items: [
        {
          id: 'overview',
          label: 'Ringkasan & Metrik',
          icon: LayoutDashboard,
          badge: null,
          badgeColor: '',
        },
        {
          id: 'reports',
          label: 'Laporan Keuangan & Audit',
          icon: FileCheck,
          badge: 'Proposal',
          badgeColor: 'bg-teal-950 text-teal-300 border border-teal-500/30',
        },
        {
          id: 'payments',
          label: 'Rekening & Gateway',
          icon: CreditCard,
          badge: null,
          badgeColor: '',
        },
      ],
    },
  ];

  return (
    <div className="h-screen bg-[#070d0b] text-slate-100 flex flex-col font-sans overflow-hidden">
      <Navbar currentRegionName="Pusat Operasional Admin" />

      {/* Mobile Menu Toggle Header (Only on small screens < lg) */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0d1613] border-b border-emerald-950/80">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>{isMobileMenuOpen ? 'Tutup Menu' : 'Menu Admin'}</span>
        </button>

        <div className="flex items-center gap-2">
          {mounted && totalPendingVerification > 0 && (
            <span
              suppressHydrationWarning
              className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-bold animate-pulse"
            >
              {totalPendingVerification} Pending
            </span>
          )}
          <span className="text-xs font-bold text-white">Panel Superadmin</span>
        </div>
      </div>

      {/* Main Body Split Screen: Side Menu (Left) + Content (Right) */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* ================================================================= */}
        {/* SIDE MENU (SIDEBAR)                                               */}
        {/* ================================================================= */}
        <aside
          className={`
            fixed lg:sticky top-16 lg:top-0 bottom-0 left-0 z-40
            w-72 h-[calc(100vh-4rem)] bg-[#0a110e]/95 lg:bg-[#0a110e]/90 backdrop-blur-md
            border-r border-emerald-950/80 flex flex-col justify-between
            transition-transform duration-300 ease-in-out shrink-0
            ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Top Section: Admin Profile Card */}
          <div className="p-4 border-b border-emerald-950/70">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900/60 border border-emerald-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs font-bold text-white truncate">Administrator be-ternak</h2>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                </div>
                <p className="text-[10px] text-emerald-400 font-semibold tracking-wide">
                  Superadmin Central
                </p>
                <p className="text-[9px] text-slate-400 truncate">chusniarin12@gmail.com</p>
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
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as AdminTab);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20 border border-emerald-400/30'
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
                            suppressHydrationWarning
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quick Links Group */}
            <div className="space-y-1.5 pt-2 border-t border-emerald-950/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
                PINTASAN PLATFORM
              </span>
              <div className="space-y-1">
                <Link
                  href="/"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Map className="w-4 h-4 text-emerald-400" />
                    <span>Peta Interaktif Spasial</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Link>

                <Link
                  href="/dashboard/peternak"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-teal-400" />
                    <span>Portal Peternak</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Link>

                <Link
                  href="/dashboard/pemasok"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Store className="w-4 h-4 text-emerald-400" />
                    <span>Portal Pemilik Pakan</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar Footer: System Status & Sync Button */}
          <div className="p-4 border-t border-emerald-950/70 bg-[#070d0b]/90 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Sistem Spasial:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PostGIS Online
              </span>
            </div>

            <button
              onClick={refreshData}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700/60 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sinkronkan Data
            </button>
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
        {/* MAIN CONTENT AREA (RIGHT)                                         */}
        {/* ================================================================= */}
        <main className="flex-1 h-full overflow-y-auto px-4 sm:px-8 py-6 pb-20 lg:pb-6 space-y-6 max-w-7xl">
          {/* Toast Notification */}
          {notification && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between shadow-lg transition-all ${
                notification.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-900/90 border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-xs sm:text-sm font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Section Breadcrumb & Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-950/60">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Admin Console</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-emerald-400 font-semibold capitalize">
                  {activeTab === 'overview'
                    ? 'Ringkasan & Metrik'
                    : activeTab === 'verification'
                    ? 'Verifikasi Pembayaran Langganan'
                    : activeTab === 'users'
                    ? 'Kelola Pengguna'
                    : activeTab === 'feeds'
                    ? 'Titik Pakan Alternatif'
                    : activeTab === 'reports'
                    ? 'Laporan Keuangan & Audit'
                    : 'Rekening & Gateway'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                {activeTab === 'overview' && 'Ringkasan Eksekutif & Metrik Platform'}
                {activeTab === 'verification' && 'Antrean Verifikasi Pembayaran Langganan'}
                {activeTab === 'users' && 'Direktori Pengguna (Peternak & Pemilik Pakan)'}
                {activeTab === 'feeds' && 'Pusat Validasi Titik Pakan Spasial Seluruh Indonesia'}
                {activeTab === 'reports' && 'Laporan Finansial & Dokumen Audit Proposal'}
                {activeTab === 'payments' && 'Pengaturan Rekening Penampung & Payment Gateway'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Peta
              </Link>
            </div>
          </div>

          {/* =============================================================== */}
          {/* TAB: OVERVIEW (RINGKASAN & METRIK)                              */}
          {/* =============================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 Big Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => {
                    setActiveTab('verification');
                    setVerificationSubTab(
                      pendingUsers.length > 0
                        ? 'users'
                        : pendingFeeds.length > 0 && pendingTxs.length === 0
                        ? 'feeds'
                        : 'payments'
                    );
                  }}
                  className="p-5 rounded-2xl bg-[#0d1613] border border-amber-500/40 cursor-pointer hover:border-amber-400 transition-all shadow-lg shadow-amber-500/5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-300">Menunggu Verifikasi</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span suppressHydrationWarning className="text-3xl font-extrabold text-white">
                      {mounted ? totalPendingVerification : 0}
                    </span>
                    <span className="text-xs text-amber-400 font-semibold">Pengajuan Baru</span>
                  </div>
                  <p suppressHydrationWarning className="text-[11px] text-slate-400 mt-1">
                    {mounted
                      ? `${pendingTxs.length} Transaksi • ${pendingFeeds.length} Titik Pakan • ${pendingUsers.length} Akun`
                      : 'Memuat antrean verifikasi...'}
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('reports')}
                  className="p-5 rounded-2xl bg-[#0d1613] border border-emerald-500/40 cursor-pointer hover:border-emerald-400 transition-all shadow-lg shadow-emerald-500/5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-300">Total Omset Langganan</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Coins className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-xs text-emerald-400 font-bold">Rp</span>
                    <span className="text-3xl font-extrabold text-white">
                      {totalRevenue.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tervalidasi mutasi perbankan/QRIS
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('users')}
                  className="p-5 rounded-2xl bg-[#0d1613] border border-emerald-950/80 cursor-pointer hover:border-emerald-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Peternak Unggas</span>
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">
                      {totalFarmers.length}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold">
                      ({totalFarmers.filter((f) => f.is_verified).length} Aktif)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Layer, Broiler, Joper, Bebek, Puyuh
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('users')}
                  className="p-5 rounded-2xl bg-[#0d1613] border border-emerald-950/80 cursor-pointer hover:border-emerald-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Pemilik Pakan Alternatif</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Store className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">
                      {totalSuppliers.length}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold">
                      ({totalSuppliers.filter((s) => s.is_verified).length} Terverifikasi)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Pemasok dedak, ampas tahu, BSF
                  </p>
                </div>
              </div>

              {/* Quick Action Pending Transactions */}
              {pendingTxs.length > 0 && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-[#0d1613] to-slate-900/40 border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                      Perlu Tindakan Cepat: {pendingTxs.length} Pembayaran Langganan Menunggu Verifikasi
                    </h3>
                    <button
                      onClick={() => setActiveTab('verification')}
                      className="text-xs text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1"
                    >
                      Buka Semua <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingTxs.slice(0, 2).map((tx) => (
                      <div
                        key={tx.id}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">
                              {tx.business_name}
                            </span>
                            <span className="text-[10px] text-amber-300 font-mono">
                              ({tx.user_role === 'peternak' ? 'Peternak' : 'Pemasok'})
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {tx.plan_name} • Rp {Number(tx.amount).toLocaleString('id-ID')}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleVerify(tx.id, true)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleVerify(tx.id, false)}
                            className="px-2 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-[11px]"
                          >
                            Tolak
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Action Pending Feed Submissions */}
              {pendingFeeds.length > 0 && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0d1613] to-teal-950/30 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400 animate-pulse" />
                      Pengajuan Titik Pakan Baru: {pendingFeeds.length} Bahan Pakan Menunggu Verifikasi Admin
                    </h3>
                    <button
                      onClick={() => {
                        setActiveTab('verification');
                        setVerificationSubTab('feeds');
                      }}
                      className="text-xs text-emerald-300 hover:text-emerald-200 font-semibold flex items-center gap-1"
                    >
                      Buka Antrean Pakan <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingFeeds.slice(0, 2).map((feed) => (
                      <div
                        key={feed.id}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate">
                              {feed.name}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono shrink-0">
                              (Rp {feed.estimated_price_per_kg.toLocaleString('id-ID')}/kg)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {feed.supplier_name || feed.contact_info} • {feed.category}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleVerifyFeed(feed.id, true)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleVerifyFeed(feed.id, false)}
                            className="px-2 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-[11px]"
                          >
                            Tolak
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Action Pending User Registrations */}
              {pendingUsers.length > 0 && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#0d1613] to-emerald-950/30 border border-blue-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400 animate-pulse" />
                      Pendaftaran Akun Baru: {pendingUsers.length} Pengguna (Peternak & Pemilik Pakan) Menunggu Verifikasi
                    </h3>
                    <button
                      onClick={() => {
                        setActiveTab('verification');
                        setVerificationSubTab('users');
                      }}
                      className="text-xs text-blue-300 hover:text-blue-200 font-semibold flex items-center gap-1"
                    >
                      Buka Antrean Pengguna <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingUsers.slice(0, 2).map((u) => (
                      <div
                        key={u.id}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-blue-500/30 flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate">
                              {u.business_name}
                            </span>
                            <span className="text-[10px] text-blue-300 font-mono shrink-0">
                              ({u.role === 'peternak' ? 'Peternak' : 'Pemilik Pakan'})
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {u.name} • {u.email}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleVerifyUser(u.id, true)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleVerifyUser(u.id, false)}
                            className="px-2 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-[11px]"
                          >
                            Tolak
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB: VERIFICATION (ANTREAN VERIFIKASI PEMBAYARAN & PAKAN)       */}
          {/* =============================================================== */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              {/* Sub-tab Navigation: Pembayaran Langganan vs Pengajuan Pakan vs Verifikasi User */}
              <div className="flex flex-wrap items-center gap-2 border-b border-emerald-950/80 pb-3">
                <button
                  onClick={() => setVerificationSubTab('payments')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    verificationSubTab === 'payments'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/40'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>1. Pembayaran Langganan</span>
                  {mounted && pendingTxs.length > 0 && (
                    <span
                      suppressHydrationWarning
                      className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-extrabold animate-pulse"
                    >
                      {pendingTxs.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setVerificationSubTab('feeds')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    verificationSubTab === 'feeds'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/40'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>2. Pengajuan Titik Pakan Baru</span>
                  {mounted && pendingFeeds.length > 0 && (
                    <span
                      suppressHydrationWarning
                      className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-extrabold animate-pulse"
                    >
                      {pendingFeeds.length} Baru
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setVerificationSubTab('users')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    verificationSubTab === 'users'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/40'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>3. Verifikasi Akun Pengguna</span>
                  {mounted && pendingUsers.length > 0 && (
                    <span
                      suppressHydrationWarning
                      className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-extrabold animate-pulse"
                    >
                      {pendingUsers.length} Baru
                    </span>
                  )}
                </button>
              </div>

              {/* KONTEN SUB-TAB 1: PEMBAYARAN BIAYA LANGGANAN */}
              {verificationSubTab === 'payments' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1613] p-4 rounded-xl border border-emerald-950/60">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Daftar Transaksi Biaya Langganan</span>
                        <span className="text-xs text-slate-400 font-normal">
                          (Peternak & Pemilik Pakan)
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        Verifikasi bukti transfer untuk mengaktifkan akun dan memberikan badge centang hijau resmi
                      </p>
                    </div>

                    {/* Filter Status Transaksi */}
                    <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
                      {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setTxStatusFilter(st)}
                          className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                            txStatusFilter === st
                              ? 'bg-emerald-600 text-white font-semibold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {st === 'all'
                            ? 'Semua'
                            : st === 'pending'
                            ? 'Menunggu'
                            : st === 'approved'
                            ? 'Disetujui'
                            : 'Ditolak'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredTransactions.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-[#0d1613] border border-slate-800">
                      <CheckCircle2 className="w-12 h-12 text-emerald-400/60 mx-auto mb-3" />
                      <h3 className="text-base font-semibold text-white">Tidak ada transaksi ditemukan</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Semua permohonan biaya langganan telah diproses atau belum ada data baru.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className={`p-5 rounded-2xl border transition-all ${
                            tx.status === 'pending'
                              ? 'bg-gradient-to-r from-[#0d1613] to-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/5'
                              : tx.status === 'approved'
                              ? 'bg-[#0d1613] border-emerald-950/80 hover:border-emerald-500/30'
                              : 'bg-[#0d1613] border-rose-950/80 opacity-75'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Left: User & Business Info */}
                            <div className="space-y-2">
                              <div className="flex items-center flex-wrap gap-2">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                    tx.user_role === 'peternak'
                                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  }`}
                                >
                                  {tx.user_role === 'peternak' ? '👨‍🌾 Peternak' : '🌾 Pemilik Pakan'}
                                </span>

                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                    tx.status === 'pending'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                      : tx.status === 'approved'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  }`}
                                >
                                  {tx.status === 'pending'
                                    ? '⏳ Menunggu Verifikasi'
                                    : tx.status === 'approved'
                                    ? '✓ Terverifikasi & Aktif'
                                    : '✕ Ditolak'}
                                </span>

                                <span className="text-xs text-slate-400">
                                  Ref: <code className="text-emerald-400 font-mono">{tx.payment_ref}</code>
                                </span>
                              </div>

                              <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                  <span>{tx.business_name}</span>
                                  <span className="text-xs font-normal text-slate-400">
                                    (a.n. {tx.user_name})
                                  </span>
                                </h3>
                                <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                                  Paket: {tx.plan_name}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                                <div className="flex items-center gap-1.5">
                                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                  <span>
                                    Metode:{' '}
                                    <strong className="text-slate-200 uppercase">
                                      {tx.payment_method.replace('bank_transfer_', 'BANK ')}
                                    </strong>
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>
                                    Tanggal:{' '}
                                    {new Date(tx.created_at).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>

                              {tx.notes && (
                                <p className="text-xs italic text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                                  Catatan: {tx.notes}
                                </p>
                              )}
                            </div>

                            {/* Right: Amount & Action Buttons */}
                            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                              <div className="text-left lg:text-right">
                                <span className="text-[11px] text-slate-400 block">Biaya Langganan:</span>
                                <span className="text-lg sm:text-xl font-extrabold text-white">
                                  Rp {Number(tx.amount).toLocaleString('id-ID')}
                                </span>
                              </div>

                              {tx.status === 'pending' ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    disabled={processingId === tx.id}
                                    onClick={() => handleVerify(tx.id, true)}
                                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
                                  >
                                    <Check className="w-4 h-4" />
                                    Verifikasi & Aktifkan
                                  </button>
                                  <button
                                    disabled={processingId === tx.id}
                                    onClick={() => handleVerify(tx.id, false)}
                                    className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                                  >
                                    <X className="w-4 h-4" />
                                    Tolak
                                  </button>
                                </div>
                              ) : (
                                <div className="text-xs text-slate-400 text-right">
                                  Diverifikasi oleh: <br />
                                  <strong className="text-slate-300">{tx.verified_by || 'Admin'}</strong>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* KONTEN SUB-TAB 2: PENGAJUAN TITIK BAHAN PAKAN BARU */}
              {verificationSubTab === 'feeds' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1613] p-4 rounded-xl border border-emerald-950/60">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Verifikasi Pengajuan Titik Bahan Pakan</span>
                        <span className="text-xs text-amber-300 font-semibold">
                          ({pendingFeeds.length} Menunggu)
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        Setujui pengajuan pakan dari pemilik pakan agar titik muncul dengan centang hijau resmi di peta interaktif peternak
                      </p>
                    </div>

                    {/* Filter Status Pakan */}
                    <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
                      {(['all', 'pending', 'verified'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setFeedFilter(st)}
                          className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                            feedFilter === st
                              ? 'bg-emerald-600 text-white font-semibold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {st === 'all'
                            ? `Semua (${feedSources.length})`
                            : st === 'pending'
                            ? `Menunggu (${pendingFeeds.length})`
                            : `Terverifikasi (${feedSources.filter((f) => f.is_verified).length})`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredFeeds.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-[#0d1613] border border-slate-800">
                      <CheckCircle2 className="w-12 h-12 text-emerald-400/60 mx-auto mb-3" />
                      <h3 className="text-base font-semibold text-white">Tidak ada pengajuan bahan pakan</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Semua pengajuan pakan alternatif telah diverifikasi atau tidak sesuai filter.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredFeeds.map((feed) => (
                        <div
                          key={feed.id}
                          className={`p-5 rounded-2xl border transition-all ${
                            !feed.is_verified
                              ? 'bg-gradient-to-r from-[#0d1613] to-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/5'
                              : 'bg-[#0d1613] border-emerald-950/80 hover:border-emerald-500/30'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Left: Feed & Supplier Info */}
                            <div className="space-y-2">
                              <div className="flex items-center flex-wrap gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
                                  {feed.category}
                                </span>

                                {!feed.is_verified ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    ⏳ Menunggu Verifikasi Admin
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    ✓ Terverifikasi & Aktif di Peta
                                  </span>
                                )}

                                <span className="text-xs text-slate-400 font-mono">
                                  ID: {feed.id}
                                </span>
                              </div>

                              <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                  <span>{feed.name}</span>
                                </h3>
                                <p className="text-xs text-slate-300 mt-0.5">
                                  {feed.feed_material}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                                <div className="flex items-center gap-1.5">
                                  <Store className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>
                                    Pemasok:{' '}
                                    <strong className="text-slate-200">
                                      {feed.supplier_name || 'Pemilik Pakan'}
                                    </strong>
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Kontak: {feed.contact_info}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                                  <span>
                                    Koordinat: [{feed.lat.toFixed(4)}, {feed.lng.toFixed(4)}]
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>
                                    Diajukan:{' '}
                                    {feed.created_at
                                      ? new Date(feed.created_at).toLocaleDateString('id-ID', {
                                          day: 'numeric',
                                          month: 'short',
                                          year: 'numeric',
                                        })
                                      : 'Baru Saja'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Price, Stock & Action Buttons */}
                            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                              <div className="text-left lg:text-right">
                                <span className="text-[11px] text-slate-400 block">
                                  Harga & Ketersediaan:
                                </span>
                                <span className="text-lg sm:text-xl font-extrabold text-emerald-400">
                                  Rp {feed.estimated_price_per_kg.toLocaleString('id-ID')}{' '}
                                  <span className="text-xs text-slate-400 font-normal">/ kg</span>
                                </span>
                                <p className="text-[11px] text-slate-300">
                                  Stok: <strong>{feed.stock_ton || 0} Ton</strong> ({feed.availability_status})
                                </p>
                              </div>

                              {!feed.is_verified ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    disabled={processingId === feed.id}
                                    onClick={() => handleVerifyFeed(feed.id, true)}
                                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
                                  >
                                    <Check className="w-4 h-4" />
                                    Verifikasi & Aktifkan di Peta
                                  </button>
                                  <button
                                    disabled={processingId === feed.id}
                                    onClick={() => handleVerifyFeed(feed.id, false)}
                                    className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                                  >
                                    <X className="w-4 h-4" />
                                    Tolak
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Centang Hijau Aktif
                                  </span>
                                  <button
                                    disabled={processingId === feed.id}
                                    onClick={() => handleToggleFeed(feed.id)}
                                    className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/60 text-xs transition-all"
                                  >
                                    Cabut
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* KONTEN SUB-TAB 3: VERIFIKASI PENDAFTARAN PENGGUNA BARU */}
              {verificationSubTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1613] p-4 rounded-xl border border-emerald-950/60">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Antrean Verifikasi Pendaftaran Pengguna Baru</span>
                        {mounted && (
                          <span className="text-xs text-amber-300 font-semibold">
                            ({pendingUsers.length} Menunggu Persetujuan)
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-slate-400">
                        Verifikasi akun Peternak Unggas & Pemilik Pakan Alternatif yang mendaftar via email agar berstatus aktif dan mendapatkan lencana centang hijau resmi
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Total Akun Terverifikasi:</span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                        {verifiedUsersCount} Akun
                      </span>
                    </div>
                  </div>

                  {pendingUsers.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-[#0d1613] border border-slate-800">
                      <CheckCircle2 className="w-12 h-12 text-emerald-400/60 mx-auto mb-3" />
                      <h3 className="text-base font-semibold text-white">Semua Pendaftaran Akun Telah Diverifikasi</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        Tidak ada antrean pendaftaran peternak atau pemilik pakan yang tertunda. Semua akun baru yang mendaftar via email akan otomatis masuk ke sini untuk divalidasi.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {pendingUsers.map((u) => (
                        <div
                          key={u.id}
                          className="p-5 rounded-2xl border transition-all bg-gradient-to-r from-[#0d1613] to-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/5"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* User details */}
                            <div className="space-y-2">
                              <div className="flex items-center flex-wrap gap-2">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                    u.role === 'peternak'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                                  }`}
                                >
                                  {u.role === 'peternak' ? 'Peternak Unggas' : 'Pemilik Pakan Alternatif'}
                                </span>

                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  Menunggu Verifikasi Admin
                                </span>

                                <span className="text-xs text-slate-400 font-mono">
                                  ID: {u.id}
                                </span>
                              </div>

                              <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                  <span>{u.business_name}</span>
                                </h3>
                                <p className="text-xs text-slate-300 mt-0.5">
                                  Penanggung Jawab / Pemilik: <strong className="text-white">{u.name}</strong>
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                                <div className="flex items-center gap-1.5">
                                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-slate-200">{u.email}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{u.phone}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                                  <span className="max-w-xs truncate">{u.location_address}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>
                                    Terdaftar:{' '}
                                    {u.created_at
                                      ? new Date(u.created_at).toLocaleDateString('id-ID', {
                                          day: 'numeric',
                                          month: 'short',
                                          year: 'numeric',
                                        })
                                      : 'Baru Saja'}
                                  </span>
                                </div>
                              </div>

                              {/* Specific Metrics */}
                              <div className="pt-1 text-xs">
                                {u.role === 'peternak' ? (
                                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-300">
                                    <span>Kapasitas Kandang: <strong>{u.poultry_capacity?.toLocaleString('id-ID') || 0} Ekor</strong></span>
                                    <span>•</span>
                                    <span>Komoditas: <strong>{u.livestock_types?.join(', ') || 'Ayam Petelur'}</strong></span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-950/40 border border-teal-900/60 text-teal-300">
                                    <span>Kapasitas Suplai: <strong>{u.supply_capacity_ton_month || 0} Ton / Bulan</strong></span>
                                    <span>•</span>
                                    <span>Bahan Pakan: <strong>{u.feed_materials?.join(', ') || 'Dedak & Limbah Agro'}</strong></span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800 shrink-0">
                              <div className="flex items-center gap-2">
                                <button
                                  disabled={processingId === u.id}
                                  onClick={() => handleVerifyUser(u.id, true)}
                                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
                                >
                                  <Check className="w-4 h-4" />
                                  Verifikasi & Aktifkan Akun
                                </button>
                                <button
                                  disabled={processingId === u.id}
                                  onClick={() => handleVerifyUser(u.id, false)}
                                  className="px-3.5 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                                >
                                  <X className="w-4 h-4" />
                                  Tolak
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB: USERS (KELOLA PENGGUNA)                                     */}
          {/* =============================================================== */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1613] p-4 rounded-xl border border-emerald-950/60">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Daftar Pengguna Platform be-ternak</span>
                    <span className="text-xs text-emerald-400 font-semibold">
                      ({verifiedUsersCount} Terverifikasi)
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Pantau status verifikasi, kapasitas ternak, stok bahan pakan, dan kelola masa aktif
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama atau usaha..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 w-48"
                    />
                  </div>

                  {/* Filter Role */}
                  <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
                    {(['all', 'peternak', 'pemilik_pakan'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setUserRoleFilter(r)}
                        className={`px-3 py-1 rounded-md font-medium capitalize transition-all ${
                          userRoleFilter === r
                            ? 'bg-emerald-600 text-white font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {r === 'all' ? 'Semua' : r === 'peternak' ? 'Peternak' : 'Pemilik Pakan'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-5 rounded-2xl bg-[#0d1613] border border-emerald-950/70 hover:border-emerald-500/30 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              user.role === 'peternak'
                                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {user.role === 'peternak' ? '👨‍🌾 Peternak Unggas' : '🌾 Pemilik Pakan Alternatif'}
                          </span>
                          {user.is_verified ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Terverifikasi
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Belum Diverifikasi
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-white mt-1.5">{user.business_name}</h3>
                        <p className="text-xs text-slate-300 font-medium">Pemilik: {user.name}</p>
                      </div>

                      <button
                        onClick={() => handleToggleUser(user.id)}
                        title="Klik untuk ubah status verifikasi manual"
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          user.is_verified
                            ? 'bg-rose-950/40 text-rose-300 border-rose-800/40 hover:bg-rose-900/60'
                            : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/40'
                        }`}
                      >
                        {user.is_verified ? 'Cabut Verifikasi' : 'Verifikasi Akun'}
                      </button>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{user.location_address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{user.phone} ({user.email})</span>
                      </div>
                      {user.role === 'peternak' && user.poultry_capacity && (
                        <div className="flex items-center gap-2 text-emerald-400">
                          <Users className="w-3.5 h-3.5 shrink-0" />
                          <span>Kapasitas Ternak: {user.poultry_capacity.toLocaleString('id-ID')} Ekor</span>
                        </div>
                      )}
                      {user.role === 'pemilik_pakan' && user.supply_capacity_ton_month && (
                        <div className="flex items-center gap-2 text-emerald-400">
                          <Store className="w-3.5 h-3.5 shrink-0" />
                          <span>Kapasitas Suplai: {user.supply_capacity_ton_month} Ton / Bulan</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-400">Status Langganan: </span>
                        <strong className="text-white capitalize">
                          {user.subscription_status.replace('_', ' ')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Masa Aktif: </span>
                        <strong className="text-emerald-400">
                          {user.subscription_expires_at
                            ? new Date(user.subscription_expires_at).toLocaleDateString('id-ID')
                            : 'Free Tier'}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB: FEEDS (TITIK PAKAN SPASIAL)                                */}
          {/* =============================================================== */}
          {activeTab === 'feeds' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1613] p-4 rounded-xl border border-emerald-950/60">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-400" />
                    <span>Database Titik Pakan Alternatif di Peta</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Kelola dan verifikasi titik bahan baku pakan alternatif spasial di seluruh Indonesia
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Filter Status Pakan */}
                  <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
                    {(['all', 'pending', 'verified'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setFeedFilter(st)}
                        className={`px-3 py-1 rounded-md font-medium capitalize transition-all ${
                          feedFilter === st
                            ? 'bg-emerald-600 text-white font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {st === 'all'
                          ? `Semua (${feedSources.length})`
                          : st === 'pending'
                          ? `Perlu Verif (${pendingFeeds.length})`
                          : `Terverifikasi (${feedSources.filter((f) => f.is_verified).length})`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredFeeds.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#0d1613] border border-slate-800">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400/60 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-white">Tidak ada titik pakan sesuai filter</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Coba ganti filter status di atas untuk melihat data pakan lainnya.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFeeds.map((feed) => (
                    <div
                      key={feed.id}
                      className={`p-4 rounded-2xl bg-[#0d1613] border transition-all flex flex-col justify-between space-y-3 ${
                        !feed.is_verified
                          ? 'border-amber-500/50 shadow-md shadow-amber-500/5'
                          : 'border-emerald-950/80 hover:border-emerald-500/30'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {feed.category}
                          </span>
                          {feed.is_verified ? (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Terverifikasi
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3" />
                              Menunggu Verifikasi
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-white line-clamp-1">{feed.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2">{feed.feed_material}</p>

                        <div className="pt-1 text-[11px] text-slate-400 space-y-0.5">
                          <p className="truncate">
                            Pemasok: <strong className="text-slate-200">{feed.supplier_name || 'Pemilik Pakan'}</strong>
                          </p>
                          <p className="truncate">
                            Kontak: <span className="text-slate-300">{feed.contact_info}</span>
                          </p>
                          <p>
                            Stok: <strong className="text-slate-200">{feed.stock_ton || 0} Ton</strong> ({feed.availability_status})
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Harga per kg:</span>
                          <strong className="text-emerald-400 font-extrabold">
                            Rp {feed.estimated_price_per_kg.toLocaleString('id-ID')}
                          </strong>
                        </div>

                        {!feed.is_verified ? (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              disabled={processingId === feed.id}
                              onClick={() => handleVerifyFeed(feed.id, true)}
                              className="py-1.5 px-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Verifikasi
                            </button>
                            <button
                              disabled={processingId === feed.id}
                              onClick={() => handleVerifyFeed(feed.id, false)}
                              className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 flex items-center justify-center gap-1 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleFeed(feed.id)}
                              className="flex-1 py-1.5 rounded-xl text-xs font-semibold border border-rose-800/40 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 transition-all"
                            >
                              Batalkan Centang Hijau
                            </button>
                            <button
                              onClick={() => handleDeleteFeed(feed.id)}
                              title="Hapus titik pakan dari peta"
                              className="p-1.5 rounded-xl text-xs font-semibold border border-slate-700 bg-slate-800/60 text-slate-400 hover:text-rose-400 hover:border-rose-800/60 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB: REPORTS (LAPORAN KEUANGAN & AUDIT)                          */}
          {/* =============================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#0d1613] border border-emerald-950/70 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-emerald-400" />
                  Ringkasan Finansial Ekosistem Langganan be-ternak
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Platform be-ternak menerapkan model bisnis berlangganan (*subscription-based SaaS*) untuk dua segmen pengguna:
                  peternak unggas mandiri (akses formulasi nutrisi AI & peta radius) dan pemasok bahan pakan alternatif (badge verifikasi resmi & promosi prioritas).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-xs text-slate-400 block">Total Omset Terkumpul</span>
                    <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                      Rp {totalRevenue.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] text-slate-400">100% tervalidasi perbankan/QRIS</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-xs text-slate-400 block">Rata-rata Nilai Transaksi (ARPU)</span>
                    <span className="text-xl font-extrabold text-white mt-1 block">
                      Rp {(totalRevenue / (transactions.filter((t) => t.status === 'approved').length || 1)).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] text-slate-400">Per akun mitra per 30 hari</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-xs text-slate-400 block">Tingkat Retensi Mitra</span>
                    <span className="text-xl font-extrabold text-teal-400 mt-1 block">
                      94.2%
                    </span>
                    <span className="text-[11px] text-slate-400">Efisiensi pakan memicu repeat order</span>
                  </div>
                </div>
              </div>

              {/* Proposal / Investor Note */}
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  Catatan Penting untuk Komite Proposal / Hibah
                </div>
                <p>
                  Sistem verifikasi berbayar ini memecahkan dua masalah sekaligus:
                  <strong> (1) Validitas Data:</strong> Pemasok bersedia diverifikasi karena badge resmi meningkatkan penjualan limbah mereka secara riil;
                  <strong> (2) Keberlanjutan Proyek:</strong> Pendapatan biaya langganan menutup biaya operasional server GIS, API token AI Gemini, dan gaji surveyor lapangan secara berkesinambungan.
                </p>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB: PAYMENTS (REKENING & GATEWAY)                              */}
          {/* =============================================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#0d1613] border border-emerald-950/70 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  Rekening Operasional & Settlement be-ternak
                </h2>
                <p className="text-xs text-slate-400">
                  Semua transaksi biaya langganan dari Peternak dan Pemilik Pakan disalurkan ke rekening bank resmi berbadan hukum:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase">Rekening Utama (BCA)</span>
                    <h3 className="text-base font-extrabold text-white">Bank Central Asia (BCA)</h3>
                    <p className="text-sm font-mono text-slate-200">No. Rek: <strong>8820-123-999</strong></p>
                    <p className="text-xs text-slate-400">Atas Nama: <strong>PT be-ternak Agritech Indonesia</strong></p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-teal-400 uppercase">Rekening Cadangan (Mandiri)</span>
                    <h3 className="text-base font-extrabold text-white">Bank Mandiri</h3>
                    <p className="text-sm font-mono text-slate-200">No. Rek: <strong>144-00-9988-121</strong></p>
                    <p className="text-xs text-slate-400">Atas Nama: <strong>PT be-ternak Agritech Indonesia</strong></p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase">Rekening Wilayah (BRI)</span>
                    <h3 className="text-base font-extrabold text-white">Bank Rakyat Indonesia (BRI)</h3>
                    <p className="text-sm font-mono text-slate-200">No. Rek: <strong>0122-01-002341-50-2</strong></p>
                    <p className="text-xs text-slate-400">Atas Nama: <strong>PT be-ternak Agritech Indonesia</strong></p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase">QRIS Dinamis Multi-Payment</span>
                    <h3 className="text-base font-extrabold text-white">QRIS Nasional (NMID)</h3>
                    <p className="text-sm font-mono text-slate-200">NMID: <strong>ID1020268899120</strong></p>
                    <p className="text-xs text-slate-400">Mendukung GoPay, OVO, ShopeePay, DANA, BCA Mobile</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
