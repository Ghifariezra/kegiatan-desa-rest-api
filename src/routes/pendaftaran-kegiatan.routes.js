import createCrudRouter from '../core/createCrudRouter.js';
import controller from '../controllers/pendaftaran-kegiatan.controller.js';
import { pendaftaranCreateSchema, pendaftaranUpdateSchema } from '../schemas/pendaftaran-kegiatan.js';

export default createCrudRouter({
    controller,
    createSchema: pendaftaranCreateSchema,
    updateSchema: pendaftaranUpdateSchema,
});