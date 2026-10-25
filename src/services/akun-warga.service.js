import bcrypt from 'bcryptjs';
import BaseService from '../core/BaseService.js';

class AkunWargaService extends BaseService {
    constructor() {
        super({
            table: 'akun_warga',
            label: 'Akun warga',
            columns: ['warga_id', 'email', 'password_hash', 'peran'],
            // password_hash sengaja tidak ikut di SELECT, jadi tidak pernah bocor ke response.
            selectSql: `
                SELECT a.id, a.warga_id, w.nama_lengkap, a.email, a.peran, a.created_at
                FROM akun_warga a
                JOIN warga w ON w.id = a.warga_id
            `,
            idColumn: 'a.id',
            orderBy: 'a.id',
        });
    }

    // Client mengirim `password`; yang disimpan ke database adalah hash-nya.
    async prepare(data) {
        const { password, ...sisanya } = data;
        if (password !== undefined) {
            sisanya.password_hash = await bcrypt.hash(password, 10);
        }
        return sisanya;
    }
}

export default new AkunWargaService();