import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { token } from 'morgan';
import User from '../model/userModel';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

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
  async (req: Request, res: Response, next: NextFunction) => {
    //1 ) Getting token and check if it exist
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    console.log(token);

    if (!token) {
      return next(
        new AppError(
          'You are not logged in!, Please log in to get access.',
          401
        )
      );
    }

    //2) Validate token, verification
    // 3) Check if user still exist
    // 4) Check if user changed password after token was issued.
  }
);

export default {
  signUp,
  login,
  protect,
};
