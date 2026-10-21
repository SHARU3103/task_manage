/**
 * Global Error Handling Middleware
 * Ensures HTTP status codes:
 * 400 - invalid data or broken business rule
 * 404 - resource not found
 * 409 - duplicate employee ID or email
 * 500 - unexpected internal server error
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    const value = err.keyValue ? err.keyValue[field] : '';
    if (field === 'employeeId') {
      message = `Employee ID "${value}" already exists. Please choose a unique Employee ID.`;
    } else if (field === 'email') {
      message = `Email "${value}" is already registered. Please use another email.`;
    } else {
      message = `Duplicate value for field "${field}": "${value}". Must be unique.`;
    }
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join('. ');
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with ID ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
