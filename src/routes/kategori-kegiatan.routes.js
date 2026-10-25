import createCrudRouter from '../core/createCrudRouter.js';
import controller from '../controllers/kategori-kegiatan.controller.js';
import { kategoriCreateSchema, kategoriUpdateSchema } from '../schemas/kategori-kegiatan.js';

export default createCrudRouter({ controller, createSchema: kategoriCreateSchema, updateSchema: kategoriUpdateSchema });