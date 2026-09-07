import { Router, Request, Response } from 'express';
import { db } from './store';
import {
  BankSoalButir,
  PaketUjian,
  PaketUjianSoalItem,
  ClientSoalItem,
  GeneratePaketPayload,
  KodeVarianPaket,
  SesiUjianSiswaCBT,
  NaskahCetakData,
} from '../src/types';

export const apiRouter = Router();

// Helper to generate dynamic 6-letter uppercase token
function generateToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit ambiguous O, 0, 1, I
  let res = '';
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

// -------------------------------------------------------------
// 1. MATA PELAJARAN & TUJUAN PEMBELAJARAN (TP)
// -------------------------------------------------------------
apiRouter.get('/mapel', (req: Request, res: Response) => {
  const { jenjang_sekolah, tingkat_kelas } = req.query;
  let list = db.mapelList;
  if (jenjang_sekolah && typeof jenjang_sekolah === 'string') {
    list = list.filter((m) => m.jenjang_sekolah === jenjang_sekolah);
  }
  if (tingkat_kelas && typeof tingkat_kelas === 'string') {
    list = list.filter((m) => m.tingkat_kelas === tingkat_kelas);
  }
  res.json({ success: true, data: list });
});

apiRouter.get('/mapel/:id', (req: Request, res: Response) => {
  const mapel = db.mapelList.find((m) => m.id === req.params.id);
  if (!mapel) {
    return res.status(404).json({ success: false, message: 'Mata pelajaran tidak ditemukan' });
  }
  res.json({ success: true, data: mapel });
});

// Update entire list of TP for a mapel
apiRouter.put('/mapel/:id/tp', (req: Request, res: Response) => {
  const { id } = req.params;
  const { daftar_tp, user_nama, user_role } = req.body;

  const mapelIndex = db.mapelList.findIndex((m) => m.id === id);
  if (mapelIndex === -1) {
    return res.status(404).json({ success: false, message: 'Mata pelajaran tidak ditemukan' });
  }

  if (!Array.isArray(daftar_tp)) {
    return res.status(400).json({ success: false, message: 'daftar_tp harus berupa array' });
  }

  db.mapelList[mapelIndex].daftar_tp = daftar_tp;

  db.logActivity(
    'user-tp',
    user_nama || 'Guru / Koordinator',
    user_role || 'GURU_PENULIS',
    'UPDATE_TP',
    'MataPelajaranKurikulum',
    id,
    `Memperbarui ${daftar_tp.length} Tujuan Pembelajaran (TP) pada mapel ${db.mapelList[mapelIndex].nama_mapel} (${db.mapelList[mapelIndex].tingkat_kelas})`
  );

  res.json({
    success: true,
    message: `Berhasil memperbarui Tujuan Pembelajaran untuk ${db.mapelList[mapelIndex].nama_mapel}`,
    data: db.mapelList[mapelIndex],
  });
});

// Add single TP to a mapel
apiRouter.post('/mapel/:id/tp', (req: Request, res: Response) => {
  const { id } = req.params;
  const { kode_tp, deskripsi, lingkup_materi, indikator_asesmen, user_nama, user_role } = req.body;

  const mapel = db.mapelList.find((m) => m.id === id);
  if (!mapel) {
    return res.status(404).json({ success: false, message: 'Mata pelajaran tidak ditemukan' });
  }

  if (!kode_tp || !deskripsi) {
    return res.status(400).json({ success: false, message: 'Kode TP dan Deskripsi wajib diisi' });
  }

  if (!mapel.daftar_tp) {
    mapel.daftar_tp = [];
  }

  // Check if kode_tp exists
  const existingIdx = mapel.daftar_tp.findIndex((t) => t.kode_tp.toLowerCase() === kode_tp.toLowerCase());
  const newTp = {
    kode_tp: kode_tp.trim(),
    deskripsi: deskripsi.trim(),
    lingkup_materi: lingkup_materi ? lingkup_materi.trim() : '',
    indikator_asesmen: indikator_asesmen ? indikator_asesmen.trim() : '',
  };

  if (existingIdx !== -1) {
    mapel.daftar_tp[existingIdx] = newTp;
  } else {
    mapel.daftar_tp.push(newTp);
  }

  db.logActivity(
    'user-tp',
    user_nama || 'Guru Penulis',
    user_role || 'GURU_PENULIS',
    'ADD_OR_EDIT_TP',
    'MataPelajaranKurikulum',
    id,
    `Menyimpan TP [${kode_tp}] pada ${mapel.nama_mapel}`
  );

  res.json({
    success: true,
    message: `TP ${kode_tp} berhasil disimpan`,
    data: mapel,
  });
});

// Delete TP from a mapel
apiRouter.delete('/mapel/:id/tp/:kode_tp', (req: Request, res: Response) => {
  const { id, kode_tp } = req.params;
  const { user_nama, user_role } = req.query;

  const mapel = db.mapelList.find((m) => m.id === id);
  if (!mapel) {
    return res.status(404).json({ success: false, message: 'Mata pelajaran tidak ditemukan' });
  }

  if (!mapel.daftar_tp) {
    return res.status(404).json({ success: false, message: 'Mapel belum memiliki daftar TP' });
  }

  const decodedKode = decodeURIComponent(kode_tp);
  const beforeCount = mapel.daftar_tp.length;
  mapel.daftar_tp = mapel.daftar_tp.filter((t) => t.kode_tp !== decodedKode);

  if (mapel.daftar_tp.length === beforeCount) {
    return res.status(404).json({ success: false, message: `TP ${decodedKode} tidak ditemukan` });
  }

  db.logActivity(
    'user-tp',
    typeof user_nama === 'string' ? user_nama : 'Guru Penulis',
    typeof user_role === 'string' ? user_role : 'GURU_PENULIS',
    'DELETE_TP',
    'MataPelajaranKurikulum',
    id,
    `Menghapus TP [${decodedKode}] dari ${mapel.nama_mapel}`
  );

  res.json({
    success: true,
    message: `TP ${decodedKode} berhasil dihapus`,
    data: mapel,
  });
});

