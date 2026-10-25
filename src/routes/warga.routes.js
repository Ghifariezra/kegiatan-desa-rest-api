import createCrudRouter from '../core/createCrudRouter.js';
import controller from '../controllers/warga.controller.js';
import { wargaCreateSchema, wargaUpdateSchema } from '../schemas/warga.js';

export default createCrudRouter({ controller, createSchema: wargaCreateSchema, updateSchema: wargaUpdateSchema });