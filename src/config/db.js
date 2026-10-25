import './env.js';
import pg from 'pg';

const { Pool, types } = pg;

// Kolom bertipe DATE dikembalikan sebagai teks apa adanya, misalnya "2026-11-08".
// Tanpa ini, tanggal diubah menjadi objek Date dan bisa bergeser karena zona waktu.
types.setTypeParser(1082, (value) => value);

// Pool = kumpulan koneksi ke PostgreSQL yang dipakai ulang oleh setiap request.
// Nilai koneksi diambil dari file .env agar password tidak ditulis langsung di kode.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export default pool;