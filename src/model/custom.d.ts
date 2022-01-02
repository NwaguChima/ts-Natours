import express, { Application, Request, Response, NextFunction } from 'express';
import { IUser } from './userModel';

// export interface ReqUser extends Document {
//   name?: string;
//   email?: string;
//   password?: string;
//   passwordConfirm?: string | undefined;
//   passwordChangedAt?: Date;
// }

export interface CustomReq extends Request {
  requestTime?: string;
}

export interface CustomUserReq extends Request {
  user?: IUser;
}