// -------------------------------------------------------------
// 2. BANK SOAL BUTIR
// -------------------------------------------------------------
// GET /api/v1/bank-soal/items
apiRouter.get('/bank-soal/items', (req: Request, res: Response) => {
  const { mapel_id, jenjang_sekolah, tingkat_kelas, kode_tp, jenis_soal, level_kognitif, status_validasi, search } = req.query;
  let items = [...db.butirSoalList];

  if (jenjang_sekolah && typeof jenjang_sekolah === 'string') {
    items = items.filter((i) => {
      if (i.jenjang_sekolah) return i.jenjang_sekolah === jenjang_sekolah;
      const mapel = db.mapelList.find((m) => m.id === i.mapel_id);
      return mapel?.jenjang_sekolah === jenjang_sekolah;
    });
  }
  if (tingkat_kelas && typeof tingkat_kelas === 'string') {
    items = items.filter((i) => {
      if (i.tingkat_kelas) return i.tingkat_kelas === tingkat_kelas;
      const mapel = db.mapelList.find((m) => m.id === i.mapel_id);
      return mapel?.tingkat_kelas === tingkat_kelas;
    });
  }
  if (mapel_id) {
    items = items.filter((i) => i.mapel_id === mapel_id);
  }
  if (kode_tp && typeof kode_tp === 'string') {
    items = items.filter((i) => i.kode_tp === kode_tp);
  }
  if (jenis_soal) {
    items = items.filter((i) => i.jenis_soal === jenis_soal);
  }
  if (level_kognitif) {
    items = items.filter((i) => i.level_kognitif === level_kognitif);
  }
  if (status_validasi) {
    items = items.filter((i) => i.status_validasi === status_validasi);
  }
  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    items = items.filter(
      (i) =>
        i.pertanyaan_teks.toLowerCase().includes(s) ||
        i.stimulus_konten.toLowerCase().includes(s) ||
        i.capaian_pembelajaran.toLowerCase().includes(s) ||
        (i.kode_tp && i.kode_tp.toLowerCase().includes(s)) ||
        (i.tujuan_pembelajaran && i.tujuan_pembelajaran.toLowerCase().includes(s)) ||
        (i.lingkup_materi && i.lingkup_materi.toLowerCase().includes(s)) ||
        (i.indikator_soal && i.indikator_soal.toLowerCase().includes(s))
    );
  }

  // Populate mapel name and metadata
  const enriched = items.map((item) => {
    const mapel = db.mapelList.find((m) => m.id === item.mapel_id);
    return {
      ...item,
      jenjang_sekolah: item.jenjang_sekolah || mapel?.jenjang_sekolah,
      tingkat_kelas: item.tingkat_kelas || mapel?.tingkat_kelas,
      mapel_nama: mapel ? mapel.nama_mapel : 'Umum',
      mapel_kode: mapel ? mapel.kode_mapel : '',
    };
  });

  res.json({ success: true, data: enriched });
});

// POST /api/v1/bank-soal/items (Create or Update item)
apiRouter.post('/bank-soal/items', (req: Request, res: Response) => {
  try {
    const body = req.body;
    const {
      id,
      mapel_id,
      jenjang_sekolah,
      tingkat_kelas,
      kode_tp,
      tujuan_pembelajaran,
      lingkup_materi,
      indikator_soal,
      jenis_soal,
      level_kognitif,
      capaian_pembelajaran,
      stimulus_konten,
      stimulus_gambar_url,
      pertanyaan_teks,
      opsi_jawaban_json,
      kunci_jawaban_terenkripsi,
      bobot_nilai,
      rubrik_penilaian_esai,
      status_validasi,
      penulis_guru_id,
      nama_penulis,
    } = body;

    // Validation
    if (!mapel_id || !jenis_soal || !level_kognitif || !pertanyaan_teks) {
      return res.status(400).json({ success: false, message: 'Harap lengkapi semua atribut wajib butir soal!' });
    }

    const mapelInfo = db.mapelList.find((m) => m.id === mapel_id);
    const resolvedJenjang = jenjang_sekolah || mapelInfo?.jenjang_sekolah;
    const resolvedKelas = tingkat_kelas || mapelInfo?.tingkat_kelas;

    // BL-EXAM-002: Check if this item is part of a FROZEN paket ujian
    if (id) {
      const usedInLockedPaket = db.paketItemsList.some((pItem) => {
        if (pItem.butir_soal_id === id) {
          const pkt = db.paketList.find((p) => p.id === pItem.paket_ujian_id);
          return pkt && pkt.status_paket === 'TERKUNCI';
        }
        return false;
      });

      if (usedInLockedPaket) {
        return res.status(403).json({
          success: false,
          code: 'BL_EXAM_002_VIOLATION',
          message: 'BL-EXAM-002: Butir soal ini telah terdaftar dalam Paket Ujian yang TERKUNCI (Exam Paper Freeze). Modifikasi tidak diizinkan!',
        });
      }
    }

    if (id) {
      // Update existing item
      const idx = db.butirSoalList.findIndex((b) => b.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Butir soal tidak ditemukan!' });
      }

      const updated: BankSoalButir = {
        ...db.butirSoalList[idx],
        mapel_id,
        jenjang_sekolah: resolvedJenjang,
        tingkat_kelas: resolvedKelas,
        kode_tp: kode_tp || db.butirSoalList[idx].kode_tp,
        tujuan_pembelajaran: tujuan_pembelajaran || db.butirSoalList[idx].tujuan_pembelajaran,
        lingkup_materi: lingkup_materi || db.butirSoalList[idx].lingkup_materi,
        indikator_soal: indikator_soal || db.butirSoalList[idx].indikator_soal,
        jenis_soal,
        level_kognitif,
        capaian_pembelajaran: capaian_pembelajaran || '',
        stimulus_konten: stimulus_konten || '',
        stimulus_gambar_url: stimulus_gambar_url || undefined,
        pertanyaan_teks,
        opsi_jawaban_json: Array.isArray(opsi_jawaban_json) ? opsi_jawaban_json : [],
        kunci_jawaban_terenkripsi: kunci_jawaban_terenkripsi ?? db.butirSoalList[idx].kunci_jawaban_terenkripsi,
        bobot_nilai: Number(bobot_nilai) || 2.0,
        rubrik_penilaian_esai: rubrik_penilaian_esai || undefined,
        status_validasi: status_validasi || 'MENUNGGU_VALIDASI',
        penulis_guru_id: penulis_guru_id || db.butirSoalList[idx].penulis_guru_id,
        nama_penulis: nama_penulis || db.butirSoalList[idx].nama_penulis,
        updated_at: new Date().toISOString(),
      };

      db.butirSoalList[idx] = updated;

      db.logActivity(
        penulis_guru_id || 'guru-1',
        nama_penulis || 'Guru Penulis',
        'GURU_PENULIS',
        'UPDATE_QUESTION_ITEM',
        'bank_soal_butir',
        id,
        `Memperbarui butir soal [${id}] TP: ${kode_tp || '-'} untuk mapel ${mapel_id}.`
      );

      return res.json({ success: true, message: 'Butir soal berhasil diperbarui!', data: updated });
    } else {
      // Create new item
      const newId = 'soal-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      const newItem: BankSoalButir = {
        id: newId,
        mapel_id,
        jenjang_sekolah: resolvedJenjang,
        tingkat_kelas: resolvedKelas,
        kode_tp: kode_tp || undefined,
        tujuan_pembelajaran: tujuan_pembelajaran || undefined,
        lingkup_materi: lingkup_materi || undefined,
        indikator_soal: indikator_soal || undefined,
        jenis_soal,
        level_kognitif,
        capaian_pembelajaran: capaian_pembelajaran || '',
        stimulus_konten: stimulus_konten || '',
        stimulus_gambar_url: stimulus_gambar_url || undefined,
        pertanyaan_teks,
        opsi_jawaban_json: Array.isArray(opsi_jawaban_json) ? opsi_jawaban_json : [],
        kunci_jawaban_terenkripsi: kunci_jawaban_terenkripsi ?? '',
        bobot_nilai: Number(bobot_nilai) || 2.0,
        rubrik_penilaian_esai: rubrik_penilaian_esai || undefined,
        status_validasi: status_validasi || 'MENUNGGU_VALIDASI',
        penulis_guru_id: penulis_guru_id || 'guru-1',
        nama_penulis: nama_penulis || 'Guru Penulis',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.butirSoalList.unshift(newItem);

      db.logActivity(
        newItem.penulis_guru_id,
        newItem.nama_penulis,
        'GURU_PENULIS',
        'CREATE_QUESTION_ITEM',
        'bank_soal_butir',
        newId,
        `Menyimpan butir soal baru [${newId}] tipe ${jenis_soal} Level ${level_kognitif} TP: ${kode_tp || '-'}.`
      );

      return res.json({ success: true, message: 'Butir soal berhasil ditambahkan ke bank soal!', data: newItem });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
});

// POST /api/v1/bank-soal/items/:id/validate (Koordinator Kurikulum review)
apiRouter.post('/bank-soal/items/:id/validate', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, catatan_revisi, validator_nama } = req.body;

  const item = db.butirSoalList.find((b) => b.id === id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Butir soal tidak ditemukan!' });
  }

  // BL-EXAM-002: Check locked
  const usedInLocked = db.paketItemsList.some((pItem) => {
    if (pItem.butir_soal_id === id) {
      const pkt = db.paketList.find((p) => p.id === pItem.paket_ujian_id);
      return pkt && pkt.status_paket === 'TERKUNCI';
    }
    return false;
  });

  if (usedInLocked) {
    return res.status(403).json({
      success: false,
      code: 'BL_EXAM_002_VIOLATION',
      message: 'BL-EXAM-002: Soal ini telah terikat pada paket ujian terkunci!',
    });
  }

  item.status_validasi = status;
  if (catatan_revisi !== undefined) {
    item.catatan_revisi = catatan_revisi;
  }
  item.updated_at = new Date().toISOString();

  db.logActivity(
    'admin-1',
    validator_nama || 'Koordinator Kurikulum',
    'KOORDINATOR_KURIKULUM',
    status === 'TERVALIDASI' ? 'APPROVE_QUESTION_ITEM' : 'REVISE_QUESTION_ITEM',
    'bank_soal_butir',
    id,
    `Mengubah status validasi soal menjadi [${status}] ${catatan_revisi ? `Catatan: ${catatan_revisi}` : ''}`
  );

  res.json({ success: true, message: `Status butir soal berhasil diubah menjadi ${status}`, data: item });
});

