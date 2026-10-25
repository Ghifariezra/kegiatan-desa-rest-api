import AppError from '../core/AppError.js';

export const notFound = (req, res) => {
    res.status(404).json({ status: 'error', message: `Route ${req.method} ${req.originalUrl} tidak ditemukan` });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ status: 'error', message: 'Format JSON pada body tidak valid' });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            ...(err.errors && { errors: err.errors }),
        });
    }

    console.error(err);
    res.status(500).json({ status: 'error', message: 'Terjadi kesalahan pada server' });
};