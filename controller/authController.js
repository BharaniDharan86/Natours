/* eslint-disable arrow-body-style */
/* eslint-disable import/order */
/* eslint-disable import/no-useless-path-segments */
const User = require('../models/userModal');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

const { promisify } = require('util');

const AppError = require('./../utils/appError');
const sendMail = require('../utils/email');

const crypto = require('crypto');

//Function to generate the token it takes the user id and a strong secret string from the server
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JSON_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
};

const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
  ),
  // secure: true,
  httpOnly: true,
};

if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

const sendToken = (id, res, statusCode) => {
  const token = signToken(id);

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'Success',
    token,
  });
};

//SIGNUP
exports.createUser = catchAsync(async (req, res) => {
  const { body } = req;

  const newUser = await User.create({
    name: body.name,
    email: body.email,
    password: body.password,
    passwordConfirm: body.passwordConfirm,
    passwordChangedAt: body.passwordChangedAt,
    role: body.role,
  });

  //SENT BACK THE TOKEN TO THE CLIENT
  sendToken(newUser._id, res, 200);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Password and Email required', 400));

  const currUser = await User.findOne({ email }).select('+password');

  if (
    !currUser ||
    !(await currUser.checkPassword(password, currUser.password))
  ) {
    return next(new AppError('Email or Password is incorrect', 401));
  }

  sendToken(currUser._id, res, 200);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) next(new AppError("You're not logedin", 400));

  const decoded = await promisify(jwt.verify)(token, process.env.JSON_SECRET);

  const freshUser = await User.findById(decoded.id);

  if (!freshUser) return next(new AppError('Token No longer exixts', 401));

  if (freshUser.isPasswordChanged(decoded.iat)) {
    return next(new AppError('login in again', 401));
  }

  req.user = freshUser;

  next();
});

//this will receive the email
exports.forgetPassword = catchAsync(async (req, res, next) => {
  //gets the user based on the email

  const currUser = await User.findOne({ email: req.body.email });
  if (!currUser) return next(new AppError('Wrong Email Provided', 404));

  //generate some random string

  const resetToken = currUser.passwordResetToken();
  await currUser.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password ? submit a patch request with your new password and password confirm to ${resetURL}.Otherwise ignore this message..`;

  console.log(message);
  try {
    await sendMail({
      email: 'bharanidharanm77@gmail.com',
      subject: 'Reset Token',
      message,
    });
  } catch (error) {
    currUser.passwordChangeTokenExpires = undefined;
    currUser.passwordChangeToken = undefined;
    console.log(error);

    return next(new AppError('Failed', 404));
  }

  res.status(200).json({
    status: 'Succcess',
    message: 'Check Your Mail',
  });
});

//will receive the new token and password
exports.reset = async (req, res, next) => {
  //1 get user based on the token
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordChangeToken: hashToken,
    passwordChangeTokenExpires: {
      $gt: Date.now(),
    },
  });

  //2 if token has not expired and there is user set the password

  if (!user) return next(new AppError('Invalid Token', 403));

  //3 update changePasswordAt property

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordChangeToken = undefined;
  user.passwordChangeTokenExpires = undefined;
  await user.save();

  //4 log the user in and send JWT token

  sendToken(user._id, res, 200);

  // const token = signToken(user._id);
  // return res.status(200).json({
  //   status: 'Success',
  //   token,
  // });
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  //gets the current user
  const currUser = await User.findOne({ email: req.body.email }).select(
    '+password',
  );

  if (!currUser) return next(new AppError('Provided Email is Wrong', 404));

  //check if the password is correct
  const isValidPassword = await currUser.checkPassword(
    req.body.password,
    currUser.password,
  );

  if (!isValidPassword)
    return next(new AppError('Provided Password is Wrong', 404));
  //if so issue update the password

  currUser.password = req.body.newPassWord;
  currUser.passwordChangedAt = Date.now();

  await currUser.save({ validateBeforeSave: false });
  //login the user by sending the JWT token

  sendToken(currUser._id, res, 200);

  // const token = signToken(currUser._id);
  // return res.status(200).json({
  //   status: 'Success',
  //   token,
  // });
});
