const router = require('express').Router();

const { celebrate, Joi } = require('celebrate');
const { login } = require('../controllers/users');

/** пакет, предназначенный для обработки валидации данных в
 * Express.js. Он предоставляет удобный способ определения
 * применения правил валидации для запросов в вашем приложении Express
 * подключение celebrate и Joi для обработки валидации данных */

router.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6),
    }),
  }),
  login,
);

module.exports = router;
