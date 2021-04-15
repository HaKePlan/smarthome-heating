const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFiels) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFiels.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// USER
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) error if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'this route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }

  // 2) filter out unwanted field names that are not allowed to be updatet
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 2) update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: updateUser,
  });
});

// ADMIN
exports.createUser = catchAsync(async (req, res, next) => {
  // 1) filter out unwanted field names that are not allowed to be updatet
  const filteredBody = filterObj(
    req.body,
    'name',
    'email',
    'password',
    'passwordConfirm'
  );

  // 2) create user
  const newUser = await User.create(filteredBody);

  // 3) remove password from response
  newUser.password = undefined;

  res.status(200).json({
    status: 'success',
    data: newUser,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new AppError('no such user with this id', 404));

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('no document found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUser = catchAsync(async (req, res, next) => {
  const user = await User.find({ role: { $ne: 'sudoer' } });

  res.status(200).json({
    status: 'success',
    results: user.length,
    data: user,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    'name',
    'email',
    'password',
    'passwordConfirm',
    'role'
  );

  if (filteredBody.role === 'sudoer' && !(req.user.role === 'sudoer'))
    filteredBody.role = '';

  const user = await User.findById(req.params.id);
  if (user.role === 'sudoer' && !(req.user.role === 'sudoer'))
    return next(new AppError('you can not eddit sudoer user', 403));

  Object.keys(filteredBody).forEach((key) => {
    user[key] = filteredBody[key];
  });

  await user.save();

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    user,
  });
});