// -------------------------------------------------------------
// 3. GENERATOR PAKET UJIAN & KISI-KISI
// -------------------------------------------------------------
// POST /api/v1/paket-ujian/generate (BL-EXAM-004: Balanced generation)
apiRouter.post('/paket-ujian/generate', (req: Request, res: Response) => {
  try {
    const payload: GeneratePaketPayload = req.body;
    const {
      mapel_id,
      kode_ujian,
      judul_ujian,
      durasi_menit,
      total_soal_pg,
      total_soal_esai,
      target_l1,
      target_l2,
      target_l3,
      acak_nomor_soal,
      acak_opsi_jawaban,
    } = payload;

    if (!mapel_id || !kode_ujian || !judul_ujian) {
      return res.status(400).json({ success: false, message: 'Harap isi informasi dasar paket ujian!' });
    }

    // Find available validated items for this mapel
    const candidates = db.butirSoalList.filter((b) => b.mapel_id === mapel_id && b.status_validasi === 'TERVALIDASI');

    if (candidates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Belum ada butir soal dengan status TERVALIDASI untuk mata pelajaran ini. Silakan validasi soal terlebih dahulu!',
      });
    }

    // Partition candidates by cognitive level and type
    const pgCandidates = candidates.filter((b) => b.jenis_soal !== 'ESAI_URAIAN');
    const esaiCandidates = candidates.filter((b) => b.jenis_soal === 'ESAI_URAIAN');

    const l1Items = pgCandidates.filter((b) => b.level_kognitif === 'L1');
    const l2Items = pgCandidates.filter((b) => b.level_kognitif === 'L2');
    const l3Items = pgCandidates.filter((b) => b.level_kognitif === 'L3');

    // Pick for base selection according to distribution
    const selectedPg: BankSoalButir[] = [];
    const pickCount = (source: BankSoalButir[], target: number) => {
      const shuffled = [...source].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(target, shuffled.length));
    };

    selectedPg.push(...pickCount(l1Items, target_l1 || 1));
    selectedPg.push(...pickCount(l2Items, target_l2 || 1));
    selectedPg.push(...pickCount(l3Items, target_l3 || 1));

    // If still less than total_soal_pg, fill from remaining
    if (selectedPg.length < (total_soal_pg || 3)) {
      const remaining = pgCandidates.filter((b) => !selectedPg.some((s) => s.id === b.id));
      const fill = pickCount(remaining, (total_soal_pg || 3) - selectedPg.length);
      selectedPg.push(...fill);
    }

    // If no PG candidates at all, take any
    if (selectedPg.length === 0 && pgCandidates.length > 0) {
      selectedPg.push(pgCandidates[0]);
    }

    // Pick esai questions
    const selectedEsai = pickCount(esaiCandidates, total_soal_esai || 1);
    if (selectedEsai.length === 0 && esaiCandidates.length > 0) {
      selectedEsai.push(esaiCandidates[0]);
    }

    const allBaseItems = [...selectedPg, ...selectedEsai];

    if (allBaseItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Jumlah soal tervalidasi tidak mencukupi untuk kriteria distribusi yang diminta.',
      });
    }

    const newPaketId = 'pkt-' + Date.now().toString(36);
    const newPaket: PaketUjian = {
      id: newPaketId,
      kode_ujian,
      judul_ujian,
      mapel_id,
      durasi_menit: Number(durasi_menit) || 90,
      total_soal_pg: selectedPg.length,
      total_soal_esai: selectedEsai.length,
      acak_nomor_soal: !!acak_nomor_soal,
      acak_opsi_jawaban: !!acak_opsi_jawaban,
      status_paket: 'DRAFT',
      target_l1: target_l1 || 1,
      target_l2: target_l2 || 1,
      target_l3: target_l3 || 1,
      varian_tersedia: ['A', 'B', 'CADANGAN'],
      created_at: new Date().toISOString(),
    };

    db.paketList.unshift(newPaket);

    // BL-EXAM-004: Balanced Distribution for Varian A, B, and Cadangan
    // Paket A has natural sequence
    allBaseItems.forEach((b, idx) => {
      db.paketItemsList.push({
        id: `item-${newPaketId}-a-${idx + 1}`,
        paket_ujian_id: newPaketId,
        butir_soal_id: b.id,
        kode_varian_paket: 'A',
        nomor_urut: idx + 1,
      });
    });

    // Paket B: Permuted question sequence with balanced cognitive difficulty
    // (e.g. PG items cyclically shifted or interleaved while keeping difficulty weights identical)
    const bPgItems = [...selectedPg];
    if (bPgItems.length > 1) {
      // rotate by half to balance position effect while preserving exact same items & difficulty
      const shift = Math.floor(bPgItems.length / 2);
      const rotated = [...bPgItems.slice(shift), ...bPgItems.slice(0, shift)];
      rotated.forEach((b, idx) => {
        db.paketItemsList.push({
          id: `item-${newPaketId}-b-${idx + 1}`,
          paket_ujian_id: newPaketId,
          butir_soal_id: b.id,
          kode_varian_paket: 'B',
          nomor_urut: idx + 1,
        });
      });
    } else {
      bPgItems.forEach((b, idx) => {
        db.paketItemsList.push({
          id: `item-${newPaketId}-b-${idx + 1}`,
          paket_ujian_id: newPaketId,
          butir_soal_id: b.id,
          kode_varian_paket: 'B',
          nomor_urut: idx + 1,
        });
      });
    }
    selectedEsai.forEach((b, idx) => {
      db.paketItemsList.push({
        id: `item-${newPaketId}-b-${bPgItems.length + idx + 1}`,
        paket_ujian_id: newPaketId,
        butir_soal_id: b.id,
        kode_varian_paket: 'B',
        nomor_urut: bPgItems.length + idx + 1,
      });
    });

    // Paket CADANGAN
    allBaseItems.forEach((b, idx) => {
      db.paketItemsList.push({
        id: `item-${newPaketId}-cad-${idx + 1}`,
        paket_ujian_id: newPaketId,
        butir_soal_id: b.id,
        kode_varian_paket: 'CADANGAN',
        nomor_urut: idx + 1,
      });
    });

    db.logActivity(
      'admin-1',
      'Koordinator Kurikulum',
      'KOORDINATOR_KURIKULUM',
      'GENERATE_EXAM_PACKAGE',
      'paket_ujian',
      newPaketId,
      `Berhasil menyusun Paket Ujian seimbang [${kode_ujian}] Varian A, B, Cadangan (${allBaseItems.length} butir soal, BL-EXAM-004).`
    );

    return res.json({
      success: true,
      message: 'Paket Ujian Seimbang (Paket A, B, Cadangan) berhasil disusun otomatis!',
      data: newPaket,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Gagal generate paket' });
  }
});

