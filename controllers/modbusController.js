const Modbus = require('../models/modbusModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const modbusHandler = require('../modbus/modbusHandler');

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
  let entry = await Modbus.findOne({
    register: req.params.reg,
    address: req.params.add,
  });

  if (!entry) {
    return next(new AppError('no document found with that adrress', 404));
  }

  // Check if lastUpdated of the entry is more than 30 seconds in the past
  // if it is the case, update the value and lastUpdated, save it to the document in DB
  if (entry.lastUpdated < Date.now() - process.env.VALUEUPDATE * 1000) {
    // call modbusHandler.getValue with the address from the entry minus the offset stored in config.env
    entry = await modbusHandler.getValue(
      entry.address + process.env.MODBUS_OFFSET * 1,
      1,
      entry
    );

    // save changes to the document
    // console.log(entry);
    await entry.save();
  }

  res.status(200).json({
    status: 'success',
    message: 'this is the getEntryByAdr route.',
    data: {
      entry,
    },
  });
});

exports.updateEntyByAdr = catchAsync(async (req, res, next) => {
  const entry = await Modbus.findOneAndUpdate(
    {
      register: req.params.reg,
      adress: req.params.adr,
    },
    req.body,
    {
      runValidators: true,
      new: true,
    }
  );

  if (!entry) {
    return next(new AppError('no document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      entry,
    },
  });
});

exports.getHomeEntrys = catchAsync(async (req, res, next) => {
  const data = await Modbus.find({ homeEntry: true });

  res.status(200).json({
    status: 'success',
    results: data.length,
    data: {
      data,
    },
  });
});

exports.getAllAlarm = (req, res, next) => {
  // How to deal with this??
  res.status(200).json({
    status: 'success',
    message: 'this is the getAllAlarm route.',
  });
};