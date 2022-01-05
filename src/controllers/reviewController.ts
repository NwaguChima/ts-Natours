import { Request, Response, NextFunction } from 'express';
import { factory } from 'typescript';
import { CustomUserReq } from '../model/custom';
import Review from '../model/reviewModel';
import catchAsync from '../utils/catchAsync';
import handlerFactory from './handlerFactory';

const getAllReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const reviews = await Review.find(filter);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  }
);

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

const createReview = handlerFactory.createOne(Review);

const updateReview = handlerFactory.updateOne(Review);
const deleteReview = handlerFactory.deleteOne(Review);

export default {
  createReview,
  getAllReview,
  deleteReview,
  updateReview,
  setTourUserIds,
};
