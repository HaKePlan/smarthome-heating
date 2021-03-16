const ModbusRTU = require('modbus-serial');
const dotenv = require('dotenv');
const AppError = require('../utils/appError');

// create an empty modbus client
const client = new ModbusRTU();

// set the defined offset fpr the address translation
dotenv.config({ path: './config.env' });
const offset = process.env.MODBUS_OFFSET * 1;

// conect function
const connectClient = async () => {
  await client.connectTCP(process.env.MODBUS_IP, {
    port: process.env.MODBUS_PORT,
  });

  // console.log('modbus connection enabled');
  client.setID(1);
  client.setTimeout(1000);
};

exports.getValue = async (doc, len, next) => {
  // 1) CREATE CONNECTION
  await connectClient();

  // 2) RUN PROGRAMMS
  let val;
  switch (doc.register) {
    case 0:
      val = await client.readCoils(doc.address + offset, len);
      break;
    case 1:
      val = await client.readDiscreteInputs(doc.address + offset, len);
      break;
    case 3:
      val = await client.readInputRegisters(doc.address + offset, len);
      break;
    case 4:
      val = await client.readHoldingRegisters(doc.address + offset, len);
      break;
    default:
      return next(
        new AppError(
          'no valid register found. Please provide a valid register',
          404
        )
      );
  }

  // 3) CLOSE CONNECTION
  client.close();

  // 4) CALCULATE THE VALUE WITH THE FACTOR
  doc.value = val.data[0] / doc.valueFactor;

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
      await client.writeCoil(doc.address + offset, !!val);
      checkVal = await client.readCoils(doc.address + offset, 1);
      break;
    case 4:
      await client.writeRegister(doc.address + offset, val);
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

  // 4) CONVERT CHECKVALUE TO A SINGLE NUMBER
  checkVal = Number(checkVal.data[0]);

  // 5) CHECK IF IT WORKED PROPERLY
  if (!(checkVal === val)) {
    return next(
      new AppError('value not properly set, something went bad'),
      500
    );
  }

  // 6) RETURN THE CHECKVALUE TO SAVE IT LATER
  return checkVal;
};