// GET /api/v1/paket-ujian (List packages)
apiRouter.get('/paket-ujian', (req: Request, res: Response) => {
  const result = db.paketList.map((pkt) => {
    const mapel = db.mapelList.find((m) => m.id === pkt.mapel_id);
    const itemsCount = db.paketItemsList.filter((pi) => pi.paket_ujian_id === pkt.id && pi.kode_varian_paket === 'A').length;
    return {
      ...pkt,
      nama_mapel: mapel?.nama_mapel || 'Umum',
      kode_mapel: mapel?.kode_mapel || '',
      total_items_count: itemsCount,
    };
  });
  res.json({ success: true, data: result });
});

// GET /api/v1/paket-ujian/:id (Package detail with items per variant)
apiRouter.get('/paket-ujian/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const pkt = db.paketList.find((p) => p.id === id);
  if (!pkt) {
    return res.status(404).json({ success: false, message: 'Paket ujian tidak ditemukan!' });
  }

  const mapel = db.mapelList.find((m) => m.id === pkt.mapel_id);

  // Group items by variant
  const items = db.paketItemsList
    .filter((pi) => pi.paket_ujian_id === id)
    .map((pi) => {
      const butir = db.butirSoalList.find((b) => b.id === pi.butir_soal_id);
      return {
        ...pi,
        butir_soal: butir,
      };
    });

  const variantA = items.filter((i) => i.kode_varian_paket === 'A').sort((a, b) => a.nomor_urut - b.nomor_urut);
  const variantB = items.filter((i) => i.kode_varian_paket === 'B').sort((a, b) => a.nomor_urut - b.nomor_urut);
  const variantCadangan = items.filter((i) => i.kode_varian_paket === 'CADANGAN').sort((a, b) => a.nomor_urut - b.nomor_urut);

  res.json({
    success: true,
    data: {
      paket: pkt,
      mapel,
      varian: {
        A: variantA,
        B: variantB,
        CADANGAN: variantCadangan,
      },
    },
  });
});

// POST /api/v1/paket-ujian/:id/freeze (BL-EXAM-002: Exam Paper Freeze)
apiRouter.post('/paket-ujian/:id/freeze', (req: Request, res: Response) => {
  const { id } = req.params;
  const pkt = db.paketList.find((p) => p.id === id);
  if (!pkt) {
    return res.status(404).json({ success: false, message: 'Paket ujian tidak ditemukan!' });
  }

  pkt.status_paket = 'TERKUNCI';
  pkt.tanggal_kunci = new Date().toISOString();

  db.logActivity(
    'admin-1',
    'Koordinator Kurikulum',
    'KOORDINATOR_KURIKULUM',
    'FREEZE_EXAM_PACKAGE',
    'paket_ujian',
    id,
    `BL-EXAM-002: Mengunci secara permanen paket naskah [${pkt.kode_ujian}]. Soal tidak dapat lagi diubah atau dihapus!`
  );

  res.json({
    success: true,
    message: 'Paket ujian resmi TERKUNCI (BL-EXAM-002 Freeze Active). Integritas naskah terjamin!',
    data: pkt,
  });
});

