import { z } from 'zod';

export { z };

const pesanTipe = (label, tipe) => (iss) =>
    iss.input === undefined ? `${label} wajib diisi` : `${label} harus berupa ${tipe}`;

export const teks = (label, max) =>
    z
        .string({ error: pesanTipe(label, 'teks') })
        .trim()
        .min(1, { error: `${label} tidak boleh kosong` })
        .max(max, { error: `${label} maksimal ${max} karakter` });

// Kolom teks yang boleh kosong. String kosong disimpan sebagai NULL.
export const teksOpsional = (label) =>
    z
        .string({ error: pesanTipe(label, 'teks') })
        .trim()
        .nullable()
        .optional()
        .transform((v) => (v === '' ? null : v));

export const bilanganPositif = (label) =>
    z
        .number({ error: pesanTipe(label, 'angka') })
        .int({ error: `${label} harus berupa bilangan bulat` })
        .positive({ error: `${label} harus lebih dari 0` });

export const bilanganNolKeAtas = (label) =>
    z
        .number({ error: pesanTipe(label, 'angka') })
        .int({ error: `${label} harus berupa bilangan bulat` })
        .min(0, { error: `${label} tidak boleh negatif` });

export const tanggal = (label) =>
    z
        .string({ error: pesanTipe(label, 'teks') })
        .regex(/^\d{4}-\d{2}-\d{2}$/, { error: `${label} harus berformat YYYY-MM-DD, contoh 2026-11-20` })
        .refine(
            (v) => {
                const d = new Date(`${v}T00:00:00Z`);
                return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
            },
            { error: `${label} bukan tanggal yang valid` }
        );

export const jam = (label) =>
    z
        .string({ error: pesanTipe(label, 'teks') })
        .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, { error: `${label} harus berformat HH:MM, contoh 07:30` });

export const enumDari = (label, daftar) =>
    z.enum(daftar, {
        error: (iss) =>
            iss.input === undefined
                ? `${label} wajib diisi`
                : `${label} harus salah satu dari: ${daftar.join(', ')}`,
    });

// Jam "07:30" dan "07:30:00" dibandingkan sebagai detik.
export const keDetik = (v) => {
    const [h, m, s = '0'] = v.split(':');
    return Number(h) * 3600 + Number(m) * 60 + Number(s);
};

// Untuk schema update (PUT): minimal satu kolom harus dikirim.
export const adaIsi = (obj) => Object.values(obj).some((v) => v !== undefined);
export const PESAN_KOSONG = 'Kirim minimal satu kolom yang ingin diubah';

// Validasi parameter :id di URL
export const idParamSchema = z.object({
    id: z.string().regex(/^[1-9]\d*$/, { error: 'ID harus berupa angka bulat positif' }),
});