/** создаем сервер подключением модуля express */
const express = require('express');
/** подключаем модуль к бд */
const mongoose = require('mongoose');

const { PORT = 3000 } = process.env;
const app = express();
const router = require('./routes/index');

/** запускаем сервер и слушаем запрос */
app.listen(PORT, () => {
  console.log('Сервер запущен!');
});

/** подключаем к бд */
mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use((req, res, next) => {
  req.user = {
    _id: '64a5c56812ba4df16b7b5c00',
  };
  next();
});

app.use(express.json());
app.use('/', router);
app.use('/', (req, res) => {
  res.status(404).send({ message: 'Страница не найдена' });
});
