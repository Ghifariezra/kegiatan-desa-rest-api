import { readFile } from 'node:fs/promises';
import pool from '../../src/config/db.js';

export const JUMLAH_WARGA = 16;

const bacaSql = (nama) => readFile(new URL(`../../database/${nama}`, import.meta.url), 'utf8');

export async function resetDatabase() {
    await pool.query(await bacaSql('reset.sql'));
    await pool.query(await bacaSql('schema.sql'));

    await pool.query(`INSERT INTO rt (nomor_rt, nama_ketua) VALUES ('001', 'Ketua Uji')`);
    await pool.query(
        `INSERT INTO warga (rt_id, nik, nama_lengkap, jenis_kelamin, tanggal_lahir)
     SELECT (SELECT id FROM rt LIMIT 1),
            LPAD(n::text, 16, '3'),
            'Warga Uji ' || n,
            CASE WHEN n % 2 = 0 THEN 'P' ELSE 'L' END,
            DATE '1990-01-01'
     FROM generate_series(1, ${JUMLAH_WARGA}) AS n`
    );
}