const mongoose = require('mongoose');

const modbusSchema = new mongoose.Schema({
  register: {
    type: Number,
    required: [true, 'a modbus entry needs a register to address'],
  },
  address: {
    type: Number,
    required: [true, 'a modbus entry needs an address'],
  },
  domain: {
    type: String,
    // required: [true, 'a modbus entry needs a domain theme'],
  },
  name: {
    type: String,
    // required: [true, 'a modbus entry needs a name'],
  },
  value: {
    type: Number,
    default: '0',
  },
  unit: {
    type: String,
    default: 'Number',
    // required: [true, 'a modbus entry needs an unit'],
  },
  valueFactor: {
    type: Number,
    default: 1,
  },
  homeEntry: {
    type: Boolean,
    default: false,
  },
  interval: {
    type: Boolean,
    default: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now(),
  },
});

// INDEXES
modbusSchema.index(
  {
    address: 1,
    register: 1,
  },
  { unique: true }
);

// MIDDLEWARE
modbusSchema.pre('save', function (next) {
  this.lastUpdated = Date.now();
  next();
});

// third parameter defines the name of the collection, if this parameter is not set, mongoose will use the plural lowercase version of the schema name.
const Modbus = mongoose.model('Modbus', modbusSchema, 'modbus');

module.exports = Modbus;
