import BaseController from '../core/BaseController.js';
import kegiatanService from '../services/kegiatan.service.js';

class KegiatanController extends BaseController { }

export default new KegiatanController(kegiatanService);