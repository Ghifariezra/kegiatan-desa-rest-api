import { z } from 'zod';
import { bilanganPositif, enumDari, adaIsi, PESAN_KOSONG } from './common.js';

const PERAN = ['warga', 'admin'];

// Client mengirim `password`, bukan `password_hash`. Hashing dilakukan di server.
export const akunCreateSchema = z.object({
    warga_id: bilanganPositif('warga_id'),
    email: z
        .email({ error: 'email tidak valid' })
        .max(100, { error: 'email maksimal 100 karakter' })
        .transform((v) => v.toLowerCase()),
    password: z
        .string({ error: (iss) => (iss.input === undefined ? 'password wajib diisi' : 'password harus berupa teks') })
        .min(8, { error: 'password minimal 8 karakter' })
        .max(72, { error: 'password maksimal 72 karakter' }),
    peran: enumDari('peran', PERAN).optional(),
});

// warga_id tidak boleh diubah setelah akun dibuat.
export const akunUpdateSchema = akunCreateSchema
    .omit({ warga_id: true })
    .partial()
    .refine(adaIsi, { error: PESAN_KOSONG });