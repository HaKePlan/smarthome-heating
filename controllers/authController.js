const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// TOKEN HANDLER
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWTSECRET, {
    expiresIn: process.env.JWTEXPIRES,
  });

const sendToken = (user, statuscode, res) => {
  // create token
  const token = signToken(user._id);

  // set cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // send token as a cookie
  res.cookie(jwt, token, cookieOptions);

  // send response with user data
  res.status(statuscode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// MODULES
// login
exports.login = catchAsync(async (req, res, next) => {
  const { name, password } = req.body;

  // 1) check if uesername and password is set
  if (!name || !password)
    return next(new AppError('pleas provide a username and a password', 400));

  // 2) get user from db and check if username and password is correct
  const user = await User.findOne({ name }).select('+password');

  if (!user || !(await user.passwordCompare(password, user.password)))
    return next(new AppError('incorrect password or username', 401));

  // 3) remove password from user
  user.password = undefined;

  // 4) do the token stuff
  sendToken(user, 200, res);
});

// protection
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
