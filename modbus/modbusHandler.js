const ModbusRTU = require('modbus-serial');
const dotenv = require('dotenv');
const AppError = require('../utils/appError');

// create an empty modbus client
const client = new ModbusRTU();

dotenv.config({ path: './config.env' });

exports.getValue = async function (adr, len, doc, next) {
  // 1) CREATE CONNECTION
  await client.connectTCP(process.env.MODBUS_IP, {
    port: process.env.MODBUS_PORT,
  });

  // console.log('modbus connection enabled');
  client.setID(1);
  client.setTimeout(1000);

  // 2) RUN PROGRAMMS
  let val;
  switch (doc.register) {
    case 0:
      val = await client.readCoils(adr, len).catch((err) => {
        console.log(err.message);
      });
      break;
    case 1:
      val = await client.readDiscreteInputs(adr, len).catch((err) => {
        console.log(err.message);
      });
      break;
    case 3:
      val = await client.readInputRegisters(adr, len).catch((err) => {
        console.log(err.message);
      });
      break;
    case 4:
      val = await client.readHoldingRegisters(adr, len).catch((err) => {
        console.log(err.message);
      });
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
  console.log(val.data);
  doc.value = val.data[0] / doc.valueFactor;

  // 4) CLOSE CONNECTION
  client.close();
  // console.log('modbus connection disabled');

  // 5) RETURN MODIFIED DOC
  return doc;
};
