import { GoogleGenAI } from '@google/genai';
import {
  BankSoalButir,
  JenisSoal,
  JenjangSekolah,
  LevelKognitif,
  OpsiJawaban,
} from '../src/types';

export interface GenerateSoalAiParams {
  jenjang_sekolah: JenjangSekolah;
  tingkat_kelas: string;
  mapel_id?: string;
  nama_mapel: string;
  lingkup_materi: string;
  capaian_pembelajaran?: string;
  tujuan_pembelajaran?: string;
  kode_tp?: string;
  jenis_soal: 'PILIHAN_GANDA' | 'PG_KOMPLEKS' | 'ISIAN_SINGKAT' | 'ESAI_URAIAN' | 'CAMPURAN';
  level_kognitif: 'L1' | 'L2' | 'L3' | 'CAMPURAN';
  jumlah_soal: number;
  sertakan_stimulus?: boolean;
  sertakan_rumus_katex?: boolean;
  tingkat_kesulitan?: 'MUDAH' | 'SEDANG' | 'SULIT' | 'HOTS';
  catatan_khusus?: string;
}

export interface GeneratedAiItem {
  id?: string;
  pertanyaan_teks: string;
  stimulus_konten: string;
  stimulus_gambar_url?: string;
  jenis_soal: JenisSoal;
  level_kognitif: LevelKognitif;
  capaian_pembelajaran: string;
  tujuan_pembelajaran: string;
  kode_tp?: string;
  lingkup_materi: string;
  indikator_soal: string;
  opsi_jawaban_json: OpsiJawaban[];
  kunci_jawaban_terenkripsi: string | string[];
  bobot_nilai: number;
  rubrik_penilaian_esai?: string;
  pembahasan?: string;
}

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export async function generateSoalAi(params: GenerateSoalAiParams): Promise<{
  source: 'GEMINI_AI' | 'CURRICULUM_GENERATOR';
  model?: string;
  items: GeneratedAiItem[];
}> {
  const count = Math.min(Math.max(params.jumlah_soal || 3, 1), 10);
  const client = getAiClient();

  if (client) {
    try {
      const prompt = `Anda adalah Asesor Kurikulum Nasional, Pakar Penyusun Butir Asesmen Pendidikan Indonesia (Kurikulum Merdeka), dan Pengembang Soal HOTS Berstandar Nasional (AKM / Asesmen Nasional).

Tugas Anda adalah membuat ${count} butir soal asesmen berkualitas tinggi dan kontekstual sesuai spesifikasi berikut:
- Jenjang Sekolah: ${params.jenjang_sekolah}
- Tingkat / Kelas: ${params.tingkat_kelas}
- Mata Pelajaran: ${params.nama_mapel}
- Lingkup Materi / Topik: ${params.lingkup_materi || 'Materi Inti Semester'}
- Capaian Pembelajaran (CP): ${params.capaian_pembelajaran || 'Menguasai konsep dan aplikasi materi'}
- Tujuan Pembelajaran (TP): ${params.tujuan_pembelajaran || params.lingkup_materi}
- Kode TP: ${params.kode_tp || 'TP-01'}
- Jenis Soal yang Diminta: ${params.jenis_soal} (jika CAMPURAN, buat variasi PILIHAN_GANDA, PG_KOMPLEKS, ISIAN_SINGKAT, atau ESAI_URAIAN)
- Level Kognitif: ${params.level_kognitif} (L1: Pemahaman/Mengingat, L2: Penerapan/Aplikasi, L3: Penalaran/HOTS Analisis Evaluasi)
- Tingkat Kesulitan: ${params.tingkat_kesulitan || 'SEDANG'}
- Sertakan Stimulus: ${params.sertakan_stimulus !== false ? 'YA, sertakan stimulus wacana kontekstual/studi kasus/data tabel/fenomena kehidupan nyata' : 'TIDAK'}
- Sertakan Rumus KaTeX: ${params.sertakan_rumus_katex ? 'YA, gunakan format LaTeX dalam tanda dolar seperti $...$ (contoh: $\\frac{a}{b}$, $x^2 + 5x = 0$, $\\sqrt{144}$)' : 'Gunakan teks biasa atau formula sederhana jika diperlukan'}
${params.catatan_khusus ? `- Catatan Khusus dari Guru: ${params.catatan_khusus}` : ''}

Ketentuan Format Output:
Kembalikan respon DALAM FORMAT JSON MURNI berupa array objek dengan struktur persis berikut (tanpa blok markdown di luar json jika memungkinkan):
[
  {
    "pertanyaan_teks": "Teks pertanyaan yang jelas, lugas, dan bebas ambigu.",
    "stimulus_konten": "Teks narasi stimulus pengantar berbasis masalah nyata / teks informasi / data yang menjadi dasar pertanyaan.",
    "jenis_soal": "PILIHAN_GANDA" | "PG_KOMPLEKS" | "ISIAN_SINGKAT" | "ESAI_URAIAN",
    "level_kognitif": "L1" | "L2" | "L3",
    "capaian_pembelajaran": "Deskripsi CP",
    "tujuan_pembelajaran": "Deskripsi TP",
    "kode_tp": "${params.kode_tp || 'TP-01'}",
    "lingkup_materi": "${params.lingkup_materi}",
    "indikator_soal": "Disajikan ..., peserta didik dapat ...",
    "opsi_jawaban_json": [
      { "id": "opt-1", "label": "A", "teks": "Pilihan A" },
      { "id": "opt-2", "label": "B", "teks": "Pilihan B" },
      { "id": "opt-3", "label": "C", "teks": "Pilihan C" },
      { "id": "opt-4", "label": "D", "teks": "Pilihan D" }
    ],
    "kunci_jawaban_terenkripsi": "opt-1" (atau array ["opt-1", "opt-3"] jika PG_KOMPLEKS, atau teks jawaban untuk ISIAN_SINGKAT / kunci intisari untuk ESAI_URAIAN),
    "bobot_nilai": 2 (atau 4 untuk PG_KOMPLEKS, 8 untuk ESAI_URAIAN),
    "rubrik_penilaian_esai": "Panduan penskoran komprehensif...",
    "pembahasan": "Penjelasan rinci mengapa kunci jawaban tersebut benar dan analisis opsi lainnya."
  }
]

Penting:
1. Pastikan kunci jawaban konsisten dengan opsi jawaban (menggunakan id 'opt-1', 'opt-2', dst).
2. Jika jenjang SD, opsi cukup 4 (A, B, C, D) dengan bahasa komunikatif dan ramah anak.
3. Untuk jenjang SMA/SMK, opsi boleh 5 (A, B, C, D, E).
4. Untuk jenis ESAI_URAIAN, opsi_jawaban_json boleh berupa array kosong [].
5. Untuk jenis PG_KOMPLEKS, kunci_jawaban_terenkripsi HARUS berupa array id (contoh: ["opt-1", "opt-3"]).`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text;
      if (responseText) {
        let parsed: any[] = [];
        try {
          parsed = JSON.parse(responseText);
        } catch {
          // Attempt to extract JSON from code fences
          const match = responseText.match(/\[[\s\S]*\]/);
          if (match) {
            parsed = JSON.parse(match[0]);
          }
        }

        if (Array.isArray(parsed) && parsed.length > 0) {
          const validated = parsed.map((item, idx) => sanitizeGeneratedItem(item, params, idx));
          return {
            source: 'GEMINI_AI',
            model: 'gemini-3.8-flash',
            items: validated,
          };
        }
      }
    } catch (err) {
      console.warn('[Gemini AI Engine] Fallback triggered due to API error or limit:', err);
    }
  }

  // Fallback / Standalone Curriculum-Aligned Question Generator
  const fallbackItems = generateCurriculumFallbackSoal(params, count);
  return {
    source: 'CURRICULUM_GENERATOR',
    items: fallbackItems,
  };
}

