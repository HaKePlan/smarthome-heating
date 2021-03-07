const express = require('express');
const morgan = require('morgan');
const modbusRoutes = require('./routes/modbusRoutes');

const app = express();

// 1) MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// body parser (enables req.body output)
app.use(express.json({ limit: '10kb' }));

// 2) ROUTES
app.get('/api/v1/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'this app is gona be the shit!!!',
  });
});

app.use('/api/v1/modbus', modbusRoutes);

// 3) GLOBAL ERROR HANDLER

module.exports = app;
