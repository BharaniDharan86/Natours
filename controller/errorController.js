/* eslint-disable no-else-return */
/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */

const AppError = require('../utils/appError');

function handleCastErrorDB(err) {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
}

function handleDuplicateField(err) {
  const value = 'x';
  const message = `Duplicate Field : ${value} replace this`;
  return new AppError(message, 400);
}

function handleJWTErr() {
  const message = `Invalid Token!!! Login Again`;
  return new AppError(message, 403);
}

function handleTokenExpiresErr() {
  const message = ` Token Expired Login Again`;
  return new AppError(message, 403);
}

function errDev(err, res) {
  return res.status(err.statusCode).json({
    status: 'Failed',
    message: err.message,
    error: err,
    stack: err.stack,
  });
}

function errProd(err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: 'Failed',
      message: err.message,
    });
  } else {
    res.status(err.statusCode).json({
      status: 'Error',
      message: 'Something went wrong',
    });
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    if (error.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateField(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTErr();
    if (err.name === 'TokenExpiredError') error = handleTokenExpiresErr();
    errProd(error, res);
  } else if (process.env.NODE_ENV === 'development') {
    return errDev(err, res);
  }
};
