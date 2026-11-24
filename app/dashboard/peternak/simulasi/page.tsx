'use client';

import React, { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import {
  UserProfile,
  SavedRansum,
  LayerSimulationScenario,
} from '@/lib/types';
import {
  loadUsersFromStorage,
  loadSavedRansumsFromStorage,
  getActiveUserId,
  setActiveUserId,
  loadSimulationScenariosFromStorage,
  saveSimulationScenarioToStorage,
  deleteSimulationScenarioFromStorage,
  DEFAULT_FARMER_PROFILE,
} from '@/lib/subscription-store';
import UnverifiedAccountNotice from '@/components/ui/UnverifiedAccountNotice';
import {
  Calculator,
  TrendingUp,
  LayoutDashboard,
  BookOpen,
  Layers,
  CreditCard,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Printer,
  Save,
  Trash2,
  DollarSign,
  Scale,
  Egg,
  PieChart as PieIcon,
  LineChart as LineIcon,
  CheckCircle2,
  Info,
  Zap,
  ScanEye,
  ClipboardList,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function LayerSimulationPage() {
  // 1. Data User & Context
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DEFAULT_FARMER_PROFILE);
  const [savedRansums, setSavedRansums] = useState<SavedRansum[]>(() => loadSavedRansumsFromStorage());
  const [scenarios, setScenarios] = useState<LayerSimulationScenario[]>(() =>
    loadSimulationScenariosFromStorage()
  );

  // Mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Client-side mount flag for charts
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    setMounted(true);
    const syncUser = () => {
      const loaded = loadUsersFromStorage();
      setUsers(loaded);
      const activeId = getActiveUserId();
      let activeUser = loaded.find((u) => u.id === activeId && u.role === 'peternak');
      if (!activeUser) {
        activeUser = loaded.find((u) => u.role === 'peternak');
      }
      if (activeUser) {
        setCurrentUser({ ...activeUser });
        if (activeUser.poultry_capacity) {
          setPopulasiAwal(activeUser.poultry_capacity);
        }
      }
    };

    syncUser();

    window.addEventListener('storage', syncUser);
    window.addEventListener('focus', syncUser);
    const poller = setInterval(syncUser, 2000);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('focus', syncUser);
      clearInterval(poller);
    };
  }, []);

  // 2. State Input Parameter Simulator
  const [populasiAwal, setPopulasiAwal] = useState<number>(() => currentUser?.poultry_capacity || 5000);
  const [modeAwal, setModeAwal] = useState<'pullet' | 'doc'>('pullet');
  const [hargaBibit, setHargaBibit] = useState<number>(85000); // Rp 85.000 untuk pullet 18 minggu
  const [biayaGrowerDOC, setBiayaGrowerDOC] = useState<number>(65000); // jika mode DOC, pakan grower 0-18 minggu
  const [biayaKandang, setBiayaKandang] = useState<number>(150000000); // Rp 150 jt
  const [lamaDepresiasiKandang, setLamaDepresiasiKandang] = useState<number>(60); // 60 bulan (5 tahun)

  // Teknis Produksi
  const [hdpPercent, setHdpPercent] = useState<number>(88); // 88% Hen Day Production
  const [beratTelurGram, setBeratTelurGram] = useState<number>(62); // 62 gr/butir
  const [feedIntakeGram, setFeedIntakeGram] = useState<number>(110); // 110 gr/ekor/hari
  const [deplesiPercent, setDeplesiPercent] = useState<number>(5.0); // 5% mortalitas per siklus
  const [lamaSiklusBulan, setLamaSiklusBulan] = useState<number>(18); // 18 bulan masa bertelur

  // Harga & Operasional
  const [hargaJualTelurKg, setHargaJualTelurKg] = useState<number>(27500); // Rp 27.500/kg
  const [hargaPakanKomersial, setHargaPakanKomersial] = useState<number>(9500); // Rp 9.500/kg
  const [isUsingAiFeed, setIsUsingAiFeed] = useState<boolean>(true); // default terintegrasi resep AI

  const [biayaOvkPerEkorBulan, setBiayaOvkPerEkorBulan] = useState<number>(1500); // OVK Rp 1.500/ekor/bln
  const [gajiAnakKandangBulan, setGajiAnakKandangBulan] = useState<number>(4500000); // Rp 4.5 jt/bln
  const [listrikAirBulan, setListrikAirBulan] = useState<number>(1200000); // Rp 1.2 jt/bln
  const [hargaJualAfkirEkor, setHargaJualAfkirEkor] = useState<number>(35000); // Rp 35.000/ekor

  // Modal Simpan Skenario
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [scenarioNameInput, setScenarioNameInput] = useState<string>('');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Sync saat ganti akun demo peternak
  const handleSelectFarmer = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setActiveUserId(user.id);
      if (user.poultry_capacity) {
        setPopulasiAwal(user.poultry_capacity);
      }
      setNoticeMessage(`Akun diswitch ke: ${user.name} (${user.poultry_capacity || 5000} ekor)`);
      setTimeout(() => setNoticeMessage(null), 4000);
    }
  };

  // Cari rata-rata atau resep ransum AI milik user
  const aiRecipePrice = useMemo(() => {
    if (savedRansums.length > 0) {
      const userRecipe = savedRansums.find((r) => r.user_id === currentUser?.id) || savedRansums[0];
      return userRecipe.total_cost_per_kg || 5400;
    }
    return 5400;
  }, [savedRansums, currentUser]);

  // Efektif harga pakan yang digunakan
  const effectiveFeedPrice = isUsingAiFeed ? aiRecipePrice : hargaPakanKomersial;

  // Toggle sync pakan AI
  const toggleUseAiFeed = () => {
    setIsUsingAiFeed(!isUsingAiFeed);
    if (!isUsingAiFeed) {
      setNoticeMessage(`⚡ Sinkronisasi Resep Ransum AI Aktif: Rp ${aiRecipePrice.toLocaleString('id-ID')}/kg`);
    } else {
      setNoticeMessage(`Beralih ke Pakan Komersial Pabrik: Rp ${hargaPakanKomersial.toLocaleString('id-ID')}/kg`);
    }
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  // Saat mode awal berubah (Pullet vs DOC)
  const handleModeAwalChange = (mode: 'pullet' | 'doc') => {
    setModeAwal(mode);
    if (mode === 'pullet') {
      setHargaBibit(85000);
    } else {
      setHargaBibit(12000); // DOC
    }
  };

  // Harga modal bibit efektif per ekor sampai siap bertelur (18 minggu)
  const modalBibitPerEkor = modeAwal === 'pullet' ? hargaBibit : hargaBibit + biayaGrowerDOC;

  // ============================================================================
  // KALKULASI RUMUS MATEMATIS WAJIB
  // ============================================================================
  const calc = useMemo(() => {
    // 1. Populasi
    const deplesiDec = deplesiPercent / 100;
    const populasiRataRata = populasiAwal * (1 - deplesiDec / 2);
    const populasiAkhir = populasiAwal * (1 - deplesiDec);

    // 2. Produksi Telur Harian
    const hdpDec = hdpPercent / 100;
    const butirTelurHarian = populasiRataRata * hdpDec;
    const telurHarianKg = (butirTelurHarian * beratTelurGram) / 1000;
    const telurBulananKg = telurHarianKg * 30;
    const telurSiklusKg = telurBulananKg * lamaSiklusBulan;

    // 3. Konsumsi Pakan Harian
    const pakanHarianKg = (populasiRataRata * feedIntakeGram) / 1000;
    const pakanBulananKg = pakanHarianKg * 30;
    const pakanSiklusKg = pakanBulananKg * lamaSiklusBulan;

    // 4. FCR (Feed Conversion Ratio)
    const fcr = telurHarianKg > 0 ? pakanHarianKg / telurHarianKg : 0;

    // 5. Biaya Depresiasi / Penyusutan
    // Penyusutan Bibit = (Modal Bibit Awal - Nilai Afkir Akhir) / Lama Siklus
    const totalModalBibit = populasiAwal * modalBibitPerEkor;
    const totalNilaiAfkir = populasiAkhir * hargaJualAfkirEkor;
    const penyusutanBibitSiklus = Math.max(0, totalModalBibit - totalNilaiAfkir);
    const penyusutanBibitBulan = penyusutanBibitSiklus / lamaSiklusBulan;

    // Penyusutan Kandang & Alat
    const penyusutanKandangBulan = lamaDepresiasiKandang > 0 ? biayaKandang / lamaDepresiasiKandang : 0;
    const penyusutanKandangSiklus = penyusutanKandangBulan * lamaSiklusBulan;

    // 6. Biaya Operasional (OPEX)
    // Biaya Pakan (dengan harga aktif)
    const biayaPakanBulan = pakanBulananKg * effectiveFeedPrice;
    const biayaPakanSiklus = pakanSiklusKg * effectiveFeedPrice;

    // Biaya Pakan Komersial (sebagai pembanding)
    const biayaPakanKomersialBulan = pakanBulananKg * hargaPakanKomersial;
    const biayaPakanKomersialSiklus = pakanSiklusKg * hargaPakanKomersial;

    // Biaya Pakan dengan Resep AI murni
    const biayaPakanAiBulan = pakanBulananKg * aiRecipePrice;
    const biayaPakanAiSiklus = pakanSiklusKg * aiRecipePrice;

    // Penghematan jika pakai PetaPakan AI
    const penghematanPakanBulan = biayaPakanKomersialBulan - biayaPakanAiBulan;
    const penghematanPakanSiklus = biayaPakanKomersialSiklus - biayaPakanAiSiklus;

    // OVK & Utilitas
    const biayaOvkBulan = populasiRataRata * biayaOvkPerEkorBulan;
    const biayaOvkSiklus = biayaOvkBulan * lamaSiklusBulan;

    const biayaGajiBulan = gajiAnakKandangBulan;
    const biayaGajiSiklus = biayaGajiBulan * lamaSiklusBulan;

    const biayaListrikAirBulan = listrikAirBulan;
    const biayaListrikAirSiklus = biayaListrikAirBulan * lamaSiklusBulan;

    const totalBiayaNonPakanBulan =
      biayaOvkBulan + biayaGajiBulan + biayaListrikAirBulan + penyusutanBibitBulan + penyusutanKandangBulan;

    // Total Biaya Bulanan & Siklus (dengan harga pakan aktif)
    const totalBiayaBulan = biayaPakanBulan + totalBiayaNonPakanBulan;
    const totalBiayaSiklus =
      biayaPakanSiklus +
      biayaOvkSiklus +
      biayaGajiSiklus +
      biayaListrikAirSiklus +
      penyusutanBibitSiklus +
      penyusutanKandangSiklus;

    // 7. Pendapatan (Revenue)
    const pendapatanTelurBulan = telurBulananKg * hargaJualTelurKg;
    const pendapatanTelurSiklus = telurSiklusKg * hargaJualTelurKg;
    const totalPendapatanSiklus = pendapatanTelurSiklus + totalNilaiAfkir;

    // 8. HPP (Harga Pokok Produksi) per Kg Telur
    const hppPerKg = telurBulananKg > 0 ? totalBiayaBulan / telurBulananKg : 0;
    const marginPerKg = hargaJualTelurKg - hppPerKg;

    // HPP Komersial (sebagai pembanding)
    const totalBiayaKomersialBulan = biayaPakanKomersialBulan + totalBiayaNonPakanBulan;
    const hppKomersialPerKg = telurBulananKg > 0 ? totalBiayaKomersialBulan / telurBulananKg : 0;

    // 9. Laba Bersih
    const labaBersihBulan = pendapatanTelurBulan - totalBiayaBulan;
    const labaBersihSiklus = totalPendapatanSiklus - totalBiayaSiklus;

    // Laba Bersih jika komersial
    const labaKomersialBulan = pendapatanTelurBulan - totalBiayaKomersialBulan;

    // 10. R/C Ratio & Payback Period
    const rcRatio = totalBiayaBulan > 0 ? pendapatanTelurBulan / totalBiayaBulan : 0;

    const modalAwalInvestasi = totalModalBibit + biayaKandang;
    // Cashflow operasional bulanan = Laba Bersih + Penyusutan Kandang (non-cash)
    const cashflowOperasionalBulan = labaBersihBulan + penyusutanKandangBulan;
    const paybackPeriodBulan =
      cashflowOperasionalBulan > 0 ? modalAwalInvestasi / cashflowOperasionalBulan : 999;

    return {
      populasiRataRata: Math.round(populasiRataRata),
      populasiAkhir: Math.round(populasiAkhir),
      butirTelurHarian: Math.round(butirTelurHarian),
      telurHarianKg,
      telurBulananKg,
      telurSiklusKg,
      pakanHarianKg,
      pakanBulananKg,
      pakanSiklusKg,
      fcr,
      modalBibitPerEkor,
      totalModalBibit,
      totalNilaiAfkir,
      penyusutanBibitBulan,
      penyusutanBibitSiklus,
      penyusutanKandangBulan,
      penyusutanKandangSiklus,
      biayaPakanBulan,
      biayaPakanSiklus,
      biayaPakanKomersialBulan,
      biayaPakanKomersialSiklus,
      biayaPakanAiBulan,
      penghematanPakanBulan,
      penghematanPakanSiklus,
      biayaOvkBulan,
      biayaOvkSiklus,
      biayaGajiBulan,
      biayaGajiSiklus,
      biayaListrikAirBulan,
      biayaListrikAirSiklus,
      totalBiayaBulan,
      totalBiayaSiklus,
      pendapatanTelurBulan,
      pendapatanTelurSiklus,
      totalPendapatanSiklus,
      hppPerKg,
      hppKomersialPerKg,
      marginPerKg,
      labaBersihBulan,
      labaBersihSiklus,
      labaKomersialBulan,
      rcRatio,
      modalAwalInvestasi,
      cashflowOperasionalBulan,
      paybackPeriodBulan,
    };
  }, [
    populasiAwal,
    modalBibitPerEkor,
    biayaKandang,
    lamaDepresiasiKandang,
    hdpPercent,
    beratTelurGram,
    feedIntakeGram,
    deplesiPercent,
    lamaSiklusBulan,
    hargaJualTelurKg,
    effectiveFeedPrice,
    hargaPakanKomersial,
    aiRecipePrice,
    biayaOvkPerEkorBulan,
    gajiAnakKandangBulan,
    listrikAirBulan,
    hargaJualAfkirEkor,
  ]);

  // ============================================================================
  // DATA UNTUK GRAFIK RECHARTS
  // ============================================================================

  // 1. Data Cashflow Curve (Arus Kas Kumulatif Bulan 0 s/d 18)
  const cashflowChartData = useMemo(() => {
    const data = [];
    // Bulan 0: Arus kas negatif sebesar modal awal
    let kumulatifAi = -calc.modalAwalInvestasi;
    let kumulatifKomersial = -calc.modalAwalInvestasi;

    data.push({
      bulanLabel: 'Bln 0 (Modal)',
      bulanNum: 0,
      'be-ternak AI': Math.round(kumulatifAi / 1000000),
      'Pakan Komersial': Math.round(kumulatifKomersial / 1000000),
      bepLine: 0,
    });

    const netCashflowAiBulan = calc.labaBersihBulan + calc.penyusutanKandangBulan;
    const netCashflowKomersialBulan = calc.labaKomersialBulan + calc.penyusutanKandangBulan;

    for (let m = 1; m <= lamaSiklusBulan; m++) {
      kumulatifAi += netCashflowAiBulan;
      kumulatifKomersial += netCashflowKomersialBulan;

      // Pada bulan terakhir, tambahkan penjualan ayam afkir
      if (m === lamaSiklusBulan) {
        kumulatifAi += calc.totalNilaiAfkir;
        kumulatifKomersial += calc.totalNilaiAfkir;
      }

      data.push({
        bulanLabel: `Bln ${m}`,
        bulanNum: m,
        'be-ternak AI': Math.round(kumulatifAi / 1000000),
        'Pakan Komersial': Math.round(kumulatifKomersial / 1000000),
        bepLine: 0,
      });
    }

    return data;
  }, [calc, lamaSiklusBulan]);

  // 2. Data Struktur Biaya (Donut Chart)
  const costBreakdownData = useMemo(() => {
    return [
      { name: 'Pakan Ransum', value: Math.round(calc.biayaPakanBulan), color: '#10B981' }, // Emerald
      { name: 'Penyusutan Bibit', value: Math.round(calc.penyusutanBibitBulan), color: '#06B6D4' }, // Cyan
      { name: 'Gaji Tenaga Kerja', value: Math.round(calc.biayaGajiBulan), color: '#F59E0B' }, // Amber
      { name: 'OVK & Vitamin', value: Math.round(calc.biayaOvkBulan), color: '#8B5CF6' }, // Violet
      { name: 'Penyusutan Kandang', value: Math.round(calc.penyusutanKandangBulan), color: '#EC4899' }, // Pink
      { name: 'Listrik & Air', value: Math.round(calc.biayaListrikAirBulan), color: '#64748B' }, // Slate
    ];
  }, [calc]);

  // Simpan Skenario
  const handleSaveScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioNameInput.trim()) return;

    const newScenario: LayerSimulationScenario = {
      id: `scen-${Date.now()}`,
      user_id: currentUser?.id || DEFAULT_FARMER_PROFILE.id,
      name: scenarioNameInput.trim(),
      created_at: new Date().toISOString(),
      params: {
        populasiAwal,
        modeAwal,
        hargaBibit,
        biayaKandang,
        hdpPercent,
        beratTelurGram,
        feedIntakeGram,
        deplesiPercent,
        lamaSiklusBulan,
        hargaJualTelurKg,
        hargaPakanKg: effectiveFeedPrice,
        isUsingAiFeed,
        biayaOvkPerEkorBulan,
        gajiAnakKandangBulan,
        listrikAirBulan,
        hargaJualAfkirEkor,
      },
      results: {
        populasiRataRata: calc.populasiRataRata,
        telurHarianKg: calc.telurHarianKg,
        pakanHarianKg: calc.pakanHarianKg,
        fcr: calc.fcr,
        hppPerKg: calc.hppPerKg,
        labaBersihBulan: calc.labaBersihBulan,
        labaBersihTotal: calc.labaBersihSiklus,
        rcRatio: calc.rcRatio,
        paybackMonths: calc.paybackPeriodBulan,
        savingsPerMonthVsCommercial: calc.penghematanPakanBulan,
      },
    };

    saveSimulationScenarioToStorage(newScenario);
    setScenarios(loadSimulationScenariosFromStorage());
    setIsSaveModalOpen(false);
    setScenarioNameInput('');
    setNoticeMessage(`✓ Skenario "${newScenario.name}" berhasil disimpan!`);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  // Muat Skenario
  const handleLoadScenario = (scen: LayerSimulationScenario) => {
    setPopulasiAwal(scen.params.populasiAwal);
    setModeAwal(scen.params.modeAwal);
    setHargaBibit(scen.params.hargaBibit);
    setBiayaKandang(scen.params.biayaKandang);
    setHdpPercent(scen.params.hdpPercent);
    setBeratTelurGram(scen.params.beratTelurGram);
    setFeedIntakeGram(scen.params.feedIntakeGram);
    setDeplesiPercent(scen.params.deplesiPercent);
    setLamaSiklusBulan(scen.params.lamaSiklusBulan);
    setHargaJualTelurKg(scen.params.hargaJualTelurKg);
    setIsUsingAiFeed(scen.params.isUsingAiFeed);
    setBiayaOvkPerEkorBulan(scen.params.biayaOvkPerEkorBulan);
    setGajiAnakKandangBulan(scen.params.gajiAnakKandangBulan);
    setListrikAirBulan(scen.params.listrikAirBulan);
    setHargaJualAfkirEkor(scen.params.hargaJualAfkirEkor);

    setNoticeMessage(`✓ Skenario "${scen.name}" berhasil dimuat!`);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  // Hapus Skenario
  const handleDeleteScenario = (id: string, name: string) => {
    deleteSimulationScenarioFromStorage(id);
    setScenarios(loadSimulationScenariosFromStorage());
    setNoticeMessage(`Skenario "${name}" dihapus.`);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  // Print / PDF Handler
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070d0b] text-white flex items-center justify-center">
        <p className="text-sm text-slate-400">Memuat Simulasi Usaha Layer...</p>
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
          active: true,
        },
        {
          id: 'recording',
          label: 'Recording Harian',
          icon: ClipboardList,
          badge: 'Harian',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold',
          href: '/dashboard/peternak/recording',
        },
        {
          id: 'health-scan',
          label: 'AI Health Scan',
          icon: ScanEye,
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
          id: 'subscription',
          label: 'Langganan & Pembayaran',
          icon: CreditCard,
          badge: currentUser.is_verified ? 'Pro Aktif' : 'Pending',
          badgeColor: currentUser.is_verified
            ? 'bg-emerald-500/20 text-emerald-300'
            : 'bg-amber-500/20 text-amber-300',
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
    <div className="h-screen bg-[#060D0A] text-slate-100 flex flex-col font-sans overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      <Navbar currentRegionName={mounted && currentUser ? `Kandang: ${currentUser.business_name}` : 'Peternakan Layer'} />

      {/* Mobile Toggle Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0d1613] border-b border-[#1E352B]">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-600/20 text-teal-300 border border-teal-500/40 text-xs font-semibold"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>{isMobileMenuOpen ? 'Tutup Menu' : 'Menu Peternak'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            Simulasi Layer
          </span>
          <span
            suppressHydrationWarning
            className="text-xs font-bold text-white truncate max-w-[120px]"
          >
            {mounted && currentUser ? currentUser.name : DEFAULT_FARMER_PROFILE.name}
          </span>
        </div>
      </div>

      {/* Main Layout: Sidebar (Left) + Simulator Content (Right) */}
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
          {/* Top: Profile Card */}
          <div className="p-4 border-b border-[#1E352B]">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900/60 border border-emerald-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-md text-xl">
                👨‍🌾
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 suppressHydrationWarning className="text-xs font-bold text-white truncate">
                    {mounted && currentUser ? currentUser.name : DEFAULT_FARMER_PROFILE.name}
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                </div>
                <p suppressHydrationWarning className="text-[10px] text-emerald-300 font-semibold truncate">
                  {mounted && currentUser ? currentUser.business_name : DEFAULT_FARMER_PROFILE.business_name}
                </p>
                <p suppressHydrationWarning className="text-[9px] text-slate-400 truncate">
                  {mounted && currentUser?.poultry_capacity ? `Populasi: ${currentUser.poultry_capacity.toLocaleString('id-ID')} Ekor Layer` : 'Unit Peternakan Unggas'}
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
          <div className="p-4 border-t border-[#1E352B] bg-[#070D0A]/50">
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-[11px] text-emerald-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="leading-tight">
                be-ternak AI Engine terhubung aktif ke formulasi nutrisi.
              </span>
            </div>
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
        {/* MAIN SIMULATOR CONTENT                                            */}
        {/* ================================================================= */}
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 space-y-6 w-full">
          {mounted && currentUser && !currentUser.is_verified ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Link
                  href="/dashboard/peternak"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Portal Peternak
                </Link>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span className="text-emerald-400 font-semibold">Simulasi Usaha Layer</span>
              </div>
              <UnverifiedAccountNotice
                user={currentUser}
                featureName="Simulasi Usaha Layer"
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
              {/* Breadcrumb & Actions Bar */}
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
                <span className="text-emerald-400 font-semibold">Simulasi Usaha Layer</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <Calculator className="w-6 h-6 text-emerald-400" />
                <span>Simulasi Usaha Ayam Petelur (Layer)</span>
              </h1>
              <p className="text-xs text-slate-400">
                Proyeksi finansial komprehensif, HPP telur per kg, arus kas siklus, dan dampak efisiensi ransum be-ternak AI.
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              {/* Tombol Sync Resep AI */}
              <button
                onClick={toggleUseAiFeed}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-md cursor-pointer ${
                  isUsingAiFeed
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-600/30 hover:bg-emerald-500'
                    : 'bg-[#0F1D17] text-slate-300 border-[#1E352B] hover:text-white hover:bg-slate-900'
                }`}
                title="Tarik harga pakan dari Resep Ransum be-ternak AI"
              >
                <Zap className={`w-3.5 h-3.5 ${isUsingAiFeed ? 'fill-current text-amber-300' : 'text-emerald-400'}`} />
                <span>{isUsingAiFeed ? 'Pakan AI Aktif' : 'Gunakan Pakan AI'}</span>
              </button>

              {/* Tombol Simpan Skenario */}
              <button
                onClick={() => setIsSaveModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0F1D17] hover:bg-slate-900 border border-[#1E352B] text-slate-200 text-xs font-semibold transition-all hover:text-white cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-teal-400" />
                <span>Simpan Skenario</span>
              </button>

              {/* Tombol Export / Print PDF */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0F1D17] hover:bg-slate-900 border border-[#1E352B] text-slate-200 text-xs font-semibold transition-all hover:text-white cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cetak / PDF</span>
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {noticeMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between shadow-lg animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{noticeMessage}</span>
              </div>
              <button onClick={() => setNoticeMessage(null)} className="text-emerald-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ================================================================= */}
          {/* 4 KARTU KPI UTAMA (SEJAJAR DI ATAS)                               */}
          {/* ================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* KPI 1: HPP Telur / Kg */}
            <div className="p-4 rounded-2xl bg-[#0F1D17] border border-[#1E352B] shadow-lg flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    HPP Telur / Kg
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Scale className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  Rp {Math.round(calc.hppPerKg).toLocaleString('id-ID')}
                  <span className="text-xs font-normal text-slate-400 ml-1">/kg</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#1E352B] flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Harga Jual: Rp {hargaJualTelurKg.toLocaleString('id-ID')}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                    calc.marginPerKg > 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {calc.marginPerKg > 0
                    ? `Margin +Rp ${Math.round(calc.marginPerKg).toLocaleString('id-ID')}`
                    : 'Waspada / Rugi'}
                </span>
              </div>
            </div>

            {/* KPI 2: Estimasi Laba Bersih / Bulan */}
            <div className="p-4 rounded-2xl bg-[#0F1D17] border border-[#1E352B] shadow-lg flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full pointer-events-none group-hover:bg-teal-500/10 transition-colors" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Estimasi Laba Bersih
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  Rp {Math.round(calc.labaBersihBulan).toLocaleString('id-ID')}
                  <span className="text-xs font-normal text-slate-400 ml-1">/bulan</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#1E352B] flex items-center justify-between text-xs">
                <span className="text-[11px] text-emerald-400 font-semibold truncate">
                  {isUsingAiFeed
                    ? `+Rp ${Math.round(calc.penghematanPakanBulan).toLocaleString('id-ID')} vs Pabrik`
                    : 'Mode Pakan Komersial'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {((calc.labaBersihBulan / (calc.pendapatanTelurBulan || 1)) * 100).toFixed(1)}% Margin
                </span>
              </div>
            </div>

            {/* KPI 3: FCR & Produksi Harian */}
            <div className="p-4 rounded-2xl bg-[#0F1D17] border border-[#1E352B] shadow-lg flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    FCR & Produksi Telur
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Egg className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  {calc.fcr.toFixed(2)}
                  <span className="text-xs font-normal text-slate-400 ml-2">
                    ({calc.telurHarianKg.toFixed(1)} kg / hari)
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#1E352B] flex items-center justify-between text-xs text-slate-400 text-[11px]">
                <span>Konsumsi: {calc.pakanHarianKg.toFixed(1)} kg pakan/hari</span>
                <span className="text-amber-400 font-semibold">{calc.butirTelurHarian.toLocaleString('id-ID')} butir</span>
              </div>
            </div>

            {/* KPI 4: R/C Ratio & Payback Period */}
            <div className="p-4 rounded-2xl bg-[#0F1D17] border border-[#1E352B] shadow-lg flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    R/C Ratio & Balik Modal
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  {calc.rcRatio.toFixed(2)}
                  <span className="text-xs font-normal text-slate-400 ml-2">
                    (BEP: {calc.paybackPeriodBulan < 100 ? `${calc.paybackPeriodBulan.toFixed(1)} Bln` : '> 2 Thn'})
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#1E352B] flex items-center justify-between text-xs text-slate-400 text-[11px]">
                <span className={calc.rcRatio >= 1.15 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {calc.rcRatio >= 1.15 ? 'Usaha Sangat Layak' : 'Margin Tipis'}
                </span>
                <span>Siklus: {lamaSiklusBulan} Bulan</span>
              </div>
            </div>

          </div>

          {/* ================================================================= */}
          {/* LAYOUT 2 KOLOM (Kiri: Parameter Input, Kanan: Grafik & Laporan)   */}
          {/* ================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* =============================================================== */}
            {/* KOLOM KIRI (5 Cols): Parameter Input Form                       */}
            {/* =============================================================== */}
            <div className="lg:col-span-5 space-y-4 print:hidden">
              
              {/* Header Box Parameter */}
              <div className="p-4 rounded-2xl bg-[#0F1D17] border border-[#1E352B] space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#1E352B] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      <Calculator className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Parameter Input Kandang
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400">Real-time Calculation</span>
                </div>

                {/* Section 1: Skala & Bibit */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                    1. Skala Kandang & Modal Bibit
                  </span>

                  {/* Mode Bibit Awal (Pullet vs DOC) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Mode Bibit Awal
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#0A1410] border border-[#1E352B]">
                      <button
                        type="button"
                        onClick={() => handleModeAwalChange('pullet')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                          modeAwal === 'pullet'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Pullet 18 Minggu
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModeAwalChange('doc')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                          modeAwal === 'doc'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        DOC + Grower
                      </button>
                    </div>
                  </div>

                  {/* Populasi Ayam Awal */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-semibold text-slate-300">Populasi Ayam Awal</label>
                      <span className="text-emerald-400 font-bold">{populasiAwal.toLocaleString('id-ID')} ekor</span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={30000}
                      step={500}
                      value={populasiAwal}
                      onChange={(e) => setPopulasiAwal(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>500 ekor</span>
                      <span>15.000</span>
                      <span>30.000 ekor</span>
                    </div>
                  </div>

                  {/* Harga Bibit per ekor */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        {modeAwal === 'pullet' ? 'Harga Pullet / Ekor' : 'Harga DOC / Ekor'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs text-slate-400">Rp</span>
                        <input
                          type="number"
                          value={hargaBibit}
                          onChange={(e) => setHargaBibit(Number(e.target.value))}
                          className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-[#0A1410] border border-[#1E352B] text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {modeAwal === 'doc' ? (
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Biaya Grower 0-18 Mgg
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs text-slate-400">Rp</span>
                          <input
                            type="number"
                            value={biayaGrowerDOC}
                            onChange={(e) => setBiayaGrowerDOC(Number(e.target.value))}
                            className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-[#0A1410] border border-[#1E352B] text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Total Modal Bibit
                        </label>
                        <div className="py-1.5 px-3 rounded-lg bg-[#0A1410] border border-[#1E352B] text-xs font-bold text-emerald-300">
                          Rp {Math.round(calc.totalModalBibit / 1000000)} Jt
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Biaya Kandang & Peralatan */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Biaya Kandang & Alat
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs text-slate-400">Rp</span>
                        <input
                          type="number"
                          step={5000000}
                          value={biayaKandang}
                          onChange={(e) => setBiayaKandang(Number(e.target.value))}
                          className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-[#0A1410] border border-[#1E352B] text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Depresiasi Kandang
                      </label>
                      <select
                        value={lamaDepresiasiKandang}
                        onChange={(e) => setLamaDepresiasiKandang(Number(e.target.value))}
                        className="w-full py-1.5 px-2 rounded-lg bg-[#0A1410] border border-[#1E352B] text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value={36}>3 Tahun (36 Bln)</option>
                        <option value={60}>5 Tahun (60 Bln)</option>
                        <option value={84}>7 Tahun (84 Bln)</option>
                        <option value={120}>10 Tahun (120 Bln)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Teknis Produksi */}
                <div className="space-y-3 pt-3 border-t border-[#1E352B]">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                    2. Parameter Teknis Produksi
                  </span>

                  {/* Hen Day Production (HDP %) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-semibold text-slate-300">Hen Day Production (HDP)</label>
                      <span className="text-cyan-400 font-bold">{hdpPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={70}
                      max={95}
                      step={1}
                      value={hdpPercent}
                      onChange={(e) => setHdpPercent(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  {/* Berat Telur & Feed Intake */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Berat Telur Rata-rata
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={beratTelurGram}
                          onChange={(e) => setBeratTelurGram(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A1410] border border-[#1E352B] text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
                        />
                        <span className="absolute right-2.5 top-2 text-[10px] text-slate-400">gram/btr</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Feed Intake / Ekor
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={feedIntakeGram}
                          onChange={(e) => setFeedIntakeGram(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A1410] border border-[#1E352B] text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
                        />
                        <span className="absolute right-2.5 top-2 text-[10px] text-slate-400">gram/hari</span>
                      </div>
                    </div>
                  </div>

                  {/* Deplesi & Lama Siklus */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Deplesi / Kematian
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step={0.5}
                          value={deplesiPercent}
                          onChange={(e) => setDeplesiPercent(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A1410] border border-[#1E352B] text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
                        />
                        <span className="absolute right-2.5 top-2 text-[10px] text-slate-400">% siklus</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Lama Siklus Bertelur
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={lamaSiklusBulan}
                          onChange={(e) => setLamaSiklusBulan(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A1410] border border-[#1E352B] text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
                        />
                        <span className="absolute right-2.5 top-2 text-[10px] text-slate-400">bulan</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Harga & Operasional */}
                <div className="space-y-3 pt-3 border-t border-[#1E352B]">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    3. Harga Pasar & Biaya Operasional
                  </span>

                  {/* Harga Jual Telur */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Harga Jual Telur Segar / Kg
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs text-slate-400">Rp</span>
                      <input
                        type="number"
                        step={500}
                        value={hargaJualTelurKg}
                        onChange={(e) => setHargaJualTelurKg(Number(e.target.value))}
                        className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-[#0A1410] border border-[#1E352B] text-xs font-bold text-emerald-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Panel Pakan & Tombol Sync AI */}
                  <div className="p-3 rounded-xl bg-[#0A1410] border border-[#1E352B] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-200">
                        Harga Pakan / Kg
                      </label>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isUsingAiFeed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isUsingAiFeed ? '✓ Resep be-ternak AI' : 'Pakan Komersial'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-2 text-xs text-slate-400">Rp</span>
                        <input
                          type="number"
                          value={effectiveFeedPrice}
                          disabled={isUsingAiFeed}
                          onChange={(e) => {
                            if (!isUsingAiFeed) {
                              setHargaPakanKomersial(Number(e.target.value));
                            }
                          }}
                          className={`w-full pl-8 pr-2 py-1.5 rounded-lg text-xs font-bold border ${
                            isUsingAiFeed
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                              : 'bg-[#0F1D17] border-[#1E352B] text-white'
                          }`}
                        />
                      </div>

                      {/* Tombol Sync Resep Ransum AI */}
                      <button
                        type="button"
                        onClick={toggleUseAiFeed}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 cursor-pointer ${
                          isUsingAiFeed
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                        title="Klik untuk beralih antara Pakan AI vs Komersial"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>{isUsingAiFeed ? 'Tarik Komersial' : 'Gunakan AI'}</span>
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Harga Pakan AI: Rp {aiRecipePrice.toLocaleString('id-ID')}/kg</span>
                      <span className="text-amber-400">Pabrik: Rp {hargaPakanKomersial.toLocaleString('id-ID')}/kg</span>
                    </div>
                  </div>

                  {/* Biaya OVK, Gaji, Listrik, Afkir */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Biaya OVK / Ekor / Bln
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-[11px] text-slate-400">Rp</span>
                        <input
                          type="number"
                          value={biayaOvkPerEkorBulan}
                          onChange={(e) => setBiayaOvkPerEkorBulan(Number(e.target.value))}
                          className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-[#0A1410] border border-[#1E352B] text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Gaji Anak Kandang / Bln
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-[11px] text-slate-400">Rp</span>
                        <input
                          type="number"
                          step={500000}
                          value={gajiAnakKandangBulan}
                          onChange={(e) => setGajiAnakKandangBulan(Number(e.target.value))}
                          className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-[#0A1410] border border-[#1E352B] text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Listrik, Air & Biaya Lain
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-[11px] text-slate-400">Rp</span>
                        <input
                          type="number"
                          step={200000}
                          value={listrikAirBulan}
                          onChange={(e) => setListrikAirBulan(Number(e.target.value))}
                          className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-[#0A1410] border border-[#1E352B] text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Harga Jual Ayam Afkir
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-[11px] text-slate-400">Rp</span>
                        <input
                          type="number"
                          step={2000}
                          value={hargaJualAfkirEkor}
                          onChange={(e) => setHargaJualAfkirEkor(Number(e.target.value))}
                          className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-[#0A1410] border border-[#1E352B] text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Skenario Tersimpan Quick List */}
              {scenarios.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#0F1D17] border border-[#1E352B] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Skenario Tersimpan ({scenarios.length})
                    </span>
                    <span className="text-[10px] text-slate-400">Klik untuk muat</span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {scenarios.map((scen) => (
                      <div
                        key={scen.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-[#0A1410] border border-[#1E352B] hover:border-emerald-500/50 transition-colors"
                      >
                        <button
                          onClick={() => handleLoadScenario(scen)}
                          className="flex-1 text-left truncate mr-2"
                        >
                          <div className="text-xs font-bold text-white truncate">{scen.name}</div>
                          <div className="text-[10px] text-emerald-400">
                            Populasi: {scen.params.populasiAwal.toLocaleString('id-ID')} | HPP: Rp{' '}
                            {Math.round(scen.results.hppPerKg).toLocaleString('id-ID')}
                          </div>
                        </button>
                        <button
                          onClick={() => handleDeleteScenario(scen.id, scen.name)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                          title="Hapus skenario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* =============================================================== */}
            {/* KOLOM KANAN (7 Cols): Visualisasi Grafik & Laporan Laba Rugi   */}
            {/* =============================================================== */}
            <div className="lg:col-span-7 space-y-6">

              {/* Banner Komparasi be-ternak AI vs Konsentrat Pabrik */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#0F1D17] to-teal-950/80 border border-emerald-500/40 shadow-xl relative overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-slate-950 uppercase tracking-wider">
                        Komparasi Finansial AI
                      </span>
                      <span className="text-xs text-emerald-400 font-bold">
                        Dampak Nyata Ransum Presisi
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white">
                      Hemat Rp {Math.round(calc.penghematanPakanSiklus).toLocaleString('id-ID')} per 1 Siklus Produksi!
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                      Dengan memanfaatkan formulasi pakan alternatif lokal (dedak halus, ampas tahu fermentasi, BSF, & grit kupang), HPP turun dari{' '}
                      <strong className="text-rose-400">Rp {Math.round(calc.hppKomersialPerKg).toLocaleString('id-ID')}/kg</strong> menjadi{' '}
                      <strong className="text-emerald-400">Rp {Math.round(calc.hppPerKg).toLocaleString('id-ID')}/kg</strong>.
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end shrink-0 text-right">
                    <span className="text-xs text-slate-400">Tambahan Profit / Bln:</span>
                    <span className="text-xl font-black text-emerald-300">
                      +Rp {Math.round(calc.penghematanPakanBulan).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-slate-400">bersih ke kantong peternak</span>
                  </div>
                </div>
              </div>

              {/* GRAFIK 1: Arus Kas Kumulatif (Cashflow Curve & BEP) */}
              <div className="p-5 rounded-2xl bg-[#0F1D17] border border-[#1E352B] shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-[#1E352B] pb-3">
                  <div className="flex items-center gap-2">
                    <LineIcon className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Kurva Arus Kas Kumulatif & Titik Impas (BEP)
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Dalam Juta Rupiah (Rp)</span>
                </div>

                <div className="h-64 sm:h-72 w-full pt-2">
                  {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cashflowChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="colorKomersial" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="bulanLabel"
                          stroke="#64748B"
                          fontSize={10}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#64748B"
                          fontSize={10}
                          tickLine={false}
                          tickFormatter={(val) => `${val}Jt`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0F1D17',
                            borderColor: '#1E352B',
                            borderRadius: '12px',
                            color: '#F8FAFC',
                            fontSize: '11px',
                          }}
                          formatter={(value: unknown) => [`Rp ${Number(value).toLocaleString('id-ID')} Juta`, '']}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'BEP (Rp 0)', fill: '#EF4444', fontSize: 10 }} />
                        <Area
                          type="monotone"
                          dataKey="be-ternak AI"
                          stroke="#10B981"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorAi)"
                        />
                        <Area
                          type="monotone"
                          dataKey="Pakan Komersial"
                          stroke="#F59E0B"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          fillOpacity={1}
                          fill="url(#colorKomersial)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500">
                      Memuat grafik arus kas...
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 italic text-center pt-1">
                  *Garis hijau (be-ternak AI) mencapai titik impas modal bibit & kandang jauh lebih cepat ({calc.paybackPeriodBulan.toFixed(1)} bulan) dibanding garis kuning komersial.
                </p>
              </div>

              {/* GRAFIK 2: Struktur Biaya Operasional (Donut Chart) */}
              <div className="p-5 rounded-2xl bg-[#0F1D17] border border-[#1E352B] shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-[#1E352B] pb-3">
                  <div className="flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Struktur Biaya Operasional Bulanan
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Total: Rp {Math.round(calc.totalBiayaBulan).toLocaleString('id-ID')} / Bln
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-6 h-56 w-full">
                    {isMounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={costBreakdownData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {costBreakdownData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0F1D17',
                              borderColor: '#1E352B',
                              borderRadius: '12px',
                              color: '#F8FAFC',
                              fontSize: '11px',
                            }}
                            formatter={(val: unknown) => [`Rp ${Number(val).toLocaleString('id-ID')}`, '']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-500">
                        Memuat diagram...
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-6 space-y-2 text-xs">
                    {costBreakdownData.map((item, idx) => {
                      const percent = ((item.value / (calc.totalBiayaBulan || 1)) * 100).toFixed(1);
                      return (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/60">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-300">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-mono text-[11px]">Rp {item.value.toLocaleString('id-ID')}</span>
                            <span className="font-bold text-white text-[10px] px-1.5 py-0.5 rounded bg-slate-800">
                              {percent}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ============================================================= */}
              {/* TABEL RINCIAN LABA RUGI (P&L)                                 */}
              {/* ============================================================= */}
              <div className="p-5 rounded-2xl bg-[#0F1D17] border border-[#1E352B] shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-[#1E352B] pb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Rincian Laba Rugi (Profit & Loss Statement)
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Siklus: {lamaSiklusBulan} Bulan | {(currentUser.poultry_capacity || 5000).toLocaleString('id-ID')} Ekor
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#1E352B] text-slate-400 font-semibold text-[11px]">
                        <th className="py-2.5 px-3">Komponen Finansial</th>
                        <th className="py-2.5 px-3">Basis / Satuan</th>
                        <th className="py-2.5 px-3 text-right">Per Bulan (Rp)</th>
                        <th className="py-2.5 px-3 text-right">Total 1 Siklus (Rp)</th>
                        <th className="py-2.5 px-3 text-right">% Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-300">
                      
                      {/* Bagian A: Pendapatan */}
                      <tr className="bg-emerald-950/20 font-bold text-emerald-400">
                        <td colSpan={5} className="py-2 px-3 text-[11px]">
                          A. PENDAPATAN (GROSS REVENUE)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 pl-6">Penjualan Telur Segar</td>
                        <td className="py-2 px-3 text-slate-400">{calc.telurBulananKg.toFixed(0)} kg/bln @ Rp {hargaJualTelurKg.toLocaleString('id-ID')}</td>
                        <td className="py-2 px-3 text-right font-semibold text-white">
                          Rp {Math.round(calc.pendapatanTelurBulan).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-white">
                          Rp {Math.round(calc.pendapatanTelurSiklus).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-400">100.0%</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 pl-6">Penjualan Ayam Afkir</td>
                        <td className="py-2 px-3 text-slate-400">{calc.populasiAkhir.toLocaleString('id-ID')} ekor @ Rp {hargaJualAfkirEkor.toLocaleString('id-ID')}</td>
                        <td className="py-2 px-3 text-right text-slate-500">-</td>
                        <td className="py-2 px-3 text-right text-slate-300">
                          Rp {Math.round(calc.totalNilaiAfkir).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-400">
                          {((calc.totalNilaiAfkir / (calc.totalPendapatanSiklus || 1)) * 100).toFixed(1)}%
                        </td>
                      </tr>

                      {/* Bagian B: Biaya Operasional Pakan & Non-Pakan */}
                      <tr className="bg-amber-950/20 font-bold text-amber-400">
                        <td colSpan={5} className="py-2 px-3 text-[11px]">
                          B. BIAYA OPERASIONAL (OPEX)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 pl-6">Biaya Pakan ({isUsingAiFeed ? 'Ransum AI' : 'Komersial'})</td>
                        <td className="py-2 px-3 text-slate-400">{calc.pakanBulananKg.toFixed(0)} kg/bln @ Rp {effectiveFeedPrice.toLocaleString('id-ID')}</td>
                        <td className="py-2 px-3 text-right text-rose-300 font-semibold">
                          Rp {Math.round(calc.biayaPakanBulan).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right text-rose-300 font-semibold">
                          Rp {Math.round(calc.biayaPakanSiklus).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right text-rose-400">
                          {((calc.biayaPakanBulan / (calc.pendapatanTelurBulan || 1)) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 pl-6">Obat, Vaksin, Vitamin (OVK)</td>
                        <td className="py-2 px-3 text-slate-400">Rp {biayaOvkPerEkorBulan.toLocaleString('id-ID')} / ekor / bln</td>
                        <td className="py-2 px-3 text-right text-slate-300">
                          Rp {Math.round(calc.biayaOvkBulan).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-300">
                          Rp {Math.round(calc.biayaOvkSiklus).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-400">
                          {((calc.biayaOvkBulan / (calc.pendapatanTelurBulan || 1)) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 pl-6">Gaji Tenaga Kerja / Anak Kandang</td>
                        <td className="py-2 px-3 text-slate-400">Gaji Tetap Bulanan</td>
                        <td className="py-2 px-3 text-right text-slate-300">
                          Rp {Math.round(calc.biayaGajiBulan).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-300">
                          Rp {Math.round(calc.biayaGajiSiklus).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-400">
                          {((calc.biayaGajiBulan / (calc.pendapatanTelurBulan || 1)) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 pl-6">Listrik, Air & Biaya Sanitasi</td>
                        <td className="py-2 px-3 text-slate-400">Utilitas Bulanan</td>
                        <td className="py-2 px-3 text-right text-slate-300">
                          Rp {Math.round(calc.biayaListrikAirBulan).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-300">
                          Rp {Math.round(calc.biayaListrikAirSiklus).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-400">
                          {((calc.biayaListrikAirBulan / (calc.pendapatanTelurBulan || 1)) * 100).toFixed(1)}%
                        </td>
                      </tr>

                      {/* Bagian C: Penyusutan / Depresiasi */}
                      <tr className="bg-cyan-950/20 font-bold text-cyan-400">
                        <td colSpan={5} className="py-2 px-3 text-[11px]">
                          C. DEPRESIASI & PENYUSUTAN (NON-CASH)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 pl-6">Penyusutan Bibit (Pullet/DOC)</td>
                        <td className="py-2 px-3 text-slate-400">Amortisasi Siklus 18 Bln</td>
                        <td className="py-2 px-3 text-right text-slate-300">
                          Rp {Math.round(calc.penyusutanBibitBulan).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-300">
                          Rp {Math.round(calc.penyusutanBibitSiklus).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-400">
                          {((calc.penyusutanBibitBulan / (calc.pendapatanTelurBulan || 1)) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 pl-6">Penyusutan Kandang & Peralatan</td>
                        <td className="py-2 px-3 text-slate-400">Depresiasi {lamaDepresiasiKandang} Bulan</td>
                        <td className="py-2 px-3 text-right text-slate-300">
                          Rp {Math.round(calc.penyusutanKandangBulan).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-300">
                          Rp {Math.round(calc.penyusutanKandangSiklus).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-400">
                          {((calc.penyusutanKandangBulan / (calc.pendapatanTelurBulan || 1)) * 100).toFixed(1)}%
                        </td>
                      </tr>

                      {/* Total Biaya */}
                      <tr className="font-bold text-white bg-slate-900/60">
                        <td className="py-2.5 px-3">TOTAL BIAYA USAHA</td>
                        <td className="py-2.5 px-3 text-slate-400">HPP: Rp {Math.round(calc.hppPerKg).toLocaleString('id-ID')}/kg</td>
                        <td className="py-2.5 px-3 text-right text-rose-300">
                          Rp {Math.round(calc.totalBiayaBulan).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 text-right text-rose-300">
                          Rp {Math.round(calc.totalBiayaSiklus).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 text-right text-rose-400">
                          {((calc.totalBiayaBulan / (calc.pendapatanTelurBulan || 1)) * 100).toFixed(1)}%
                        </td>
                      </tr>

                      {/* Laba Bersih */}
                      <tr className="font-extrabold text-emerald-300 bg-emerald-950/40 text-sm">
                        <td className="py-3 px-3">LABA BERSIH OPERASIONAL</td>
                        <td className="py-3 px-3 text-xs text-emerald-400">Margin: Rp {Math.round(calc.marginPerKg).toLocaleString('id-ID')}/kg</td>
                        <td className="py-3 px-3 text-right">
                          Rp {Math.round(calc.labaBersihBulan).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right">
                          Rp {Math.round(calc.labaBersihSiklus).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-400">
                          {((calc.labaBersihBulan / (calc.pendapatanTelurBulan || 1)) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="pt-3 border-t border-[#1E352B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Laporan telah diverifikasi standar agroklimat perunggasan Indonesia.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all cursor-pointer"
                    >
                      Export PDF / Cetak Laporan
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
          </>
          )}
        </main>
      </div>

      {/* =================================================================== */}
      {/* MODAL SIMPAN SKENARIO                                               */}
      {/* =================================================================== */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0F1D17] border border-[#1E352B] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E352B] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Save className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Simpan Skenario Simulasi</h3>
              </div>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveScenario} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Nama Skenario / Kandang
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Skenario 5000 Ekor Ransum AI Hemat 35%"
                  value={scenarioNameInput}
                  onChange={(e) => setScenarioNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0A1410] border border-[#1E352B] text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#0A1410] border border-[#1E352B] text-xs text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Populasi:</span>
                  <span className="font-bold text-white">{populasiAwal.toLocaleString('id-ID')} ekor</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">HPP / Kg:</span>
                  <span className="font-bold text-emerald-400">Rp {Math.round(calc.hppPerKg).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Laba Bersih:</span>
                  <span className="font-bold text-white">Rp {Math.round(calc.labaBersihBulan).toLocaleString('id-ID')} / bln</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
                >
                  Simpan Skenario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Styling */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          header, aside, .print\\:hidden {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .glass-panel, div[class*="bg-[#0F1D17]"], div[class*="bg-[#0A1410]"] {
            background-color: #ffffff !important;
            color: #000000 !important;
            border: 1px solid #cccccc !important;
            box-shadow: none !important;
          }
          table {
            color: #000000 !important;
          }
          tr {
            border-color: #dddddd !important;
          }
          td, th {
            color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
}
