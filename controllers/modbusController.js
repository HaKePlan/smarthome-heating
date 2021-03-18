/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
const Modbus = require('../models/modbusModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const modbusHandler = require('../modbus/modbusHandler');
const factory = require('./handlerFactory');

exports.createEntry = catchAsync(async (req, res, next) => {
  const doc = await Modbus.create(req.body);

  res.status(200).json({
    status: 'success',
    message: 'this route is only for testing and development',
    data: {
      doc,
    },
  });
});

exports.getAllEntrys = catchAsync(async (req, res, next) => {
  const doc = await Modbus.find();

  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      doc,
    },
  });
});

exports.getEntryByAdr = catchAsync(async (req, res, next) => {
  let doc = await Modbus.findOne({
    register: req.params.reg,
    address: req.params.adr,
  });

  if (!doc) {
    return next(new AppError('no document found with that adrress', 404));
  }

  // Check if lastUpdated of the doc is more than 30 seconds in the past
  // if it is the case, update the value and lastUpdated, save it to the document in DB
  if (doc.lastUpdated < Date.now() - process.env.VALUEUPDATE * 1000) {
    // call modbusHandler.getValue with the address from the doc minus the offset stored in config.env
    doc = await modbusHandler.getValue(doc, 1, next);

    // save changes to the document
    // console.log(doc);
    await doc.save();
  }

  res.status(200).json({
    status: 'success',
    message: 'this is the getEntryByAdr route.',
    data: {
      doc,
    },
  });
});

exports.updateEntyByAdr = catchAsync(async (req, res, next) => {
  // check if value is a number
  if (typeof req.body.value === 'number') {
    const doc = await Modbus.findOne({
      register: req.params.reg,
      address: req.params.adr,
    });

    if (!doc) {
      return next(new AppError('no document found with that address', 404));
    }

    req.body.value = await modbusHandler.setValue(doc, req.body.value, next);

    // check if value is set, if true then respnose with error
  } else if (req.body.value) {
    return next(
      new AppError(
        'value is not a Number. Please provide a value with a number',
        400
      )
    );
  }

  const entry = await Modbus.findOneAndUpdate(
    {
      register: req.params.reg,
      address: req.params.adr,
    },
    req.body,
    {
      runValidators: true,
      new: true,
    }
  );

  if (!entry) {
    return next(new AppError('no document found with that address', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      entry,
    },
  });
});

exports.getHomeEntrys = catchAsync(async (req, res, next) => {
  const doc = await Modbus.find({ homeEntry: true });

  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      doc,
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

exports.getAllEntrysUpdatet = factory.updateAll(Modbus);
exports.updateInterval = factory.updateAll(Modbus, { interval: true });
