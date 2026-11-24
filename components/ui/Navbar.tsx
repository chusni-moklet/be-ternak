'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Leaf,
  Database,
  Sparkles,
  MapPin,
  Map,
  Users,
  Store,
  ShieldCheck,
  User,
  LogIn,
  LogOut,
  Menu,
  X,
  Calculator,
  ChevronRight,
} from 'lucide-react';
import { getActiveUser, logoutUser } from '@/lib/subscription-store';
import { UserProfile } from '@/lib/types';

interface NavbarProps {
  isSupabaseActive?: boolean;
  isGeminiActive?: boolean;
  aiEngineName?: string;
  currentRegionName?: string;
}

export default function Navbar({
  isSupabaseActive = false,
  isGeminiActive = false,
  aiEngineName,
  currentRegionName = 'Kecamatan Grati, Pasuruan',
}: NavbarProps) {
  const pathname = usePathname();
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActiveUser(getActiveUser());
    const syncUser = () => setActiveUser(getActiveUser());
    window.addEventListener('storage', syncUser);
    window.addEventListener('focus', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('focus', syncUser);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    {
      href: '/',
      label: 'Peta Interaktif',
      icon: Map,
      badge: null,
      desc: 'Pemetaan Spasial & Potensi Pakan',
    },
    {
      href: '/dashboard/peternak',
      label: 'Portal Peternak',
      icon: Users,
      badge: 'Pro',
      desc: 'Manajemen Kandang & Resep Ransum',
    },
    {
      href: '/dashboard/peternak/simulasi',
      label: 'Simulasi Usaha',
      icon: Calculator,
      badge: 'AI',
      desc: 'Kalkulator HPP, BEP & Laba Siklus',
    },
    {
      href: '/dashboard/pemasok',
      label: 'Pemilik Pakan',
      icon: Store,
      badge: 'Mitra',
      desc: 'Katalog Pasokan Limbah Agroindustri',
    },
    {
      href: '/admin',
      label: 'Panel Admin',
      icon: ShieldCheck,
      badge: 'Verif',
      desc: 'Pusat Verifikasi & Keuangan Platform',
    },
  ];

  return (
    <>
      <header className="h-16 border-b border-emerald-950/60 bg-[#070d0b]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between shrink-0 z-30 sticky top-0">
        {/* Brand & Title */}
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/40 group-hover:scale-105 transition-transform shrink-0">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center">
                  be-<span className="text-emerald-400 font-extrabold">ternak</span>
                </h1>
                <span className="text-[9px] sm:text-[10px] uppercase font-semibold px-1.5 py-0.2 sm:py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Unggas ID
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden xl:block">
                Sistem Pemetaan Wilayah & Rekomendasi Pakan Unggas Berbasis AI
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Main Navigation Links (Center) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-emerald-950/80">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
                {item.badge && !isActive && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 border border-emerald-500/20 font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Status Badges & Region Indicator (Right) */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
          {/* Active Region Pill (Only on Interactive Map page where region selection is used) */}
          {pathname === '/' && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-medium text-[11px] text-emerald-300 max-w-[160px] truncate">
                {currentRegionName}
              </span>
            </div>
          )}

          {/* Supabase PostGIS Status (Tablet & Desktop) */}
          <div
            title={isSupabaseActive ? 'Supabase PostGIS Terhubung (Online)' : 'Mode Offline / In-Memory Store'}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
              isSupabaseActive
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <Database className="w-3 h-3 text-emerald-400" />
            <span>PostGIS</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSupabaseActive ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'
              }`}
            />
          </div>

          {/* User Account / Auth Profile & Logout */}
          {mounted && activeUser ? (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-emerald-950/80">
              <Link
                href={
                  activeUser.role === 'admin'
                    ? '/admin'
                    : activeUser.role === 'pemilik_pakan'
                    ? '/dashboard/pemasok'
                    : '/dashboard/peternak'
                }
                title={`Akun: ${activeUser.name} (${activeUser.email})`}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#0d1714] hover:bg-emerald-950/60 border border-emerald-500/30 text-white font-medium text-xs transition-all shadow-sm group"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-[10px] shrink-0">
                  {activeUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="max-w-[110px] xl:max-w-[140px] truncate text-white font-semibold text-xs">
                    {activeUser.name}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-medium truncate max-w-[110px] xl:max-w-[140px] mt-0.5">
                    {activeUser.role === 'admin' ? 'Superadmin' : activeUser.business_name}
                  </span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold shrink-0 border border-emerald-500/30">
                  {activeUser.role === 'admin' ? 'Admin' : activeUser.role === 'peternak' ? 'Ternak' : 'Pakan'}
                </span>
              </Link>

              <button
                onClick={() => {
                  logoutUser();
                  setActiveUser(null);
                  window.location.href = '/login';
                }}
                title="Keluar dari Akun"
                className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-800/60 text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : mounted ? (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Masuk / Daftar</span>
              <span className="sm:hidden">Masuk</span>
            </Link>
          ) : null}

          {/* Mobile Menu Hamburger Toggle (Shown only on mobile & tablet < lg) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-emerald-950/80 text-xs font-semibold cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* MOBILE NAVIGATION DRAWER (Slide-down from top)                       */}
      {/* ===================================================================== */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-50 bg-[#060d0a]/95 backdrop-blur-xl border-b border-emerald-950 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 space-y-4">
            {/* Header / Active User Greeting in Drawer */}
            {activeUser ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-slate-900/70 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white truncate max-w-[200px]">
                      {activeUser.business_name}
                    </h3>
                    <p className="text-[11px] text-slate-300 truncate max-w-[200px]">
                      {activeUser.name} • <span className="text-emerald-400 font-semibold capitalize">{activeUser.role}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{activeUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logoutUser();
                    setActiveUser(null);
                    window.location.href = '/login';
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900/60 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white">Selamat Datang di be-ternak</h3>
                  <p className="text-[11px] text-slate-400">Masuk untuk menyimpan resep dan simulasi usaha.</p>
                </div>
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30"
                >
                  Masuk / Daftar
                </Link>
              </div>
            )}

            {/* Navigation Links in Mobile Drawer */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
                Navigasi Platform
              </span>
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/40 shadow-lg shadow-emerald-600/20'
                        : 'bg-[#0d1613] text-slate-300 border-emerald-950/80 hover:text-white hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                                isActive
                                  ? 'bg-white text-emerald-900'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  </Link>
                );
              })}
            </div>

            {/* Quick Status Pill in Drawer */}
            <div className="pt-2 border-t border-emerald-950/80 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block">Database</span>
                  <span className="text-xs font-bold text-white truncate block">PostGIS Aktif</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block">AI Engine</span>
                  <span className="text-xs font-bold text-white truncate block">
                    {isGeminiActive ? 'Groq AI' : 'Simulasi AI'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-emerald-950/80 text-center">
            <p className="text-[10px] text-slate-400">
              be-ternak • Sistem Pemetaan & Formulasi Ransum Presisi Berbasis AI
            </p>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Fixed Bottom - 1-Thumb Reachability)   */}
      {/* ===================================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070d0b]/95 backdrop-blur-md border-t border-emerald-950/80 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'bg-emerald-500/20 text-emerald-300 scale-110' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] tracking-tight whitespace-nowrap">
                {item.label === 'Peta Interaktif'
                  ? 'Peta'
                  : item.label === 'Portal Peternak'
                  ? 'Peternak'
                  : item.label === 'Simulasi Usaha'
                  ? 'Simulasi'
                  : item.label === 'Pemilik Pakan'
                  ? 'Pakan'
                  : 'Admin'}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