// GET /api/v1/paket-ujian/:id/pdf-naskah (2-Column Official Exam Paper Print Layout Data)
apiRouter.get('/paket-ujian/:id/pdf-naskah', (req: Request, res: Response) => {
  const { id } = req.params;
  const varian = (req.query.varian as KodeVarianPaket) || 'A';

  const pkt = db.paketList.find((p) => p.id === id);
  if (!pkt) {
    return res.status(404).json({ success: false, message: 'Paket ujian tidak ditemukan!' });
  }

  const mapel = db.mapelList.find((m) => m.id === pkt.mapel_id) || {
    id: 'm-def',
    jenjang_sekolah: 'SMA' as const,
    kode_mapel: 'MAPEL-01',
    nama_mapel: 'Mata Pelajaran Umum',
    tingkat_kelas: 'Kelas X',
    fase_kurikulum: 'Fase E',
  };

  const rawItems = db.paketItemsList
    .filter((pi) => pi.paket_ujian_id === id && pi.kode_varian_paket === varian)
    .sort((a, b) => a.nomor_urut - b.nomor_urut)
    .map((pi) => ({
      ...pi,
      butir_soal: db.butirSoalList.find((b) => b.id === pi.butir_soal_id)!,
    }))
    .filter((pi) => Boolean(pi.butir_soal));

  const soal_pg = rawItems.filter((i) => i.butir_soal.jenis_soal !== 'ESAI_URAIAN');
  const soal_esai = rawItems.filter((i) => i.butir_soal.jenis_soal === 'ESAI_URAIAN');

  const naskahData: NaskahCetakData = {
    paket: pkt,
    mapel,
    varian,
    kop_sekolah: {
      dinas: 'PEMERINTAH DAERAH PROVINSI - DINAS PENDIDIKAN DAN KEBUDAYAAN',
      provinsi: 'CABANG DINAS WILAYAH PENDIDIKAN MENENGAH ATAS',
      nama_sekolah: 'SMA NEGERI 1 TELADAN NUSANTARA',
      alamat: 'Jl. Pendidikan No. 45, Kompleks Karangpawitan, Telp. (021) 7894562 Kode Pos 14230',
      akreditasi: 'TERAKREDITASI "A" (UNGGUL) - NPSN: 20104523',
      tahun_ajaran: 'TAHUN AJARAN 2025/2026',
    },
    petunjuk_umum: [
      'Berdoalah kepada Tuhan Yang Maha Esa sebelum memulai mengerjakan naskah ujian.',
      'Periksa dan bacalah setiap stimulus wacana dan butir soal dengan teliti sebelum menjawab.',
      'Tuliskan identitas dan nomor peserta Anda pada Lembar Jawaban Komputer (LJK) atau periksa pada layar CBT.',
      'Dilarang menggunakan kalkulator, tabel matematika, kamus, HP atau alat bantu komunikasi lainnya tanpa izin pengawas.',
      'Laporkan kepada pengawas ruang apabila terdapat lembar soal yang kurang jelas, rusak, atau tidak lengkap.',
      'Periksa kembali seluruh lembar jawaban Anda sebelum diserahkan kepada pengawas ujian.',
    ],
    soal_pg,
    soal_esai,
  };

  res.json({ success: true, data: naskahData });
});

// -------------------------------------------------------------
// 4. PROKTOR CBT & MONITORING RUANG UJIAN
// -------------------------------------------------------------
// POST /api/v1/cbt/proktor/release-token
apiRouter.post('/cbt/proktor/release-token', (req: Request, res: Response) => {
  const { paket_ujian_id, ruang_lab, masa_berlaku_jam } = req.body;
  const pkt = db.paketList.find((p) => p.id === paket_ujian_id) || db.paketList[0];

  const newTokenStr = generateToken();
  const durasiJam = Number(masa_berlaku_jam) || 2;
  const expiredAt = new Date(Date.now() + durasiJam * 3600000).toISOString();

  // Deactivate old tokens
  db.proctorTokens.forEach((t) => (t.is_active = false));

  const tokenObj = {
    token: newTokenStr,
    paket_ujian_id: pkt ? pkt.id : 'pkt-def',
    kode_ujian: pkt ? pkt.kode_ujian : 'ASAT-2026',
    judul_ujian: pkt ? pkt.judul_ujian : 'Asesmen Sumatif CBT',
    dibuat_pada: new Date().toISOString(),
    berlaku_sampai: expiredAt,
    is_active: true,
    ruang_lab: ruang_lab || 'Lab Komputer 01',
  };

  db.proctorTokens.unshift(tokenObj);

  db.logActivity(
    'proktor-1',
    'Indra Hermawan, S.Kom.',
    'PROKTOR_PENGAWAS',
    'RELEASE_TOKEN',
    'proctor_token',
    newTokenStr,
    `Menerbitkan Token CBT dinamis [${newTokenStr}] aktif hingga ${new Date(expiredAt).toLocaleTimeString('id-ID')}.`
  );

  res.json({
    success: true,
    message: `Token CBT baru berhasil diterbitkan: ${newTokenStr}`,
    data: tokenObj,
  });
});

// GET /api/v1/cbt/proktor/token (Get current active token)
apiRouter.get('/cbt/proktor/token', (req: Request, res: Response) => {
  const active = db.proctorTokens.find((t) => t.is_active);
  res.json({ success: true, data: active || null });
});

// GET /api/v1/cbt/proktor/sessions (Live monitoring for proctor)
apiRouter.get('/cbt/proktor/sessions', (req: Request, res: Response) => {
  const sessions = db.sesiList.map((sesi) => {
    const answeredCount = Object.keys(sesi.jawaban_siswa_json || {}).length;
    const doubtfulCount = Object.values(sesi.jawaban_siswa_json || {}).filter((j) => j.ragu).length;
    const totalItems = db.paketItemsList.filter((pi) => pi.paket_ujian_id === sesi.paket_ujian_id && pi.kode_varian_paket === sesi.kode_varian_paket).length || 4;

    return {
      ...sesi,
      progres_jawab: answeredCount,
      jumlah_ragu: doubtfulCount,
      total_soal: totalItems,
      persentase: Math.round((answeredCount / totalItems) * 100),
    };
  });

  res.json({ success: true, data: sessions });
});

