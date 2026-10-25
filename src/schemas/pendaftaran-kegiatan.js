import { z } from 'zod';
import { bilanganPositif, enumDari } from './common.js';

const STATUS_KEHADIRAN = ['terdaftar', 'hadir', 'tidak_hadir'];

export const pendaftaranCreateSchema = z.object({
    warga_id: bilanganPositif('warga_id'),
    kegiatan_id: bilanganPositif('kegiatan_id'),
    status_kehadiran: enumDari('status_kehadiran', STATUS_KEHADIRAN).optional(),
});

// Yang boleh diubah hanya status kehadiran.
export const pendaftaranUpdateSchema = z.object({
    status_kehadiran: enumDari('status_kehadiran', STATUS_KEHADIRAN),
});