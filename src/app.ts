import morgan from 'morgan';
import express, {
  Application,
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from 'express';
import { CustomReq } from './custom';

import AppError from './utils/appError';
import globalErrorHandler from './controllers/errorController';
import tourRouter from './routes/tourRoutes';
import userRouter from './routes/userRoutes';

const app: Application = express();

// MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// ROUTE HANDLERS
app.use((req: CustomReq, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  //
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
