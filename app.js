const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const modbusRoutes = require('./routes/modbusRoutes');
const configRoutes = require('./routes/configRoutes');
const userRoutes = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

// 1) MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors());

// body parser (enables req.body output)
app.use(express.json({ limit: '10kb' }));

// 2) ROUTES
// test entry
app.get('/api/v1/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'this app is gona be the shit!!!',
  });
});

app.use('/api/v1/user', userRoutes);

app.use('/api/v1/modbus', modbusRoutes);
app.use('/api/v1/config', configRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404));
});

// 3) GLOBAL ERROR HANDLER
// the globalErrorHandler activates the errorController ant his behaviour / code
app.use(globalErrorHandler);

module.exports = app;
