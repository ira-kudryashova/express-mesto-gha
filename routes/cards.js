const router = require('express').Router();

/** пакет lля обработки валидации данных в xpress.js. Он предоставляет удобный
 * способ определения и применения правил валидации для запросов в вашем приложении Express */
// eslint-disable-next-line import/no-extraneous-dependencies, no-unused-vars
const { celebrate, Joi } = require('celebrate');

/** регулярное выражение для проверки адресов и почты */
const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const {
  createCard,
  getCards,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

// const { validateCard, validateCardId } = require('../middlewares/validation');

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(URL_REGEX),
  }),
}), createCard);

router.get('/', getCards);

router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex().required(),
  }),
}), likeCard);

router.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex().required(),
  }),
}), dislikeCard);

router.delete('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().length(24).hex().required(),
  }),
}), deleteCard);

module.exports = router;
