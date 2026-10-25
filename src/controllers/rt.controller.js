import BaseController from '../core/BaseController.js';
import rtService from '../services/rt.service.js';

class RtController extends BaseController { }

export default new RtController(rtService);