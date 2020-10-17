
// extend CustomError to create new type of errors (for example see ApiError.js)
class CustomError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code || 0;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, CustomError);
    }

    toString() {
        return `[${this.code}] - "${this.message}"`;
    }
}

module.exports = CustomError;