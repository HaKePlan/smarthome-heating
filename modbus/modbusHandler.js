/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */

const ModbusRTU = require('modbus-serial');
const dotenv = require('dotenv');
const convertDecimalToBinary = require('../utils/binaryConverter');

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
      return ['no valid register found. Please provide a valid register', 404];
  }

  // 3) CLOSE CONNECTION
  client.close();

  // 4) CALCULATE THE VALUE WITH THE FACTOR
  doc.value = val.data[0] / doc.valueFactor;

  // 5) IF UNIT === OBJECT, STORE VALUE IN BINARY TO signedValue.bits
  doc.valueAssignation.bits = convertDecimalToBinary(
    doc.valueAssignation.definition,
    val.data[0]
  );

  // 6) RETURN MODIFIED DOC
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
      return ['no valid register found. Please provide a valid register', 404];
  }

  // 3) CLOSE CONNECTION
  client.close();

  // 4) CONVERT CHECKVALUE TO A SINGLE NUMBER
  checkVal = Number(checkVal.data[0]);

  // 5) CHECK IF IT WORKED PROPERLY
  if (!(checkVal === val)) {
    return ['value not properly set, something went bad', 500];
  }

  // 6) IF UNIT === OBJECT, STORE VALUE IN BINARY TO signedValue.bits
  const bits = convertDecimalToBinary(
    doc.valueAssignation.definition,
    checkVal
  );

  // 7) CLCULATE AND RETURN THE CHECKVALUE TO SAVE IT LATER
  checkVal /= doc.valueFactor;
  return [checkVal, bits];
};

exports.updateValue = async (doc, next) => {
  // 1) CREATE CONNECTION
  await connectClient();

  // 2) GET VALUE IN A LOOP
  const elementArr = [];
  for (let i = 0; i < doc.length; i++) {
    const element = doc[i];

    let val;
    switch (element.register) {
      case 0:
        val = await client.readCoils(element.address + offset, 1);
        break;
      case 1:
        val = await client.readDiscreteInputs(element.address + offset, 1);
        break;
      case 3:
        val = await client.readInputRegisters(element.address + offset, 1);
        break;
      case 4:
        val = await client.readHoldingRegisters(element.address + offset, 1);
        break;
      default:
        return [`register ${element.register} is not a valid register.`, 404];
    }
    // 3) CALCULATE EACH VALUE AND PUSH IN AN ARRAY
    element.value = val.data[0] / element.valueFactor;

    // 4) GET BITS OF EACH ELEMENT IF UNIT === OBJECT, STORE VALUE IN BINARY TO signedValue.bits
    element.valueAssignation.bits = convertDecimalToBinary(
      element.valueAssignation.definition,
      val.data[0]
    );

    // 5) PUSH ELEMENT (DOC) IN AN ARRAY
    elementArr.push(element);
    // console.log(
    //   'value of',
    //   element.register,
    //   element.address,
    //   'is : ',
    //   element.value
    // );
  }

  // 4) CLOSE CONNECTION
  client.close();

  // 5) RETURN UPDATET ELEMENTS
  return elementArr;
};