// POST /api/v1/cbt/proktor/sessions/:sesiId/action (Proctor actions: reset, unlock, force-submit)
apiRouter.post('/cbt/proktor/sessions/:sesiId/action', (req: Request, res: Response) => {
  const { sesiId } = req.params;
  const { action, proktor_nama, note } = req.body;

  const sesi = db.sesiList.find((s) => s.id === sesiId);
  if (!sesi) {
    return res.status(404).json({ success: false, message: 'Sesi siswa tidak ditemukan!' });
  }

  if (action === 'reset-login') {
    // Reset login for PC crash / device restart
    sesi.status_pengerjaan = 'SEDANG_MENGERJAKAN';
    sesi.terakhir_aktif = new Date().toISOString();
    db.logActivity(
      'proktor-1',
      proktor_nama || 'Pengawas Ruang',
      'PROKTOR_PENGAWAS',
      'RESET_STUDENT_SESSION',
      'sesi_ujian_siswa_cbt',
      sesiId,
      `Mereset sesi login siswa [${sesi.nomor_peserta} - ${sesi.nama_siswa}] karena kendala perangkat lab.`
    );
    return res.json({ success: true, message: `Sesi login ${sesi.nama_siswa} berhasil direset!`, data: sesi });
  }

  if (action === 'unlock-violation') {
    // BL-EXAM-003: Unlock after violation lockdown
    sesi.status_pengerjaan = 'SEDANG_MENGERJAKAN';
    sesi.riwayat_pelanggaran.push({
      timestamp: new Date().toISOString(),
      jenis: 'DEVTOOLS',
      detail: `Kunci sesi dibuka manual oleh proktor (${proktor_nama || 'Pengawas'}). Catatan: ${note || 'Diberi dispensasi'}.`,
    });
    db.logActivity(
      'proktor-1',
      proktor_nama || 'Pengawas Ruang',
      'PROKTOR_PENGAWAS',
      'UNLOCK_VIOLATION',
      'sesi_ujian_siswa_cbt',
      sesiId,
      `Membuka kunci pelanggaran sesi siswa [${sesi.nomor_peserta}].`
    );
    return res.json({ success: true, message: `Kunci pelanggaran berhasil dibuka. Siswa dapat melanjutkan pengerjaan!`, data: sesi });
  }

  if (action === 'force-submit') {
    // Forcibly finalize
    sesi.status_pengerjaan = 'SELESAI';
    sesi.waktu_selesai = new Date().toISOString();
    sesi.sisa_detik = 0;

    // Calculate score
    evaluateStudentScore(sesi);

    db.logActivity(
      'proktor-1',
      proktor_nama || 'Pengawas Ruang',
      'PROKTOR_PENGAWAS',
      'FORCE_SUBMIT_EXAM',
      'sesi_ujian_siswa_cbt',
      sesiId,
      `Memaksa pengumpulan ujian siswa [${sesi.nomor_peserta} - ${sesi.nama_siswa}].`
    );
    return res.json({ success: true, message: `Ujian ${sesi.nama_siswa} berhasil diselesaikan paksa!`, data: sesi });
  }

  if (action === 'extend-time') {
    const tambahMenit = Number(req.body.menit) || 15;
    sesi.sisa_detik += tambahMenit * 60;
    db.logActivity(
      'proktor-1',
      proktor_nama || 'Pengawas Ruang',
      'PROKTOR_PENGAWAS',
      'EXTEND_TIME',
      'sesi_ujian_siswa_cbt',
      sesiId,
      `Menambah waktu pengerjaan siswa [${sesi.nomor_peserta}] sebesar ${tambahMenit} menit.`
    );
    return res.json({ success: true, message: `Waktu pengerjaan ditambah ${tambahMenit} menit!`, data: sesi });
  }

  res.status(400).json({ success: false, message: 'Aksi proktor tidak dikenali!' });
});

// -------------------------------------------------------------
// 5. SISWA CBT AUTH & ENGINE ASESMEN (BL-EXAM-001 ZERO-LEAKAGE)
// -------------------------------------------------------------
// POST /api/v1/cbt/auth/login
apiRouter.post('/cbt/auth/login', (req: Request, res: Response) => {
  const { nomor_peserta, token_ujian } = req.body;

  if (!nomor_peserta || !token_ujian) {
    return res.status(400).json({ success: false, message: 'Nomor Peserta dan Token Ujian wajib diisi!' });
  }

  // Validate Token
  const cleanToken = token_ujian.trim().toUpperCase();
  const tokenRecord = db.proctorTokens.find((t) => t.token === cleanToken && t.is_active);

  if (!tokenRecord) {
    return res.status(401).json({
      success: false,
      message: 'Token Ujian tidak valid atau telah kadaluarsa! Silakan tanyakan token aktif pada Pengawas Ruang.',
    });
  }

  // Find or create student session
  let sesi = db.sesiList.find((s) => s.nomor_peserta.toLowerCase() === nomor_peserta.trim().toLowerCase());

  if (!sesi) {
    // Create new session for this student
    const paket = db.paketList.find((p) => p.id === tokenRecord.paket_ujian_id) || db.paketList[0];
    const varianAssign: KodeVarianPaket = Math.random() > 0.5 ? 'A' : 'B';
    const newSesiId = 'sesi-' + Date.now().toString(36);

    sesi = {
      id: newSesiId,
      paket_ujian_id: paket.id,
      kode_varian_paket: varianAssign,
      siswa_id: 'siswa-' + Date.now(),
      nomor_peserta: nomor_peserta.trim().toUpperCase(),
      nama_siswa: `Peserta ${nomor_peserta.trim().toUpperCase()}`,
      kelas: 'Kelas X-MIPA',
      waktu_mulai: new Date().toISOString(),
      sisa_detik: (paket.durasi_menit || 90) * 60,
      jawaban_siswa_json: {},
      skor_otomatis_pg: null,
      skor_esai_manual: null,
      total_skor_akhir: null,
      jumlah_pelanggaran_tab: 0,
      status_pengerjaan: 'SEDANG_MENGERJAKAN',
      riwayat_pelanggaran: [],
      terakhir_aktif: new Date().toISOString(),
      ip_address: '192.168.10.' + Math.floor(Math.random() * 50 + 10),
    };

    db.sesiList.unshift(sesi);
  } else {
    // Check if already finished
    if (sesi.status_pengerjaan === 'SELESAI') {
      return res.status(403).json({
        success: false,
        message: 'Anda telah menyelesaikan ujian ini. Pengulangan pengerjaan tidak diizinkan!',
      });
    }

    if (sesi.status_pengerjaan === 'TERKUNCI_PELANGGARAN') {
      return res.status(403).json({
        success: false,
        code: 'LOCKED_BY_VIOLATION',
        message: 'Sesi Anda terblokir akibat deteksi kecurangan / perpindahan layar (BL-EXAM-003). Silakan temui Pengawas Ruang untuk verifikasi reset!',
      });
    }

    // Resume session
    if (sesi.status_pengerjaan === 'BELUM_MULAI') {
      sesi.status_pengerjaan = 'SEDANG_MENGERJAKAN';
      sesi.waktu_mulai = new Date().toISOString();
    }
    sesi.terakhir_aktif = new Date().toISOString();
  }

  const paket = db.paketList.find((p) => p.id === sesi.paket_ujian_id);

  db.logActivity(
    sesi.siswa_id,
    sesi.nama_siswa,
    'SISWA_CBT',
    'LOGIN_CBT',
    'sesi_ujian_siswa_cbt',
    sesi.id,
    `Siswa login CBT dengan nomor peserta [${sesi.nomor_peserta}], menerima Varian Paket [${sesi.kode_varian_paket}].`
  );

  res.json({
    success: true,
    message: 'Login CBT berhasil diverifikasi.',
    data: {
      sesi_id: sesi.id,
      nama_siswa: sesi.nama_siswa,
      nomor_peserta: sesi.nomor_peserta,
      kelas: sesi.kelas,
      kode_varian_paket: sesi.kode_varian_paket,
      sisa_detik: sesi.sisa_detik,
      status_pengerjaan: sesi.status_pengerjaan,
      judul_ujian: paket?.judul_ujian || 'Asesmen CBT',
      durasi_menit: paket?.durasi_menit || 90,
    },
  });
});

