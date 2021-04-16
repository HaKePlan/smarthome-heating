const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

// TOKEN HANDLER
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWTSECRET, {
    expiresIn: process.env.JWTEXPIRES,
  });

const sendToken = (user, statuscode, res) => {
  // 1) create token
  const token = signToken(user._id);

  // 2) set cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // 3) send token as a cookie
  res.cookie(jwt, token, cookieOptions);

  // 4) remove password from user
  user.password = undefined;

  // 5) send response with user data
  res.status(statuscode).json({
    status: 'success',
    token,
    data: user,
  });
};

// MODULES
exports.login = catchAsync(async (req, res, next) => {
  const { name, password } = req.body;

  // 1) check if uesername and password is set
  if (!name || !password)
    return next(new AppError('please provide username and password', 400));

  // 2) get user from db and check if username and password is correct
  const user = await User.findOne({ name }).select('+password');

  if (!user || !(await user.passwordCompare(password, user.password)))
    return next(new AppError('incorrect password or username', 401));

  // 3) do the token stuff
  sendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) getting the token, check if its exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2) check if token is valid
  const decoded = await promisify(jwt.verify)(token, process.env.JWTSECRET);

  // 3) check if user still exist
  const currUser = await User.findById(decoded.id);
  if (!currUser) {
    return next(
      new AppError(
        'the user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) chekc if user changed password
  if (currUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! please log in again', 401)
    );
  }

  // 5) grant access to the protectet routes
  req.user = currUser;
  next();
});

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new AppError('You do not have permission to preform this action', 403)
    );
  }
  next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on POST email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is no user with email address.', 404));
  }

  // 2) generate random Token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) send back as email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `forgot your password? submitt a PATCH request with your new password and passwordConfirm to: ${resetURL}\nIf you didn't forget your password, please ignore this email!.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset Token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'there was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on the reset token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) if token not expired and user, set new password
  if (!user) {
    return next(new AppError('token is invalide or hase expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) log the user in, send JWT token
  sendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) check postet password
  if (!user.passwordCompare(req.body.passwordCurrent, user.password)) {
    return next(new AppError('password incorect', 401));
  }

  // 3) pass correct, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) log user in with new password
  sendToken(user, 200, res);
});
