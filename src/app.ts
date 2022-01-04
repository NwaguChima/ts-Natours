import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import express, { Application, Request, Response, NextFunction } from 'express';

import { CustomReq } from './model/custom';
import AppError from './utils/appError';
import globalErrorHandler from './controllers/errorController';
import tourRouter from './routes/tourRoutes';
import userRouter from './routes/userRoutes';
import reviewRouter from './routes/reviewRoutes';

const app: Application = express();

// GLOBAL
// Set Security http headers
app.use(helmet());

// Developement Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization agaisnt NoSQL query injection
app.use(ExpressMongoSanitize());

// Data sanitization agaisnt XSS
app.use(xss());

//Prevent parameter Polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//Serving static file
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req: CustomReq, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  //
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
