'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import {
  UserProfile,
  SubscriptionPlanType,
  PaymentMethod,
  FeedCategory,
  FeedSource,
} from '@/lib/types';
import {
  loadUsersFromStorage,
  getActiveUserId,
  submitSubscriptionPayment,
  loadFeedSourcesFromStorage,
  addFeedSourceToStorage,
  DEFAULT_SUPPLIER_PROFILE,
} from '@/lib/subscription-store';
import UnverifiedAccountNotice from '@/components/ui/UnverifiedAccountNotice';
import {
  CheckCircle2,
  CreditCard,
  Plus,
  Send,
  MessageCircle,
  Eye,
  Package,
  Map,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  Users,
  Clock,
} from 'lucide-react';

type PemasokTab = 'catalog' | 'stats' | 'subscription' | 'verification_status';

interface SupplierFeedItem {
  id: string;
  name: string;
  feed_material: string;
  category: string;
  price_per_kg: number;
  availability: string;
  stock_ton: number;
  is_verified: boolean;
  views_count: number;
  whatsapp_leads: number;
}

const loadProductsForSupplier = (supplierId: string): SupplierFeedItem[] => {
  const allFeeds = loadFeedSourcesFromStorage();
  const filtered = allFeeds.filter((f) => f.supplier_id === supplierId);
  return filtered.map((f) => ({
    id: f.id,
    name: f.name,
    feed_material: f.feed_material,
    category: f.category,
    price_per_kg: f.estimated_price_per_kg,
    availability: f.availability_status || 'Tersedia',
    stock_ton: f.stock_ton ?? 5,
    is_verified: Boolean(f.is_verified),
    views_count: f.is_verified ? 240 + ((f.id.charCodeAt(f.id.length - 1) * 7) % 300) : 15,
    whatsapp_leads: f.is_verified ? 20 + ((f.id.charCodeAt(f.id.length - 1) * 3) % 70) : 2,
  }));
};

