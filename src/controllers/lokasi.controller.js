import BaseController from '../core/BaseController.js';
import lokasiService from '../services/lokasi.service.js';

class LokasiController extends BaseController { }

export default new LokasiController(lokasiService);