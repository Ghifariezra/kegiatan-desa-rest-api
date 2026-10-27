import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';

describe('App', () => {
    it('GET / returns the API info with the 8 resource paths', async () => {
        const res = await request(app).get('/');

        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal('API Sistem Informasi Kegiatan Desa Sukamaju');
        expect(res.body.resources).to.have.lengthOf(8);
        expect(res.body.resources).to.include('/api/akun-warga');
    });

    it('GET unknown route returns 404 with the route name in the message', async () => {
        const res = await request(app).get('/api/tidak-ada');

        expect(res.status).to.equal(404);
        expect(res.body).to.deep.equal({
            status: 'error',
            message: 'Route GET /api/tidak-ada tidak ditemukan',
        });
    });
});