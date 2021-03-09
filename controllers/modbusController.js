const Modbus = require('../models/modbusModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createEntry = catchAsync(async (req, res, next) => {
  const doc = await Modbus.create(req.body);

  res.status(200).json({
    status: 'success',
    message: 'this route is only for testing and development',
    data: {
      data: doc,
    },
  });
});

exports.getAllEntrys = catchAsync(async (req, res, next) => {
  const data = await Modbus.find();

  res.status(200).json({
    status: 'success',
    results: data.length,
    data: {
      data,
    },
  });
});

exports.getEntryByAdr = catchAsync(async (req, res, next) => {
  const entry = await Modbus.findOne({ adress: req.params.adr });

  if (!entry) {
    return next(new AppError('no document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'this is the getEntryByAdr route.',
    data: {
      entry,
    },
  });
});

exports.updateEntyByAdr = (req, res, next) => {
  const adress = req.params.adr;

  res.status(200).json({
    status: 'success',
    data: {
      adress,
    },
  });
};

exports.getHomeEntrys = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'this is the getHomeEntrys route.',
  });
};

exports.getAllAlarm = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'this is the getAllAlarm route.',
  });
};
