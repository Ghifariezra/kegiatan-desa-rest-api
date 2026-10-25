import createCrudRouter from '../core/createCrudRouter.js';
import controller from '../controllers/akun-warga.controller.js';
import { akunCreateSchema, akunUpdateSchema } from '../schemas/akun-warga.js';

export default createCrudRouter({ controller, createSchema: akunCreateSchema, updateSchema: akunUpdateSchema });