function sanitizeGeneratedItem(raw: any, params: GenerateSoalAiParams, idx: number): GeneratedAiItem {
  const jenjang = params.jenjang_sekolah;
  let jenis: JenisSoal = 'PILIHAN_GANDA';
  if (['PILIHAN_GANDA', 'PG_KOMPLEKS', 'ISIAN_SINGKAT', 'ESAI_URAIAN'].includes(raw.jenis_soal)) {
    jenis = raw.jenis_soal as JenisSoal;
  } else if (params.jenis_soal !== 'CAMPURAN') {
    jenis = params.jenis_soal;
  }

  let level: LevelKognitif = 'L2';
  if (['L1', 'L2', 'L3'].includes(raw.level_kognitif)) {
    level = raw.level_kognitif as LevelKognitif;
  } else if (params.level_kognitif !== 'CAMPURAN') {
    level = params.level_kognitif;
  }

  let opsi: OpsiJawaban[] = [];
  if (Array.isArray(raw.opsi_jawaban_json) && raw.opsi_jawaban_json.length > 0) {
    opsi = raw.opsi_jawaban_json.map((opt: any, oIdx: number) => {
      const labels = ['A', 'B', 'C', 'D', 'E'];
      return {
        id: opt.id || `opt-${oIdx + 1}`,
        label: opt.label || labels[oIdx] || String.fromCharCode(65 + oIdx),
        teks: String(opt.teks || ''),
      };
    });
  } else if (jenis !== 'ESAI_URAIAN' && jenis !== 'ISIAN_SINGKAT') {
    // Generate default options if missing
    const defaultLabels = jenjang === 'SD' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E'];
    opsi = defaultLabels.map((l, oIdx) => ({
      id: `opt-${oIdx + 1}`,
      label: l,
      teks: `Alternatif Jawaban ${l}`,
    }));
  }

  let kunci = raw.kunci_jawaban_terenkripsi;
  if (jenis === 'PG_KOMPLEKS') {
    if (!Array.isArray(kunci)) {
      kunci = [opsi[0]?.id || 'opt-1', opsi[1]?.id || 'opt-2'];
    }
  } else if (jenis === 'PILIHAN_GANDA') {
    if (Array.isArray(kunci)) {
      kunci = kunci[0] || 'opt-1';
    } else if (!kunci) {
      kunci = opsi[0]?.id || 'opt-1';
    }
  } else {
    kunci = typeof kunci === 'string' ? kunci : String(kunci || 'Kunci Jawaban Uraian');
  }

  const defaultBobot = jenis === 'ESAI_URAIAN' ? 8 : jenis === 'PG_KOMPLEKS' ? 4 : 2;

  return {
    id: `ai-item-${Date.now()}-${idx + 1}`,
    pertanyaan_teks: raw.pertanyaan_teks || 'Teks pertanyaan evaluasi kompetensi siswa.',
    stimulus_konten: raw.stimulus_konten || '',
    stimulus_gambar_url: raw.stimulus_gambar_url || undefined,
    jenis_soal: jenis,
    level_kognitif: level,
    capaian_pembelajaran: raw.capaian_pembelajaran || params.capaian_pembelajaran || 'Memahami dan mengaplikasikan konsep materi pembelajaran.',
    tujuan_pembelajaran: raw.tujuan_pembelajaran || params.tujuan_pembelajaran || params.lingkup_materi,
    kode_tp: raw.kode_tp || params.kode_tp || 'TP-01',
    lingkup_materi: raw.lingkup_materi || params.lingkup_materi,
    indikator_soal: raw.indikator_soal || `Disajikan stimulus, peserta didik mampu menyelesaikan persoalan terkait ${params.lingkup_materi}.`,
    opsi_jawaban_json: opsi,
    kunci_jawaban_terenkripsi: kunci,
    bobot_nilai: Number(raw.bobot_nilai) || defaultBobot,
    rubrik_penilaian_esai: raw.rubrik_penilaian_esai || (jenis === 'ESAI_URAIAN' ? 'Skor 8: Jawaban lengkap, runut, dan tepat secara ilmiah.' : undefined),
    pembahasan: raw.pembahasan || 'Pembahasan kunci jawaban berdasarkan kaidah keilmuan kurikulum.',
  };
}

