import AppError from '../core/AppError.js';
import BaseService from '../core/BaseService.js';

class PendaftaranKegiatanService extends BaseService {
    constructor() {
        super({
            table: 'pendaftaran_kegiatan',
            label: 'Pendaftaran kegiatan',
            columns: ['warga_id', 'kegiatan_id', 'status_kehadiran'],
            selectSql: `
                SELECT p.id, p.warga_id, w.nama_lengkap,
                       p.kegiatan_id, k.nama_kegiatan,
                       p.tanggal_daftar, p.status_kehadiran
                FROM pendaftaran_kegiatan p
                JOIN warga w ON w.id = p.warga_id
                JOIN kegiatan k ON k.id = p.kegiatan_id
            `,
            idColumn: 'p.id',
            orderBy: 'p.tanggal_daftar DESC',
        });
    }

    // Aturan bisnis: pendaftaran hanya untuk kegiatan yang masih dijadwalkan dan kuotanya belum penuh.
    async create(input) {
        const result = await this.run(
            `SELECT k.kuota, k.status,
                    (SELECT COUNT(*) FROM pendaftaran_kegiatan p WHERE p.kegiatan_id = k.id)::int AS terisi
             FROM kegiatan k
             WHERE k.id = $1`,
            [input.kegiatan_id]
        );

        const kegiatan = result.rows[0];
        if (!kegiatan) throw new AppError(400, 'kegiatan_id tidak ditemukan');
        if (kegiatan.status !== 'dijadwalkan') {
            throw new AppError(409, `Pendaftaran ditutup, status kegiatan: ${kegiatan.status}`);
        }
        if (kegiatan.terisi >= kegiatan.kuota) {
            throw new AppError(409, 'Kuota kegiatan sudah penuh');
        }

        return super.create(input);
    }
}

export default new PendaftaranKegiatanService();