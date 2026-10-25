import BaseService from '../core/BaseService.js';

class KategoriKegiatanService extends BaseService {
    constructor() {
        super({
            table: 'kategori_kegiatan',
            label: 'Kategori kegiatan',
            columns: ['nama_kategori', 'deskripsi'],
            orderBy: 'nama_kategori',
        });
    }
}

export default new KategoriKegiatanService();