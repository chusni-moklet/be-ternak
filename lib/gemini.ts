import { GoogleGenAI } from '@google/genai';
import { AiAnalysisResult, FeedSource, LivestockType } from './types';
import { generateMockAiAnalysis } from './mock-data';

const apiKey = process.env.GEMINI_API_KEY || '';

export const isGeminiConfigured = Boolean(
  apiKey &&
  apiKey.length > 5 &&
  !apiKey.includes('your-gemini-api-key')
);

export async function analyzeAreaWithGemini(
  lat: number,
  lng: number,
  radiusKm: number,
  livestockType: LivestockType,
  nearbyFeeds: FeedSource[],
  regionName?: string,
  avgTemp?: number
): Promise<AiAnalysisResult> {
  if (!isGeminiConfigured) {
    console.info('[PetaPakan AI] GEMINI_API_KEY belum dikonfigurasi, menggunakan data simulasi nutrisi unggas cerdas.');
    return generateMockAiAnalysis(lat, lng, radiusKm, livestockType, nearbyFeeds, regionName, avgTemp);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const feedListSummary = nearbyFeeds.length > 0
      ? nearbyFeeds.map((f, idx) => 
          `${idx + 1}. ${f.name} - Bahan: ${f.feed_material} (Kategori: ${f.category}, Harga: Rp ${f.estimated_price_per_kg}/kg, Ketersediaan: ${f.availability_status}, Jarak: ${f.distance_km ?? '?'} km)`
        ).join('\n')
      : 'Belum ada titik pakan terdaftar di radius ini (gunakan estimasi bahan pakan unggas lokal wilayah Indonesia).';

    const systemPrompt = `Anda adalah "PetaPakan AI", Konsultan Ahli Nutrisi Ternak Unggas (Poultry Nutritionist) dan Agroklimatologi Indonesia.
Fokus komoditas Anda adalah PERUNGGASAN KHUSUS (Ayam Broiler, Ayam Petelur/Layer, Ayam Kampung/Joper, Bebek/Itik, Burung Puyuh).

Tugas Anda adalah menganalisis potensi geografis wilayah Indonesia, iklim/suhu lingkungan (analisis risiko Heat Stress pada unggas), dan sumber pakan alternatif lokal yang terdeteksi untuk jenis unggas: "${livestockType}".

PERHATIAN STANDAR NUTRISI UNGGAS:
- Gunakan standar energi unggas: Energi Metabolis (EM / ME dalam satuan kcal/kg, misal: 2.800 - 3.150 kcal/kg), BUKAN TDN rumnansia!
- Kandungan Protein Kasar (PK %) sesuai fase umur & komoditas unggas.
- Serat Kasar (SK %) harus dibatasi (< 6%) karena saluran cerna unggas monogastrik pendek.
- Kalsium (Ca %) dan Fosfor (P %) penting, terutama Ca 3.5-4% untuk kerabang telur layer/puyuh.
- Pertimbangkan pemanfaatan pakan lokal unggas seperti Jagung Pipil Giling, Dedak Bekatul, Maggot BSF, Tepung Ikan Lokal, Ampas Tahu Fermentasi Kering, Tepung Kulit Kerang, dan Tepung Azolla/Indigofera.

Wajib kembalikan format JSON murni yang valid tanpa format markdown tambahan selain JSON.
Struktur JSON yang WAJIB dipatuhi:
{
  "ringkasan_wilayah": {
    "status_wilayah": "Nama status/karakteristik agro-ekologis sentra unggas wilayah",
    "analisis_iklim": "Penjelasan suhu lingkungan dan mitigasi Heat Stress pada metabolisme unggas",
    "ketersediaan_pakan": "Ringkasan ketersediaan bahan pakan unggas lokal dan keunggulannya",
    "skor_kesesuaian": 92
  },
  "rekomendasi_ransum": [
    {
      "nama_ransum": "Nama Ransum Unggas Alternatif 1",
      "target_ternak": "${livestockType}",
      "komposisi": [
        { "bahan": "Nama Bahan Unggas", "persentase": 50, "peran_nutrisi": "Peran nutrisi unggas" }
      ],
      "kandungan_nutrisi": {
        "protein_kasar_est": "18-20%",
        "energi_metabolis_est": "2.900 - 3.100 kcal/kg",
        "serat_kasar_est": "< 5.5%",
        "kalsium_fosfor_est": "Ca: 1.0% | P: 0.45%"
      },
      "estimasi_biaya_per_kg": 5400,
      "penghematan_komersial": "Persentase penghematan dibanding konsentrat pabrik (Rp 8.500-9.800/kg)"
    }
  ],
  "tips_pengolahan": [
    {
      "metode": "Metode Pengolahan (misal: Fermentasi Probiotik Asam Laktat / Penepungan Maggot BSF)",
      "bahan_target": "Bahan pakan yang diolah",
      "tahapan": ["Langkah 1", "Langkah 2", "Langkah 3"],
      "manfaat": "Manfaat pengolahan bagi saluran cerna unggas",
      "perhatian": "Hal kritis (misal: bebas aflatoksin/jamur, kadar air < 12%)"
    }
  ],
  "strategi_pasar": {
    "potensi_lokal": "Peluang pasar produk unggas (daging/telur) di wilayah tersebut",
    "saluran_pemasaran": ["Kemitraan 1", "Strategi 2"],
    "efisiensi_usaha": "Proyeksi penghematan biaya pakan per ekor atau per butir telur",
    "rekomendasi_aksi": ["Aksi 1", "Aksi 2", "Aksi 3"]
  }
}`;

    const userMessage = `Wilayah Analisis Indonesia:
- Nama Lokasi: ${regionName || 'Lokasi Indonesia'}
- Suhu Lingkungan Saat Ini: ${avgTemp ? `${avgTemp}°C` : 'Tropis'}
- Koordinat: Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}
- Radius Pantau: ${radiusKm} km
- Target Komoditas Unggas: ${livestockType}
- Daftar Titik Pakan Lokal Terdeteksi (${nearbyFeeds.length} titik):
${feedListSummary}

Hasilkan formulasi ransum unggas presisi dalam bahasa Indonesia!`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { text: systemPrompt },
        { text: userMessage }
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      ...parsed,
      source_feed_count: nearbyFeeds.length,
      analyzed_at: new Date().toISOString(),
      is_mock: false,
    };
  } catch (error) {
    console.error('[PetaPakan AI] Error saat memanggil Gemini API, mengalihkan ke fallback cerdas:', error);
    return generateMockAiAnalysis(lat, lng, radiusKm, livestockType, nearbyFeeds, regionName, avgTemp);
  }
}
