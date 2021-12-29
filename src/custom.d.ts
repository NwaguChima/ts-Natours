import express, { Application, Request, Response, NextFunction } from 'express';

export interface CustomReq extends Request {
  requestTime?: string;
}
