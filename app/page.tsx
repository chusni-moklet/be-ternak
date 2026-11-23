'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/ui/Navbar';
import ControlBar from '@/components/ui/ControlBar';
import MetricsOverlay from '@/components/ui/MetricsOverlay';
import AiInsightPanel from '@/components/ui/AiInsightPanel';
import FeedListPanel from '@/components/ui/FeedListPanel';
import AddFeedModal from '@/components/ui/AddFeedModal';
import InteractiveMap from '@/components/map/MapContainer';
import {
  Region,
  FeedSource,
  LivestockType,
  AiAnalysisResult,
  GeocodeResult,
  UserGeoLocation,
} from '@/lib/types';
import { INITIAL_REGIONS, INITIAL_FEED_SOURCES, calculateHaversineDistance } from '@/lib/mock-data';
import { requestUserLocation } from '@/lib/geolocation';
import { Sparkles, Layers, Navigation, AlertTriangle, X } from 'lucide-react';

export default function PetaPakanDashboard() {
  // State Regions & Center Focus
  const [regions, setRegions] = useState<Region[]>(INITIAL_REGIONS);
  const [selectedRegionId, setSelectedRegionId] = useState<string>(INITIAL_REGIONS[0].id);
  const [customLocationName, setCustomLocationName] = useState<string | null>(null);
  const [customTemp, setCustomTemp] = useState<number | null>(null);
  const [center, setCenter] = useState<[number, number]>([
    INITIAL_REGIONS[0].lat,
    INITIAL_REGIONS[0].lng,
  ]);
  const [radiusKm, setRadiusKm] = useState<number>(15);
  const [livestockType, setLivestockType] = useState<LivestockType>('Ayam Petelur (Layer)');

  // Feeds state
  const [feedSources, setFeedSources] = useState<FeedSource[]>([]);
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);

  // AI & Analysis state
  const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // System & Modal status
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(false);
  const [isGeminiActive, setIsGeminiActive] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [modalCoords, setModalCoords] = useState<[number, number] | null>(null);

  // Web Geolocation API state
  const [userLocation, setUserLocation] = useState<UserGeoLocation | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [geoNotice, setGeoNotice] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Sidebar Tab state ('insight' | 'list')
  const [activeTab, setActiveTab] = useState<'insight' | 'list'>('insight');

  // Current active region metadata
  const currentRegion = useMemo(() => {
    return (
      regions.find((r) => r.id === selectedRegionId) || {
        id: 'custom',
        name: customLocationName || `Lokasi Peta (${center[0].toFixed(3)}, ${center[1].toFixed(3)})`,
        lat: center[0],
        lng: center[1],
        avg_temp_celsius: customTemp ?? 28.0,
        market_potential_score: 86,
        market_notes: 'Area pilihan pengguna di peta Indonesia',
      }
    );
  }, [regions, selectedRegionId, customLocationName, customTemp, center]);

  // Load regions once on mount
  useEffect(() => {
    async function loadRegions() {
      try {
        const regRes = await fetch('/api/regions');
        if (regRes.ok) {
          const regJson = await regRes.json();
          if (regJson.data && regJson.data.length > 0) {
            setRegions(regJson.data);
            setIsSupabaseActive(regJson.isSupabaseActive || false);
          }
        }
      } catch (err) {
        console.warn('[PetaPakan AI] Loading fallback static regions:', err);
      }
    }

    loadRegions();
  }, []);

  // Update feed sources list whenever center or radius changes
  useEffect(() => {
    async function refreshFeeds() {
      try {
        const res = await fetch(
          `/api/feed-sources?lat=${center[0]}&lng=${center[1]}&radiusKm=${radiusKm}`
        );
        if (res.ok) {
          const json = await res.json();
          setFeedSources(json.data || []);
          if (json.isSupabaseActive) setIsSupabaseActive(true);
        }
      } catch {
        // Fallback local computation
        const fallback = INITIAL_FEED_SOURCES.map((f) => ({
          ...f,
          distance_km: calculateHaversineDistance(center[0], center[1], f.lat, f.lng),
        }))
          .filter((f) => (f.distance_km ?? 999) <= radiusKm)
          .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
        setFeedSources(fallback);
      }
    }

    refreshFeeds();
  }, [center, radiusKm]);

  // Fetch reverse geocode place name & live temperature for any custom/searched coordinate
  const fetchLocationDetails = async (lat: number, lng: number, preserveName?: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const json = (await res.json()) as {
          placeName?: string | null;
          temperature?: number | null;
        };
        if (!preserveName && json.placeName) {
          setCustomLocationName(json.placeName);
        }
        if (typeof json.temperature === 'number') {
          setCustomTemp(json.temperature);
        }
        return json.placeName || null;
      }
    } catch {
      // Abaikan jika gagal reverse geocode, fallback ke koordinat
    }
    return null;
  };

  // Detect live device coordinates via MDN Web Geolocation API & mark on map
  const handleRequestGps = async () => {
    setIsLocating(true);
    setGeoNotice(null);
    try {
      const loc = await requestUserLocation();
      setUserLocation(loc);
      setCenter([loc.lat, loc.lng]);
      setSelectedRegionId('custom');
      setCustomLocationName(`Lokasi GPS (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`);
      setCustomTemp(null);

      const resolvedName = await fetchLocationDetails(loc.lat, loc.lng);
      if (resolvedName) {
        setUserLocation((prev) => (prev ? { ...prev, placeName: resolvedName } : prev));
      }

      const accText = loc.accuracy ? ` (akurasi ±${loc.accuracy} m)` : '';
      setGeoNotice({
        type: 'success',
        message: `Titik GPS Anda ditandai di peta${accText}${resolvedName ? ` • ${resolvedName}` : ''}`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membaca lokasi GPS.';
      setGeoNotice({ type: 'error', message: msg });
    } finally {
      setIsLocating(false);
    }
  };

  const handleOpenAddAtLocation = (lat: number, lng: number) => {
    setModalCoords([lat, lng]);
    setIsAddModalOpen(true);
  };

  // Handle region switch from preset dropdown
  const handleSelectRegion = (regionId: string) => {
    setSelectedRegionId(regionId);
    setCustomLocationName(null);
    setCustomTemp(null);
    const reg = regions.find((r) => r.id === regionId);
    if (reg) {
      setCenter([reg.lat, reg.lng]);
    }
  };

  // Handle selecting any searched city/district/village across Indonesia
  const handleSelectSearchedLocation = (loc: GeocodeResult) => {
    setSelectedRegionId('custom');
    setCustomLocationName(loc.name);
    setCustomTemp(null);
    setCenter([loc.lat, loc.lng]);
    fetchLocationDetails(loc.lat, loc.lng, loc.name);
  };

  // Handle map click to move focus
  const handleMapLocationSelect = (lat: number, lng: number) => {
    setCenter([lat, lng]);
    // Check if clicked near an existing preset region (~2 km)
    const matched = regions.find(
      (r) => Math.abs(r.lat - lat) < 0.02 && Math.abs(r.lng - lng) < 0.02
    );
    if (matched) {
      setSelectedRegionId(matched.id);
      setCustomLocationName(null);
      setCustomTemp(null);
    } else {
      setSelectedRegionId('custom');
      setCustomLocationName(`Lokasi Peta (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
      setCustomTemp(null);
      fetchLocationDetails(lat, lng);
    }
  };

  // Trigger AI Analysis
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setActiveTab('insight');

    try {
      const res = await fetch('/api/analyze-area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: center[0],
          lng: center[1],
          radiusKm,
          livestockType,
          regionName: currentRegion.name,
          avgTemp: currentRegion.avg_temp_celsius,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAnalysisResult(json.data);
        setIsGeminiActive(json.isGeminiActive || false);
        if (json.isSupabaseActive) setIsSupabaseActive(true);
        if (json.nearbyFeeds) setFeedSources(json.nearbyFeeds);
      }
    } catch (err) {
      console.error('[PetaPakan AI] Error during analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Focus a specific feed on the map
  const handleFocusFeed = (feed: FeedSource) => {
    setCenter([feed.lat, feed.lng]);
    setSelectedFeedId(feed.id);
  };

  // Handle newly added feed from modal
  const handleFeedAdded = (newFeed: FeedSource) => {
    const feedWithDist = {
      ...newFeed,
      distance_km: calculateHaversineDistance(center[0], center[1], newFeed.lat, newFeed.lng),
    };
    setFeedSources((prev) => [feedWithDist, ...prev]);
    setSelectedFeedId(newFeed.id);
    setActiveTab('list');
  };

  // Mark a feed source as verified via PATCH /api/feed-sources
  const handleVerifyFeed = async (feedId: string) => {
    try {
      const res = await fetch('/api/feed-sources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: feedId,
          is_verified: true,
          source_type: 'survey_lapangan',
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setFeedSources((prev) =>
          prev.map((item) =>
            item.id === feedId
              ? {
                  ...item,
                  is_verified: true,
                  source_type: json.source_type || 'survey_lapangan',
                  last_verified_at: json.last_verified_at || new Date().toISOString(),
                }
              : item
          )
        );
      }
    } catch (err) {
      console.error('[PetaPakan AI] Gagal memverifikasi titik pakan:', err);
    }
  };

  // Calculate average feed price
  const avgFeedPrice = useMemo(() => {
    if (feedSources.length === 0) return 0;
    const sum = feedSources.reduce((acc, f) => acc + (f.estimated_price_per_kg || 0), 0);
    return Math.round(sum / feedSources.length);
  }, [feedSources]);

  return (
    <div className="min-h-screen flex flex-col bg-[#070d0b] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        isSupabaseActive={isSupabaseActive}
        isGeminiActive={isGeminiActive}
        currentRegionName={currentRegion.name}
      />

      {/* Main Split-Screen Dashboard */}
      <main className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden relative">
        
        {/* ============================================================ */}
        {/* PANEL KIRI (65% layar pada desktop - Peta Interaktif) */}
        {/* ============================================================ */}
        <section className="lg:col-span-8 flex flex-col min-h-[62vh] lg:h-[calc(100vh-4rem)] relative border-b lg:border-b-0 lg:border-r border-emerald-950/80">
          
          {/* Floating Control Bar (Atas Peta) */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-30 pointer-events-auto space-y-2">
            <ControlBar
              regions={regions}
              selectedRegionId={selectedRegionId}
              customLocationName={customLocationName}
              onSelectRegion={handleSelectRegion}
              onSelectSearchedLocation={handleSelectSearchedLocation}
              onRequestGps={handleRequestGps}
              isLocating={isLocating}
              center={center}
              radiusKm={radiusKm}
              onRadiusChange={setRadiusKm}
              livestockType={livestockType}
              onLivestockChange={setLivestockType}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              onOpenAddModal={() => {
                setModalCoords(null);
                setIsAddModalOpen(true);
              }}
            />

            {/* Web Geolocation Status Banner */}
            {geoNotice && (
              <div
                className={`max-w-xl glass-panel-elevated rounded-xl px-3 py-2 text-xs flex items-center justify-between gap-2 border shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${
                  geoNotice.type === 'error'
                    ? 'border-rose-500/50 bg-rose-950/75 text-rose-200'
                    : 'border-sky-500/50 bg-sky-950/75 text-sky-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {geoNotice.type === 'error' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <Navigation className="w-4 h-4 text-sky-400 shrink-0" />
                  )}
                  <span className="truncate font-medium">{geoNotice.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGeoNotice(null)}
                  className="p-0.5 rounded hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Interactive Leaflet Map */}
          <div className="w-full h-full relative">
            <InteractiveMap
              center={center}
              radiusKm={radiusKm}
              feedSources={feedSources}
              regions={regions}
              userLocation={userLocation}
              isLocating={isLocating}
              onLocationSelect={handleMapLocationSelect}
              onRequestGps={handleRequestGps}
              onOpenAddAtLocation={handleOpenAddAtLocation}
              selectedFeedId={selectedFeedId}
            />
          </div>

          {/* Floating Metrics Overlay (Bawah Peta) */}
          <MetricsOverlay
            avgTemp={currentRegion.avg_temp_celsius}
            marketScore={currentRegion.market_potential_score}
            feedCount={feedSources.length}
            avgPrice={avgFeedPrice}
            regionName={currentRegion.name}
          />
        </section>

        {/* ============================================================ */}
        {/* PANEL KANAN (35% layar pada desktop - Sidebar AI & Feed List) */}
        {/* ============================================================ */}
        <section className="lg:col-span-4 flex flex-col h-[48vh] lg:h-[calc(100vh-4rem)] bg-[#08120e] relative">
          
          {/* Tabs Navigation Header */}
          <div className="h-14 border-b border-emerald-950/80 px-4 flex items-center justify-between shrink-0 bg-[#060c09]/80 backdrop-blur-md">
            <div className="flex items-center gap-1 bg-[#091511] p-1 rounded-xl border border-emerald-900/60 w-full">
              
              {/* Tab 1: Insight AI */}
              <button
                onClick={() => setActiveTab('insight')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'insight'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'insight' ? 'fill-slate-950' : 'text-emerald-400'}`} />
                <span>Insight AI</span>
                {analysisResult && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 ml-0.5 animate-pulse" />
                )}
              </button>

              {/* Tab 2: Daftar Pakan Terdekat */}
              <button
                onClick={() => setActiveTab('list')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 ${activeTab === 'list' ? 'text-slate-950' : 'text-teal-400'}`} />
                <span>Titik Pakan</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-extrabold ml-1">
                  {feedSources.length}
                </span>
              </button>

            </div>
          </div>

          {/* Scrollable Tab Content Container */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {activeTab === 'insight' ? (
              <AiInsightPanel
                analysis={analysisResult}
                isAnalyzing={isAnalyzing}
                livestockType={livestockType}
                onTriggerAnalyze={handleAnalyze}
              />
            ) : (
              <FeedListPanel
                feedSources={feedSources}
                onFocusFeed={handleFocusFeed}
                onVerifyFeed={handleVerifyFeed}
                onOpenAddModal={() => {
                  setModalCoords(null);
                  setIsAddModalOpen(true);
                }}
                selectedFeedId={selectedFeedId}
                radiusKm={radiusKm}
              />
            )}
          </div>

        </section>

      </main>

      {/* Add Feed Source Modal (remounts clean when opened) */}
      {isAddModalOpen && (
        <AddFeedModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setModalCoords(null);
          }}
          currentLat={modalCoords ? modalCoords[0] : center[0]}
          currentLng={modalCoords ? modalCoords[1] : center[1]}
          onFeedAdded={handleFeedAdded}
          onGpsDetected={(gpsLoc) => {
            setUserLocation(gpsLoc);
            fetchLocationDetails(gpsLoc.lat, gpsLoc.lng, customLocationName || undefined);
          }}
        />
      )}
    </div>
  );
}