// GET /api/v1/cbt/sesi/:sesiId/soal (BL-EXAM-001: ZERO-LEAKAGE)
// CRITICAL: NEVER return answer keys or rubrics to student browser!
apiRouter.get('/cbt/sesi/:sesiId/soal', (req: Request, res: Response) => {
  const { sesiId } = req.params;
  const sesi = db.sesiList.find((s) => s.id === sesiId);

  if (!sesi) {
    return res.status(404).json({ success: false, message: 'Sesi pengerjaan tidak ditemukan!' });
  }

  const paket = db.paketList.find((p) => p.id === sesi.paket_ujian_id);
  if (!paket) {
    return res.status(404).json({ success: false, message: 'Paket ujian tidak valid!' });
  }

  // Get items for assigned variant
  const itemsInVariant = db.paketItemsList
    .filter((pi) => pi.paket_ujian_id === sesi.paket_ujian_id && pi.kode_varian_paket === sesi.kode_varian_paket)
    .sort((a, b) => a.nomor_urut - b.nomor_urut);

  // Map to client-safe structure STRIPPING ANSWER KEYS
  const clientQuestions: ClientSoalItem[] = [];

  itemsInVariant.forEach((pi) => {
    const original = db.butirSoalList.find((b) => b.id === pi.butir_soal_id);
    if (original) {
      clientQuestions.push({
        id: original.id,
        nomor_urut: pi.nomor_urut,
        jenis_soal: original.jenis_soal,
        level_kognitif: original.level_kognitif,
        capaian_pembelajaran: original.capaian_pembelajaran,
        stimulus_konten: original.stimulus_konten,
        stimulus_gambar_url: original.stimulus_gambar_url,
        pertanyaan_teks: original.pertanyaan_teks,
        // Clone options so original memory is untouched
        opsi_jawaban_json: original.opsi_jawaban_json.map((opt) => ({
          id: opt.id,
          label: opt.label,
          teks: opt.teks,
        })),
        bobot_nilai: original.bobot_nilai,
        // ZERO-LEAKAGE: NO kunci_jawaban_terenkripsi, NO rubrik_penilaian_esai
      });
    }
  });

  res.json({
    success: true,
    data: {
      sesi: {
        id: sesi.id,
        nomor_peserta: sesi.nomor_peserta,
        nama_siswa: sesi.nama_siswa,
        kelas: sesi.kelas,
        sisa_detik: sesi.sisa_detik,
        jawaban_siswa: sesi.jawaban_siswa_json,
        status_pengerjaan: sesi.status_pengerjaan,
        jumlah_pelanggaran_tab: sesi.jumlah_pelanggaran_tab,
      },
      paket: {
        judul_ujian: paket.judul_ujian,
        durasi_menit: paket.durasi_menit,
        kode_varian: sesi.kode_varian_paket,
        total_soal: clientQuestions.length,
      },
      daftar_soal: clientQuestions,
    },
  });
});

// POST /api/v1/cbt/sesi/:sesiId/autosave (BL-EXAM-003: Anti-Cheat Tab-Switch Detection + Realtime Autosave)
apiRouter.post('/cbt/sesi/:sesiId/autosave', (req: Request, res: Response) => {
  const { sesiId } = req.params;
  const { jawaban_siswa, sisa_detik, pelanggaran } = req.body;

  const sesi = db.sesiList.find((s) => s.id === sesiId);
  if (!sesi) {
    return res.status(404).json({ success: false, message: 'Sesi siswa tidak ditemukan!' });
  }

  // If already locked by violation, reject autosave
  if (sesi.status_pengerjaan === 'TERKUNCI_PELANGGARAN') {
    return res.status(403).json({
      success: false,
      code: 'BL_EXAM_003_LOCKED',
      message: 'Sesi Anda TERKUNCI akibat deteksi kecurangan (BL-EXAM-003). Menunggu pembukaan oleh Pengawas Ruang!',
    });
  }

  // Update answers
  if (jawaban_siswa && typeof jawaban_siswa === 'object') {
    sesi.jawaban_siswa_json = {
      ...sesi.jawaban_siswa_json,
      ...jawaban_siswa,
    };
  }

  // Update timer
  if (typeof sisa_detik === 'number') {
    sesi.sisa_detik = Math.max(0, sisa_detik);
  }

  sesi.terakhir_aktif = new Date().toISOString();

  // BL-EXAM-003: Process Anti-Cheat Violation Event
  if (pelanggaran && pelanggaran.jenis) {
    sesi.jumlah_pelanggaran_tab += 1;
    const catat = {
      timestamp: new Date().toISOString(),
      jenis: pelanggaran.jenis,
      detail: pelanggaran.detail || 'Terdeteksi meninggalkan jendela ujian (tab switch / blur / exit fullscreen).',
    };
    sesi.riwayat_pelanggaran.push(catat);

    db.logActivity(
      sesi.siswa_id,
      sesi.nama_siswa,
      'SISWA_CBT',
      'ANTI_CHEAT_VIOLATION',
      'sesi_ujian_siswa_cbt',
      sesi.id,
      `BL-EXAM-003: Pelanggaran ke-${sesi.jumlah_pelanggaran_tab} [${pelanggaran.jenis}]: ${catat.detail}`
    );

    // If violations >= 3 -> Trigger auto-lockdown
    if (sesi.jumlah_pelanggaran_tab >= 3) {
      sesi.status_pengerjaan = 'TERKUNCI_PELANGGARAN';
      return res.json({
        success: true,
        locked: true,
        message: 'BL-EXAM-003: Anda telah melakukan 3x pelanggaran fokus layar. Sesi Anda DIKUNCI otomatis dan membutuhkan persetujuan pengawas!',
        jumlah_pelanggaran: sesi.jumlah_pelanggaran_tab,
        status: sesi.status_pengerjaan,
      });
    }

    return res.json({
      success: true,
      locked: false,
      warning: true,
      message: `Peringatan Pelanggaran ke-${sesi.jumlah_pelanggaran_tab}/3: Harap tetap fokus pada layar ujian!`,
      jumlah_pelanggaran: sesi.jumlah_pelanggaran_tab,
      status: sesi.status_pengerjaan,
    });
  }

  res.json({
    success: true,
    saved_at: new Date().toISOString(),
    status: sesi.status_pengerjaan,
    jumlah_pelanggaran: sesi.jumlah_pelanggaran_tab,
  });
});

