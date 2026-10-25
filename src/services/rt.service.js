import BaseService from '../core/BaseService.js';

class RtService extends BaseService {
    constructor() {
        super({
            table: 'rt',
            label: 'RT',
            columns: ['nomor_rt', 'nama_ketua'],
            orderBy: 'nomor_rt',
        });
    }
}

export default new RtService();