'use client';

import React, { useState } from 'react';
import { X, Plus, Phone, Coins, Check, Loader2, ShieldCheck, Crosshair } from 'lucide-react';
import {
  CreateFeedSourcePayload,
  FeedCategory,
  AvailabilityStatus,
  LivestockType,
  FeedSource,
  FeedSourceType,
  UserGeoLocation,
} from '@/lib/types';
import { requestUserLocation } from '@/lib/geolocation';

interface AddFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLat: number;
  currentLng: number;
  onFeedAdded: (newFeed: FeedSource) => void;
  onGpsDetected?: (loc: UserGeoLocation) => void;
}

const CATEGORIES: FeedCategory[] = [
  'Limbah Pertanian',
  'Limbah Agroindustri',
  'Limbah Perikanan & Ternak',
  'Hijauan & Karotenoid',
  'Mineral & Suplemen',
];

const AVAILABILITY_OPTIONS: AvailabilityStatus[] = [
  'Melimpah',
  'Tersedia',
  'Musiman',
  'Terbatas',
];

const POULTRY_LIVESTOCK: LivestockType[] = [
  'Ayam Broiler (Pedaging)',
  'Ayam Petelur (Layer)',
  'Ayam Kampung / Joper',
  'Bebek / Itik (Petelur & Pedaging)',
  'Burung Puyuh (Layer/Pedaging)',
];

const SOURCE_TYPE_OPTIONS: { value: FeedSourceType; label: string }[] = [
  { value: 'survey_lapangan', label: 'Survei Lapangan (Langsung)' },
  { value: 'komunitas', label: 'Komunitas Peternak / PPL' },
  { value: 'google_places', label: 'Google Places / Maps' },
  { value: 'data_pemerintah', label: 'Data Dinas / Bapanas' },
  { value: 'osm_data', label: 'OpenStreetMap' },
];

