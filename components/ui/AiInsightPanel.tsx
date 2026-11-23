'use client';

import React from 'react';
import { AiAnalysisResult, LivestockType } from '@/lib/types';
import {
  Sparkles,
  Thermometer,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  FlaskConical,
  Wheat,
  Award,
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

interface AiInsightPanelProps {
  analysis: AiAnalysisResult | null;
  isAnalyzing: boolean;
  livestockType: LivestockType;
  onTriggerAnalyze: () => void;
}

export default function AiInsightPanel({
  analysis,
  isAnalyzing,
  livestockType,
  onTriggerAnalyze,
}: AiInsightPanelProps) {
  if (isAnalyzing) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-300">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-ping" />
        </div>
        <h4 className="text-base font-bold text-white mb-1">
          be-ternak AI Sedang Menganalisis...
        </h4>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          Menghitung korelasi agroklimatologi, profil nutrisi bahan pakan lokal, formulasi ransum seimbang, dan proyeksi efisiensi ekonomi untuk <strong className="text-emerald-300">{livestockType}</strong>.
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-300">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-emerald-400">
          <Sparkles className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-white mb-1.5">
          Siap Menganalisis Wilayah
        </h4>
        <p className="text-xs text-slate-400 max-w-xs mb-4 leading-relaxed">
          Klik tombol di bawah untuk menghasilkan formulasi ransum pakan lokal presisi, panduan pengolahan/fermentasi, dan analisis pasar berbasis AI unggas presisi (Groq / Gemini).
        </p>
        <button
          onClick={onTriggerAnalyze}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>Mulai Analisis AI Sekarang</span>
        </button>
      </div>
    );
  }

  const { ringkasan_wilayah, rekomendasi_ransum, tips_pengolahan, strategi_pasar } = analysis;

  return (
    <div className="space-y-4 p-4 text-slate-200">
      
      {/* AI Active Status Pill */}
      {analysis.is_mock ? (
        <div className="p-2.5 rounded-xl bg-teal-950/40 border border-teal-800/40 text-[11px] text-teal-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span>Simulasi Agroklimat Presisi (Masukkan GROQ_API_KEY / GEMINI_API_KEY untuk live API)</span>
          </div>
          <span className="text-[10px] text-teal-400/80">Offline DB</span>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live AI Generated ({analysis.ai_engine || 'Groq AI'})</span>
          </div>
          <span className="text-[10px] text-emerald-400/80">Ultra-fast Inference</span>
        </div>
      )}

      {/* 1. Ringkasan Wilayah */}
      <div className="glass-panel rounded-2xl p-4 border border-emerald-900/60 shadow-lg">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Thermometer className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Ringkasan Wilayah & Agroklimat
            </h4>
          </div>
          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            Kesesuaian: {ringkasan_wilayah?.skor_kesesuaian ?? 88}%
          </span>
        </div>

        <p className="text-xs font-semibold text-white mb-1.5">
          {ringkasan_wilayah?.status_wilayah || 'Kawasan Peternakan Potensial'}
        </p>
        <p className="text-xs text-slate-300 leading-relaxed mb-2">
          {ringkasan_wilayah?.analisis_iklim}
        </p>
        <div className="p-2.5 rounded-xl bg-[#091511] border border-emerald-950/80 text-[11px] text-emerald-300/90 leading-relaxed">
          <strong className="text-white">Ketersediaan Pakan Lokal: </strong>
          {ringkasan_wilayah?.ketersediaan_pakan}
        </div>
      </div>

      {/* 2. Rekomendasi Ransum Lokal */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Wheat className="w-4 h-4 text-amber-400" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Rekomendasi Ransum Pakan Lokal Presisi
          </h4>
        </div>

        {rekomendasi_ransum && rekomendasi_ransum.map((ransum, idx) => (
          <div
            key={idx}
            className="glass-panel rounded-2xl p-4 border border-emerald-900/50 hover:border-emerald-700/60 transition-colors shadow-lg"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h5 className="text-xs font-bold text-white mb-0.5">
                  {ransum.nama_ransum}
                </h5>
                <span className="text-[10px] text-emerald-400 font-medium">
                  Khusus: {ransum.target_ternak}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-emerald-300 block">
                  {formatRupiah(ransum.estimasi_biaya_per_kg)}/kg
                </span>
                <span className="text-[9px] text-emerald-400/80">Est. Harga Ransum</span>
              </div>
            </div>

            {/* Nutrients Badges */}
            <div className="grid grid-cols-3 gap-1.5 bg-[#081310] p-2 rounded-xl border border-emerald-950/90 mb-2 text-center">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-mono">Protein Kasar</span>
                <span className="text-[11px] font-bold text-amber-300">
                  {ransum.kandungan_nutrisi.protein_kasar_est}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-mono">Energi EM</span>
                <span className="text-[11px] font-bold text-emerald-300">
                  {ransum.kandungan_nutrisi.energi_metabolis_est || ransum.kandungan_nutrisi.tdn_energi_est || '2.950 kcal/kg'}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-mono">Serat Kasar</span>
                <span className="text-[11px] font-bold text-blue-300">
                  {ransum.kandungan_nutrisi.serat_kasar_est}
                </span>
              </div>
            </div>

            {/* Kalsium & Fosfor (Penting untuk Unggas) */}
            {ransum.kandungan_nutrisi.kalsium_fosfor_est && (
              <div className="text-[10px] bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1 mb-3 text-slate-300 flex items-center justify-between">
                <span className="text-slate-400 font-mono">Rasio Kalsium & Fosfor:</span>
                <span className="font-semibold text-teal-300">{ransum.kandungan_nutrisi.kalsium_fosfor_est}</span>
              </div>
            )}

            {/* Composition Breakdown */}
            <div className="space-y-1.5 mb-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Komposisi Formulasi Bahan:
              </span>
              {ransum.komposisi.map((comp, cIdx) => (
                <div
                  key={cIdx}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-900/40 border border-slate-800/60"
                >
                  <div className="truncate pr-2">
                    <span className="font-semibold text-slate-200">{comp.bahan}</span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {comp.peran_nutrisi}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 shrink-0">
                    {comp.persentase}%
                  </span>
                </div>
              ))}
            </div>

            {/* Cost Savings Pill */}
            {ransum.penghematan_komersial && (
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-medium">{ransum.penghematan_komersial}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 3. Tips Pengolahan & Pengawetan */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-teal-400" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Teknik Pengolahan & Pengawetan (Silase / Fermentasi)
          </h4>
        </div>

        {tips_pengolahan && tips_pengolahan.map((tip, idx) => (
          <div
            key={idx}
            className="glass-panel rounded-2xl p-4 border border-teal-900/50 shadow-lg space-y-2.5"
          >
            <div>
              <h5 className="text-xs font-bold text-white">{tip.metode}</h5>
              <span className="text-[10px] text-teal-300 font-medium">
                Sasaran Bahan: {tip.bahan_target}
              </span>
            </div>

            {/* Tahapan Step by Step */}
            <div className="space-y-1.5 bg-[#091511] p-3 rounded-xl border border-emerald-950">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Langkah Eksekusi:
              </span>
              {tip.tahapan.map((step, sIdx) => (
                <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    {sIdx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-emerald-300 bg-emerald-950/30 p-2 rounded-lg border border-emerald-900/50">
              <strong>Manfaat:</strong> {tip.manfaat}
            </div>

            {tip.perhatian && (
              <div className="flex items-start gap-1.5 text-[10px] text-rose-300 bg-rose-950/30 p-2 rounded-lg border border-rose-900/50">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Perhatian:</strong> {tip.perhatian}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 4. Strategi Pasar */}
      <div className="glass-panel rounded-2xl p-4 border border-emerald-900/60 shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Strategi Komersial & Pemasaran Hasil Ternak
          </h4>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {strategi_pasar?.potensi_lokal}
        </p>

        {/* Efisiensi Usaha */}
        <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/50 text-xs text-blue-200">
          <strong className="block text-white mb-0.5">Efisiensi Biaya Produksi:</strong>
          {strategi_pasar?.efisiensi_usaha}
        </div>

        {/* Saluran & Rekomendasi Aksi */}
        {strategi_pasar?.saluran_pemasaran && (
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
              Saluran Distribusi & Kemitraan:
            </span>
            <ul className="space-y-1">
              {strategi_pasar.saluran_pemasaran.map((item, idx) => (
                <li key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
}

