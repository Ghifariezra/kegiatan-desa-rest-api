import BaseController from '../core/BaseController.js';
import pendaftaranKegiatanService from '../services/pendaftaran-kegiatan.service.js';

class PendaftaranKegiatanController extends BaseController { }

export default new PendaftaranKegiatanController(pendaftaranKegiatanService);