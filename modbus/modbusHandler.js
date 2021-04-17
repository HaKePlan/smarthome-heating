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

// CONNECT TO CLIENT
client
  .connectTCP(process.env.MODBUS_IP, {
    port: process.env.MODBUS_PORT,
  })
  .then(() => {
    console.log('modbus connection successfull');
    client.setID(1);
    // console.log(client.getID());
    client.setTimeout(0);
  });

exports.getValue = async (doc, len, next) => {
  // 1) RUN PROGRAMMS
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

  // 2) CALCULATE THE VALUE WITH THE FACTOR
  doc.value = val.data[0] / doc.valueFactor;

  // 3) IF UNIT === OBJECT, STORE VALUE IN BINARY TO signedValue.bits
  doc.valueAssignation.bits = convertDecimalToBinary(
    doc.valueAssignation.definition,
    val.data[0]
  );

  // 4) RETURN MODIFIED DOC
  return doc;
};

exports.setValue = async (doc, val, next) => {
  // 1) RUN PROGRAMMS
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

  // 2) CONVERT CHECKVALUE TO A SINGLE NUMBER
  checkVal = Number(checkVal.data[0]);

  // 3) CHECK IF IT WORKED PROPERLY
  if (!(checkVal === val)) {
    return ['value not properly set, something went bad', 500];
  }

  // 4) IF UNIT === OBJECT, STORE VALUE IN BINARY TO signedValue.bits
  const bits = convertDecimalToBinary(
    doc.valueAssignation.definition,
    checkVal
  );

  // 5) CLCULATE AND RETURN THE CHECKVALUE TO SAVE IT LATER
  checkVal /= doc.valueFactor;
  return [checkVal, bits];
};

exports.updateValue = async (doc, next) => {
  // 1) GET VALUE IN A LOOP
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

    // 2) CALCULATE EACH VALUE AND PUSH IN AN ARRAY
    element.value = val.data[0] / element.valueFactor;

    // 3) GET BITS OF EACH ELEMENT IF UNIT === OBJECT, STORE VALUE IN BINARY TO signedValue.bits
    element.valueAssignation.bits = convertDecimalToBinary(
      element.valueAssignation.definition,
      val.data[0]
    );

    // 4) PUSH ELEMENT (DOC) IN AN ARRAY
    elementArr.push(element);
    // console.log(
    //   'value of',
    //   element.register,
    //   element.address,
    //   'is : ',
    //   element.value
    // );
  }

  // 5) RETURN UPDATET ELEMENTS
  return elementArr;
};