/**
 * High-quality fallback generator when offline or without API key
 */
function generateCurriculumFallbackSoal(params: GenerateSoalAiParams, count: number): GeneratedAiItem[] {
  const result: GeneratedAiItem[] = [];
  const mapel = params.nama_mapel.toLowerCase();
  const materi = params.lingkup_materi || 'Topik Esensial Kurikulum Merdeka';
  const jenjang = params.jenjang_sekolah;
  const kelas = params.tingkat_kelas;

  // Determine question types to create
  const typesSequence: JenisSoal[] = [];
  if (params.jenis_soal === 'CAMPURAN') {
    typesSequence.push('PILIHAN_GANDA', 'PG_KOMPLEKS', 'ESAI_URAIAN', 'PILIHAN_GANDA', 'ISIAN_SINGKAT');
  } else {
    for (let i = 0; i < count; i++) {
      typesSequence.push(params.jenis_soal);
    }
  }

  // Determine cognitive levels
  const levelsSequence: LevelKognitif[] = [];
  if (params.level_kognitif === 'CAMPURAN') {
    levelsSequence.push('L1', 'L2', 'L3', 'L2', 'L3');
  } else {
    for (let i = 0; i < count; i++) {
      levelsSequence.push(params.level_kognitif);
    }
  }

  for (let i = 0; i < count; i++) {
    const qType = typesSequence[i % typesSequence.length];
    const qLevel = levelsSequence[i % levelsSequence.length];
    const isMathOrExact = mapel.includes('matematika') || mapel.includes('fisika') || mapel.includes('kimia') || mapel.includes('ipa') || mapel.includes('ipas');

    let stimulus = '';
    let questionText = '';
    let options: OpsiJawaban[] = [];
    let answerKey: string | string[] = 'opt-2';
    let pembahasan = '';
    let rubrik = '';
    let bobot = qType === 'ESAI_URAIAN' ? 8 : qType === 'PG_KOMPLEKS' ? 4 : 2;

    if (isMathOrExact) {
      if (jenjang === 'SD') {
        stimulus = `Bu Rahma membagikan bibit tanaman cabai kepada para siswa di pekarangan sekolah. Kelompok A mendapatkan $12$ polybag, Kelompok B mendapatkan $18$ polybag, dan Kelompok C mendapatkan $24$ polybag. Setiap polybag disiram secara berkala dengan pupuk cair seimbang.`;
        if (qType === 'PILIHAN_GANDA') {
          questionText = `Jika Bu Rahma ingin membagi seluruh bibit tersebut ke dalam rak display dengan jumlah yang sama banyak pada setiap rak tanpa sisa, berapakah jumlah rak terbanyak yang dapat digunakan (FPB dari $12$, $18$, dan $24$)?`;
          options = [
            { id: 'opt-1', label: 'A', teks: '$4$ rak' },
            { id: 'opt-2', label: 'B', teks: '$6$ rak' },
            { id: 'opt-3', label: 'C', teks: '$8$ rak' },
            { id: 'opt-4', label: 'D', teks: '$12$ rak' },
          ];
          answerKey = 'opt-2';
          pembahasan = `Faktorisasi prima: $12 = 2^2 \\times 3$, $18 = 2 \\times 3^2$, $24 = 2^3 \\times 3$. FPB = $2 \\times 3 = 6$ rak.`;
        } else if (qType === 'PG_KOMPLEKS') {
          questionText = `Berdasarkan pembagian bibit cabai di atas, pilihlah SEMUA pernyataan matematika yang BENAR! (Jawaban dapat lebih dari satu)`;
          options = [
            { id: 'opt-1', label: 'A', teks: 'Rasio perbandingan bibit Kelompok A terhadap Kelompok C adalah $1 : 2$.' },
            { id: 'opt-2', label: 'B', teks: 'Total seluruh bibit tanaman yang dibagikan adalah $54$ polybag.' },
            { id: 'opt-3', label: 'C', teks: 'Selisih bibit Kelompok B dan Kelompok A adalah $10$ polybag.' },
            { id: 'opt-4', label: 'D', teks: 'Kelompok C memiliki jumlah bibit paling banyak.' },
          ];
          answerKey = ['opt-1', 'opt-2', 'opt-4'];
          pembahasan = `Total = $12 + 18 + 24 = 54$ polybag (Benar). Rasio A : C = $12 : 24 = 1 : 2$ (Benar). Selisih B dan A = $18 - 12 = 6$ (bukan 10). Kelompok C terbanyak dengan 24 polybag (Benar).`;
        } else {
          questionText = `Hitunglah rata-rata (mean) jumlah bibit tanaman yang diterima oleh masing-masing kelompok, dan jelaskan langkah-langkah perhitungannya secara runut!`;
          options = [];
          answerKey = 'Rata-rata = (12 + 18 + 24) / 3 = 54 / 3 = 18 polybag.';
          rubrik = 'Skor 8: Menuliskan rumus dengan tepat, menjumlahkan data dengan benar (54), membagi dengan 3 kelompok, dan mendapatkan hasil akhir 18 polybag disertai satuan.';
          pembahasan = `Rata-rata = Jumlah Data / Banyak Data = $(12 + 18 + 24) / 3 = 54 / 3 = 18$ polybag.`;
        }
      } else {
        // SMP / SMA
        stimulus = `Sebuah partikel bergerak lurus sepanjang sumbu-$x$ dengan persamaan posisi terhadap waktu $s(t) = 2t^3 - 6t^2 + 12$ meter, di mana $t$ dinyatakan dalam detik.`;
        if (qType === 'PILIHAN_GANDA') {
          questionText = `Berapakah percepatan partikel tersebut pada saat kecepatannya sama dengan nol ($v(t) = 0$) untuk $t > 0$?`;
          options = [
            { id: 'opt-1', label: 'A', teks: '$6\\text{ m/s}^2$' },
            { id: 'opt-2', label: 'B', teks: '$12\\text{ m/s}^2$' },
            { id: 'opt-3', label: 'C', teks: '$18\\text{ m/s}^2$' },
            { id: 'opt-4', label: 'D', teks: '$24\\text{ m/s}^2$' },
            { id: 'opt-5', label: 'E', teks: '$36\\text{ m/s}^2$' },
          ];
          answerKey = 'opt-2';
          pembahasan = `Kecepatan $v(t) = s'(t) = 6t^2 - 12t$. $v(t) = 0 \\Rightarrow 6t(t - 2) = 0 \\Rightarrow t = 2\\text{ s}$. Percepatan $a(t) = v'(t) = 12t - 12$. Untuk $t = 2$, $a(2) = 12(2) - 12 = 12\\text{ m/s}^2$.`;
        } else {
          questionText = `Tentukan interval waktu ketika gerak partikel tersebut mengalami perlambatan, dan jelaskan syarat fisis yang mendasarinya!`;
          options = [];
          answerKey = 'Gerak diperlambat saat tanda v(t) dan a(t) berlawanan.';
          rubrik = 'Skor 8: Menentukan turunan pertama dan kedua dengan akurat, menganalisis tanda v(t) dan a(t), serta menyimpulkan interval dengan benar.';
          pembahasan = `Analisis tanda tanda v(t) dan a(t) menghasilkan interval di mana perkalian v(t) * a(t) < 0.`;
        }
      }
    } else {
      // Social / Language / Science thematic
      stimulus = `Kawasan pesisir utara Jawa mengalami penurunan muka tanah (land subsidence) sekitar $5 - 10\\text{ cm}$ per tahun akibat pengambilan air tanah secara berlebihan dan beban infrastruktur yang padat. Fenomena ini diperparah dengan kenaikan permukaan air laut global yang memicu rob musiman di pemukiman warga.`;
      if (qType === 'PILIHAN_GANDA') {
        questionText = `Berdasarkan stimulus wacana di atas, upaya konservasi lingkungan yang paling efektif dan berorientasi jangka panjang untuk mengatasi permasalahan tersebut adalah...`;
        options = [
          { id: 'opt-1', label: 'A', teks: 'Membangun tanggul beton darurat di sepanjang jalan utama saja.' },
          { id: 'opt-2', label: 'B', teks: 'Menghentikan eksploitasi air tanah dalam dengan menyediakan jaringan air bersih perpipaan terpadu dan merevitalisasi hutan mangrove.' },
          { id: 'opt-3', label: 'C', teks: 'Mengeruk saluran air secara terus-menerus setiap hari saat rob berlangsung.' },
          { id: 'opt-4', label: 'D', teks: 'Merelokasi seluruh warga secara sepihak tanpa pemulihan ekosistem pesisir.' },
        ];
        if (jenjang !== 'SD') {
          options.push({ id: 'opt-5', label: 'E', teks: 'Mengalirkan air laut ke sungai-sungai pedalaman dengan pompa air bertekanan tinggi.' });
        }
        answerKey = 'opt-2';
        pembahasan = `Penyebab utama adalah ekstraksi air tanah berlebih dan hilangnya pelindung alami pesisir. Solusi jangka panjang berkelanjutan adalah penyediaan air alternatif dan restorasi mangrove.`;
      } else if (qType === 'PG_KOMPLEKS') {
        questionText = `Manakah pernyataan-pernyataan berikut yang mencerminkan faktor pemicu utama fenomena yang diuraikan pada teks? (Pilih semua yang tepat)`;
        options = [
          { id: 'opt-1', label: 'A', teks: 'Pemanfaatan sumur bor air tanah dalam secara masif oleh industri dan pemukiman.' },
          { id: 'opt-2', label: 'B', teks: 'Pemanasan global yang memicu pemuaian termal air laut dan pencairan gletser kutub.' },
          { id: 'opt-3', label: 'C', teks: 'Penanaman bibit pohon bakau secara berlebihan di garis pantai.' },
          { id: 'opt-4', label: 'D', teks: 'Beban struktural bangunan di atas tanah aluvial yang masih mengalami kompaksi alami.' },
        ];
        answerKey = ['opt-1', 'opt-2', 'opt-4'];
        pembahasan = `Pernyataan A, B, dan D merupakan faktor ilmiah pemicu land subsidence dan banjir rob. Pernyataan C keliru karena bakau justru menahan abrasi.`;
      } else {
        questionText = `Analisis keterkaitan antara aktivitas manusia (antropogenik) di wilayah pesisir dengan meningkatnya risiko bencana banjir rob, serta rumuskan 3 rekomendasi kebijakan mitigasi berbasis kearifan lokal!`;
        options = [];
        answerKey = 'Analisis keterkaitan antropogenik dengan land subsidence dan 3 rekomendasi kebijakan.';
        rubrik = 'Skor 8: Memberikan telaah kritis keterkaitan antropogenik dengan ilmiah, menyajikan 3 solusi realistis berbasis masyarakat/kearifan lokal.';
        pembahasan = `Jawaban harus memuat aspek antropogenik (air tanah, tata ruang), aspek oseanografi/klimatologi, dan solusi mitigasi adaptif.`;
      }
    }

    result.push({
      id: `ai-item-${Date.now()}-${i + 1}`,
      pertanyaan_teks: questionText,
      stimulus_konten: stimulus,
      jenis_soal: qType,
      level_kognitif: qLevel,
      capaian_pembelajaran: params.capaian_pembelajaran || `Memahami dan mengevaluasi fenomena terkait ${materi}.`,
      tujuan_pembelajaran: params.tujuan_pembelajaran || `Peserta didik mampu menganalisis permasalahan terkait ${materi}.`,
      kode_tp: params.kode_tp || `TP-${String(i + 1).padStart(2, '0')}`,
      lingkup_materi: materi,
      indikator_soal: `Disajikan wacana stimulus terkait ${materi}, peserta didik dapat mengidentifikasi dan memecahkan permasalahan dengan tepat.`,
      opsi_jawaban_json: options,
      kunci_jawaban_terenkripsi: answerKey,
      bobot_nilai: bobot,
      rubrik_penilaian_esai: rubrik,
      pembahasan: pembahasan,
    });
  }

  return result;
}
