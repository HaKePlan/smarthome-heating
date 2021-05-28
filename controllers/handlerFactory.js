/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const modbusHandler = require('../modbus/modbusHandler');

exports.getEntry = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1) CHECK IF REQ IS FROM MODBUS OR CONFIG
    let doc;
    if (req.baseUrl === '/api/v1/modbus') {
      doc = await Model.findById(req.params.id);
    } else {
      doc = await Model.findOne({
        register: req.params.reg,
        address: req.params.adr,
      });
    }

    // 2) CHECK IF THERE IS A DOC
    if (!doc) {
      return next(new AppError('no document found with that adrress', 404));
    }

    // 3) CHECK IF NEW UPDATE IS NEEDED
    // Check if lastUpdated of the doc is more than 30 seconds in the past
    // if it is the case, update the value and lastUpdated, save it to the document in DB
    if (doc.lastUpdated < Date.now() - process.env.VALUEUPDATE * 1000) {
      // call modbusHandler.getValue with the address from the doc minus the offset stored in config.env
      doc = await modbusHandler.getValue(doc, 1, next);

      if (Array.isArray(doc)) {
        return next(new AppError(doc[0], doc[1]));
      }

      // 4) SAVE UPDATE TO DOC
      await doc.save();
    }

    // 5) RESPONSE
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log(req.headers);
    // 1) GET DOC FROM REG AND ADR
    let doc;
    if (req.baseUrl === '/api/v1/modbus') {
      doc = await Model.findById(req.params.id);
    } else {
      doc = await Model.findOne({
        register: req.params.reg,
        address: req.params.adr,
      });
    }

    // 2) CHECK IF DOC EXISTS
    if (!doc) {
      return next(new AppError('no document found with this address', 404));
    }

    // 3) CHECK IF A VALUE IS SET AND IS A NUMBER, IF TRUE: UPDATE VALUE
    if (typeof req.body.value === 'number') {
      const check = await modbusHandler.setValue(doc, req.body.value, next);

      if (!(typeof check[0] === 'number')) {
        return next(new AppError(check[0], check[1]));
      }

      // assign value and bit to doc and save doc
      doc.value = check[0];
      doc.valueAssignation.bits = check[1];
      doc.save();
    } else if (req.body.value || req.baseUrl === '/api/v1/modbus') {
      return next(
        new AppError(
          'value is not a Number. Please provide a value with a number',
          400
        )
      );
    }

    // 4) UPDATET DOC IF FROM CONFIG ROUTE
    let entry;
    if (req.baseUrl === '/api/v1/config') {
      // sanitisize req.body.value
      req.body.value = undefined;

      // update the rest
      entry = await Model.findByIdAndUpdate(doc.id, req.body, {
        runValidators: true,
        new: true,
      });
    } else {
      entry = doc;
    }

    // 6) RESPONSE UPDATET DOC
    res.status(200).json({
      status: 'success',
      data: entry,
    });
  });

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
    // const newDoc = [];
    for (let i = 0; i < doc.length; i++) {
      const element = doc[i];
      await element.save();
      // newDoc.push(element);
    }

    // 4) RESPONSE ALL ENTRYS
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: doc,
    });
  });
