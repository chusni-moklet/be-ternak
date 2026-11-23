'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Region, LivestockType, GeocodeResult } from '@/lib/types';
import {
  MapPin,
  Sparkles,
  PlusCircle,
  Sliders,
  ChevronDown,
  Loader2,
  Globe2,
  Search,
  Check,
  Navigation,
  Crosshair,
} from 'lucide-react';

interface ControlBarProps {
  regions: Region[];
  selectedRegionId: string;
  customLocationName?: string | null;
  onSelectRegion: (regionId: string) => void;
  onSelectSearchedLocation: (loc: GeocodeResult) => void;
  onRequestGps: () => void;
  isLocating: boolean;
  center: [number, number];
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  livestockType: LivestockType;
  onLivestockChange: (type: LivestockType) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onOpenAddModal: () => void;
}

const POULTRY_OPTIONS: { value: LivestockType; icon: string; label: string; desc: string }[] = [
  { value: 'Ayam Broiler (Pedaging)', icon: '🐔', label: 'Ayam Broiler (Pedaging)', desc: 'Fokus ADG cepat & energi tinggi' },
  { value: 'Ayam Petelur (Layer)', icon: '🥚', label: 'Ayam Petelur (Layer)', desc: 'Fokus kalsium kerabang & hen-day' },
  { value: 'Ayam Kampung / Joper', icon: '🐓', label: 'Ayam Kampung / Joper', desc: 'Efisiensi pakan lokal & hijauan' },
  { value: 'Bebek / Itik (Petelur & Pedaging)', icon: '🦆', label: 'Bebek / Itik', desc: 'Toleran dedak, keong & pakan basah' },
  { value: 'Burung Puyuh (Layer/Pedaging)', icon: '🐦', label: 'Burung Puyuh', desc: 'Kebutuhan protein padat (20-24%)' },
];

