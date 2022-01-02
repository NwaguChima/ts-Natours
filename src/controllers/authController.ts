import express, { Request, Response, NextFunction } from 'express';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import User from '../model/userModel';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { CustomUserReq } from '../custom';

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signUp = catchAsync(async (req: Request, res: Response) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // 1) check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    // 2) check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError(`Incorrect email or password`, 401));
    }

    // 3) Send token if everything is okay
    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
    });
  }
);

const protect = catchAsync(
  async (req: CustomUserReq, _res: Response, next: NextFunction) => {
    //1 ) Getting token and check if it exist
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError(
          'You are not logged in!, Please log in to get access.',
          401
        )
      );
    }

    //2) Validate token, verification
    const decoded: any = await jwt.verify(token, process.env.JWT_SECRET!);

    // 3) Check if user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist',
          401
        )
      );
    }

    //4) Check if user changed password afer the token was issued.
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          401
        )
      );
    }

    // Grant access to protected route
    req.user = currentUser;

    next();
  }
);

const restrictTo = (...roles: [string]) => {
  return (req: CustomUserReq, res: Response, next: NextFunction) => {
    // roles ['admin', lead-guide]
    if (!roles.includes(req.user!.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

export default {
  signUp,
  login,
  protect,
  restrictTo,
};
