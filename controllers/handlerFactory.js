/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const modbusHandler = require('../modbus/modbusHandler');

exports.updateAll = (Model, filter) =>
  catchAsync(async (req, res, next) => {
    // 1) GET ALL DOCUMENTS IN THE DB
    const data = await Model.find(filter);

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
      const newElement = await Model.findByIdAndUpdate(
        element.id,
        { value: element.value, lastUpdated: element.lastUpdated },
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
      data: {
        newDoc,
      },
    });
  });
