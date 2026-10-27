import { expect } from 'chai';
import pool from '../../src/config/db.js';
import { BaseModule } from './base.module.js';

const AKUN_KEYS = ['id', 'warga_id', 'nama_lengkap', 'email', 'peran', 'created_at'];

export class AkunWargaModule extends BaseModule {
    constructor() {
        super({
            basePath: '/api/akun-warga',
            dataFile: 'data-akun-warga.json',
            groupTitles: {
                'POST valid': 'POST - valid input',
                'POST negatif': 'POST - invalid input',
                'Decision Table POST': 'POST - decision table',
                'PUT kombinasi field': 'PUT - field combinations (decision table)',
                'PUT EP/BVA': 'PUT - EP and BVA',
                'Decision Table PUT': 'PUT - decision table',
                'Parameter :id': 'Path parameter :id',
                'GET all & DELETE': 'GET all and DELETE',
            },
        });
    }

    // ---------------------------------------------------------------- Assertion response

    assertList(body) {
        expect(body.data).to.be.an('array');
        expect(body.total, 'total').to.equal(body.data.length);

        const listIds = body.data.map((row) => row.id);
        expect(listIds, 'sorted by id ascending').to.deep.equal([...listIds].sort((a, b) => a - b));

        for (const row of body.data) {
            expect(row).to.have.all.keys(...AKUN_KEYS);
        }
        // Akun yang sudah kita buat harus muncul dengan isi yang sama.
        for (const [id, data] of Object.entries(this.known)) {
            expect(body.data.find((row) => row.id === Number(id)), `account ${id} in list`).to.deep.equal(data);
        }
    }

    assertSingle(c, data) {
        expect(data).to.have.all.keys(...AKUN_KEYS);
        expect(data, 'secret fields must not leak').to.not.have.any.keys('password', 'password_hash');
        expect(data.id).to.be.a('number');

        const sent = c.body ?? {};
        const before = this.known[data.id];

        if (c.method === 'POST') this.assertCreated(data, sent);
        if (c.method === 'PUT' && before) this.assertUpdated(data, sent, before);
        if (c.method === 'GET' && before) expect(data).to.deep.equal(before);
        if (c.method === 'DELETE') this.assertDeleted(c, data, before);
    }

    assertCreated(data, sent) {
        expect(data.warga_id).to.equal(sent.warga_id);
        expect(data.email).to.equal(sent.email.toLowerCase());
        expect(data.peran).to.equal(sent.peran ?? 'warga');
        if (sent.id !== undefined) expect(data.id, 'extra field id must be ignored').to.not.equal(sent.id);
        this.known[data.id] = data;
    }

    assertUpdated(data, sent, before) {
        expect(data.email).to.equal(sent.email === undefined ? before.email : sent.email.toLowerCase());
        expect(data.peran).to.equal(sent.peran ?? before.peran);
        expect(data.warga_id, 'warga_id is immutable').to.equal(before.warga_id);
        expect(data.nama_lengkap).to.equal(before.nama_lengkap);
        expect(data.created_at).to.equal(before.created_at);
        this.known[data.id] = data;
    }

    assertDeleted(c, data, before) {
        const idDiUrl = Number(this.fill(c.url).split('/').pop());
        expect(data.id, 'deleted row id').to.equal(idDiUrl);
        if (before) expect(data).to.deep.equal(before);
        delete this.known[data.id];
    }

    async insertWarga(id, nama) {
        await pool.query(
            `INSERT INTO warga (rt_id, nik, nama_lengkap, jenis_kelamin, tanggal_lahir)
             VALUES ((SELECT id FROM rt LIMIT 1), LPAD($1::text, 16, '3'), $2, 'L', DATE '1990-01-01')`,
            [id, nama]
        );
    }

    async getPasswordHash(akunId) {
        const { rows } = await pool.query('SELECT password_hash FROM akun_warga WHERE id = $1', [akunId]);
        return rows[0].password_hash;
    }
}