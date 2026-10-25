import createCrudRouter from '../core/createCrudRouter.js';
import controller from '../controllers/kegiatan.controller.js';
import { kegiatanCreateSchema, kegiatanUpdateSchema } from '../schemas/kegiatan.js';

export default createCrudRouter({ controller, createSchema: kegiatanCreateSchema, updateSchema: kegiatanUpdateSchema });