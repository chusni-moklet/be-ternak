'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserProfile } from '@/lib/types';
import {
  resendActivationLink,
  getActivationUrl,
  logoutUser,
} from '@/lib/subscription-store';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Mail,
  Send,
  Building2,
  User,
  ArrowRight,
  ExternalLink,
  LogOut,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface UnverifiedAccountNoticeProps {
  user: UserProfile;
  featureName?: string;
  onRefresh?: () => void;
}

export default function UnverifiedAccountNotice({
  user,
  featureName = 'Fitur Manajemen & Portal be-ternak',
  onRefresh,
}: UnverifiedAccountNoticeProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const isAdminApproved = Boolean(user.admin_verified);
  const activationUrl = getActivationUrl(user);

  const handleResend = () => {
    setIsResending(true);
    setResendNotice(null);
    try {
      const res = resendActivationLink(user.id);
      setResendNotice(`✓ Tautan aktivasi email berhasil diperbarui dan dikirim ulang ke ${user.email}.`);
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      setResendNotice(err instanceof Error ? err.message : 'Gagal mengirim ulang email aktivasi.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-6 p-6 sm:p-8 rounded-3xl bg-[#0A1410] border border-amber-500/40 shadow-2xl space-y-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
      {/* Header Warning Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E352B]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0 shadow-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Akun Belum Aktif
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {isAdminApproved ? 'Menunggu Aktivasi Email' : 'Menunggu Verifikasi Admin'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pendaftaran berhasil, namun akun Anda belum dapat digunakan sebelum diverifikasi & diaktivasi.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (onRefresh) onRefresh();
            else window.location.reload();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold cursor-pointer shrink-0 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Muat Ulang Status</span>
        </button>
      </div>

      {/* 3-Step Verification Timeline */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
          Tahapan Aktivasi Akun Anda:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Step 1: Registrasi */}
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
              ✓
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-emerald-300">1. Pendaftaran</p>
              <p className="text-[10px] text-slate-400 truncate">Selesai terdaftar</p>
            </div>
          </div>

          {/* Step 2: Verifikasi Admin */}
          <div
            className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
              isAdminApproved
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300 animate-pulse'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                isAdminApproved ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {isAdminApproved ? '✓' : <Clock className="w-3.5 h-3.5" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white">2. Verif Admin</p>
              <p className="text-[10px] text-slate-400 truncate">
                {isAdminApproved ? 'Disetujui Admin' : 'Sedang diverifikasi'}
              </p>
            </div>
          </div>

          {/* Step 3: Klik Link Email */}
          <div
            className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
              isAdminApproved
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-500'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                isAdminApproved ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200">3. Aktivasi Email</p>
              <p className="text-[10px] text-slate-400 truncate">
                {isAdminApproved ? 'Klik link email' : 'Menunggu tahap 2'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Status Detail Card */}
      {isAdminApproved ? (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/50 via-[#0A1410] to-emerald-950/40 border border-cyan-500/40 space-y-3">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Admin Telah Menyetujui Pendaftaran Anda!</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Email Dikirim
                </span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tautan aktivasi resmi telah dikirimkan ke email pendaftar: <strong className="text-cyan-300 font-mono">{user.email}</strong>.
                Akun Anda akan langsung aktif setelah Anda mengeklik tautan tersebut.
              </p>
            </div>
          </div>

          {/* Quick Activation Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <Link
              href={activationUrl}
              className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <span>Buka Tautan Aktivasi Email Sekarang</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              disabled={isResending}
              onClick={handleResend}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isResending ? 'Mengirim...' : 'Kirim Ulang Link'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2.5">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">
                Pendaftaran Sedang Ditinjau Administrator be-ternak
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Data usaha dan lokasi kandang/pakan Anda sedang diperiksa oleh tim Administrator pusat.
                Setelah diverifikasi oleh Admin, tautan aktivasi akan secara otomatis dikirimkan ke email <strong className="text-amber-300 font-mono">{user.email}</strong>.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pl-8">
            *Catatan: Selama akun belum diverifikasi Admin dan diaktivasi via email, akses fitur <strong>{featureName}</strong> dinonaktifkan untuk menjaga validitas data ekosistem.
          </p>
        </div>
      )}

      {/* Resend Notice */}
      {resendNotice && (
        <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{resendNotice}</span>
        </div>
      )}

      {/* User Info Bar */}
      <div className="p-3 rounded-2xl bg-[#09140F] border border-[#1E352B] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-500" />
          <span className="text-slate-400">Pendaftar:</span>
          <span className="font-bold text-white">{user.name}</span>
          <span className="text-slate-500 font-mono">({user.business_name})</span>
        </div>

        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-slate-500" />
          <span className="font-mono text-emerald-400">{user.email}</span>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <Link
          href="/"
          className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>← Kembali ke Peta Interaktif</span>
        </Link>

        <button
          onClick={() => {
            logoutUser();
            window.location.href = '/login';
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/40 text-rose-300 text-xs font-semibold cursor-pointer transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar & Masuk dengan Akun Lain</span>
        </button>
      </div>
    </div>
  );
}
