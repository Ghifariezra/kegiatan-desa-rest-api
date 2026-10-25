import BaseController from '../core/BaseController.js';
import wargaService from '../services/warga.service.js';

class WargaController extends BaseController { }

export default new WargaController(wargaService);