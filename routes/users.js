const router = require('express').Router();
// eslint-disable-next-line no-unused-vars, import/no-extraneous-dependencies
const { celebrate, Joi } = require('celebrate');

/** регулярное выражение для проверки адресов и почты */
const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const {
  getUsers,
  getUserById,
  getCurrentUserInfo,
  updateUser,
  updateUserAvatar,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getCurrentUserInfo);

router.get('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().length(24).hex().required(),
  }),
}), getUserById);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateUser);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(URL_REGEX),
  }),
}), updateUserAvatar);

module.exports = router;
