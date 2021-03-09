class AppError extends Error {
  constructor(message, statusCode) {
    // this is the official error message rom the error it self, this message will be in the response.json for the client
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
