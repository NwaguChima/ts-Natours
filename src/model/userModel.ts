import crypto from 'crypto';
import mongoose, { Document, Schema } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string | undefined;
  photo?: string;
  role: string;
  passwordChangedAt: Date;
  passwordResetToken: string | undefined;
  passwordResetExpires: Date | undefined;
  active: boolean;

  correctPassword(candidatePassword: string, userPassword: string): boolean;
  changedPasswordAfter(JWTTimestamp: Date): boolean;
  createPasswordResetToken(): string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on create and save();
      validator: function (this: IUser, el: any) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // run if password is actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  const date = (Date.now() - 1000) as unknown as Date;
  this.passwordChangedAt = date;

  next();
});

userSchema.pre(/^find/, function (this: any, next) {
  // this point to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    let changedTimestamp = this.passwordChangedAt.getTime() / 1000;

    changedTimestamp = parseInt(changedTimestamp.toString(), 10);

    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  // falsle means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = (Date.now() + 10 * 60 * 1000) as unknown as Date;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
