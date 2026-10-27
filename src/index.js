import './config/env.js';
import pool from './config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  try {
    await pool.query('SELECT 1');
    console.log(`Terhubung ke database "${process.env.DB_NAME}"`);
  } catch (err) {
    console.error('Gagal terhubung ke database. Periksa isi file .env:', err.message);
  }
});

// Tutup server dan koneksi database dengan rapi saat Ctrl+C atau SIGTERM.
const shutdown = () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);