import { Router } from 'express';
import validate from '../middlewares/validate.js';
import { idParamSchema } from '../schemas/common.js';

// Membuat 5 route CRUD standar dari sebuah controller dan schema validasinya.
export default function createCrudRouter({ controller, createSchema, updateSchema }) {
    const router = Router();

    router.get('/', controller.getAll);
    router.get('/:id', validate({ params: idParamSchema }), controller.getById);
    router.post('/', validate({ body: createSchema }), controller.create);
    router.put('/:id', validate({ params: idParamSchema, body: updateSchema }), controller.update);
    router.delete('/:id', validate({ params: idParamSchema }), controller.remove);

    return router;
}