import express, { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import { CustomReq } from '../model/custom';
import Tour from '../model/tourModel';
import APIFeatures from '../utils/apiFeatures';
import AppError from '../utils/appError';

const deleteOne = (Model: { findByIdAndDelete: (arg0: string) => any }) =>
  catchAsync(async (req: CustomReq, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError(`No document found with that ID`, 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

const updateOne = (Model: {
  findByIdAndUpdate: (
    arg0: string,
    arg1: any,
    arg2: { new: boolean; runValidators: boolean }
  ) => any;
}) =>
  catchAsync(async (req: CustomReq, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError(`No document found with that ID`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const createOne = (Model: { create: (arg0: any) => any }) =>
  catchAsync(async (req: Request, res: Response) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const getOne = (Model: { findById: (arg0: string) => any }, popOptions?: any) =>
  catchAsync(async (req: CustomReq, res: Response, next: NextFunction) => {
    let query = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError(`No document found with that ID`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const getAll = (Model: { find: (arg0: {}) => any }) =>
  catchAsync(async (req: CustomReq, res: Response) => {
    // To allow for nested GET reviews ontour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    // const doc = await features.query.explain()

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

export default {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
};
