'use client';

import React from 'react';
import { Thermometer, TrendingUp, Layers, Coins } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

interface MetricsOverlayProps {
  avgTemp: number;
  marketScore: number;
  feedCount: number;
  avgPrice?: number;
  regionName?: string;
}

export default function MetricsOverlay({
  avgTemp,
  marketScore,
  feedCount,
  avgPrice,
}: MetricsOverlayProps) {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        
        {/* Metric 1: Rata-rata Suhu Wilayah */}
        <div className="glass-panel-elevated pointer-events-auto rounded-xl p-2.5 sm:p-3 border border-emerald-900/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shrink-0">
            <Thermometer className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Rerata Suhu
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-extrabold text-white">
                {avgTemp.toFixed(1)}°
              </span>
              <span className="text-[11px] text-orange-300 font-semibold">C</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Skor Potensi Pasar */}
        <div className="glass-panel-elevated pointer-events-auto rounded-xl p-2.5 sm:p-3 border border-emerald-900/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Potensi Pasar
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-extrabold text-emerald-400">
                {marketScore}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">/ 100</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Jumlah Titik Pakan Ditemukan */}
        <div className="glass-panel-elevated pointer-events-auto rounded-xl p-2.5 sm:p-3 border border-emerald-900/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Titik Pakan
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-extrabold text-teal-300">
                {feedCount}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">lokasi</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Rerata Estimasi Harga Pakan */}
        <div className="glass-panel-elevated pointer-events-auto rounded-xl p-2.5 sm:p-3 border border-emerald-900/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Rerata Pakan
            </span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xs sm:text-sm font-extrabold text-amber-300 truncate">
                {avgPrice && avgPrice > 0 ? formatRupiah(avgPrice) : '-'}
              </span>
              {avgPrice && avgPrice > 0 ? (
                <span className="text-[10px] text-slate-400 font-medium">/kg</span>
              ) : null}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

