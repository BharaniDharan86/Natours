/* eslint-disable no-console */
/* eslint-disable import/newline-after-import */
const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

const DBURL = process.env.DATABASE;

//CONNECTING TO MONGODB USING MONGOOSE DRIVER

mongoose
  .connect(DBURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('Connected Successfully');
  })
  .catch((err) => {
    console.log(err);
  });

const PORT = 3000;

// STARTS THE SERVER
const server = app.listen(3000, () => {
  console.log(`App is listening on post ${PORT}`);
});

//EACHTIME THERE IS AN UNHANDLED REJECTION - PROCESS EMIT AN OBJECT CALLED "unhandledRejection"

process.on('unhandledRejection', (err) => {
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  server.close(() => {
    process.exit(1);
  });
});

// console.log(app.get('env'));
// console.log(process.env);
