import BaseService from '../core/BaseService.js';

class LokasiService extends BaseService {
    constructor() {
        super({
            table: 'lokasi',
            label: 'Lokasi',
            columns: ['nama_lokasi', 'alamat'],
            orderBy: 'nama_lokasi',
        });
    }
}

export default new LokasiService();