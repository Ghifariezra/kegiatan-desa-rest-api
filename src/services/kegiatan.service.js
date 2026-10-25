import BaseService from '../core/BaseService.js';

class KegiatanService extends BaseService {
    constructor() {
        super({
            table: 'kegiatan',
            label: 'Kegiatan',
            columns: [
                'kategori_id', 'lokasi_id', 'nama_kegiatan', 'deskripsi',
                'tanggal', 'jam_mulai', 'jam_selesai', 'kuota', 'status',
            ],
            selectSql: `
                SELECT k.id, k.nama_kegiatan, k.deskripsi, k.tanggal, k.jam_mulai, k.jam_selesai,
                       k.kuota, k.status,
                       k.kategori_id, kk.nama_kategori,
                       k.lokasi_id, l.nama_lokasi,
                       k.created_at, k.updated_at
                FROM kegiatan k
                JOIN kategori_kegiatan kk ON kk.id = k.kategori_id
                JOIN lokasi l ON l.id = k.lokasi_id
            `,
            idColumn: 'k.id',
            orderBy: 'k.tanggal, k.jam_mulai',
            updatedAtColumn: 'updated_at',
        });
    }
}

export default new KegiatanService();