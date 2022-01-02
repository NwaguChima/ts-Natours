import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../model/userModel';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { CustomUserReq } from '../custom';
import sendEmail from '../utils/email';

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

const restrictTo = (...roles: [string, string]) => {
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

const forgotPassword = catchAsync(
  async (req: CustomUserReq, res: Response, next: NextFunction) => {
    // 1) Get user based on email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new AppError('There is no user with this email address', 404)
      );
    }

    // 2) Generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it back as email to user
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with a your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this message!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 mins)',
        message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          'There was an error sending the email. Try again later!',
          500
        )
      );
    }
  }
);

const resetPassword = catchAsync(
  async (req: CustomUserReq, res: Response, next: NextFunction) => {
    // 1) Get user based on the token
    const hasedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hasedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    //2) If token has not expired, and there is user, set the new password.
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update chandedPasswordAt property for the user in the user Model

    // 4) Log the user in send JWT.
    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
    });
  }
);

export default {
  signUp,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
};