export default function ControlBar({
  regions,
  selectedRegionId,
  customLocationName,
  onSelectRegion,
  onSelectSearchedLocation,
  onRequestGps,
  isLocating,
  center,
  radiusKm,
  onRadiusChange,
  livestockType,
  onLivestockChange,
  onAnalyze,
  isAnalyzing,
  onOpenAddModal,
}: ControlBarProps) {
  const [regionOpen, setRegionOpen] = useState(false);
  const [poultryOpen, setPoultryOpen] = useState(false);
  const [regionSearch, setRegionSearch] = useState('');
  const [geocodeResults, setGeocodeResults] = useState<GeocodeResult[]>([]);
  const [isSearchingGeo, setIsSearchingGeo] = useState(false);

  const regionRef = useRef<HTMLDivElement>(null);
  const poultryRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click or Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) {
        setRegionOpen(false);
      }
      if (poultryRef.current && !poultryRef.current.contains(e.target as Node)) {
        setPoultryOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setRegionOpen(false);
        setPoultryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleRegionSearchChange = (val: string) => {
    setRegionSearch(val);
    if (val.trim().length < 2) {
      setGeocodeResults([]);
      setIsSearchingGeo(false);
    } else {
      setIsSearchingGeo(true);
    }
  };

  // Debounced geocoding search across ALL Indonesia
  useEffect(() => {
    const query = regionSearch.trim();
    if (query.length < 2) return;

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const json = (await res.json()) as { results?: GeocodeResult[] };
          setGeocodeResults(json.results || []);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setGeocodeResults([]);
        }
      } finally {
        setIsSearchingGeo(false);
      }
    }, 320);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [regionSearch]);

  const isCustomCoord = selectedRegionId === 'custom';
  const activeRegion = regions.find((r) => r.id === selectedRegionId);
  const activePoultry = POULTRY_OPTIONS.find((p) => p.value === livestockType) || POULTRY_OPTIONS[0];

  // Filter preset regions by search
  const filteredRegions = regions.filter(
    (r) =>
      r.name.toLowerCase().includes(regionSearch.toLowerCase()) ||
      (r.island && r.island.toLowerCase().includes(regionSearch.toLowerCase()))
  );

  const groupedRegions: Record<string, Region[]> = {};
  filteredRegions.forEach((reg) => {
    const island = reg.island || 'Lainnya';
    if (!groupedRegions[island]) groupedRegions[island] = [];
    groupedRegions[island].push(reg);
  });

  const displayLabel = isCustomCoord
    ? customLocationName || `Lokasi Peta (${center[0].toFixed(3)}, ${center[1].toFixed(3)})`
    : activeRegion?.name || 'Pilih Wilayah Indonesia';

  return (
    <div className="w-full glass-panel-elevated rounded-2xl p-2.5 sm:p-3.5 text-slate-100 shadow-2xl transition-all border border-emerald-900/80">
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 sm:gap-3">
        
        {/* Left Section: Custom Dark Wilayah Combobox + Komoditas Unggas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 flex-1">
          
          {/* 1. Custom Searchable Wilayah Indonesia Dropdown */}
          <div className="relative" ref={regionRef}>
            <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90 flex items-center gap-1 mb-1 whitespace-nowrap">
              <Globe2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Pusat Wilayah (Seluruh Indonesia)</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setRegionOpen((o) => !o);
                setPoultryOpen(false);
              }}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-[#091511] text-xs font-semibold text-slate-100 border border-emerald-900/80 rounded-xl hover:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2 truncate">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{displayLabel}</span>
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                  regionOpen ? 'rotate-180 text-emerald-400' : ''
                }`}
              />
            </button>

            {/* Dark Mode Popover List */}
            {regionOpen && (
              <div className="absolute left-0 right-0 sm:min-w-[330px] mt-1.5 z-50 rounded-2xl bg-[#0a1612] border border-emerald-800/80 shadow-2xl shadow-black/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Search Box */}
                <div className="p-2 border-b border-emerald-950/90 bg-[#07100d]">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Cari desa, kec, kab/kota se-Indonesia..."
                      value={regionSearch}
                      onChange={(e) => handleRegionSearchChange(e.target.value)}
                      className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#0d1c17] border border-emerald-900/70 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    {isSearchingGeo && (
                      <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>

                {/* Combined List: GPS Action + Preset Sentra + Live Geocode All Indonesia */}
                <div className="max-h-72 overflow-y-auto p-1.5 space-y-2.5">
                  
                  {/* Web Geolocation API Quick Button */}
                  <button
                    type="button"
                    disabled={isLocating}
                    onClick={() => {
                      onRequestGps();
                      setRegionOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left text-xs bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/50 text-sky-300 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <Crosshair className={`w-3.5 h-3.5 text-sky-400 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? 'Mendeteksi Koordinat GPS...' : 'Gunakan Lokasi GPS Saya'}</span>
                    </span>
                    <span className="text-[10px] text-sky-400/80 font-mono">Geolocation</span>
                  </button>

                  {/* Live Geocoding Results when user searches */}
                  {regionSearch.trim().length >= 2 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center justify-between">
                        <span>Hasil Pencarian Seluruh Indonesia</span>
                        {isSearchingGeo && <span className="text-[9px] text-slate-400 lowercase">mencari...</span>}
                      </div>

                      {!isSearchingGeo && geocodeResults.length === 0 ? (
                        <div className="px-2.5 py-2 text-[11px] text-slate-400">
                          Tidak ada hasil peta untuk &ldquo;{regionSearch}&rdquo;. Coba nama kecamatan/kota terdekat.
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          {geocodeResults.map((loc) => (
                            <button
                              type="button"
                              key={loc.id}
                              onClick={() => {
                                onSelectSearchedLocation(loc);
                                setRegionOpen(false);
                                handleRegionSearchChange('');
                              }}
                              className="w-full flex items-start justify-between gap-2 px-2.5 py-2 rounded-xl text-left text-xs text-slate-100 hover:bg-emerald-950/70 border border-transparent hover:border-emerald-800/60 transition-colors cursor-pointer"
                            >
                              <div className="flex items-start gap-2 min-w-0">
                                <Navigation className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <div className="font-semibold text-white truncate">
                                    {loc.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    {loc.sublabel}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[9px] text-emerald-400/80 font-mono shrink-0 mt-0.5">
                                {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preset Poultry Hubs */}
                  {Object.keys(groupedRegions).length > 0 && (
                    <div className="space-y-2">
                      {regionSearch.trim().length >= 2 && (
                        <div className="border-t border-emerald-950/80 pt-1.5" />
                      )}
                      {Object.keys(groupedRegions).map((island) => (
                        <div key={island}>
                          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">
                            Sentra Unggas • Pulau {island}
                          </div>
                          <div className="space-y-0.5">
                            {groupedRegions[island].map((reg) => {
                              const selected = reg.id === selectedRegionId;
                              return (
                                <button
                                  type="button"
                                  key={reg.id}
                                  onClick={() => {
                                    onSelectRegion(reg.id);
                                    setRegionOpen(false);
                                    handleRegionSearchChange('');
                                  }}
                                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                                    selected
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                                      : 'text-slate-200 hover:bg-emerald-950/60'
                                  }`}
                                >
                                  <span className="truncate">{reg.name}</span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {reg.avg_temp_celsius}°C
                                    </span>
                                    {selected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>

          {/* 2. Custom Komoditas Unggas Dropdown */}
          <div className="relative" ref={poultryRef}>
            <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90 block mb-1 whitespace-nowrap">
              Komoditas Unggas
            </label>
            <button
              type="button"
              onClick={() => {
                setPoultryOpen((o) => !o);
                setRegionOpen(false);
              }}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-[#091511] text-xs font-semibold text-slate-100 border border-emerald-900/80 rounded-xl hover:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2 truncate">
                <span>{activePoultry.icon}</span>
                <span className="truncate">{activePoultry.label}</span>
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                  poultryOpen ? 'rotate-180 text-emerald-400' : ''
                }`}
              />
            </button>

            {poultryOpen && (
              <div className="absolute left-0 right-0 mt-1.5 z-50 rounded-2xl bg-[#0a1612] border border-emerald-800/80 shadow-2xl shadow-black/80 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                {POULTRY_OPTIONS.map((item) => {
                  const selected = item.value === livestockType;
                  return (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => {
                        onLivestockChange(item.value);
                        setPoultryOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                        selected
                          ? 'bg-emerald-500/20 border border-emerald-500/40'
                          : 'hover:bg-emerald-950/60'
                      }`}
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-sm mt-0.5">{item.icon}</span>
                        <div className="min-w-0">
                          <div
                            className={`text-xs font-semibold truncate ${
                              selected ? 'text-emerald-300' : 'text-slate-100'
                            }`}
                          >
                            {item.label}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      {selected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Center: Radius Slider */}
        <div className="xl:w-48 shrink-0 px-1">
          <div className="flex items-center justify-between gap-2 text-xs mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90 flex items-center gap-1 whitespace-nowrap">
              <Sliders className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Radius</span>
            </span>
            <span className="text-[11px] font-extrabold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60 whitespace-nowrap">
              {radiusKm} km
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">5km</span>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={radiusKm}
              onChange={(e) => onRadiusChange(Number(e.target.value))}
              className="w-full h-1.5 bg-[#091511] rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">30km</span>
          </div>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Analisis Pakan Unggas</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs bg-[#11241e] hover:bg-[#163028] text-emerald-300 border border-emerald-700/50 hover:border-emerald-500 transition-all cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Tambah Pakan</span>
            <span className="sm:hidden">+ Pakan</span>
          </button>
        </div>

      </div>
    </div>
  );
}
