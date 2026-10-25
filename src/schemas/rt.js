import { z } from 'zod';
import { teks, adaIsi, PESAN_KOSONG } from './common.js';

const rtBase = z.object({
    nomor_rt: z
        .string({ error: (iss) => (iss.input === undefined ? 'nomor_rt wajib diisi' : 'nomor_rt harus berupa teks') })
        .trim()
        .regex(/^\d{3}$/, { error: 'nomor_rt harus 3 digit, contoh 001' }),
    nama_ketua: teks('nama_ketua', 100),
});

export const rtCreateSchema = rtBase;
export const rtUpdateSchema = rtBase.partial().refine(adaIsi, { error: PESAN_KOSONG });