// Helper to evaluate automatic scoring authoritative on backend
function evaluateStudentScore(sesi: SesiUjianSiswaCBT) {
  let pgTotalEarned = 0;
  let pgMaxWeight = 0;

  const items = db.paketItemsList.filter(
    (pi) => pi.paket_ujian_id === sesi.paket_ujian_id && pi.kode_varian_paket === sesi.kode_varian_paket
  );

  items.forEach((pi) => {
    const butir = db.butirSoalList.find((b) => b.id === pi.butir_soal_id);
    if (!butir) return;

    if (butir.jenis_soal === 'PILIHAN_GANDA') {
      pgMaxWeight += butir.bobot_nilai;
      const studentAns = sesi.jawaban_siswa_json[butir.id]?.jawaban;
      if (studentAns && studentAns === butir.kunci_jawaban_terenkripsi) {
        pgTotalEarned += butir.bobot_nilai;
      }
    } else if (butir.jenis_soal === 'PG_KOMPLEKS') {
      pgMaxWeight += butir.bobot_nilai;
      const studentAns = sesi.jawaban_siswa_json[butir.id]?.jawaban;
      if (Array.isArray(studentAns) && Array.isArray(butir.kunci_jawaban_terenkripsi)) {
        // Compare arrays
        const sortedStudent = [...studentAns].sort().join(',');
        const sortedKey = [...butir.kunci_jawaban_terenkripsi].sort().join(',');
        if (sortedStudent === sortedKey) {
          pgTotalEarned += butir.bobot_nilai;
        } else {
          // Partial credit: calculate matched answers
          const correctPicks = studentAns.filter((a) => butir.kunci_jawaban_terenkripsi.includes(a)).length;
          const wrongPicks = studentAns.filter((a) => !butir.kunci_jawaban_terenkripsi.includes(a)).length;
          const net = Math.max(0, (correctPicks - wrongPicks) / butir.kunci_jawaban_terenkripsi.length);
          pgTotalEarned += Number((net * butir.bobot_nilai).toFixed(2));
        }
      }
    } else if (butir.jenis_soal === 'ISIAN_SINGKAT') {
      pgMaxWeight += butir.bobot_nilai;
      const studentAns = sesi.jawaban_siswa_json[butir.id]?.jawaban;
      if (typeof studentAns === 'string' && typeof butir.kunci_jawaban_terenkripsi === 'string') {
        if (studentAns.trim().toLowerCase() === butir.kunci_jawaban_terenkripsi.trim().toLowerCase()) {
          pgTotalEarned += butir.bobot_nilai;
        }
      }
    }
  });

  sesi.skor_otomatis_pg = Number(pgTotalEarned.toFixed(2));
  sesi.total_skor_akhir = Number(pgTotalEarned.toFixed(2));
}

// POST /api/v1/cbt/sesi/:sesiId/submit (Finalize student test)
apiRouter.post('/api/v1/cbt/sesi/:sesiId/submit', (req: Request, res: Response) => {
  // handled below
});

apiRouter.post('/cbt/sesi/:sesiId/submit', (req: Request, res: Response) => {
  const { sesiId } = req.params;
  const sesi = db.sesiList.find((s) => s.id === sesiId);

  if (!sesi) {
    return res.status(404).json({ success: false, message: 'Sesi siswa tidak ditemukan!' });
  }

  sesi.status_pengerjaan = 'SELESAI';
  sesi.waktu_selesai = new Date().toISOString();
  sesi.sisa_detik = 0;

  // Backend authoritative grading
  evaluateStudentScore(sesi);

  db.logActivity(
    sesi.siswa_id,
    sesi.nama_siswa,
    'SISWA_CBT',
    'SUBMIT_FINAL_EXAM',
    'sesi_ujian_siswa_cbt',
    sesi.id,
    `Ujian selesai dikerjakan siswa [${sesi.nomor_peserta}]. Skor otomatis objektif: ${sesi.skor_otomatis_pg}.`
  );

  res.json({
    success: true,
    message: 'Selamat! Seluruh lembar jawaban ujian CBT Anda telah berhasil dikumpulkan.',
    data: {
      nomor_peserta: sesi.nomor_peserta,
      nama_siswa: sesi.nama_siswa,
      waktu_selesai: sesi.waktu_selesai,
      status: sesi.status_pengerjaan,
      skor_otomatis_pg: sesi.skor_otomatis_pg,
    },
  });
});

// -------------------------------------------------------------
// 6. AUDIT TRAILS & SYSTEM LOGS
// -------------------------------------------------------------
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  res.json({ success: true, data: db.auditLogs });
});

// POST /api/v1/seed/reset
apiRouter.post('/seed/reset', (req: Request, res: Response) => {
  db.seedInitialData();
  res.json({ success: true, message: 'Data simulasi bank soal dan sesi ujian telah di-reset ke nilai awal standar!' });
});
