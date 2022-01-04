import { Request, Response, NextFunction } from 'express';
import Review from '../model/reviewModel';
import catchAsync from '../utils/catchAsync';

const getAllReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviews = await Review.find();

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  }
);

const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newReview = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview,
      },
    });
  }
);

export default {
  createReview,
  getAllReview,
};
