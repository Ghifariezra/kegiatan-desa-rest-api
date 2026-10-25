import pool from '../config/db.js';
import AppError from './AppError.js';
import { toAppError } from './dbError.js';

/**
 * Service dasar untuk CRUD satu tabel dengan primary key `id`.
 *
 * Subclass cukup memanggil super({...}) dengan:
 *   table            nama tabel
 *   label            nama untuk pesan ke client, contoh 'Kegiatan'
 *   columns          daftar kolom yang boleh ditulis (whitelist, bukan dari input user)
 *   selectSql        query SELECT dasar (boleh JOIN), tanpa WHERE/ORDER BY
 *   idColumn         kolom id di selectSql, contoh 'k.id'
 *   orderBy          ORDER BY untuk findAll
 *   updatedAtColumn  kolom yang diisi CURRENT_TIMESTAMP saat update (opsional)
 *
 * Override prepare(data) untuk mengubah input sebelum disimpan,
 * atau override method CRUD untuk aturan bisnis tambahan.
 */
export default class BaseService {
    constructor({ table, label, columns, selectSql, idColumn = 'id', orderBy = 'id', updatedAtColumn = null }) {
        this.table = table;
        this.label = label;
        this.columns = columns;
        this.selectSql = selectSql ?? `SELECT * FROM ${table}`;
        this.idColumn = idColumn;
        this.orderBy = orderBy;
        this.updatedAtColumn = updatedAtColumn;
    }

    // Semua query lewat sini supaya error PostgreSQL otomatis jadi AppError.
    async run(sql, params = []) {
        try {
            return await pool.query(sql, params);
        } catch (err) {
            throw toAppError(err);
        }
    }

    // Hook: ubah input sebelum disimpan.
    async prepare(data) {
        return { ...data };
    }

    kolomDikirim(data) {
        return this.columns.filter((kolom) => data[kolom] !== undefined);
    }

    async findAll() {
        const result = await this.run(`${this.selectSql} ORDER BY ${this.orderBy}`);
        return result.rows;
    }

    async findById(id) {
        const result = await this.run(`${this.selectSql} WHERE ${this.idColumn} = $1`, [id]);
        if (result.rowCount === 0) {
            throw new AppError(404, `${this.label} dengan id ${id} tidak ditemukan`);
        }
        return result.rows[0];
    }

    async create(input) {
        const data = await this.prepare(input);
        const kolom = this.kolomDikirim(data);
        if (kolom.length === 0) throw new AppError(400, 'Tidak ada data yang dikirim');

        const placeholders = kolom.map((_, i) => `$${i + 1}`).join(', ');
        const result = await this.run(
            `INSERT INTO ${this.table} (${kolom.join(', ')}) VALUES (${placeholders}) RETURNING id`,
            kolom.map((k) => data[k])
        );
        return this.findById(result.rows[0].id);
    }

    async update(id, input) {
        const data = await this.prepare(input);
        const kolom = this.kolomDikirim(data);
        if (kolom.length === 0) throw new AppError(400, 'Tidak ada kolom yang diubah');

        const set = kolom.map((k, i) => `${k} = $${i + 1}`);
        if (this.updatedAtColumn) set.push(`${this.updatedAtColumn} = CURRENT_TIMESTAMP`);

        const result = await this.run(
            `UPDATE ${this.table} SET ${set.join(', ')} WHERE id = $${kolom.length + 1} RETURNING id`,
            [...kolom.map((k) => data[k]), id]
        );
        if (result.rowCount === 0) {
            throw new AppError(404, `${this.label} dengan id ${id} tidak ditemukan`);
        }
        return this.findById(id);
    }

    async delete(id) {
        const row = await this.findById(id);
        await this.run(`DELETE FROM ${this.table} WHERE id = $1`, [id]);
        return row;
    }
}