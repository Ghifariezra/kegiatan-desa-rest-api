import BaseService from '../core/BaseService.js';

class LaporanKegiatanService extends BaseService {
    constructor() {
        super({
            table: 'laporan_kegiatan',
            label: 'Laporan kegiatan',
            columns: ['kegiatan_id', 'ringkasan', 'jumlah_hadir'],
            selectSql: `
                SELECT l.id, l.kegiatan_id, k.nama_kegiatan, l.ringkasan, l.jumlah_hadir, l.created_at
                FROM laporan_kegiatan l
                JOIN kegiatan k ON k.id = l.kegiatan_id
            `,
            idColumn: 'l.id',
            orderBy: 'l.created_at DESC',
        });
    }
}

export default new LaporanKegiatanService();