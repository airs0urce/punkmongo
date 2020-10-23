const CustomError = require('./CustomError');

class ApiError extends CustomError {
    constructor(message, code, name = null) {
        super(message, code);
        if (name) {
            this.name = name;    
        } else {
            this.name = this.constructor.name;
        }
        Error.captureStackTrace(this, ApiError);
    }
}

ApiError.ERROR_INPUT = 100;
ApiError.ERROR_SERVER = 101;

module.exports = ApiError;