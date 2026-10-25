import './config/env.js';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import pool from './config/db.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Agar Express bisa membaca body request berformat JSON
app.use(express.json());

// Halaman awal untuk mengecek server berjalan
app.get('/', (req, res) => {
  res.json({
    message: 'API Sistem Informasi Kegiatan Desa Sukamaju',
    resources: [
      'rt',
      'warga',
      'akun-warga',
      'kategori-kegiatan',
      'lokasi',
      'kegiatan',
      'pendaftaran-kegiatan',
      'laporan-kegiatan',
    ].map((nama) => `/api/${nama}`),
    methods: 'GET /, GET /:id, POST /, PUT /:id, DELETE /:id',
  });
});

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

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