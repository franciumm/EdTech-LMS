import { logger } from './logger.js';

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise
      .resolve(fn(req, res, next))
      .catch(err => {
        if (!err.cause) err.cause = 500;
        next(err);
      });
  };
};

export const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    error: { message: 'Not Found', path: req.originalUrl, reqId: req.id },
  });
};

export const globalerrorHandling = (err, req, res, next) => {
  let statusCode = err.cause || 500;
  let message = err.message || 'Internal Server Error';

  // Map Mongoose errors to appropriate HTTP status codes
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    statusCode = 409; // Conflict
    message = `Duplicate field value entered`;
  }

  logger.error({
    reqId: req.id,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message,
    stack: err.stack
  }, 'Request Error');

  res
    .status(statusCode)
    .json({ message });
};
