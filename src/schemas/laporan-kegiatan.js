import { z } from 'zod';
import { bilanganPositif, bilanganNolKeAtas, adaIsi, PESAN_KOSONG } from './common.js';

export const laporanCreateSchema = z.object({
    kegiatan_id: bilanganPositif('kegiatan_id'),
    ringkasan: z
        .string({ error: (iss) => (iss.input === undefined ? 'ringkasan wajib diisi' : 'ringkasan harus berupa teks') })
        .trim()
        .min(1, { error: 'ringkasan tidak boleh kosong' }),
    jumlah_hadir: bilanganNolKeAtas('jumlah_hadir').optional(),
});

// kegiatan_id tidak boleh diubah (relasi one to one).
export const laporanUpdateSchema = laporanCreateSchema
    .omit({ kegiatan_id: true })
    .partial()
    .refine(adaIsi, { error: PESAN_KOSONG });