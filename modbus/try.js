const ModbusHandler = require('./modbusHandler');

(async () => {
  const d = await ModbusHandler.getValue(49, 1);
  console.log('the value of a is: ', d);
})();
