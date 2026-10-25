import BaseService from '../core/BaseService.js';

class WargaService extends BaseService {
    constructor() {
        super({
            table: 'warga',
            label: 'Warga',
            columns: ['rt_id', 'nik', 'nama_lengkap', 'jenis_kelamin', 'tanggal_lahir', 'no_hp', 'alamat'],
            selectSql: `
                SELECT w.id, w.rt_id, r.nomor_rt, w.nik, w.nama_lengkap, w.jenis_kelamin,
                       w.tanggal_lahir, w.no_hp, w.alamat, w.created_at
                FROM warga w
                JOIN rt r ON r.id = w.rt_id
            `,
            idColumn: 'w.id',
            orderBy: 'w.nama_lengkap',
        });
    }
}

export default new WargaService();