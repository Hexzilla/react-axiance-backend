require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const chalk = require('chalk');
const userRouter = require('./routes/userRouter');
const nullPointRouter = require('./routes/nullPointRouter');
const sfRouter = require('./routes/sfRouter');
const awsRouter = require('./routes/awsRouter');
const documentRouter = require('./routes/documentRouter');

const app = express();
const port = process.env.PORT || 3001;
const mongoUri = process.env.MONGO_URL;
const corsOptions = {
  credentials: true,
  origin: [
    'https://portal.axiancepartnerseu.com',
    'https://portal.axiancepartners.com',
    'https://everfx2.lightning.force.com',
    'https://everfx2--uat.lightning.force.com',
    'https://everfx2--dev.lightning.force.com',
    'http://localhost:3000',
  ],
};

app.use(logger('dev'));
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}, (err) => {
  if (err) {
    throw err;
  }
});

app.use('/users', userRouter);
app.use('/nullpoint', nullPointRouter);
app.use('/sf', sfRouter);
app.use('/aws', awsRouter);
app.use('/document', documentRouter);
app.get('/', (req, res) => {
  res.send('Should you really be here?');
});

app.listen(port, () => {
  console.log('Server running at:', chalk.magenta(`http://localhost:${port}/`));
});

module.exports = app;
