import { expect } from 'chai';
import bcrypt from 'bcryptjs';
import { AkunWargaModule } from '../modules/akun-warga.module.js';
import { JUMLAH_WARGA } from '../helpers/db.js';
import * as allure from '../helpers/allure.js';

const akun = new AkunWargaModule();

describe('Akun warga API (data driven)', () => {
    for (const [group, items] of akun.groupedCases()) {
        describe(akun.groupTitle(group), () => {
            for (const c of items) {
                it(`[${c.id}] ${c.teknik}: ${c.method} ${c.url} -> ${c.expected_status}`, async () => {
                    await allure.epic('Akun Warga');
                    await allure.feature(akun.groupTitle(group));
                    await allure.tag(c.teknik);
                    await akun.run(c);
                });
            }
        });
    }
});

describe('Akun warga API - password storage', () => {
    const PASSWORD_AWAL = 'Rahasia123';
    const PASSWORD_BARU = 'PasswordBaru456';
    const WARGA_ID = JUMLAH_WARGA + 1;
    let akunId;

    const ambilHash = () => akun.getPasswordHash(akunId);

    before(async () => {
        await akun.insertWarga(WARGA_ID, 'Warga Uji Hash');
        const res = await akun.create({ warga_id: WARGA_ID, email: 'hash.check@desasukamaju.id', password: PASSWORD_AWAL });
        expect(res.status).to.equal(201);
        akunId = res.body.data.id;
    });

    it('POST stores a bcrypt hash and never the plain password', async () => {
        const hash = await ambilHash();

        expect(hash).to.not.equal(PASSWORD_AWAL);
        expect(hash).to.match(/^\$2[aby]\$/);
        expect(await bcrypt.compare(PASSWORD_AWAL, hash)).to.equal(true);
    });

    it('PUT with a new password replaces the stored hash', async () => {
        const hashLama = await ambilHash();

        const res = await akun.update(akunId, { password: PASSWORD_BARU });
        expect(res.status).to.equal(200);

        const hashBaru = await ambilHash();
        expect(hashBaru).to.not.equal(hashLama);
        expect(await bcrypt.compare(PASSWORD_BARU, hashBaru)).to.equal(true);
        expect(await bcrypt.compare(PASSWORD_AWAL, hashBaru)).to.equal(false);
    });

    it('PUT without a password keeps the stored hash unchanged', async () => {
        const hashSebelum = await ambilHash();

        const res = await akun.update(akunId, { peran: 'admin' });
        expect(res.status).to.equal(200);

        expect(await ambilHash()).to.equal(hashSebelum);
    });
});