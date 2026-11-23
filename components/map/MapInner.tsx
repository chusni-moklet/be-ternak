'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { FeedSource, Region, UserGeoLocation } from '@/lib/types';
import {
  createCenterMarkerIcon,
  createFeedMarkerIcon,
  createUserGpsMarkerIcon,
  createRegisteredRegionMarkerIcon,
} from './CustomMarkers';
import {
  formatRupiah,
  getAvailabilityBadgeColor,
  getCategoryBadgeColor,
  createWhatsAppLink,
  getSourceTypeLabel,
  formatVerifiedDate,
} from '@/lib/utils';
import { calculateHaversineDistance } from '@/lib/mock-data';
import {
  MapPin,
  Phone,
  MessageSquare,
  Plus,
  Minus,
  Crosshair,
  Moon,
  Sun,
  Satellite,
  ShieldCheck,
  AlertCircle,
  Navigation,
  PlusCircle,
} from 'lucide-react';

type MapStyle = 'dark-osm' | 'light-osm' | 'satellite';

interface MapInnerProps {
  center: [number, number];
  radiusKm: number;
  feedSources: FeedSource[];
  regions: Region[];
  userLocation: UserGeoLocation | null;
  isLocating: boolean;
  onLocationSelect: (lat: number, lng: number) => void;
  onRequestGps: () => void;
  onOpenAddAtLocation: (lat: number, lng: number) => void;
  selectedFeedId?: string | null;
}

// Controller to fly map smoothly when focal position changes
function MapViewController({
  center,
  radiusKm,
}: {
  center: [number, number];
  radiusKm: number;
}) {
  const map = useMap();
  useEffect(() => {
    const currentCenter = map.getCenter();
    const distMoved = currentCenter.distanceTo(center);
    const idealZoom = radiusKm >= 25 ? 11 : radiusKm >= 15 ? 12 : 13;
    const targetZoom = distMoved > 30000 ? idealZoom : map.getZoom() || idealZoom;

    map.flyTo(center, targetZoom, {
      duration: 1.1,
      easeLinearity: 0.25,
    });
  }, [center, map, radiusKm]);
  return null;
}

