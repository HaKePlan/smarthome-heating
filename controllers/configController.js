const Modbus = require('../models/modbusModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const modbusHandler = require('../modbus/modbusHandler');

exports.createEntry = catchAsync(async (req, res, next) => {
  const doc = await Modbus.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      doc,
    },
  });
});

exports.getEntryByAdr = factory.getEntry(Modbus);
exports.updateEntyByAdr = factory.updateOne(Modbus);

exports.deleteEntryByAdr = catchAsync(async (req, res, next) => {
  const doc = await Modbus.findOneAndDelete({
    register: req.params.reg,
    address: req.params.adr,
  });

  if (!doc) {
    return next(new AppError('no document found with this address', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
