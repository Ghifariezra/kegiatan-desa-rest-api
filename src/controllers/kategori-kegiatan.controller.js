import BaseController from '../core/BaseController.js';
import kategoriKegiatanService from '../services/kategori-kegiatan.service.js';

class KategoriKegiatanController extends BaseController { }

export default new KategoriKegiatanController(kategoriKegiatanService);