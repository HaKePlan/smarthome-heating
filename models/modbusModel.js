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
    enum: [
      'alarme',
      'heizgruppe_1',
      'heizgruppe_2',
      'brauchwasser',
      'allgemein',
      'vorregler',
    ],
    required: [true, 'a modbus entry needs a domain theme'],
  },
  name: {
    type: String,
    required: [true, 'a modbus entry needs a name'],
  },
  value: {
    type: Number,
    default: 0,
  },
  unit: {
    type: String,
    default: 'number',
    enum: ['°C', '%', 'number', 'signedValue'],
  },
  valueFactor: {
    type: Number,
    default: 1,
  },
  valueAssignation: {
    assignment: {
      type: Object,
      default: undefined,
    },
    definition: {
      type: String,
      enum: ['bitwise', 'numeric', 'boolean'],
      default: undefined,
    },
    bits: {
      type: Array,
      default: undefined,
    },
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

modbusSchema.pre('findOneAndUpdate', function (next) {
  this.set({ lastUpdated: Date.now() });
  next();
});

// third parameter defines the name of the collection, if this parameter is not set, mongoose will use the plural lowercase version of the schema name.
const Modbus = mongoose.model('Modbus', modbusSchema, 'modbus');

module.exports = Modbus;
