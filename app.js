const express = require('express');
const morgan = require('morgan');

const app = express();

// 1) MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2) ROUTES
app.get('/api/v1/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'this app is gona be the shit!!!',
  });
});

// 3) GLOBAL ERROR HANDLER

module.exports = app;
