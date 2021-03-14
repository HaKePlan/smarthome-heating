const mongoose = require('mongoose');

const modbusSchema = new mongoose.Schema({
  register: {
    type: Number,
    required: [true, 'a modbus entry needs a register to adress'],
  },
  address: {
    type: Number,
    unique: true,
    required: [true, 'a modbus entry needs an adress'],
  },
  domain: {
    type: String,
    required: [true, 'a modbus entry needs a domain theme'],
  },
  name: {
    type: String,
    unique: true,
    required: [true, 'a modbus entry needs a name'],
  },
  value: {
    type: {},
    default: '0',
  },
  homeEntry: {
    type: String,
    default: false,
  },
  lastUpdated: {
    type: Date,
    default: Date.now(),
  },
});

// third parameter defines the name of the collection, if this parameter is not set, mongoose will use the plural lowercase version of the schema name.
const Modbus = mongoose.model('Modbus', modbusSchema, 'modbus');

module.exports = Modbus;
