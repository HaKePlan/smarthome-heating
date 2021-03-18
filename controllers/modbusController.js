/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
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

exports.getAllEntrysUpdatet = catchAsync(async (req, res, next) => {
  // 1) GET ALL DOCUMENTS IN THE DB
  const data = await Modbus.find();

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
    element.lastUpdated = Date.now();
    const newElement = await Modbus.findByIdAndUpdate(element.id, element, {
      new: true,
    });
    newDoc.push(newElement);
  }

  // 4) RESPONSE ALL ENTRYS
  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      newDoc,
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
