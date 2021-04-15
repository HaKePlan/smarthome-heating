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
  if (!doc) {
    return;
    // this return statement is realy neccessari! without this, the next functions in the script will be called. So we need to return at this piont. This expression is only true, wehn there is a nonvalid register in data (error handling in updateValue switch.default statement)
  }

  // 3) SAVE ALL NEW VALUES IN DB BY LOOP (update lastUpdatet)
  const newDoc = [];
  for (let i = 0; i < doc.length; i++) {
    const element = doc[i];
    const newElement = await Modbus.findByIdAndUpdate(
      element.id,
      { value: element.value },
      {
        new: true,
      }
    );
    newDoc.push(newElement);
  }

  // 4) RESPONSE ALL ENTRYS
  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: newDoc,
  });
});

exports.getEntryByID = factory.getEntry(Modbus);
exports.updateEntryByID = factory.updateOne(Modbus);
exports.getHomeEntrys = factory.updateAll(Modbus, { homeEntry: true });
exports.getAllAlarm = factory.updateAll(Modbus, { domain: 'Alarm' });
exports.getAllEntrysUpdatet = factory.updateAll(Modbus);
exports.updateInterval = factory.updateAll(Modbus, { interval: true });
