import { z } from 'zod';
import { teks, teksOpsional, bilanganPositif, tanggal, enumDari, adaIsi, PESAN_KOSONG } from './common.js';

const wargaBase = z.object({
    rt_id: bilanganPositif('rt_id'),
    nik: z
        .string({ error: (iss) => (iss.input === undefined ? 'nik wajib diisi' : 'nik harus berupa teks') })
        .trim()
        .regex(/^\d{16}$/, { error: 'nik harus 16 digit angka' }),
    nama_lengkap: teks('nama_lengkap', 100),
    jenis_kelamin: enumDari('jenis_kelamin', ['L', 'P']),
    tanggal_lahir: tanggal('tanggal_lahir').refine((v) => v <= new Date().toISOString().slice(0, 10), {
        error: 'tanggal_lahir tidak boleh di masa depan',
    }),
    no_hp: z
        .string({ error: 'no_hp harus berupa teks' })
        .trim()
        .regex(/^(\+62|62|0)8\d{8,11}$/, { error: 'no_hp tidak valid, contoh 081234567890' })
        .nullable()
        .optional(),
    alamat: teksOpsional('alamat'),
});

export const wargaCreateSchema = wargaBase;
export const wargaUpdateSchema = wargaBase.partial().refine(adaIsi, { error: PESAN_KOSONG });