/** создаем сервер подключением модуля express */
const express = require('express');
/** подключаем модуль к бд */
const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const helmet = require('helmet');

const { PORT = 3000 } = process.env;
// const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const app = express();
const router = require('./routes/index');

/** подключаем к бд */
mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use((req, res, next) => {
  req.user = {
    _id: '64a5c56812ba4df16b7b5c00',
  };
  next();
});

app.use(express.json());
app.use(helmet());
app.use('/', router);
app.use('/', (req, res) => {
  res.status(404).send({ message: 'Страница не найдена' });
});

/** запускаем сервер и слушаем запрос */
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Сервер запущен!');
});
