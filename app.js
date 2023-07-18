/** создаем сервер подключением модуля express */
const express = require('express');
/** подключаем модуль к бд */
const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const helmet = require('helmet');
// eslint-disable-next-line import/no-extraneous-dependencies
const { errors } = require('celebrate');

const { PORT = 3000 } = process.env;

const app = express();
const routes = require('./routes/index');
const error = require('./middlewares/error');

/** подключаем к бд */
mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(express.json());
app.use(helmet());
app.use(routes);
app.use(errors());
app.use(error);

/** запускаем сервер и слушаем запрос */
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Сервер запущен!');
});
