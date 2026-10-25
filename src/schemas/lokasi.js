import { z } from 'zod';
import { teks, adaIsi, PESAN_KOSONG } from './common.js';

const lokasiBase = z.object({
    nama_lokasi: teks('nama_lokasi', 100),
    alamat: z
        .string({ error: (iss) => (iss.input === undefined ? 'alamat wajib diisi' : 'alamat harus berupa teks') })
        .trim()
        .min(1, { error: 'alamat tidak boleh kosong' }),
});

export const lokasiCreateSchema = lokasiBase;
export const lokasiUpdateSchema = lokasiBase.partial().refine(adaIsi, { error: PESAN_KOSONG });