// Map click listener to reposition focal target
function ClickToMoveFocus({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Custom Map Controls (Zoom +, Zoom -, GPS Locate, Map Style Switcher)
function CustomMapControls({
  mapStyle,
  onChangeStyle,
  onRequestGps,
  isLocating,
}: {
  mapStyle: MapStyle;
  onChangeStyle: (s: MapStyle) => void;
  onRequestGps: () => void;
  isLocating: boolean;
}) {
  const map = useMap();

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    map.zoomIn();
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    map.zoomOut();
  };

  const handleLocateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestGps();
  };

  return (
    <div
      className="absolute right-4 bottom-36 sm:bottom-28 z-[400] flex flex-col gap-2 pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {/* Layer Switcher Pill */}
      <div className="glass-panel-elevated rounded-xl p-1 border border-emerald-900/70 flex flex-col gap-1 shadow-xl">
        <button
          type="button"
          onClick={() => onChangeStyle('dark-osm')}
          title="Peta Gelap (OSM)"
          className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
            mapStyle === 'dark-osm'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-300 hover:bg-emerald-950/60 hover:text-emerald-300'
          }`}
        >
          <Moon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onChangeStyle('light-osm')}
          title="Peta Jalan Standar (OSM)"
          className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
            mapStyle === 'light-osm'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-300 hover:bg-emerald-950/60 hover:text-emerald-300'
          }`}
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onChangeStyle('satellite')}
          title="Citra Satelit (Esri)"
          className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
            mapStyle === 'satellite'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-300 hover:bg-emerald-950/60 hover:text-emerald-300'
          }`}
        >
          <Satellite className="w-4 h-4" />
        </button>
      </div>

      {/* GPS Locate Button (Web Geolocation API) */}
      <button
        type="button"
        onClick={handleLocateClick}
        disabled={isLocating}
        title="Deteksi & Tandai Lokasi GPS Saya"
        className={`glass-panel-elevated p-2.5 rounded-xl border transition-all cursor-pointer shadow-xl flex items-center justify-center ${
          isLocating
            ? 'border-sky-400 text-sky-300 bg-sky-950/70'
            : 'border-emerald-900/70 text-sky-400 hover:text-white hover:bg-sky-900/50'
        }`}
      >
        <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
      </button>

      {/* Zoom Controls */}
      <div className="glass-panel-elevated rounded-xl border border-emerald-900/70 flex flex-col overflow-hidden shadow-xl">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Perbesar Peta"
          className="p-2.5 text-slate-200 hover:text-emerald-300 hover:bg-emerald-950/60 transition-colors cursor-pointer border-b border-emerald-900/60 flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Perkecil Peta"
          className="p-2.5 text-slate-200 hover:text-emerald-300 hover:bg-emerald-950/60 transition-colors cursor-pointer flex items-center justify-center"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function MapInner({
  center,
  radiusKm,
  feedSources,
  regions,
  userLocation,
  isLocating,
  onLocationSelect,
  onRequestGps,
  onOpenAddAtLocation,
  selectedFeedId,
}: MapInnerProps) {
  const [mapStyle, setMapStyle] = useState<MapStyle>('dark-osm');
  const radiusMeters = radiusKm * 1000;

  // Hitung sentra wilayah terdaftar terdekat dari posisi GPS pengguna
  const nearestRegionToUser = useMemo(() => {
    if (!userLocation || regions.length === 0) return null;
    let nearest = regions[0];
    let minDist = Infinity;
    for (const reg of regions) {
      const dist = calculateHaversineDistance(
        userLocation.lat,
        userLocation.lng,
        reg.lat,
        reg.lng
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = reg;
      }
    }
    return { region: nearest, distanceKm: minDist };
  }, [userLocation, regions]);

  return (
    <div
      className={`w-full h-full relative ${
        mapStyle === 'dark-osm' ? 'osm-dark-tiles' : ''
      }`}
    >
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full relative"
        attributionControl={true}
      >
        {/* Real Free Tile Layers (No API Key Required) */}
        {mapStyle === 'satellite' ? (
          <TileLayer
            key="satellite"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics"
            maxZoom={18}
          />
        ) : (
          <TileLayer
            key="osm"
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />
        )}

        <MapViewController center={center} radiusKm={radiusKm} />
        <ClickToMoveFocus onLocationSelect={onLocationSelect} />
        <CustomMapControls
          mapStyle={mapStyle}
          onChangeStyle={setMapStyle}
          onRequestGps={onRequestGps}
          isLocating={isLocating}
        />

        {/* Radius Circle Area */}
        <Circle
          center={center}
          radius={radiusMeters}
          pathOptions={{
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: mapStyle === 'satellite' ? 0.16 : 0.12,
            weight: 2,
            dashArray: '6, 8',
          }}
        />

        {/* Registered Indonesian Poultry Hubs (kecuali yang tepat di center aktif) */}
        {regions
          .filter(
            (reg) =>
              Math.abs(reg.lat - center[0]) > 0.01 ||
              Math.abs(reg.lng - center[1]) > 0.01
          )
          .map((reg) => (
            <Marker
              key={reg.id}
              position={[reg.lat, reg.lng]}
              icon={createRegisteredRegionMarkerIcon()}
            >
              <Popup>
                <div className="w-56 p-1.5 text-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-0.5">
                    Sentra Terdaftar • {reg.island || 'Indonesia'}
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{reg.name}</h4>
                  <p className="text-[10px] text-slate-400 mb-2 leading-relaxed line-clamp-2">
                    {reg.market_notes}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-300 bg-teal-950/40 px-2 py-1 rounded border border-teal-900/50 mb-2">
                    <span>Suhu: <strong>{reg.avg_temp_celsius}°C</strong></span>
                    <span>Pasar: <strong className="text-emerald-400">{reg.market_potential_score}/100</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onLocationSelect(reg.lat, reg.lng)}
                    className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    Fokus Analisis Wilayah Ini
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* User Live GPS Location Marker & Accuracy Ring (Web Geolocation API) */}
        {userLocation && (
          <>
            {userLocation.accuracy && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={Math.min(userLocation.accuracy, 2000)}
                pathOptions={{
                  color: '#38bdf8',
                  fillColor: '#38bdf8',
                  fillOpacity: 0.14,
                  weight: 1.5,
                }}
              />
            )}
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserGpsMarkerIcon()}
              zIndexOffset={600}
            >
              <Popup>
                <div className="w-64 p-1.5 text-slate-100">
                  <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs mb-1">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Lokasi GPS Anda (Terdeteksi)</span>
                  </div>
                  {userLocation.placeName && (
                    <p className="text-[11px] font-semibold text-white mb-1">
                      {userLocation.placeName}
                    </p>
                  )}
                  <div className="bg-sky-950/40 border border-sky-900/60 rounded-lg p-2 text-[10px] space-y-1 mb-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Koordinat:</span>
                      <span className="font-mono text-sky-300">
                        {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                      </span>
                    </div>
                    {userLocation.accuracy !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Akurasi GPS:</span>
                        <span className="font-semibold text-white">±{userLocation.accuracy} meter</span>
                      </div>
                    )}
                    {nearestRegionToUser && (
                      <div className="pt-1 border-t border-sky-900/50">
                        <span className="text-slate-400 block">Sentra Terdaftar Terdekat:</span>
                        <span className="text-emerald-300 font-semibold">
                          {nearestRegionToUser.region.name} ({nearestRegionToUser.distanceKm} km)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onLocationSelect(userLocation.lat, userLocation.lng)}
                      className="py-1.5 px-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-semibold text-[10px] transition-colors cursor-pointer"
                    >
                      Pusatkan Analisis
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenAddAtLocation(userLocation.lat, userLocation.lng)}
                      className="py-1.5 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Daftarkan Pakan</span>
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Main Focus Center Marker */}
        <Marker position={center} icon={createCenterMarkerIcon()}>
          <Popup>
            <div className="text-xs p-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Titik Fokus Analisis Unggas</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Koordinat: {center[0].toFixed(4)}, {center[1].toFixed(4)}
              </p>
              <p className="text-emerald-400/80 text-[10px] mt-1">
                Radius Pantau: <strong className="text-white">{radiusKm} km</strong>
              </p>
              <p className="text-slate-400 text-[10px] mt-1 italic">
                Klik lokasi mana saja di peta Indonesia untuk memindahkan titik analisis.
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Feed Sources Markers */}
        {feedSources.map((feed) => {
          const catStyle = getCategoryBadgeColor(feed.category);
          const availStyle = getAvailabilityBadgeColor(feed.availability_status);
          const isSelected = selectedFeedId === feed.id;

          return (
            <Marker
              key={feed.id}
              position={[feed.lat, feed.lng]}
              icon={createFeedMarkerIcon(feed.category, feed.availability_status)}
              zIndexOffset={isSelected ? 500 : 0}
            >
              <Popup>
                <div className="w-64 max-w-[280px] p-2 text-slate-100">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                    >
                      {feed.category}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${availStyle.bg} ${availStyle.text} ${availStyle.border}`}
                    >
                      {feed.availability_status}
                    </span>
                  </div>

                  {/* Feed Material Title */}
                  <h4 className="text-sm font-bold text-white mb-0.5 line-clamp-2">
                    {feed.feed_material}
                  </h4>
                  <p className="text-[11px] text-emerald-300/90 font-medium mb-1.5">
                    {feed.name}
                  </p>

                  {/* Verification & Source Type Pill */}
                  <div className="flex items-center justify-between gap-1.5 mb-2 text-[10px]">
                    {feed.is_verified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        Terverifikasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        Perlu Konfirmasi
                      </span>
                    )}
                    <span className="text-slate-400 truncate">
                      {getSourceTypeLabel(feed.source_type)}
                      {formatVerifiedDate(feed.last_verified_at) ? ` • ${formatVerifiedDate(feed.last_verified_at)}` : ''}
                    </span>
                  </div>

                  {/* Price and Distance Highlight */}
                  <div className="grid grid-cols-2 gap-2 bg-emerald-950/40 border border-emerald-900/50 rounded-lg p-2 mb-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Estimasi Harga</span>
                      <span className="text-xs font-bold text-emerald-400">
                        {formatRupiah(feed.estimated_price_per_kg)}
                        <span className="text-[10px] font-normal text-slate-400">/kg</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Jarak dari Titik</span>
                      <span className="text-xs font-bold text-slate-200">
                        {feed.distance_km !== undefined ? `${feed.distance_km} km` : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Target Livestock */}
                  <div className="mb-2">
                    <span className="text-[10px] text-slate-400 block mb-1">Target Unggas:</span>
                    <div className="flex flex-wrap gap-1">
                      {feed.target_livestock.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info & WhatsApp Action */}
                  {feed.contact_info && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{feed.contact_info}</span>
                      </div>
                      {createWhatsAppLink(feed.contact_info, feed.feed_material) && (
                        <a
                          href={createWhatsAppLink(feed.contact_info, feed.feed_material)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] shrink-0 transition-colors shadow-sm"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WA</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
