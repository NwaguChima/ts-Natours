import express, {
  Application,
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from 'express';
import AppError from '../utils/appError';

const handleCastErrorDB: ErrorRequestHandler = (err, req, res, next) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB: ErrorRequestHandler = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: ${value}. Please use another value`;

  return new AppError(message, 400);
};

const handleValidationErrorDB: ErrorRequestHandler = (err) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev: ErrorRequestHandler = (err, req, res, next) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd: ErrorRequestHandler = (err, req, res, next) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other error: dont want to leak error details
  } else {
    // 1) log error
    console.error(`Error 💥 🥵`, err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  //   console.log(err.stack).;
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res, next);
  } else if (process.env.NODE_ENV === 'production') {
    let errorStr = JSON.stringify(err);
    let error = JSON.parse(errorStr);

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error, req, res, next);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error, req, res, next);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error, req, res, next);
    }

    sendErrorProd(error, req, res, next);
  }
};

export default globalErrorHandler;
