'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import {
  activateUserByToken,
  loadUsersFromStorage,
  getActivationUrl,
} from '@/lib/subscription-store';
import { UserProfile } from '@/lib/types';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Mail,
  Building2,
  User,
  Sparkles,
  Layers,
  Clock,
  ExternalLink,
} from 'lucide-react';

function ActivationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>(
    tokenParam ? 'loading' : 'idle'
  );
  const [message, setMessage] = useState<string>('');
  const [activatedUser, setActivatedUser] = useState<UserProfile | null>(null);

  // Manual input state if visiting /activate directly without URL query
  const [manualEmail, setManualEmail] = useState(emailParam);
  const [manualToken, setManualToken] = useState(tokenParam);

  useEffect(() => {
    if (!tokenParam) {
      setStatus('idle');
      return;
    }

    try {
      const result = activateUserByToken(tokenParam, emailParam || undefined);
      if (result.success && result.user) {
        setStatus('success');
        setMessage(result.message);
        setActivatedUser(result.user);
      } else {
        setStatus('error');
        setMessage(result.message || 'Tautan aktivasi tidak valid.');
      }
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat aktivasi.');
    }
  }, [tokenParam, emailParam]);

  const handleManualActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      setMessage('Silakan masukkan kode/token aktivasi dari email Anda.');
      setStatus('error');
      return;
    }

    try {
      const result = activateUserByToken(manualToken.trim(), manualEmail.trim() || undefined);
      if (result.success && result.user) {
        setStatus('success');
        setMessage(result.message);
        setActivatedUser(result.user);
      } else {
        setStatus('error');
        setMessage(result.message || 'Tautan aktivasi tidak valid.');
      }
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Gagal memproses aktivasi.');
    }
  };

  return (
    <div className="min-h-screen bg-[#060D0A] text-slate-100 flex flex-col font-sans">
      <Navbar currentRegionName="Aktivasi Akun" hideNavLinks={true} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-lg bg-[#0A1410]/95 backdrop-blur-xl border border-emerald-950/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-xl shadow-emerald-500/20 border border-emerald-400/40 text-white mb-1">
              <Mail className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Aktivasi Akun be-<span className="text-emerald-400">ternak</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Konfirmasi verifikasi email untuk mengaktifkan akun resmi peternak atau pemilik pakan Anda.
            </p>
          </div>

          {/* Loading State */}
          {status === 'loading' && (
            <div className="p-8 text-center space-y-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Memverifikasi tautan aktivasi Anda...</p>
              <p className="text-xs text-slate-500">Mohon tunggu sebentar.</p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && activatedUser && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 flex items-start gap-3 shadow-lg shadow-emerald-950/40">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h2 className="text-sm font-extrabold text-emerald-200">
                    Aktivasi Berhasil! Akun Telah Aktif
                  </h2>
                  <p className="text-xs text-emerald-300/90 leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>

              {/* User Account Details Card */}
              <div className="p-4 rounded-2xl bg-[#0F1D17] border border-[#1E352B] space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#1E352B]">
                  <span className="text-slate-400 font-medium">Status Akun:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ Aktif & Terverifikasi
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      Nama Pemilik:
                    </span>
                    <span className="font-bold text-white">{activatedUser.name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      Nama Usaha:
                    </span>
                    <span className="font-bold text-emerald-300">{activatedUser.business_name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      Email Pendaftar:
                    </span>
                    <span className="font-mono text-slate-200">{activatedUser.email}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Masa Aktif:
                    </span>
                    <span className="text-emerald-400 font-semibold">30 Hari Kedepan</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Link
                  href={
                    activatedUser.role === 'pemilik_pakan'
                      ? '/dashboard/pemasok'
                      : '/dashboard/peternak'
                  }
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all"
                >
                  <span>Buka Portal Dashboard Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/"
                  className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-800 transition-all"
                >
                  <span>Kembali ke Peta Interaktif</span>
                </Link>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex items-start gap-3 shadow-lg">
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h2 className="text-sm font-extrabold text-rose-200">
                    Aktivasi Belum Berhasil
                  </h2>
                  <p className="text-xs text-rose-300/90 leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-400">
                <p className="font-semibold text-slate-300">Kemungkinan Penyebab:</p>
                <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                  <li>Akun Anda masih dalam antrean verifikasi oleh Administrator.</li>
                  <li>Tautan aktivasi telah digunakan sebelumnya atau token tidak sesuai.</li>
                  <li>Tautan terpotong saat disalin dari email.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Link
                  href="/login"
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <span>Masuk ke Halaman Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/"
                  className="w-full py-2.5 rounded-2xl bg-slate-900 text-slate-400 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Kembali ke Peta Interaktif</span>
                </Link>
              </div>
            </div>
          )}

          {/* Idle / Manual Input Form */}
          {status === 'idle' && (
            <form onSubmit={handleManualActivate} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
                Silakan masukkan alamat email yang Anda daftarkan dan token aktivasi yang dikirimkan Admin ke email Anda:
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Alamat Email Pendaftar:
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Kode / Token Aktivasi:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: act-xxxxxx"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Aktifkan Akun Saya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ActivationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#060D0A] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ActivationContent />
    </Suspense>
  );
}
