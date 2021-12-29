import fs from 'fs';
import morgan from 'morgan';
import express, { Application, Request, Response, NextFunction } from 'express';
import { CustomReq } from './custom';

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
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Hello from the middleware 🤠');
  next();
});

app.use((req: CustomReq, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

export default app;
