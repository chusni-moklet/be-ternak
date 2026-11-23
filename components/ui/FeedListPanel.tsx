'use client';

import React, { useState } from 'react';
import { FeedSource } from '@/lib/types';
import {
  Search,
  MapPin,
  Phone,
  ChevronRight,
  Layers,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  PlusCircle,
  Loader2,
} from 'lucide-react';
import {
  formatRupiah,
  getAvailabilityBadgeColor,
  getCategoryBadgeColor,
  createWhatsAppLink,
  getSourceTypeLabel,
  formatVerifiedDate,
} from '@/lib/utils';

interface FeedListPanelProps {
  feedSources: FeedSource[];
  onFocusFeed: (feed: FeedSource) => void;
  onVerifyFeed: (feedId: string) => Promise<void>;
  onOpenAddModal: () => void;
  selectedFeedId?: string | null;
  radiusKm: number;
}

export default function FeedListPanel({
  feedSources,
  onFocusFeed,
  onVerifyFeed,
  onOpenAddModal,
  selectedFeedId,
  radiusKm,
}: FeedListPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const categories = [
    'Semua',
    'Limbah Pertanian',
    'Limbah Agroindustri',
    'Limbah Perikanan & Ternak',
    'Hijauan & Karotenoid',
    'Mineral & Suplemen',
  ];

  const filteredFeeds = feedSources.filter((feed) => {
    const matchesSearch =
      feed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feed.feed_material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feed.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat =
      selectedCategory === 'Semua' || feed.category === selectedCategory;

    const matchesVerified = !verifiedOnly || Boolean(feed.is_verified);

    return matchesSearch && matchesCat && matchesVerified;
  });

  const handleVerifyClick = async (feedId: string) => {
    setVerifyingId(feedId);
    try {
      await onVerifyFeed(feedId);
    } finally {
      setVerifyingId(null);
    }
  };

  const verifiedCount = feedSources.filter((f) => f.is_verified).length;

  return (
    <div className="p-4 space-y-3 text-slate-200">
      
      {/* Search and Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari bahan pakan, jagung, maggot, dedak..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#091511] border border-emerald-900/80 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Category Horizontal Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Count Summary + Verified Only Filter Toggle */}
      <div className="flex items-center justify-between gap-2 text-xs text-slate-400 px-1">
        <span>
          <strong className="text-white">{filteredFeeds.length}</strong>/{feedSources.length} sumber • <span className="text-emerald-400 font-medium">{radiusKm} km</span>
        </span>
        <button
          type="button"
          onClick={() => setVerifiedOnly((v) => !v)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-colors cursor-pointer ${
            verifiedOnly
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Terverifikasi ({verifiedCount})</span>
        </button>
      </div>

      {/* Feed Cards List */}
      <div className="space-y-2.5">
        {filteredFeeds.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl glass-panel border border-dashed border-slate-800 space-y-2.5">
            <Layers className="w-8 h-8 text-slate-500 mx-auto" />
            <div>
              <p className="text-xs font-semibold text-slate-300">
                Tidak ada titik pakan ditemukan
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Coba perluas radius pencarian, nonaktifkan filter verifikasi, atau tambahkan titik pemasok baru.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Pakan di Lokasi Ini</span>
            </button>
          </div>
        ) : (
          filteredFeeds.map((feed) => {
            const catStyle = getCategoryBadgeColor(feed.category);
            const availStyle = getAvailabilityBadgeColor(feed.availability_status);
            const isSelected = selectedFeedId === feed.id;
            const verifiedDate = formatVerifiedDate(feed.last_verified_at);
            const isVerifying = verifyingId === feed.id;

            return (
              <div
                key={feed.id}
                className={`glass-panel rounded-2xl p-3.5 border transition-all shadow-md group ${
                  isSelected
                    ? 'border-emerald-400/80 bg-emerald-950/30 ring-1 ring-emerald-500/50'
                    : 'border-emerald-950/70 hover:border-emerald-700/60'
                }`}
              >
                {/* Header: Category & Availability */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                  >
                    {feed.category}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${availStyle.bg} ${availStyle.text} ${availStyle.border}`}
                  >
                    {feed.availability_status}
                  </span>
                </div>

                {/* Feed Material Title */}
                <h5 className="text-xs font-bold text-white mb-0.5 group-hover:text-emerald-300 transition-colors">
                  {feed.feed_material}
                </h5>
                <p className="text-[11px] text-slate-400 mb-1.5">
                  {feed.name}
                </p>

                {/* Verification Status & Source Row */}
                <div className="flex items-center justify-between gap-2 mb-2.5 text-[10px]">
                  {feed.is_verified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Terverifikasi</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
                      <AlertCircle className="w-3 h-3 text-amber-400" />
                      <span>Perlu Konfirmasi</span>
                    </span>
                  )}

                  <span className="text-slate-400 truncate">
                    {getSourceTypeLabel(feed.source_type)}
                    {verifiedDate ? ` • ${verifiedDate}` : ''}
                  </span>
                </div>

                {/* Price, Distance, & Target Info */}
                <div className="grid grid-cols-2 gap-2 bg-[#081310] p-2 rounded-xl border border-emerald-950/80 mb-2.5">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Harga Est.</span>
                    <span className="text-xs font-extrabold text-emerald-400">
                      {formatRupiah(feed.estimated_price_per_kg)}
                      <span className="text-[10px] text-slate-400 font-normal">/kg</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Jarak</span>
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {feed.distance_km !== undefined ? `${feed.distance_km} km` : '-'}
                    </span>
                  </div>
                </div>

                {/* Target Livestock Pills */}
                <div className="mb-2.5">
                  <span className="text-[9px] text-slate-400 block mb-1">Cocok untuk:</span>
                  <div className="flex flex-wrap gap-1">
                    {feed.target_livestock.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Actions: Contact, Verify (if unverified), WA & Focus */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-300 truncate max-w-[125px] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{feed.contact_info || 'Hubungi Pemasok'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!feed.is_verified && (
                      <button
                        type="button"
                        onClick={() => handleVerifyClick(feed.id)}
                        disabled={isVerifying}
                        title="Tandai stok & harga sudah dikonfirmasi"
                        className="flex items-center gap-1 text-[10px] font-semibold text-amber-300 hover:text-slate-950 bg-amber-500/15 hover:bg-amber-400 px-2 py-1 rounded-lg border border-amber-500/30 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isVerifying ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3 h-3" />
                        )}
                        <span>Verifikasi</span>
                      </button>
                    )}

                    {createWhatsAppLink(feed.contact_info || '', feed.feed_material) && (
                      <a
                        href={createWhatsAppLink(feed.contact_info || '', feed.feed_material)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] font-semibold text-white bg-emerald-700 hover:bg-emerald-600 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                        title="Chat WhatsApp Pemasok"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WA</span>
                      </a>
                    )}

                    <button
                      onClick={() => onFocusFeed(feed)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 px-2 py-1 rounded-lg border border-emerald-800/60 transition-colors cursor-pointer"
                    >
                      <span>Fokus</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