export default function AddFeedModal({
  isOpen,
  onClose,
  currentLat,
  currentLng,
  onFeedAdded,
  onGpsDetected,
}: AddFeedModalProps) {
  const [name, setName] = useState('');
  const [feedMaterial, setFeedMaterial] = useState('');
  const [category, setCategory] = useState<FeedCategory>('Limbah Pertanian');
  const [targetLivestock, setTargetLivestock] = useState<LivestockType[]>(['Ayam Kampung / Joper']);
  const [price, setPrice] = useState<string>('4500');
  const [availability, setAvailability] = useState<AvailabilityStatus>('Tersedia');
  const [lat, setLat] = useState<number>(currentLat);
  const [lng, setLng] = useState<number>(currentLng);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [contact, setContact] = useState('');
  const [sourceType, setSourceType] = useState<FeedSourceType>('komunitas');
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const toggleLivestock = (item: LivestockType) => {
    if (targetLivestock.includes(item)) {
      if (targetLivestock.length > 1) {
        setTargetLivestock(targetLivestock.filter((l) => l !== item));
      }
    } else {
      setTargetLivestock([...targetLivestock, item]);
    }
  };

  const handleUseCurrentCoords = () => {
    setLat(currentLat);
    setLng(currentLng);
    setGpsAccuracy(null);
  };

  const handleGetGpsFromDevice = async () => {
    setErrorMsg('');
    setIsGettingGps(true);
    try {
      const gpsLoc = await requestUserLocation();
      setLat(Number(gpsLoc.lat.toFixed(6)));
      setLng(Number(gpsLoc.lng.toFixed(6)));
      setGpsAccuracy(gpsLoc.accuracy ?? null);
      setSourceType('survey_lapangan');
      onGpsDetected?.(gpsLoc);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengakses GPS perangkat.';
      setErrorMsg(msg);
    } finally {
      setIsGettingGps(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !feedMaterial.trim()) {
      setErrorMsg('Nama pemasok dan bahan pakan unggas wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateFeedSourcePayload = {
        name: name.trim(),
        feed_material: feedMaterial.trim(),
        category,
        target_livestock: targetLivestock,
        estimated_price_per_kg: Number(price) || 0,
        availability_status: availability,
        lat: Number(lat),
        lng: Number(lng),
        contact_info: contact.trim(),
        source_type: sourceType,
        is_verified: isVerified,
      };

      const res = await fetch('/api/feed-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal menambahkan titik pakan unggas.');
      }

      onFeedAdded(json.data);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel-elevated rounded-2xl border border-emerald-800/80 p-5 sm:p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-950/80 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Plus className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Tambah Titik Sumber Pakan Unggas
              </h3>
              <p className="text-xs text-slate-400">
                Daftarkan pasokan jagung, bekatul, maggot BSF, tepung ikan, atau kalsium lokal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bahan Pakan & Nama Pemasok */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Nama Bahan Pakan Unggas <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Maggot BSF Kering"
                value={feedMaterial}
                onChange={(e) => setFeedMaterial(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#091511] border border-emerald-900/80 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Pemasok / Nama Peternak <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Koperasi Biolarva Nusantara"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#091511] border border-emerald-900/80 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Kategori & Status Ketersediaan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Kategori Bahan
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedCategory)}
                className="w-full px-3 py-2 text-xs bg-[#091511] border border-emerald-900/80 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Status Ketersediaan
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
                className="w-full px-3 py-2 text-xs bg-[#091511] border border-emerald-900/80 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {AVAILABILITY_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Komoditas Unggas */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
              Komoditas Unggas yang Cocok (Bisa Pilih Beberapa)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POULTRY_LIVESTOCK.map((item) => {
                const isChecked = targetLivestock.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => toggleLivestock(item)}
                    className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 text-emerald-400" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estimasi Harga per Kg & Kontak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Estimasi Harga (Rp / kg)
              </label>
              <div className="relative">
                <Coins className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#091511] border border-emerald-900/80 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Kontak Person / No. WA
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="0812-xxxx-xxxx (Pak Slamet)"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#091511] border border-emerald-900/80 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Koordinat Geografis */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label className="text-[11px] font-semibold text-slate-300">
                Koordinat Lokasi Geografis (WGS 84)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGetGpsFromDevice}
                  disabled={isGettingGps}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 text-[10px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Crosshair className={`w-3 h-3 ${isGettingGps ? 'animate-spin' : ''}`} />
                  <span>{isGettingGps ? 'Mengambil GPS...' : 'Ambil Koordinat GPS'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleUseCurrentCoords}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium underline cursor-pointer"
                >
                  Pakai Fokus Peta
                </button>
              </div>
            </div>
            {gpsAccuracy !== null && (
              <p className="text-[10px] text-sky-300 mb-1.5 font-medium">
                ✓ Koordinat GPS berhasil diambil (akurasi ±{gpsAccuracy} meter)
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="text-[10px] text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 font-mono">
                  Lat:
                </span>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-2 py-2 text-xs bg-[#091511] border border-emerald-900/80 rounded-xl text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="relative">
                <span className="text-[10px] text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 font-mono">
                  Lng:
                </span>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-2 py-2 text-xs bg-[#091511] border border-emerald-900/80 rounded-xl text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Sumber Data & Status Verifikasi */}
          <div className="p-3 rounded-xl bg-[#091511] border border-emerald-900/60 space-y-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Asal Sumber Data
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as FeedSourceType)}
                className="w-full px-3 py-2 text-xs bg-[#0d1c17] border border-emerald-900/80 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {SOURCE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="mt-0.5 rounded border-emerald-700 bg-[#0d1c17] text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
              />
              <div>
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Tandai Sudah Terverifikasi
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Centang jika stok, harga/kg, dan kontak sudah dikonfirmasi langsung di lapangan.
                </span>
              </div>
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-emerald-950/80 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan ke GIS...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Titik Pakan Unggas</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
