import createCrudRouter from '../core/createCrudRouter.js';
import controller from '../controllers/lokasi.controller.js';
import { lokasiCreateSchema, lokasiUpdateSchema } from '../schemas/lokasi.js';

export default createCrudRouter({ controller, createSchema: lokasiCreateSchema, updateSchema: lokasiUpdateSchema });