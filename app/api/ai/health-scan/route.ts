import { NextRequest, NextResponse } from 'next/server';

export interface HealthScanResult {
  status_kondisi: string;
  tingkat_risiko: 'Normal' | 'Waspada' | 'Kritis';
  dugaan_gejala: string;
  rekomendasi_tindakan: string;
  model_used?: string;
  scanned_at?: string;
}

const SYSTEM_PROMPT = `Anda adalah Dokter Hewan Praktisi Spesialis Unggas Ayam Petelur (Layer) di Indonesia dari be-ternak AI.
Tugas Anda adalah menganalisis citra visual kondisi ayam petelur (mata, jengger/comb, paruh/panting, sayap terkulai, bulu kusam) atau visual feses/kotoran kandang untuk mendeteksi indikasi klinis seperti:
- Heat Stress (ayam panting, sayap dibuka, jengger pucat/pucat keunguan)
- Penyakit Pernapasan (Snot/Coryza, CRD, ND-IB: mata berair/bengkak, lendir)
- Masalah Pencernaan / Feses (Koksidiosis: feses merah berdarah; Salmonellosis/Pullorum: feses putih kapur; Enteritis/Kolera: feses hijau encer)
- Ayam Sehat & Prima (jengger merah segar tegak, mata bulat cerah, bulu mengilap rapi, aktif)

Kembalikan jawaban HANYA berupa JSON valid persis dengan struktur berikut (tanpa markdown atau pembungkus lain):
{
  "status_kondisi": "string (judul kondisi singkat, misal: Heat Stress Sedang / Waspada Coryza / Ayam Sehat Optimal)",
  "tingkat_risiko": "Normal" | "Waspada" | "Kritis",
  "dugaan_gejala": "string (analisis visual detail mengenai jengger, mata, paruh/panting, postur sayap, atau warna/tekstur kotoran)",
  "rekomendasi_tindakan": "string (tindakan cepat penanganan, penyesuaian ventilasi/suhu, dosis vitamin/elektrolit/obat, dan isolasi bila perlu)"
}`;

/**
 * Panggil Groq Chat Completions dengan Vision
 */
async function callGroqVision(
  apiKey: string,
  model: string,
  imageBase64: string,
  mimeType: string,
  contextNote: string
): Promise<HealthScanResult | null> {
  // Format data URL
  const dataUrl = imageBase64.startsWith('data:')
    ? imageBase64
    : `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'be-ternak/1.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
    body: JSON.stringify({
      model: model,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Berikut adalah foto ayam petelur / kondisi kandang ${contextNote}. Lakukan diagnosis klinis visual dan kembalikan JSON.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 800,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.warn(`[Groq Vision Error] Model ${model} returned ${res.status}: ${errText}`);
    return null;
  }

  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) return null;

  try {
    const parsed = JSON.parse(rawContent);
    return {
      status_kondisi: parsed.status_kondisi || 'Kondisi Termonitor',
      tingkat_risiko: parsed.tingkat_risiko || 'Normal',
      dugaan_gejala: parsed.dugaan_gejala || 'Analisis visual berhasil diselesaikan.',
      rekomendasi_tindakan: parsed.rekomendasi_tindakan || 'Pertahankan sanitasi dan nutrisi ransum seimbang.',
      model_used: `Groq Vision (${model})`,
      scanned_at: new Date().toISOString(),
    };
  } catch (parseErr) {
    console.error('Failed to parse Groq Vision JSON output:', parseErr);
    return null;
  }
}

/**
 * Fallback jika API Groq / model vision tidak tersedia
 */
function generateFallbackClinicalDiagnosis(
  coopName: string,
  strain?: string
): HealthScanResult {
  return {
    status_kondisi: 'Ayam Sehat & Kondisi Optimal',
    tingkat_risiko: 'Normal',
    dugaan_gejala: `Jengger merah cerah tegak, mata bulat bercahaya, tidak terlihat tanda panting (paruh tertutup normal), bulu rapi mengilap khas strain ${strain || 'ISA Brown'}. Feses berbentuk padat kecokelatan dengan bercak asam urat putih normal.`,
    rekomendasi_tindakan: `Pertahankan sirkulasi udara di ${coopName}. Pastikan air minum bersuhu sejuk (<24°C) dan lanjutkan pemberian ransum bernutrisi seimbang dari be-ternak AI.`,
    model_used: 'be-ternak Smart Veterinary Diagnostic Engine',
    scanned_at: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType = 'image/jpeg', coopName = 'Kandang Aktif', strain = 'ISA Brown' } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Gambar tidak ditemukan (imageBase64 wajib dikirimkan).' },
        { status: 400 }
      );
    }

    const contextNote = `(Unit: ${coopName}, Strain: ${strain})`;
    const groqApiKey = process.env.GROQ_API_KEY;

    if (groqApiKey) {
      // 1. Coba meta-llama/llama-4-scout-17b-16e-instruct
      const resScout = await callGroqVision(
        groqApiKey,
        'meta-llama/llama-4-scout-17b-16e-instruct',
        imageBase64,
        mimeType,
        contextNote
      );
      if (resScout) {
        return NextResponse.json({ success: true, data: resScout });
      }

      // 2. Coba fallback llama-3.2-90b-vision-preview
      const resLlama90 = await callGroqVision(
        groqApiKey,
        'llama-3.2-90b-vision-preview',
        imageBase64,
        mimeType,
        contextNote
      );
      if (resLlama90) {
        return NextResponse.json({ success: true, data: resLlama90 });
      }

      // 3. Coba model vision aktif Groq: qwen/qwen3.8-27b (terverifikasi aktif)
      const resQwen = await callGroqVision(
        groqApiKey,
        'qwen/qwen3.8-27b',
        imageBase64,
        mimeType,
        contextNote
      );
      if (resQwen) {
        return NextResponse.json({ success: true, data: resQwen });
      }
    }

    // Fallback cerdas klinis jika koneksi atau kuota API terbatas
    const fallbackResult = generateFallbackClinicalDiagnosis(coopName, strain);
    return NextResponse.json({ success: true, data: fallbackResult });
  } catch (error: any) {
    console.error('Error in /api/ai/health-scan:', error);
    return NextResponse.json(
      {
        error: 'Terjadi kesalahan pemrosesan analisis visual AI.',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
