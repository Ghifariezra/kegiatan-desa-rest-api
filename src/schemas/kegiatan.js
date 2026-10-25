import { z } from 'zod';
import {
    teks,
    teksOpsional,
    bilanganPositif,
    tanggal,
    jam,
    enumDari,
    keDetik,
    adaIsi,
    PESAN_KOSONG,
} from './common.js';

export const STATUS_KEGIATAN = ['dijadwalkan', 'berlangsung', 'selesai', 'dibatalkan'];

const kegiatanBase = z.object({
    kategori_id: bilanganPositif('kategori_id'),
    lokasi_id: bilanganPositif('lokasi_id'),
    nama_kegiatan: teks('nama_kegiatan', 150),
    deskripsi: teksOpsional('deskripsi'),
    tanggal: tanggal('tanggal'),
    jam_mulai: jam('jam_mulai'),
    jam_selesai: jam('jam_selesai'),
    kuota: bilanganPositif('kuota'),
    status: enumDari('status', STATUS_KEGIATAN).optional(),
});

// Aturan ini sama dengan constraint chk_kegiatan_jam di database.
// Hanya diperiksa kalau kedua jam ada di body.
const jamBerurutan = (d) =>
    d.jam_mulai === undefined || d.jam_selesai === undefined || keDetik(d.jam_selesai) > keDetik(d.jam_mulai);
const optJam = { error: 'jam_selesai harus lebih besar dari jam_mulai', path: ['jam_selesai'] };

export const kegiatanCreateSchema = kegiatanBase.refine(jamBerurutan, optJam);

export const kegiatanUpdateSchema = kegiatanBase
    .partial()
    .refine(adaIsi, { error: PESAN_KOSONG })
    .refine(jamBerurutan, optJam);