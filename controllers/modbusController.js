const Modbus = require('../models/modbusModel');
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
  const data = await Modbus.findOne();
  console.log(data);

  res.status(200).json({
    status: 'success',
    message: 'this is the getAllModbus route.',
    data,
  });
});

exports.getEntryByAdr = catchAsync(async (req, res, next) => {
  const adress = req.params.adr;

  // const entry = await Model.findOne({ adress: req.params.adr });
  // works only with defined model

  res.status(200).json({
    status: 'success',
    message: 'this is the getEntryByAdr route.',
    data: {
      adress,
      // entry,
    },
  });
});

exports.updateEntyByAdr = (req, res, next) => {
  const adress = req.params.adr;

  res.status(200).json({
    status: 'success',
    message: 'this is the updateEntyByAdr route.',
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
