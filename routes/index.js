const router = require('express').Router();
// eslint-disable-next-line no-unused-vars, import/no-extraneous-dependencies
const { celebrate, Joi } = require('celebrate');

/** регулярное выражение для проверки адресов и почты */
const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

// const usersRouter = require('./users');
// const cardsRouter = require('./cards');
// const auth = require('../middlewares/auth');
const { createUser, login } = require('../controllers/users');
// const { validateAuth, validateReg } = require('../middlewares/validation');
// const NotFoundError = require('../errors/NotFoundError');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),
}), login);
router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(URL_REGEX),
  }),
}), createUser);

// router.use(auth);

// router.use('/cards', cardsRouter);
// router.use('/users', usersRouter);

// router.use(() => {
//   throw new NotFoundError('Страница не найдена');
// });

module.exports = router;
