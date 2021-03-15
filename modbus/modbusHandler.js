const ModbusRTU = require('modbus-serial');
const dotenv = require('dotenv');

// create an empty modbus client
const client = new ModbusRTU();

dotenv.config({ path: './config.env' });

exports.getValue = async function (add, len, doc) {
  // create connection
  await client.connectTCP(process.env.MODBUS_IP, {
    port: process.env.MODBUS_PORT,
  });

  // console.log('modbus connection enabled');
  client.setID(1);
  client.setTimeout(1000);

  // run programms
  const val = await client.readInputRegisters(add, len).catch((err) => {
    console.log(err.message);
  });

  // Translate the value
  // console.log(val);
  doc.value = val.data[0] / doc.valueFactor;

  // close connection
  client.close();
  // console.log('modbus connection disabled');

  // return output
  return doc;
};
