import './config/env.js';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors());
if (!['production', 'test'].includes(process.env.NODE_ENV)) app.use(morgan('dev'));

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

export default app;