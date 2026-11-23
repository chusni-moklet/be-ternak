import L from 'leaflet';

export function createCenterMarkerIcon() {
  return L.divIcon({
    className: 'custom-center-marker',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></div>
        <div class="relative w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-lg shadow-emerald-500/50">
          <div class="w-2.5 h-2.5 rounded-full bg-slate-950"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

export function createUserGpsMarkerIcon() {
  return L.divIcon({
    className: 'custom-user-gps-marker',
    html: `
      <div class="relative flex items-center justify-center w-9 h-9" title="Lokasi GPS Anda">
        <div class="absolute w-9 h-9 rounded-full bg-sky-400/35 animate-ping"></div>
        <div class="relative w-5 h-5 rounded-full bg-sky-500 border-2 border-white flex items-center justify-center shadow-lg shadow-sky-500/60">
          <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

export function createRegisteredRegionMarkerIcon() {
  return L.divIcon({
    className: 'custom-region-hub-marker',
    html: `
      <div class="relative flex items-center justify-center w-6 h-6 cursor-pointer group">
        <div class="w-6 h-6 rounded-lg bg-teal-950/90 border border-teal-400/80 flex items-center justify-center shadow-md shadow-black/50 group-hover:scale-110 transition-transform">
          <svg class="w-3.5 h-3.5 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

export function createFeedMarkerIcon(category: string, availability: string) {
  let bgColor = 'bg-emerald-600';
  let borderColor = 'border-emerald-300';
  let iconSvg = '';

  switch (category) {
    case 'Limbah Pertanian':
      bgColor = 'bg-amber-600';
      borderColor = 'border-amber-300';
      // Corn / Grain icon
      iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`;
      break;
    case 'Limbah Agroindustri':
      bgColor = 'bg-blue-600';
      borderColor = 'border-blue-300';
      // Factory / Building icon
      iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`;
      break;
    case 'Limbah Perikanan & Ternak':
    case 'Limbah Perkebunan':
      bgColor = 'bg-orange-600';
      borderColor = 'border-orange-300';
      // Protein / Sparkle icon (Maggot BSF, Tepung Ikan)
      iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>`;
      break;
    case 'Mineral & Suplemen':
      bgColor = 'bg-violet-600';
      borderColor = 'border-violet-300';
      // Mineral / Calcium grit icon
      iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`;
      break;
    case 'Hijauan & Karotenoid':
    case 'Hijauan Alternatif':
    default:
      bgColor = 'bg-emerald-600';
      borderColor = 'border-emerald-300';
      // Leaf icon
      iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
      break;
  }

  // Indicator dot for availability
  const isHighAvailability = availability === 'Melimpah';

  return L.divIcon({
    className: 'custom-feed-marker',
    html: `
      <div class="group relative flex items-center justify-center cursor-pointer">
        <div class="relative w-8 h-8 rounded-full ${bgColor} border-2 ${borderColor} flex items-center justify-center shadow-md shadow-black/40 hover:scale-110 transition-transform">
          ${iconSvg}
          ${
            isHighAvailability
              ? `<span class="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                   <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300"></span>
                 </span>`
              : ''
          }
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

