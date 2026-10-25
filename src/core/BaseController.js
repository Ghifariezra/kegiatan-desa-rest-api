/**
 * Controller dasar untuk CRUD. Method ditulis sebagai arrow function
 * supaya `this` tetap benar saat dipasang langsung di router.
 * Express 5 meneruskan error dari async handler ke errorHandler otomatis.
 */
export default class BaseController {
    constructor(service) {
        this.service = service;
    }

    get label() {
        return this.service.label;
    }

    getAll = async (req, res) => {
        const data = await this.service.findAll();
        res.status(200).json({
            status: 'success',
            message: `Berhasil mengambil semua data ${this.label.toLowerCase()}`,
            total: data.length,
            data,
        });
    };

    getById = async (req, res) => {
        const data = await this.service.findById(Number(req.params.id));
        res.status(200).json({
            status: 'success',
            message: `Berhasil mengambil data ${this.label.toLowerCase()}`,
            data,
        });
    };

    create = async (req, res) => {
        const data = await this.service.create(req.body);
        res.status(201).json({
            status: 'success',
            message: `${this.label} berhasil ditambahkan`,
            data,
        });
    };

    update = async (req, res) => {
        const data = await this.service.update(Number(req.params.id), req.body);
        res.status(200).json({
            status: 'success',
            message: `${this.label} berhasil diperbarui`,
            data,
        });
    };

    remove = async (req, res) => {
        const data = await this.service.delete(Number(req.params.id));
        res.status(200).json({
            status: 'success',
            message: `${this.label} berhasil dihapus`,
            data,
        });
    };
}