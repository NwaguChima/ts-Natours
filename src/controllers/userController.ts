import { Request, Response, NextFunction } from 'express';
import { CustomUserReq } from '../model/custom';
import User from '../model/userModel';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import handlerFactory from './handlerFactory';

const filterObj = (obj: any, ...allowedFields: [string, string]) => {
  const newObj: any = {};
  Object.keys(obj).forEach((el: string) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

const getMe = (req: CustomUserReq, res: Response, next: NextFunction) => {
  req.params.id = req.user!.id;
  next();
};

const updateMe = catchAsync(
  async (req: CustomUserReq, res: Response, next: NextFunction) => {
    // 1) Create error if user posts password data

    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updats. please use /updateMyPassword',
          400
        )
      );
    }

    // 2)Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    console.log(filteredBody);

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user!.id,
      filteredBody,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  }
);

const deleteMe = catchAsync(
  async (req: CustomUserReq, res: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(req.user?.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

const createUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

const getAllUsers = handlerFactory.getAll(User);
const getUser = handlerFactory.getOne(User);
// Do NOT update password with this;
const updateUser = handlerFactory.updateOne(User);
const deleteUser = handlerFactory.deleteOne(User);

export default {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
};