export default function PemasokDashboardPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_SUPPLIER_PROFILE);

  // Side Menu State
  const [activeTab, setActiveTab] = useState<PemasokTab>('catalog');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const syncSupplier = () => {
      const loadedUsers = loadUsersFromStorage();
      setUsers(loadedUsers);
      const activeId = getActiveUserId();
      let supplier = loadedUsers.find((u) => u.id === activeId && u.role === 'pemilik_pakan');
      if (!supplier) {
        supplier = loadedUsers.find((u) => u.role === 'pemilik_pakan') || DEFAULT_SUPPLIER_PROFILE;
      }
      if (supplier) {
        setCurrentUser({ ...supplier });
        setProducts(loadProductsForSupplier(supplier.id));
      }
    };

    syncSupplier();

    window.addEventListener('storage', syncSupplier);
    window.addEventListener('focus', syncSupplier);
    const poller = setInterval(syncSupplier, 2000);

    return () => {
      window.removeEventListener('storage', syncSupplier);
      window.removeEventListener('focus', syncSupplier);
      clearInterval(poller);
    };
  }, []);

  // Modal & Form State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanType>('pemasok_pro');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('qris');
  const [paymentRef, setPaymentRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Produk pakan milik pemasok (terkoneksi langsung dengan database feeds)
  const [products, setProducts] = useState<SupplierFeedItem[]>(() => {
    const loadedUsers = loadUsersFromStorage();
    const defaultSupplier = loadedUsers.find((u) => u.role === 'pemilik_pakan') || loadedUsers[3];
    return defaultSupplier ? loadProductsForSupplier(defaultSupplier.id) : [];
  });

  // Form Tambah Produk Pakan
  const [newProductName, setNewProductName] = useState('');
  const [newProductMaterial, setNewProductMaterial] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<FeedCategory>('Limbah Pertanian');
  const [newProductPrice, setNewProductPrice] = useState('3500');
  const [newProductStock, setNewProductStock] = useState('10');

  const refreshUserData = () => {
    const loadedUsers = loadUsersFromStorage();
    setUsers(loadedUsers);
    const activeId = currentUser?.id || DEFAULT_SUPPLIER_PROFILE.id;
    const supplier =
      loadedUsers.find((u) => u.id === activeId) ||
      loadedUsers.find((u) => u.role === 'pemilik_pakan') ||
      DEFAULT_SUPPLIER_PROFILE;
    setCurrentUser(supplier);
  };

  const handleSelectSupplier = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setProducts(loadProductsForSupplier(user.id));
    }
  };

  // Sinkronisasi otomatis jika data pakan diverifikasi atau diubah oleh admin di tab lain
  useEffect(() => {
    const handleSync = () => {
      if (currentUser) {
        setProducts(loadProductsForSupplier(currentUser.id));
        const loadedUsers = loadUsersFromStorage();
        const updated = loadedUsers.find((u) => u.id === currentUser.id);
        if (updated) setCurrentUser(updated);
      }
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [currentUser]);

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

      const amount = planPrices[selectedPlan] || 149000;

      submitSubscriptionPayment(
        currentUser.id,
        selectedPlan,
        amount,
        selectedPaymentMethod,
        paymentRef || `SUP-${Date.now().toString().slice(-5)}`
      );

      refreshUserData();
      setIsPaymentModalOpen(false);
      setPaymentRef('');

      setFeedbackNotice({
        type: 'success',
        message:
          'Pembayaran biaya langganan berhasil diserahkan! Admin sedang memverifikasi bukti Anda. Centang hijau di peta akan aktif setelah verifikasi disetujui.',
      });

      setTimeout(() => setFeedbackNotice(null), 7000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tambah Produk Pakan Baru (Tersambung ke Antrean Verifikasi Admin)
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductMaterial || !currentUser) return;

    const newFeed: FeedSource = {
      id: `feed-${Date.now().toString().slice(-6)}`,
      supplier_id: currentUser.id,
      supplier_name: currentUser.business_name,
      name: newProductName,
      feed_material: newProductMaterial,
      category: newProductCategory,
      target_livestock: ['Ayam Petelur (Layer)', 'Ayam Broiler (Pedaging)', 'Bebek / Itik (Petelur & Pedaging)'],
      estimated_price_per_kg: Number(newProductPrice) || 3000,
      availability_status: 'Tersedia',
      stock_ton: Number(newProductStock) || 5,
      lat: currentUser.lat || -7.7295,
      lng: currentUser.lng || 113.018,
      contact_info: `${currentUser.name} (${currentUser.phone}) - ${currentUser.business_name}`,
      is_verified: false, // Selalu false agar diaudit & diverifikasi Admin terlebih dahulu
      source_type: 'pengajuan_pemasok',
      last_verified_at: null,
      created_at: new Date().toISOString(),
    };

    addFeedSourceToStorage(newFeed);
    setProducts(loadProductsForSupplier(currentUser.id));
    setIsAddProductModalOpen(false);
    setNewProductName('');
    setNewProductMaterial('');

    setFeedbackNotice({
      type: 'success',
      message: `Bahan pakan "${newProductName}" berhasil diajukan! Status saat ini "Perlu Konfirmasi" dan telah masuk ke Antrean Verifikasi Admin agar mendapatkan centang hijau resmi di peta.`,
    });
    setTimeout(() => setFeedbackNotice(null), 7000);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070d0b] text-white flex items-center justify-center">
        <p className="text-sm text-slate-400">Memuat Portal Pemilik Pakan...</p>
      </div>
    );
  }

  const totalLeads = products.reduce((acc, p) => acc + p.whatsapp_leads, 0);
  const totalViews = products.reduce((acc, p) => acc + p.views_count, 0);

  // Side Menu Configuration
  const sideMenuItems = [
    {
      group: 'PRODUK & PENJUALAN',
      items: [
        {
          id: 'catalog',
          label: 'Katalog Bahan Pakan',
          icon: Package,
          badge: mounted ? `${products.length} Produk` : null,
          badgeColor: 'bg-emerald-950 text-emerald-400 border border-emerald-500/20',
        },
        {
          id: 'stats',
          label: 'Statistik & Leads WA',
          icon: MessageCircle,
          badge: mounted ? `${totalLeads} Leads` : null,
          badgeColor: 'bg-teal-950 text-teal-300 border border-teal-500/30',
        },
      ],
    },
    {
      group: 'KEMITRAAN & VERIFIKASI',
      items: [
        {
          id: 'subscription',
          label: 'Biaya Langganan Mitra',
          icon: CreditCard,
          badge:
            currentUser.is_verified
              ? 'Mitra Resmi'
              : currentUser.subscription_status === 'pending_verification'
              ? 'Pending'
              : 'Verif',
          badgeColor:
            currentUser.is_verified
              ? 'bg-emerald-500/20 text-emerald-300'
              : currentUser.subscription_status === 'pending_verification'
              ? 'bg-amber-500/20 text-amber-300 animate-pulse'
              : 'bg-slate-800 text-slate-300',
        },
        {
          id: 'verification_status',
          label: 'Sertifikasi Centang Hijau',
          icon: ShieldCheck,
          badge: currentUser.is_verified ? 'Aktif' : 'Perlu Verif',
          badgeColor: currentUser.is_verified
            ? 'bg-emerald-500/20 text-emerald-300'
            : 'bg-amber-500/20 text-amber-300',
        },
      ],
    },
  ];

  return (
    <div className="h-screen bg-[#070d0b] text-slate-100 flex flex-col font-sans overflow-hidden">
      <Navbar currentRegionName={`Gudang: ${currentUser.business_name}`} />

      {/* Mobile Menu Toggle Header (< lg) */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0d1613] border-b border-emerald-950/80">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>{isMobileMenuOpen ? 'Tutup Menu' : 'Menu Pemasok'}</span>
        </button>

        <div className="flex items-center gap-2">
          {currentUser.is_verified ? (
            <span
              suppressHydrationWarning
              className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold"
            >
              ✓ Centang Hijau Aktif
            </span>
          ) : (
            <span
              suppressHydrationWarning
              className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold animate-pulse"
            >
              ⏳ Menunggu Verifikasi
            </span>
          )}
          <span
            suppressHydrationWarning
            className="text-xs font-bold text-white truncate max-w-[120px]"
          >
            {mounted ? currentUser.name : DEFAULT_SUPPLIER_PROFILE.name}
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
          {/* Top Section: Supplier Profile Card */}
          <div className="p-4 border-b border-emerald-950/70">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900/60 border border-emerald-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-md text-xl">
                🌾
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 suppressHydrationWarning className="text-xs font-bold text-white truncate">
                    {mounted ? currentUser.name : DEFAULT_SUPPLIER_PROFILE.name}
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                </div>
                <p suppressHydrationWarning className="text-[10px] text-emerald-400 font-semibold truncate">
                  {mounted ? currentUser.business_name : DEFAULT_SUPPLIER_PROFILE.business_name}
                </p>
                <p suppressHydrationWarning className="text-[9px] text-slate-400 truncate">
                  {mounted && currentUser.supply_capacity_ton_month ? `Kapasitas Suplai: ${currentUser.supply_capacity_ton_month} Ton/bln` : 'Sentra Pakan Alternatif'}
                </p>
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
                          setActiveTab(item.id as PemasokTab);
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

                {/* Khusus Admin Platform */}
                {currentUser?.role === 'admin' && (
                  <>
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
                      href="/admin"
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Panel Admin</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-emerald-950/70 bg-[#070d0b]/90 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Status Centang Hijau:</span>
              <strong className={currentUser.is_verified ? 'text-emerald-400' : 'text-amber-400'}>
                {currentUser.is_verified ? '✓ Terverifikasi' : 'Perlu Konfirmasi'}
              </strong>
            </div>

            <button
              onClick={() => setIsAddProductModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Bahan Pakan
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
        <main className="flex-1 h-full overflow-y-auto px-4 sm:px-8 py-6 pb-24 lg:pb-8 space-y-6 w-full">
          {mounted && currentUser && !currentUser.is_verified && activeTab !== 'subscription' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Portal Pemilik Pakan</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-emerald-400 font-semibold capitalize">
                  {activeTab === 'catalog'
                    ? 'Katalog Bahan Pakan'
                    : activeTab === 'stats'
                    ? 'Statistik Penjualan'
                    : 'Sertifikasi Centang Hijau'}
                </span>
              </div>
              <UnverifiedAccountNotice
                user={currentUser}
                featureName="Portal Pemilik Pakan Alternatif"
                onRefresh={refreshUserData}
              />
            </div>
          ) : (
            <>
              {/* Feedback Notice */}
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
                <span>Portal Pemilik Pakan</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-emerald-400 font-semibold capitalize">
                  {activeTab === 'catalog'
                    ? 'Katalog Bahan Pakan'
                    : activeTab === 'stats'
                    ? 'Statistik Penjualan & Leads'
                    : activeTab === 'subscription'
                    ? 'Biaya Langganan Mitra'
                    : 'Sertifikasi Centang Hijau'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                {activeTab === 'catalog' && 'Katalog Bahan Pakan Suplai Saya'}
                {activeTab === 'stats' && 'Statistik Kunjungan Peta & Pesanan WhatsApp'}
                {activeTab === 'subscription' && 'Langganan Mitra Pemasok Terverifikasi'}
                {activeTab === 'verification_status' && 'Panduan Lencana Verifikasi Centang Hijau'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddProductModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Produk
              </button>
            </div>
          </div>

          {/* =============================================================== */}
          {/* TAB: CATALOG (KATALOG BAHAN PAKAN)                              */}
          {/* =============================================================== */}
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              {/* Verification Status Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0d1613] via-[#09120f] to-emerald-950/30 border border-emerald-500/30 shadow-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Status Kemitraan Pemasok
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          currentUser.is_verified
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : currentUser.subscription_status === 'pending_verification'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {currentUser.is_verified
                          ? 'Mitra Pemasok Terverifikasi (Centang Hijau Aktif)'
                          : currentUser.subscription_status === 'pending_verification'
                          ? 'Menunggu Verifikasi Admin'
                          : 'Belum Terverifikasi'}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      {currentUser.is_verified ? (
                        <span>Titik Pakan Anda Ditampilkan dengan Badge Centang Hijau</span>
                      ) : currentUser.subscription_status === 'pending_verification' ? (
                        <span>Pembayaran Sedang Diverifikasi oleh Admin</span>
                      ) : (
                        <span>Daftarkan Verifikasi Resmi Pemasok be-ternak</span>
                      )}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {currentUser.is_verified
                        ? 'Produk bahan baku pakan Anda diprioritaskan di baris pertama pencarian peternak dalam radius 30 km. Peternak dapat langsung menghubungi WhatsApp Anda dengan 1-klik.'
                        : currentUser.subscription_status === 'pending_verification'
                        ? 'Admin be-ternak sedang memverifikasi bukti transfer dan legalitas lokasi usaha Anda. Setelah diverifikasi, seluruh titik pakan Anda akan mendapatkan lencana centang hijau.'
                        : 'Tingkatkan kepercayaan peternak ayam & unggas dengan Badge Terverifikasi Resmi. Pemasok terverifikasi mengalami kenaikan pesanan WhatsApp hingga 5x lipat.'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3">
                    {currentUser.subscription_status !== 'active' ? (
                      <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Bayar Langganan Verifikasi
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsAddProductModalOpen(true)}
                        className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Tambah Bahan Pakan Baru
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid Produk Pakan */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl bg-[#0d1613] border border-emerald-950/80 hover:border-emerald-500/40 transition-all space-y-3 shadow-lg flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                          {p.category}
                        </span>
                        {p.is_verified ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Terverifikasi
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3" />
                            Menunggu Verifikasi Admin
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white leading-snug">{p.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{p.feed_material}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Harga Satuan:</span>
                        <strong className="text-sm font-extrabold text-emerald-400">
                          Rp {p.price_per_kg.toLocaleString('id-ID')} / kg
                        </strong>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Ketersediaan Stok:</span>
                        <span className="font-semibold text-slate-200">
                          {p.stock_ton} Ton ({p.availability})
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] bg-slate-900/60 p-2 rounded-xl text-slate-400">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.views_count} views</span>
                        </div>
                        <div className="flex items-center gap-1 text-teal-400 font-semibold">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{p.whatsapp_leads} Leads WA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB: STATS (STATISTIK PENJUALAN & LEADS WA)                     */}
          {/* =============================================================== */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#0d1613] border border-emerald-950/80 space-y-2">
                  <span className="text-xs font-medium text-slate-400">Total Kunjungan Peternak</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      {totalViews.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold">Tayangan Peta</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Dilihat peternak unggas di sekitar radius gudang
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0d1613] border border-emerald-950/80 space-y-2">
                  <span className="text-xs font-medium text-slate-400">Pesanan Masuk via WhatsApp</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-teal-400">
                      {totalLeads}
                    </span>
                    <span className="text-xs text-slate-400">Calon Pembeli</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    1-Click Direct Chat dari peternak di peta
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0d1613] border border-emerald-950/80 space-y-2">
                  <span className="text-xs font-medium text-slate-400">Kapasitas Suplai Bulanan</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      {currentUser.supply_capacity_ton_month || 30}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold">Ton / Bulan</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Dedak padi, ampas tahu, BSF, & limbah olahan
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB: SUBSCRIPTION (BIAYA LANGGANAN MITRA)                       */}
          {/* =============================================================== */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#0d1613] border border-emerald-500/30 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  Paket Kemitraan Pemasok Bahan Pakan
                </h2>
                <p className="text-xs text-slate-400">
                  Pilih paket untuk menampilkan lencana verifikasi resmi dan meningkatkan penjualan limbah pakan:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-slate-300 block">Paket Mitra UMKM</span>
                    <span className="text-2xl font-extrabold text-white block">
                      Rp 79.000 <span className="text-xs font-normal text-slate-400">/ 30 hari</span>
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      <li>• Hingga 3 titik pasokan pakan</li>
                      <li>• Lencana Centang Hijau Terverifikasi</li>
                      <li>• Tombol Chat WhatsApp langsung</li>
                    </ul>
                    <button
                      onClick={() => {
                        setSelectedPlan('pemasok_umkm');
                        setIsPaymentModalOpen(true);
                      }}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all"
                    >
                      Pilih Paket UMKM
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900/80 border border-emerald-500/40 space-y-3 shadow-lg shadow-emerald-500/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 block">Agroindustri Prioritas</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Paling Populer</span>
                    </div>
                    <span className="text-2xl font-extrabold text-emerald-300 block">
                      Rp 149.000 <span className="text-xs font-normal text-slate-400">/ 30 hari</span>
                    </span>
                    <ul className="text-xs text-slate-200 space-y-1.5">
                      <li>• Titik pasokan tanpa batas</li>
                      <li>• Prioritas teratas hasil pencarian peternak radius 30 km</li>
                      <li>• Banner promosi bahan pakan</li>
                      <li>• Sertifikasi uji lab nutrisi pakan</li>
                    </ul>
                    <button
                      onClick={() => {
                        setSelectedPlan('pemasok_pro');
                        setIsPaymentModalOpen(true);
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
                    >
                      Langganan Agroindustri Pro
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB: VERIFICATION_STATUS (SERTIFIKASI CENTANG HIJAU)             */}
          {/* =============================================================== */}
          {activeTab === 'verification_status' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-[#0d1613] border border-emerald-950/70 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Mengapa Pemasok Harus Mendapatkan Centang Hijau?
                </h2>
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong className="text-white block">Tampil di Baris Pertama Peta:</strong>
                      Peternak yang mencari dedak, ampas tahu, atau jagung giling dalam radius 30 km akan melihat titik pakan Anda di daftar teratas.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">2</span>
                    <div>
                      <strong className="text-white block">Kepercayaan Peternak Meningkat:</strong>
                      Peternak menghindari supplier tidak jelas karena risiko pakan berjamur/aflatoksin. Badge terverifikasi membuktikan lokasi fisik gudang Anda sah.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">3</span>
                    <div>
                      <strong className="text-white block">Order Masuk Langsung via WhatsApp:</strong>
                      Pemasok terverifikasi rata-rata mendapatkan 5x hingga 8x lead chat pesanan langsung dari kelompok peternak dan koperasi.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </>
          )}
        </main>
      </div>

      {/* Modal Bayar Biaya Langganan Pemasok */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1411] border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-950/80">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  Langganan Verifikasi Resmi Pemasok
                </h3>
                <p className="text-xs text-slate-400">
                  Dapatkan Badge Centang Hijau di peta & prioritas order dari ribuan peternak
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
                  Pilih Paket Kemitraan:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedPlan('pemasok_umkm')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedPlan === 'pemasok_umkm'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-bold block">Mitra UMKM</span>
                    <span className="text-base font-extrabold text-white mt-1 block">
                      Rp 79.000 <span className="text-[10px] font-normal text-slate-400">/ 30 hr</span>
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Hingga 3 titik pakan, Badge Centang Hijau</span>
                  </div>

                  <div
                    onClick={() => setSelectedPlan('pemasok_pro')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedPlan === 'pemasok_pro'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white ring-1 ring-emerald-500/50'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold block">Agroindustri Pro</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">Prioritas</span>
                    </div>
                    <span className="text-base font-extrabold text-emerald-400 mt-1 block">
                      Rp 149.000 <span className="text-[10px] font-normal text-slate-400">/ 30 hr</span>
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Titik tak terbatas, Banner Prioritas 30km</span>
                  </div>
                </div>
              </div>

              {/* Rekening Tujuan */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-200 block">Rekening Resmi be-ternak:</span>
                <div className="space-y-1 text-slate-300">
                  <p>• <strong>BCA:</strong> 8820-123-999 a.n PT be-ternak Agritech</p>
                  <p>• <strong>Mandiri:</strong> 144-00-9988-121 a.n PT be-ternak Agritech</p>
                  <p>• <strong>QRIS:</strong> Tersedia scan instan seluruh e-wallet</p>
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
                  <option value="qris">QRIS (GoPay / OVO / Dana / Livin)</option>
                  <option value="bank_transfer_bca">Transfer Bank BCA</option>
                  <option value="bank_transfer_mandiri">Transfer Bank Mandiri</option>
                  <option value="bank_transfer_bri">Transfer Bank BRI</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Nomor Referensi Transaksi:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: QRIS-TRX-55102 atau Ref Bank"
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Kirim Konfirmasi Bayar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Bahan Pakan Baru */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1411] border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-950/80">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Tambah Bahan Pakan ke Katalog
              </h3>
              <button
                onClick={() => setIsAddProductModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nama Bahan Pakan:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kulit Ari Kedelai / Bekatul Super"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Deskripsi & Spesifikasi Mutu:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Kadar air, kondisi kering/basah, kemasan karung..."
                  value={newProductMaterial}
                  onChange={(e) => setNewProductMaterial(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Kategori:
                  </label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value as FeedCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Limbah Pertanian">Limbah Pertanian</option>
                    <option value="Limbah Agroindustri">Limbah Agroindustri</option>
                    <option value="Limbah Perikanan & Ternak">Limbah Perikanan & Ternak</option>
                    <option value="Hijauan & Karotenoid">Hijauan & Karotenoid</option>
                    <option value="Mineral & Suplemen">Mineral & Suplemen</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Harga / kg (Rp):
                  </label>
                  <input
                    type="number"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Ketersediaan Stok (Ton):
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newProductStock}
                  onChange={(e) => setNewProductStock(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
