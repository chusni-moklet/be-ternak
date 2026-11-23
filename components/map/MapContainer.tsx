'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { FeedSource, Region, UserGeoLocation } from '@/lib/types';
import { Compass, Loader2 } from 'lucide-react';

interface MapComponentProps {
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

// Dynamic import with SSR false to prevent Leaflet window is undefined errors
const DynamicMapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#09110e] flex flex-col items-center justify-center text-slate-400 gap-3 border border-emerald-950/40">
      <div className="relative">
        <Compass className="w-10 h-10 text-emerald-500 animate-spin" />
        <Loader2 className="w-5 h-5 text-emerald-300 absolute inset-0 m-auto animate-pulse" />
      </div>
      <p className="text-xs font-medium tracking-wide text-emerald-400/90">
        Memuat Peta Spasial PetaPakan AI...
      </p>
    </div>
  ),
});

export default function InteractiveMap(props: MapComponentProps) {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <DynamicMapInner {...props} />
    </div>
  );
}
