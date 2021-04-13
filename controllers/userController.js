const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// create one
exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // remove password from response
  newUser.password = undefined;

  res.status(200).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

// update one

// delete one

// get one
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('no user found with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// get all
exports.getAllUser = catchAsync(async (req, res, next) => {
  const user = await User.find();

  res.status(200).json({
    status: 'success',
    results: user.length,
    data: {
      user,
    },
  });
});

// get group
