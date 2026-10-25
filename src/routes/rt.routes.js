import createCrudRouter from '../core/createCrudRouter.js';
import controller from '../controllers/rt.controller.js';
import { rtCreateSchema, rtUpdateSchema } from '../schemas/rt.js';

export default createCrudRouter({ controller, createSchema: rtCreateSchema, updateSchema: rtUpdateSchema });