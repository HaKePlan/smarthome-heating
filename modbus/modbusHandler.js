const ModbusRTU = require('modbus-serial');
const dotenv = require('dotenv');
const AppError = require('../utils/appError');

// create an empty modbus client
const client = new ModbusRTU();

dotenv.config({ path: './config.env' });
const offset = process.env.MODBUS_OFFSET * 1;

const connectClient = async () => {
  await client.connectTCP(process.env.MODBUS_IP, {
    port: process.env.MODBUS_PORT,
  });

  // console.log('modbus connection enabled');
  client.setID(1);
  client.setTimeout(1000);
};

exports.getValue = async (adr, len, doc, next) => {
  // 1) CREATE CONNECTION
  await connectClient();

  // 2) RUN PROGRAMMS
  let val;
  switch (doc.register) {
    case 0:
      val = await client.readCoils(adr, len);
      break;
    case 1:
      val = await client.readDiscreteInputs(adr, len);
      break;
    case 3:
      val = await client.readInputRegisters(adr, len);
      break;
    case 4:
      val = await client.readHoldingRegisters(adr, len);
      break;
    default:
      return next(
        new AppError(
          'no valid register found. Please provide a valid register',
          404
        )
      );
  }

  // 3) TRANSLATE THE VALUE AND ASSIGN TO DOC
  // console.log(val.data);
  doc.value = val.data[0] / doc.valueFactor;

  // 4) CLOSE CONNECTION
  client.close();
  // console.log('modbus connection disabled');

  // 5) RETURN MODIFIED DOC
  return doc;
};

exports.setValue = async (doc, val, next) => {
  // 1) CREATE CONNECTION
  await connectClient();

  // 2) RUN PROGRAMMS
  let checkVal;
  switch (doc.register) {
    case 0:
      if (!(typeof val === 'boolean')) {
        return next(
          new AppError('no valid value providet. Value must be a boolean', 400)
        );
      }
      // await client.writeCoil(doc.address + offset, val);
      checkVal = await client.readCoils(doc.address + offset, 1);
      break;
    case 4:
      await client.writeRegister(doc.address + offset, parseFloat(val)); // Translation from value as a string to a value as a number?
      checkVal = await client.readHoldingRegisters(doc.address + offset, 1);
      break;
    default:
      return next(
        new AppError(
          'no valid writeable register found. Pleas provide a valid writabel register',
          404
        )
      );
  }

  // 3) CLOSE CONNECTION
  client.close();

  // 4) CONVERT CHECKVALUE TO A NUMBER
  checkVal = checkVal.data[0];

  // 5) CHECK IF IT WORKED PROPERLY
  if (!(checkVal === parseFloat(val))) {
    return next(
      new AppError('value not properly set, something went bad'),
      500
    );
  }

  // 6) CONVERT THE CHECKVALUE TO READABLE DATA
  // this will be defined later

  // 7) RETURN THE CHECKVALUE TO SAVE IT LATER
  return checkVal;
};
