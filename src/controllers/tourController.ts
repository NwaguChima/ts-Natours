import express, { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import { CustomReq } from '../model/custom';
import Tour from '../model/tourModel';
import APIFeatures from '../utils/apiFeatures';
import AppError from '../utils/appError';

const aliasTopTours = (req: CustomReq, res: Response, next: NextFunction) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

const getAllTours = catchAsync(async (req: CustomReq, res: Response) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

const getTour = catchAsync(
  async (req: CustomReq, res: Response, next: NextFunction) => {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return next(new AppError(`No tour found with that ID`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  }
);

const createTour = catchAsync(async (req: Request, res: Response) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

const updateTour = catchAsync(
  async (req: CustomReq, res: Response, next: NextFunction) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tour) {
      return next(new AppError(`No tour found with that ID`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  }
);

const deleteTour = catchAsync(
  async (req: CustomReq, res: Response, next: NextFunction) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
      return next(new AppError(`No tour found with that ID`, 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

const getTourStats = catchAsync(
  async (req: CustomReq, res: Response, next: NextFunction) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } },
      // },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  }
);

const getMonthlyPlan = catchAsync(
  async (req: CustomReq, res: Response, next: NextFunction) => {
    const year = +req.params.year;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      { $limit: 12 },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  }
);

export default {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
};
