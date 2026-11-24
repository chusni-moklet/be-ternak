'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import {
  loginUser,
  registerUser,
} from '@/lib/subscription-store';
import {
  UserRole,
  LivestockType,
} from '@/lib/types';
import {
  ShieldCheck,
  Users,
  Store,
  Lock,
  Mail,
  Eye,
  EyeOff,
  User,
  Phone,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Layers,
  Leaf,
  Clock,
} from 'lucide-react';

function LoginRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const initialRoleParam = searchParams.get('role');
  const defaultRole: 'peternak' | 'pemilik_pakan' =
    initialRoleParam === 'pemilik_pakan' ? 'pemilik_pakan' : 'peternak';

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State: Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form State: Register
  const [registerRole, setRegisterRole] = useState<'peternak' | 'pemilik_pakan'>(defaultRole);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regAddress, setRegAddress] = useState('');
  // Peternak specifics
  const [regCapacity, setRegCapacity] = useState('3000');
  const [regLivestockType, setRegLivestockType] = useState<LivestockType>('Ayam Petelur (Layer)');
  // Pemasok specifics
  const [regSupplyCapacity, setRegSupplyCapacity] = useState('25');
  const [regFeedMaterials, setRegFeedMaterials] = useState('Dedak Padi Halus & Ampas Tahu');

  // Handle Quick Demo Account Autofill
  const handleQuickLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setErrorMessage(null);
  };

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const user = loginUser(loginEmail, loginPassword);
      setSuccessMessage(`Selamat datang kembali, ${user.name}! Mengalihkan ke dashboard...`);

      setTimeout(() => {
        if (user.role === 'admin') {
          router.push('/admin');
        } else if (user.role === 'pemilik_pakan') {
          router.push('/dashboard/pemasok');
        } else {
          router.push('/dashboard/peternak');
        }
      }, 1000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
    }
  };

  // Submit Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Kata sandi dan konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Kata sandi minimal harus 6 karakter.');
      return;
    }

    setIsLoading(true);

    try {
      const newUser = registerUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        role: registerRole,
        business_name: regBusinessName,
        location_address: regAddress,
        poultry_capacity: registerRole === 'peternak' ? Number(regCapacity) || 1000 : undefined,
        livestock_types: registerRole === 'peternak' ? [regLivestockType] : undefined,
        supply_capacity_ton_month: registerRole === 'pemilik_pakan' ? Number(regSupplyCapacity) || 10 : undefined,
        feed_materials: registerRole === 'pemilik_pakan' ? regFeedMaterials.split(',').map((s) => s.trim()) : undefined,
      });

      setSuccessMessage(
        `Registrasi berhasil! Akun "${newUser.business_name}" telah didaftarkan dan masuk ke antrean verifikasi Admin.`
      );

      setTimeout(() => {
        if (newUser.role === 'pemilik_pakan') {
          router.push('/dashboard/pemasok');
        } else {
          router.push('/dashboard/peternak');
        }
      }, 1500);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060d0a] text-slate-100 flex flex-col font-sans">
      <Navbar currentRegionName="Autentikasi Akun" />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-xl bg-[#0a1410]/90 backdrop-blur-xl border border-emerald-950/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
          {/* Header Brand */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/20 border border-emerald-400/40 text-white mb-1">
              <Leaf className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              be-<span className="text-emerald-400">ternak</span> Authentication
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Satu portal terintegrasi untuk Peternak Unggas, Pemilik Pakan Alternatif, dan Administrator
            </p>
          </div>

          {/* Tab Switcher: Masuk vs Daftar */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900/90 border border-emerald-950/80">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Masuk ke Akun
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          {/* Feedback Notices */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5 shadow-md">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5 shadow-md">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* =============================================================== */}
          {/* FORM: LOGIN                                                     */}
          {/* =============================================================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Alamat Email:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="nama@petapakan.id"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Kata Sandi:
                  </label>
                  <span className="text-[11px] text-emerald-400 hover:underline cursor-pointer">
                    Lupa sandi?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi akun"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{isLoading ? 'Memproses Masuk...' : 'Masuk ke Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Credentials Autofill */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 block text-center">
                  Coba Akun Demo Cepat (1-Klik):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('chusniarin12@gmail.com', 'skylandO2')}
                    className="p-2 rounded-xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all group"
                  >
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </div>
                    <p className="text-[10px] text-slate-300 truncate font-mono">chusniarin12@gmail.com</p>
                    <p className="text-[9px] text-slate-500">Pass: skylandO2</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('suburfarm.blitar@gmail.com', 'peternak123')}
                    className="p-2 rounded-xl bg-slate-900/90 border border-teal-500/30 hover:border-teal-400 text-left transition-all group"
                  >
                    <div className="flex items-center gap-1.5 text-teal-400 font-bold text-[11px]">
                      <Users className="w-3.5 h-3.5" />
                      <span>Peternak</span>
                    </div>
                    <p className="text-[10px] text-slate-300 truncate font-mono">suburfarm.blitar</p>
                    <p className="text-[9px] text-slate-500">Pass: peternak123</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('barokah.dedak@gmail.com', 'pemasok123')}
                    className="p-2 rounded-xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all group"
                  >
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                      <Store className="w-3.5 h-3.5" />
                      <span>Pemilik Pakan</span>
                    </div>
                    <p className="text-[10px] text-slate-300 truncate font-mono">barokah.dedak</p>
                    <p className="text-[9px] text-slate-500">Pass: pemasok123</p>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* =============================================================== */}
          {/* FORM: REGISTER                                                  */}
          {/* =============================================================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Daftar Sebagai Peran Usaha:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setRegisterRole('peternak')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      registerRole === 'peternak'
                        ? 'bg-teal-950/40 border-teal-400 text-white shadow-md shadow-teal-500/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">Peternak Unggas</p>
                      <p className="text-[10px] text-slate-400 truncate">Layer, Broiler, Joper</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setRegisterRole('pemilik_pakan')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      registerRole === 'pemilik_pakan'
                        ? 'bg-emerald-950/40 border-emerald-400 text-white shadow-md shadow-emerald-500/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                      <Store className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">Pemilik Pakan</p>
                      <p className="text-[10px] text-slate-400 truncate">Pabrik Dedak, BSF, Ampas</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Pribadi & Kontak */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nama Lengkap Pemilik:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: H. Ahmad Subari"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nomor WhatsApp / HP:
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Alamat Email:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="nama@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Kata Sandi:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min. 6 karakter"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Konfirmasi Sandi:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Ulangi kata sandi"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Data Usaha & Lokasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {registerRole === 'peternak' ? 'Nama Kandang / Farm:' : 'Nama Gudang / Usaha Pakan:'}
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder={
                        registerRole === 'peternak'
                          ? 'Contoh: Berkah Makmur Layer Farm'
                          : 'Contoh: UD Barokah Dedak Padi'
                      }
                      value={regBusinessName}
                      onChange={(e) => setRegBusinessName(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Alamat Lengkap Usaha:
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Kecamatan, Kabupaten/Kota, Provinsi"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Field Khusus Peternak vs Pemilik Pakan */}
              {registerRole === 'peternak' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-teal-950/20 border border-teal-500/30">
                  <div>
                    <label className="text-xs font-semibold text-teal-300 block mb-1">
                      Kapasitas Populasi Unggas (Ekor):
                    </label>
                    <input
                      type="number"
                      required
                      value={regCapacity}
                      onChange={(e) => setRegCapacity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-teal-300 block mb-1">
                      Jenis Unggas Utama:
                    </label>
                    <select
                      value={regLivestockType}
                      onChange={(e) => setRegLivestockType(e.target.value as LivestockType)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="Ayam Petelur (Layer)">Ayam Petelur (Layer)</option>
                      <option value="Ayam Broiler (Pedaging)">Ayam Broiler (Pedaging)</option>
                      <option value="Ayam Kampung / Joper">Ayam Kampung / Joper</option>
                      <option value="Bebek / Itik (Petelur & Pedaging)">Bebek / Itik</option>
                      <option value="Burung Puyuh (Layer/Pedaging)">Burung Puyuh</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                  <div>
                    <label className="text-xs font-semibold text-emerald-300 block mb-1">
                      Kapasitas Suplai Pakan (Ton / Bulan):
                    </label>
                    <input
                      type="number"
                      required
                      value={regSupplyCapacity}
                      onChange={(e) => setRegSupplyCapacity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-emerald-300 block mb-1">
                      Bahan Pakan Utama yang Disediakan:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Dedak, Maggot BSF, Ampas Tahu"
                      value={regFeedMaterials}
                      onChange={(e) => setRegFeedMaterials(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Informasi Verifikasi Admin */}
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                <Clock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Verifikasi Oleh Admin:</strong> Setelah mendaftar, akun Anda akan masuk ke antrean verifikasi Admin untuk pengecekan validitas usaha & titik lokasi di peta. Lencana resmi centang hijau aktif setelah disetujui.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{isLoading ? 'Mendaftarkan Akun...' : 'Daftar & Ajukan Verifikasi Akun'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Footer Navigation */}
          <div className="pt-2 text-center text-xs text-slate-400">
            <Link href="/" className="text-emerald-400 hover:underline">
              ← Kembali ke Peta Interaktif Spasial
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#060d0a] text-white flex items-center justify-center text-xs">
          Memuat Autentikasi be-ternak...
        </div>
      }
    >
      <LoginRegisterContent />
    </Suspense>
  );
}
