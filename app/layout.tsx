import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'be-ternak - Pemetaan Potensi Wilayah & Rekomendasi Pakan Ternak Alternatif',
  description:
    'Sistem Pemetaan Potensi Wilayah & Rekomendasi Pakan Ternak Alternatif Berbasis AI dan Analisis Spasial PostGIS - be-ternak.',
  keywords: [
    'be-ternak',
    'Pakan Ternak Alternatif',
    'Agroklimat',
    'GIS Peternakan',
    'Silase Jagung',
    'Ampas Tahu',
    'Ransum Ternak Presisi',
    'Peternak Unggas Layer Broiler',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#070d0b] text-slate-100">
        {children}
      </body>
    </html>
  );
}
