import { Request, Response, NextFunction } from 'express';
import { factory } from 'typescript';
import { CustomUserReq } from '../model/custom';
import Review from '../model/reviewModel';
import handlerFactory from './handlerFactory';
// import catchAsync from '../utils/catchAsync';

const setTourUserIds = (
  req: CustomUserReq,
  res: Response,
  next: NextFunction
) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user!.id;
  next();
};
const getAllReview = handlerFactory.getAll(Review);
const getReview = handlerFactory.getOne(Review);
const createReview = handlerFactory.createOne(Review);
const updateReview = handlerFactory.updateOne(Review);
const deleteReview = handlerFactory.deleteOne(Review);

export default {
  createReview,
  getAllReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
};
