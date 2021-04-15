/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
const Modbus = require('../models/modbusModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const modbusHandler = require('../modbus/modbusHandler');
const AppError = require('../utils/appError');

exports.getAllEntrys = catchAsync(async (req, res, next) => {
  const doc = await Modbus.find();

  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: doc,
  });
});

exports.getDomainEntrys = catchAsync(async (req, res, next) => {
  // 1) GET ALL DOCUMENTS IN THE DB
  const data = await Modbus.find({ domain: req.params.domain });

  // 2) CHECK IF PARAM DOMAIN IS EXISTING
  if (data.length === 0) {
    return next(new AppError('no documents found with this domain', 404));
  }

  // 2) CALL THE UPDATE FUNCTION
  const doc = await modbusHandler.updateValue(data, next);

  if (typeof doc[0] === 'string') {
    return next(new AppError(doc[0], doc[1]));
  }

  // 3) SAVE ALL NEW VALUES IN DB BY LOOP
  for (let i = 0; i < doc.length; i++) {
    const element = doc[i];
    element.save();
  }

  // 4) RESPONSE ALL ENTRYS
  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: doc,
  });
});

exports.getAllActiveAlarm = catchAsync(async (req, res, next) => {
  // 1) GET ALL DOCUMENTS IN THE DB
  const data = await Modbus.find({ domain: 'alarme' });

  // 2) CHECK IF PARAM DOMAIN IS EXISTING
  if (data.length === 0) {
    return next(new AppError('no documents found with this domain', 404));
  }

  // 2) CALL THE UPDATE FUNCTION
  const doc = await modbusHandler.updateValue(data, next);

  if (typeof doc[0] === 'string') {
    return next(new AppError(doc[0], doc[1]));
  }

  // 3) SAVE ALL NEW VALUES IN DB BY LOOP
  for (let i = 0; i < doc.length; i++) {
    const element = doc[i];
    element.save();
  }

  // 4) FILTER OUT ACTIVE ALARMS
  const active = [];
  doc.forEach((e) => {
    if (e.value === 1) active.push(e);
  });

  // 4) RESPONSE ALL ENTRYS
  res.status(200).json({
    status: 'success',
    results: active.length,
    data: active,
  });
});

exports.getEntryByID = factory.getEntry(Modbus);
exports.updateEntryByID = factory.updateOne(Modbus);
exports.getHomeEntrys = factory.updateAll(Modbus, { homeEntry: true });
exports.getAllEntrysUpdatet = factory.updateAll(Modbus);
exports.updateInterval = factory.updateAll(Modbus, { interval: true });
