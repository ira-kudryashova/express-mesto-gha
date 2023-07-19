const express = require('express');
const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const helmet = require('helmet');
// eslint-disable-next-line import/no-extraneous-dependencies
const bodyParser = require('body-parser');
// eslint-disable-next-line import/no-extraneous-dependencies
const { errors } = require('celebrate');

const limiter = require('./middlewares/rateLimiter');

const auth = require('./middlewares/auth');

const routeUsers = require('./routes/users');
const routeCards = require('./routes/cards');

const NotFoundError = require('./errors/NotFoundError');
const error = require('./middlewares/error');

const URL = 'mongodb://127.0.0.1:27017/mestodb';

const { PORT = 3000 } = process.env;

mongoose.set('strictQuery', true);

mongoose
  .connect(URL)
  .then(() => {
    console.log('БД успешно подключена');
  })
  .catch(() => {
    console.log('Не удалось подключиться к БД');
  });

const app = express();

app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(limiter);

app.use(auth);

app.use('/users', routeUsers);
app.use('/cards', routeCards);

app.use((req, res, next) => next(new NotFoundError('Страницы по запрошенному URL не существует')));
app.use(errors());
app.use(error);

app.listen(PORT);
