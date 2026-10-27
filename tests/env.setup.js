import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ quiet: true });

process.env.NODE_ENV = 'test';

const dbName = process.env.DB_NAME ?? '';
const base = process.env.DB_NAME_TEST ?? (dbName.endsWith('_test') ? dbName : dbName ? `${dbName}_test` : '');

if (!base.endsWith('_test')) {
    throw new Error(
        `Database test harus berakhiran "_test" (sekarang: "${base}"). ` +
        'Set DB_NAME_TEST di .env, contoh: DB_NAME_TEST=kegiatan_desa_test'
    );
}

const workerId = process.env.MOCHA_WORKER_ID;
const target = workerId === undefined ? base : `${base}_w${workerId}`;

if (workerId !== undefined) {
    const admin = new pg.Client({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'postgres',
    });
    await admin.connect();
    const { rowCount } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [target]);
    if (!rowCount) await admin.query(`CREATE DATABASE "${target}"`);
    await admin.end();
}

process.env.DB_NAME = target;