import { z } from 'zod';
import { teks, teksOpsional, adaIsi, PESAN_KOSONG } from './common.js';

const kategoriBase = z.object({
    nama_kategori: teks('nama_kategori', 50),
    deskripsi: teksOpsional('deskripsi'),
});

export const kategoriCreateSchema = kategoriBase;
export const kategoriUpdateSchema = kategoriBase.partial().refine(adaIsi, { error: PESAN_KOSONG });