import express, { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

const catchAsync = (
  fn: (
    arg0: express.Request<
      ParamsDictionary,
      any,
      any,
      ParsedQs,
      Record<string, any>
    >,
    arg1: express.Response<any, Record<string, any>>,
    arg2: express.NextFunction
  ) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
