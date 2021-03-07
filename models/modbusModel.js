const mongoose = require('mongoose');

const modbusSchema = new mongoose.Schema({
  register: {
    type: Number,
    required: [true, 'a modbus entry needs a register to adress'],
  },
  adress: {
    type: String,
    required: [true, 'a modbus entry needs an adress'],
  },
  domain: {
    type: String,
    required: [true, 'a modbus entry needs a domain theme'],
  },
  name: {
    type: String,
    required: [true, 'a modbus entry needs a name'],
  },
  value: {
    type: String,
    default: '0',
  },
  lastUpdatet: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

// third parameter defines the name of the collection, if this parameter is not set, mongoose will use the plural lowercase version of the schema name.
const Modbus = mongoose.model('Modbus', modbusSchema, 'modbus');

module.exports = Modbus;
