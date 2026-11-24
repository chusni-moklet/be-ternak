'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import {
  UserProfile,
  SubscriptionPlanType,
  PaymentMethod,
  SavedRansum,
} from '@/lib/types';
import {
  loadUsersFromStorage,
  loadSavedRansumsFromStorage,
  submitSubscriptionPayment,
  getActiveUserId,
  setActiveUserId,
} from '@/lib/subscription-store';
import { INITIAL_FEED_SOURCES } from '@/lib/mock-data';
import {
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  CreditCard,
  Plus,
  BookOpen,
  Send,
  ExternalLink,
  LayoutDashboard,
  Layers,
  Map,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Store,
  MessageCircle,
  Calculator,
} from 'lucide-react';

type PeternakTab = 'overview' | 'recipes' | 'nearby_feeds' | 'subscription' | 'verification_status';

export default function PeternakDashboardPage() {
  const [users, setUsers] = useState<UserProfile[]>(() => loadUsersFromStorage());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const loaded = loadUsersFromStorage();
    const activeId = getActiveUserId();
    return (
      loaded.find((u) => u.id === activeId) ||
      loaded.find((u) => u.role === 'peternak') ||
      loaded[1] ||
      null
    );
  });
  const [savedRansums, setSavedRansums] = useState<SavedRansum[]>(() => loadSavedRansumsFromStorage());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Side Menu State
  const [activeTab, setActiveTab] = useState<PeternakTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal & Form State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanType>('peternak_pro');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('bank_transfer_bca');
  const [paymentRef, setPaymentRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Refresh user data helper
  const refreshUserData = () => {
    const loadedUsers = loadUsersFromStorage();
    setUsers(loadedUsers);
    const activeId = currentUser?.id || 'usr-farmer-01';
    const farmer =
      loadedUsers.find((u) => u.id === activeId) ||
      loadedUsers.find((u) => u.role === 'peternak') ||
      loadedUsers[1];
    setCurrentUser(farmer);

    const loadedRansums = loadSavedRansumsFromStorage();
    setSavedRansums(loadedRansums);
  };

  // Ganti profil peternak demo
  const handleSelectFarmer = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setActiveUserId(user.id);
    }
  };

  // Submit pembayaran langganan
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      const planPrices: Record<SubscriptionPlanType, number> = {
        free: 0,
        peternak_starter: 49000,
        peternak_pro: 99000,
        pemasok_umkm: 79000,
        pemasok_pro: 149000,
      };

      const amount = planPrices[selectedPlan] || 99000;

      submitSubscriptionPayment(
        currentUser.id,
        selectedPlan,
        amount,
        selectedPaymentMethod,
        paymentRef || `PET-${Date.now().toString().slice(-5)}`
      );

      refreshUserData();
      setIsPaymentModalOpen(false);
      setPaymentRef('');

      setFeedbackNotice({
        type: 'success',
        message:
          'Bukti pembayaran berhasil diserahkan! Status akun kini Menunggu Verifikasi Admin. Admin akan segera memvalidasi mutasi perbankan Anda.',
      });

      setTimeout(() => setFeedbackNotice(null), 7000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070d0b] text-white flex items-center justify-center">
        <p className="text-sm text-slate-400">Memuat Portal Peternak...</p>
      </div>
    );
  }

  // Hitung estimasi penghematan
  const population = currentUser.poultry_capacity || 3000;
  const feedPerDayKg = population * 0.11; // Asumsi konsumsi 110 gram / ekor / hari
  const commercialCostDay = feedPerDayKg * 9500;
  const localRansumCostDay = feedPerDayKg * 5800;
  const savingsPerDay = commercialCostDay - localRansumCostDay;
  const savingsPerMonth = savingsPerDay * 30;

  // Filter pakan terdekat untuk kandang peternak
  const nearbyFeeds = INITIAL_FEED_SOURCES.slice(0, 6);

  // Side Menu Configuration
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
        },
        {
          id: 'recipes',
          label: 'Resep Ransum AI',
          icon: BookOpen,
          badge: mounted ? `${savedRansums.length} Resep` : null,
          badgeColor: 'bg-emerald-950 text-emerald-400 border border-emerald-500/20',
        },
        {
          id: 'nearby_feeds',
          label: 'Pakan Sekitar Kandang',
          icon: Layers,
          badge: 'Radius 15km',
          badgeColor: 'bg-slate-800 text-slate-300',
        },
        {
          id: 'simulasi',
          label: 'Simulasi Usaha Layer',
          icon: Calculator,
          badge: 'Baru',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold',
          href: '/dashboard/peternak/simulasi',
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
          badge:
            currentUser.subscription_status === 'active'
              ? 'Pro Aktif'
              : currentUser.subscription_status === 'pending_verification'
              ? 'Pending'
              : 'Upgrade',
          badgeColor:
            currentUser.subscription_status === 'active'
              ? 'bg-emerald-500/20 text-emerald-300'
              : currentUser.subscription_status === 'pending_verification'
              ? 'bg-amber-500/20 text-amber-300 animate-pulse'
              : 'bg-teal-500/20 text-teal-300',
        },
        {
          id: 'verification_status',
          label: 'Status Verifikasi Akun',
          icon: ShieldCheck,
          badge: currentUser.is_verified ? 'Terverifikasi' : 'Perlu Verif',
          badgeColor: currentUser.is_verified
            ? 'bg-emerald-500/20 text-emerald-300'
            : 'bg-amber-500/20 text-amber-300',
        },
      ],
    },
  ];

  return (
    <div className="h-screen bg-[#070d0b] text-slate-100 flex flex-col font-sans overflow-hidden">
      <Navbar currentRegionName={`Kandang: ${currentUser.business_name}`} />

      {/* Mobile Menu Toggle Header (< lg) */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0d1613] border-b border-emerald-950/80">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-600/20 text-teal-300 border border-teal-500/40 text-xs font-semibold"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>{isMobileMenuOpen ? 'Tutup Menu' : 'Menu Peternak'}</span>
        </button>

        <div className="flex items-center gap-2">
          {currentUser.is_verified ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              ✓ Pro Aktif
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold animate-pulse">
              ⏳ Menunggu Verifikasi
            </span>
          )}
          <span className="text-xs font-bold text-white truncate max-w-[120px]">
            {currentUser.name}
          </span>
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
          {/* Top Section: Farmer Profile Card */}
          <div className="p-4 border-b border-emerald-950/70 space-y-3">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-teal-950/60 to-slate-900/60 border border-teal-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-md text-xl">
                👨‍🌾
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs font-bold text-white truncate">{currentUser.name}</h2>
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
                </div>
                <p className="text-[10px] text-teal-300 font-semibold truncate">
                  {currentUser.business_name}
                </p>
                <p className="text-[9px] text-slate-400 truncate">
                  {currentUser.livestock_types?.join(', ') || 'Ayam Unggas'}
                </p>
              </div>
            </div>

            {/* Switch Akun Demo Peternak */}
            <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 block px-1.5">
                Ganti Akun Demo Peternak:
              </span>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                {users
                  .filter((u) => u.role === 'peternak')
                  .map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectFarmer(u.id)}
                      className={`px-2 py-1 rounded-lg truncate text-left font-medium transition-all ${
                        currentUser.id === u.id
                          ? 'bg-teal-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {u.name.split(' ')[0]} ({u.is_verified ? 'Aktif' : 'Pending'})
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
                    const isActive = activeTab === item.id;
                    const itemHref = 'href' in item ? (item.href as string) : undefined;

                    if (itemHref) {
                      return (
                        <Link
                          key={item.id}
                          href={itemHref}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                            isActive
                              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/20 border border-teal-400/30'
                              : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'
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
                    }

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as PeternakTab);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                          isActive
                            ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/20 border border-teal-400/30'
                            : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'
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
                  href="/dashboard/pemasok"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Store className="w-4 h-4 text-emerald-400" />
                    <span>Katalog Pemilik Pakan</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Link>

                <Link
                  href="/admin"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Panel Admin</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-emerald-950/70 bg-[#070d0b]/90 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Populasi Kandang:</span>
              <strong className="text-white">
                {population.toLocaleString('id-ID')} Ekor
              </strong>
            </div>

            {currentUser.subscription_status !== 'active' ? (
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Bayar Biaya Langganan
              </button>
            ) : (
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-600/20 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Formulasi AI di Peta
              </Link>
            )}
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
        <main className="flex-1 h-full overflow-y-auto px-4 sm:px-8 py-6 pb-24 lg:pb-8 space-y-6 w-full">
          {/* Toast Feedback */}
          {feedbackNotice && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-center justify-between text-xs sm:text-sm font-medium shadow-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{feedbackNotice.message}</span>
              </div>
              <button
                onClick={() => setFeedbackNotice(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* Breadcrumb Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-950/60">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Portal Peternak</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-teal-400 font-semibold capitalize">
                  {activeTab === 'overview'
                    ? 'Ringkasan Kandang'
                    : activeTab === 'recipes'
                    ? 'Resep Ransum Tersimpan'
                    : activeTab === 'nearby_feeds'
                    ? 'Pakan Sekitar Kandang'
                    : activeTab === 'subscription'
                    ? 'Biaya Langganan & Pembayaran'
                    : 'Status Verifikasi Akun'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                {activeTab === 'overview' && 'Ringkasan & Analisis Kandang Ternak'}
                {activeTab === 'recipes' && 'Daftar Resep Ransum Mandiri Hasil Formulasi AI'}
                {activeTab === 'nearby_feeds' && 'Pemasok Bahan Pakan Terdekat (Radius 15 km)'}
                {activeTab === 'subscription' && 'Keanggotaan & Pembayaran Biaya Langganan'}
                {activeTab === 'verification_status' && 'Status Validasi & Sertifikasi Peternak'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Buka Peta Spasial
              </Link>
            </div>
          </div>

          {/* =============================================================== */}
          {/* TAB: OVERVIEW (RINGKASAN KANDANG)                               */}
          {/* =============================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Membership Status & Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0d1613] via-[#09120f] to-teal-950/30 border border-teal-500/30 shadow-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                        Status Keanggotaan Kandang
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          currentUser.subscription_status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : currentUser.subscription_status === 'pending_verification'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {currentUser.subscription_status === 'active'
                          ? 'Pro Peternak Mandiri (Terverifikasi)'
                          : currentUser.subscription_status === 'pending_verification'
                          ? 'Menunggu Verifikasi Admin'
                          : 'Belum Berlangganan'}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      {currentUser.subscription_status === 'active' ? (
                        <span>
                          Langganan Anda Aktif Hingga{' '}
                          {currentUser.subscription_expires_at
                            ? new Date(currentUser.subscription_expires_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })
                            : '31 Desember 2026'}
                        </span>
                      ) : currentUser.subscription_status === 'pending_verification' ? (
                        <span>Pembayaran Biaya Langganan Sedang Diverifikasi</span>
                      ) : (
                        <span>Tingkatkan ke Akun Peternak Terverifikasi</span>
                      )}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {currentUser.subscription_status === 'active'
                        ? 'Anda memiliki akses penuh ke radius pencarian pakan 30 km, formulasi nutrisi AI tak terbatas, peringatan pencegahan heat stress otomatis, dan harga prioritas dari supplier terverifikasi.'
                        : currentUser.subscription_status === 'pending_verification'
                        ? 'Tim Admin be-ternak sedang memverifikasi bukti mutasi transfer Anda. Setelah terkonfirmasi sah, akun Anda akan otomatis aktif dengan centang hijau.'
                        : 'Dapatkan akses formulasi ransum murah AI presisi tanpa batas, hubungi 100+ supplier pakan terverifikasi, dan pangkas hingga 40% biaya pakan harian kandang Anda.'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3">
                    {currentUser.subscription_status !== 'active' ? (
                      <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Bayar Biaya Langganan
                      </button>
                    ) : (
                      <Link
                        href="/"
                        className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Mulai Analisis Peta AI
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#0d1613] border border-emerald-950/80 space-y-2">
                  <span className="text-xs font-medium text-slate-400">Populasi Unggas Kandang</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      {population.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs text-teal-400 font-semibold">Ekor</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Kebutuhan ransum: ±{feedPerDayKg.toFixed(0)} kg pakan / hari
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0d1613] border border-emerald-950/80 space-y-2">
                  <span className="text-xs font-medium text-slate-400">Proyeksi Penghematan Pakan</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-emerald-400 font-bold">Rp</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                      {savingsPerMonth.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs text-slate-400">/ bulan</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Hemat Rp {savingsPerDay.toLocaleString('id-ID')} setiap hari berkat pakan alternatif
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0d1613] border border-emerald-950/80 space-y-2">
                  <span className="text-xs font-medium text-slate-400">Resep Ransum Tersimpan</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      {savedRansums.length}
                    </span>
                    <span className="text-xs text-teal-400 font-semibold">Formula Nutrisi</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Dihitung dengan AI Gemini 2.5 Flash sesuai iklim kandang
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB: RECIPES (RESEP RANSUM AI TERSIMPAN)                         */}
          {/* =============================================================== */}
          {activeTab === 'recipes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-teal-400" />
                    Resep Ransum Mandiri Tersimpan
                  </h2>
                  <p className="text-xs text-slate-400">
                    Formula pakan lokal yang telah dioptimasi AI dengan batasan Protein Kasar & Energi Metabolis unggas
                  </p>
                </div>

                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 text-xs font-semibold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Racik Formula Baru di Peta
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedRansums.map((ransum) => (
                  <div
                    key={ransum.id}
                    className="p-5 rounded-2xl bg-[#0d1613] border border-emerald-950/80 hover:border-teal-500/40 transition-all space-y-4 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          {ransum.livestock_type}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1.5">{ransum.title}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Biaya Ransum:</span>
                        <span className="text-sm font-bold text-emerald-400">
                          Rp {ransum.total_cost_per_kg.toLocaleString('id-ID')} / kg
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{ransum.savings_percent}</span>
                    </div>

                    {/* Komposisi Bahan Ransum */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-300 block">
                        Proporsi Bahan Pakan Lokal:
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {ransum.ingredients.map((ing, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-slate-900/40 border border-slate-800 flex items-center justify-between"
                          >
                            <span className="text-slate-300 truncate pr-1">{ing.bahan}</span>
                            <strong className="text-emerald-400 font-mono">{ing.persentase}%</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs">
                      <span className="text-slate-400">
                        Dibuat: {new Date(ransum.created_at).toLocaleDateString('id-ID')}
                      </span>
                      <Link
                        href="/"
                        className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                      >
                        Buka Titik Pakan di Peta <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB: NEARBY_FEEDS (PAKAN SEKITAR KANDANG)                        */}
          {/* =============================================================== */}
          {activeTab === 'nearby_feeds' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-teal-400" />
                    Pemasok Bahan Pakan Terdekat
                  </h2>
                  <p className="text-xs text-slate-400">
                    Bahan pakan alternatif berjarak radius 5–15 km dari koordinat kandang {currentUser.business_name}
                  </p>
                </div>

                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 text-xs font-semibold"
                >
                  Lihat Semua di Peta Interaktif
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {nearbyFeeds.map((feed) => (
                  <div
                    key={feed.id}
                    className="p-4 rounded-2xl bg-[#0d1613] border border-emerald-950/80 hover:border-teal-500/30 transition-all flex flex-col justify-between space-y-3"
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
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                            Perlu Konfirmasi
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white line-clamp-1">{feed.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{feed.feed_material}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Estimasi Harga:</span>
                        <strong className="text-emerald-400 font-bold">
                          Rp {feed.estimated_price_per_kg.toLocaleString('id-ID')} / kg
                        </strong>
                      </div>

                      <a
                        href={`https://wa.me/?text=Halo%20saya%20peternak%20be-ternak%20ingin%20memesan%20${encodeURIComponent(
                          feed.name
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Pesan Langsung via WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB: SUBSCRIPTION (LANGGANAN & PEMBAYARAN)                       */}
          {/* =============================================================== */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#0d1613] border border-teal-500/30 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-teal-400" />
                  Paket Keanggotaan Peternak Unggas
                </h2>
                <p className="text-xs text-slate-400">
                  Pilih paket untuk mengaktifkan formulasi AI presisi tanpa batas dan akses supplier pakan terverifikasi:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-slate-300 block">Paket Starter Peternak</span>
                    <span className="text-2xl font-extrabold text-white block">
                      Rp 49.000 <span className="text-xs font-normal text-slate-400">/ 30 hari</span>
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      <li>• Radius pencarian pakan 15 km</li>
                      <li>• 30x Formulasi Ransum AI Gemini / bulan</li>
                      <li>• Akses direktori pakan lokal</li>
                    </ul>
                    <button
                      onClick={() => {
                        setSelectedPlan('peternak_starter');
                        setIsPaymentModalOpen(true);
                      }}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all"
                    >
                      Pilih Paket Starter
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-950/40 to-slate-900/80 border border-teal-500/40 space-y-3 shadow-lg shadow-teal-500/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-300 block">Pro Peternak Mandiri</span>
                      <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-bold">Pilihan Terbaik</span>
                    </div>
                    <span className="text-2xl font-extrabold text-teal-300 block">
                      Rp 99.000 <span className="text-xs font-normal text-slate-400">/ 30 hari</span>
                    </span>
                    <ul className="text-xs text-slate-200 space-y-1.5">
                      <li>• Radius pencarian pakan tak terbatas (hingga 30 km)</li>
                      <li>• Unlimited Formulasi Ransum AI Gemini</li>
                      <li>• Rekomendasi mitigasi agroklimat heat stress real-time</li>
                      <li>• Badge Peternak Terverifikasi (Harga Prioritas)</li>
                    </ul>
                    <button
                      onClick={() => {
                        setSelectedPlan('peternak_pro');
                        setIsPaymentModalOpen(true);
                      }}
                      className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-600/30 transition-all"
                    >
                      Langganan Paket Pro
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB: VERIFICATION_STATUS (STATUS VERIFIKASI AKUN)                */}
          {/* =============================================================== */}
          {activeTab === 'verification_status' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-[#0d1613] border border-emerald-950/70 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                  Alur Verifikasi Akun Peternak
                </h2>
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong className="text-white block">Pembayaran Biaya Langganan:</strong>
                      Peternak memilih paket dan mentransfer biaya langganan ke rekening resmi bank BCA, Mandiri, BRI atau QRIS.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center shrink-0">2</span>
                    <div>
                      <strong className="text-white block">Pemeriksaan Mutasi oleh Admin:</strong>
                      Bukti transfer otomatis masuk ke antrean verifikasi di Dashboard Admin untuk dicocokkan dengan mutasi rekening.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">3</span>
                    <div>
                      <strong className="text-white block">Aktivasi Hak Akses Pro:</strong>
                      Setelah admin menekan tombol &quot;Verifikasi &amp; Aktifkan&quot;, akun Anda langsung berstatus terverifikasi dan fitur AI formulasi aktif selama 30 hari.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal Pembayaran Biaya Langganan Peternak */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1411] border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-950/80">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  Pembayaran Biaya Langganan Peternak
                </h3>
                <p className="text-xs text-slate-400">
                  Aktifkan fitur pro dan dapatkan verifikasi resmi dari Admin be-ternak
                </p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Pilih Paket Keanggotaan:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedPlan('peternak_starter')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedPlan === 'peternak_starter'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-bold block">Starter Peternak</span>
                    <span className="text-base font-extrabold text-white mt-1 block">
                      Rp 49.000 <span className="text-[10px] font-normal text-slate-400">/ 30 hr</span>
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Radius 15 km, 30x AI Formulasi</span>
                  </div>

                  <div
                    onClick={() => setSelectedPlan('peternak_pro')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedPlan === 'peternak_pro'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white ring-1 ring-emerald-500/50'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold block">Pro Mandiri</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">Terbaik</span>
                    </div>
                    <span className="text-base font-extrabold text-emerald-400 mt-1 block">
                      Rp 99.000 <span className="text-[10px] font-normal text-slate-400">/ 30 hr</span>
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Radius 30 km, Unlimited AI & Heat Stress</span>
                  </div>
                </div>
              </div>

              {/* Rekening Tujuan */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-200 block">Rekening Resmi be-ternak:</span>
                <div className="space-y-1 text-slate-300">
                  <p>• <strong>BCA:</strong> 8820-123-999 a.n PT be-ternak Agritech</p>
                  <p>• <strong>Mandiri:</strong> 144-00-9988-121 a.n PT be-ternak Agritech</p>
                  <p>• <strong>QRIS Dinamis:</strong> Tersedia di kasir aplikasi</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Metode Pembayaran:
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="bank_transfer_bca">Transfer Bank BCA</option>
                  <option value="bank_transfer_mandiri">Transfer Bank Mandiri</option>
                  <option value="bank_transfer_bri">Transfer Bank BRI</option>
                  <option value="qris">QRIS (GoPay / OVO / ShopeePay / Livin)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Nomor Referensi Transfer / 4 Digit Terakhir Rekening:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BCA-TRX-99214 atau Ref 8821"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Kirim Bukti Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
