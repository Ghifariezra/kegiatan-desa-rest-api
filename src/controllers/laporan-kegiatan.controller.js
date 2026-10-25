import BaseController from '../core/BaseController.js';
import laporanKegiatanService from '../services/laporan-kegiatan.service.js';

class LaporanKegiatanController extends BaseController { }

export default new LaporanKegiatanController(laporanKegiatanService);