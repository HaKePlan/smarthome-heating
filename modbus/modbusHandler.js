const ModbusRTU = require('modbus-serial');
const dotenv = require('dotenv');

// create an empty modbus client
const client = new ModbusRTU();

dotenv.config({ path: './config.env' });

exports.getValue = async function (add, len) {
  // create connection
  await client.connectTCP(process.env.MODBUS_IP, {
    port: process.env.MODBUS_PORT,
  });

  console.log('connected');
  client.setID(1);
  client.setTimeout(1000);

  // run programms
  let val = await client.readInputRegisters(add, len).catch((err) => {
    console.log(err.message);
  });

  // const val1 = await Promise.resolve(val);
  // close connection
  client.close();

  // return output
  return val;
};
