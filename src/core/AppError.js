export default class AppError extends Error {
    constructor(statusCode, message, errors = null) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.errors = errors;
    }
}