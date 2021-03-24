/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
const Modbus = require('../models/modbusModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

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

exports.getEntryByID = factory.getEntry(Modbus);
exports.updateEntryByID = factory.updateOne(Modbus);

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

exports.getAllAlarm = factory.updateAll(Modbus, { domain: 'Alarm' });
exports.getAllEntrysUpdatet = factory.updateAll(Modbus);
exports.updateInterval = factory.updateAll(Modbus, { interval: true });
