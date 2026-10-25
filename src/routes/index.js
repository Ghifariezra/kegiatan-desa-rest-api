import { Router } from 'express';
import rtRoutes from './rt.routes.js';
import wargaRoutes from './warga.routes.js';
import akunWargaRoutes from './akun-warga.routes.js';
import kategoriKegiatanRoutes from './kategori-kegiatan.routes.js';
import lokasiRoutes from './lokasi.routes.js';
import kegiatanRoutes from './kegiatan.routes.js';
import pendaftaranKegiatanRoutes from './pendaftaran-kegiatan.routes.js';
import laporanKegiatanRoutes from './laporan-kegiatan.routes.js';

const router = Router();

router.use('/rt', rtRoutes);
router.use('/warga', wargaRoutes);
router.use('/akun-warga', akunWargaRoutes);
router.use('/kategori-kegiatan', kategoriKegiatanRoutes);
router.use('/lokasi', lokasiRoutes);
router.use('/kegiatan', kegiatanRoutes);
router.use('/pendaftaran-kegiatan', pendaftaranKegiatanRoutes);
router.use('/laporan-kegiatan', laporanKegiatanRoutes);

export default router;