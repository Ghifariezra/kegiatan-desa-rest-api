import createCrudRouter from '../core/createCrudRouter.js';
import controller from '../controllers/laporan-kegiatan.controller.js';
import { laporanCreateSchema, laporanUpdateSchema } from '../schemas/laporan-kegiatan.js';

export default createCrudRouter({ controller, createSchema: laporanCreateSchema, updateSchema: laporanUpdateSchema });