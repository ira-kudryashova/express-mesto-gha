const router = require('express').Router();

// ПОДКЛЮЧЕНИЕ ПАКЕТА celebrate и Joi для обработки валидации данных
const { celebrate, Joi } = require('celebrate');

const { URL_REGEX } = require('../utils/constants');

// пакет, предназначенный для обработки валидации данных в
// Express.js. Он предоставляет удобный способ определения
// и применения правил валидации для запросов в вашем приложении Express.
const { createUser } = require('../controllers/users');

router.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6),
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().pattern(URL_REGEX),
    }),
  }),
  createUser,
);

module.exports = router;
