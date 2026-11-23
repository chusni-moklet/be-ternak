'use client';

import React from 'react';
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
} from 'lucide-react';

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

  const navLinks = [
    {
      href: '/',
      label: 'Peta Interaktif',
      icon: Map,
      badge: null,
    },
    {
      href: '/dashboard/peternak',
      label: 'Portal Peternak',
      icon: Users,
      badge: 'Pro',
    },
    {
      href: '/dashboard/pemasok',
      label: 'Pemilik Pakan',
      icon: Store,
      badge: 'Mitra',
    },
    {
      href: '/admin',
      label: 'Panel Admin',
      icon: ShieldCheck,
      badge: 'Verif',
    },
  ];

  return (
    <header className="h-16 border-b border-emerald-950/60 bg-[#070d0b]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between shrink-0 z-30">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/40 group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1">
                PetaPakan <span className="text-emerald-400 font-extrabold">AI</span>
              </h1>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Unggas ID
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden xl:block">
              Sistem Pemetaan Wilayah & Rekomendasi Pakan Unggas Berbasis AI
            </p>
          </div>
        </Link>
      </div>

      {/* Main Navigation Links (Center) */}
      <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-emerald-950/80">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">{item.label}</span>
              {item.badge && !isActive && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 border border-emerald-500/20 font-bold hidden lg:inline">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status Badges & Region Indicator (Right) */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
        {/* Active Region Pill */}
        <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-medium text-[11px] text-emerald-300 max-w-[150px] truncate">
            {currentRegionName}
          </span>
        </div>

        {/* Supabase Status */}
        <div
          title={isSupabaseActive ? 'Supabase PostGIS Terhubung' : 'Mode Offline / In-Memory Store'}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
            isSupabaseActive
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}
        >
          <Database className="w-3 h-3 text-emerald-400" />
          <span className="hidden sm:inline">PostGIS</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSupabaseActive ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'
            }`}
          />
        </div>

        {/* AI Engine Status & Quick Simulation Link */}
        <Link
          href="/dashboard/peternak/simulasi"
          title="Buka Simulasi Usaha Layer AI"
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-medium transition-all hover:scale-105 cursor-pointer ${
            isGeminiActive
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
              : 'bg-teal-950/40 border-teal-800/40 text-teal-300 hover:border-teal-400'
          }`}
        >
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span className="hidden sm:inline">{aiEngineName || (isGeminiActive ? 'Groq AI' : 'Simulasi AI')}</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isGeminiActive ? 'bg-emerald-400 animate-pulse' : 'bg-teal-400'
            }`}
          />
        </Link>
      </div>
    </header>
  );
}
