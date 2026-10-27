import { readFileSync } from 'node:fs';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import * as allure from '../helpers/allure.js';

export class BaseModule {
    constructor({ basePath, dataFile, groupTitles = {} }) {
        this.basePath = basePath;
        this.dataFile = dataFile;
        this.groupTitles = groupTitles;

        this.ids = {};
        this.known = {};
    }

    // ---------------------------------------------------------------- 1. Data

    loadCases() {
        const file = new URL(`../data/${this.dataFile}`, import.meta.url);
        return JSON.parse(readFileSync(file, 'utf8'));
    }

    // Kelompokkan per "group" sambil mempertahankan urutan kemunculan di file.
    groupedCases() {
        const groups = new Map();
        for (const c of this.loadCases()) {
            if (!groups.has(c.group)) groups.set(c.group, []);
            groups.get(c.group).push(c);
        }
        return groups;
    }

    groupTitle(group) {
        return this.groupTitles[group] ?? group;
    }

    // ---------------------------------------------------------------- 2. Request
    fill(teks) {
        if (typeof teks !== 'string') return teks;

        return teks.replace(/\{\{(\w+)\}\}/g, (_, nama) => {
            if (this.ids[nama] === undefined) {
                throw new Error(`Placeholder {{${nama}}} belum terisi: case yang menyimpannya belum jalan atau gagal`);
            }
            return this.ids[nama];
        });
    }

    send(c) {
        const req = request(app)[c.method.toLowerCase()](this.fill(c.url));
        if (c.body_raw !== undefined) return req.set('Content-Type', 'application/json').send(c.body_raw);
        if (c.body !== null && c.body !== undefined) return req.send(c.body);
        return req;
    }

    create(body) {
        return request(app).post(this.basePath).send(body);
    }

    update(id, body) {
        return request(app).put(`${this.basePath}/${id}`).send(body);
    }

    // ---------------------------------------------------------------- 3. Assertion
    async run(c) {
        const res = await this.send(c);
        await allure.attachment('response', JSON.stringify(res.body, null, 2), 'application/json');

        expect(res.status, 'status code').to.equal(c.expected_status);
        expect(res.headers['content-type']).to.match(/application\/json/);
        expect(res.body.message).to.equal(this.fill(c.expected_message));

        if (c.expected_status < 400) this.assertSuccess(c, res.body);
        else this.assertError(c, res.body);

        if (c.simpan_id_sebagai) this.ids[c.simpan_id_sebagai] = res.body.data.id;
    }

    assertSuccess(c, body) {
        expect(body.status).to.equal('success');
        if (Array.isArray(body.data)) this.assertList(body);
        else this.assertSingle(c, body.data);
    }

    assertError(c, body) {
        expect(body.status).to.equal('error');
        if (c.expected_errors) expect(body.errors).to.deep.equal(c.expected_errors);
        else expect(body, 'no errors array').to.not.have.property('errors');
    }

    assertList() {
        throw new Error(`${this.constructor.name} harus mengimplementasikan assertList(body)`);
    }

    assertSingle() {
        throw new Error(`${this.constructor.name} harus mengimplementasikan assertSingle(c, data)`);
    }
}