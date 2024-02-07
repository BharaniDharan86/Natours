/* eslint-disable import/no-extraneous-dependencies */
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const AppError = require('./utils/appError');
const globalErrHandler = require('./controller/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

app.use(helmet());
//middleware-it modify the incoming request data when the data is json it parse and make it avialable in request.body property
const limit = rateLimit({
  max: 100,
  windowMS: 60 * 60 * 1000,
});

app.set('view engine', 'pug');

app.use(cors());

app.use('/api', limit);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

app.use((req, res, next) => {
  req.request_at = new Date().toLocaleString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // const error = new Error(`Can't find the ${req.url}`);
  // error.status = 'failed';
  // error.statusCode = 404;
  next(new AppError(`Can't find the ${req.url}`, 404));
});

app.use(globalErrHandler);

module.exports = app;
