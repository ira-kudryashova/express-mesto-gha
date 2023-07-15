// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcrypt'); /** для хеширования пароля */
// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const BadRequest = require('../errors/BadRequest');
const Conflict = require('../errors/Conflict');
const NotFound = require('../errors/NotFound');

/** при GET-запросе на URL /users  */
const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

const getUserInfo = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        next(new NotFound('Пользователь не найден'));
      } else {
        res.send({
          _id: user._id,
          name: user.name,
          about: user.about,
          avatar: user.avatar,
          email: user.email,
        });
      }
    })
    .catch((err) => next(err));
};

/** GET-запрос /users/:id */
const getUserById = (req, res, next) => {
  /** доступк параметрам */
  const { id } = req.params;
  User.findById(id)
    .then((user) => {
      if (!user) {
        next(new NotFound('Пользователь не найден'));
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Некорректный id пользователя'));
      } else {
        next(err);
      }
    });
};

/** POST-запрос /users  */
const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  return bcrypt
    .hash(password, 8)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then(() => res
      .status(201)
      .send({ message: `Пользователь с ${email} успешно зарегистрирован` }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные'));
      } else if (err.code === 11000) {
        next(new Conflict('Пользователь с такими данными уже зарегистрирован'));
      } else {
        next(err);
      }
    });
};

/** обновление данных пользователя */
const updateUser = (req, res, next) => {
  // eslint-disable-next-line no-underscore-dangle
  const userId = req.user._id;
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    userId,
    { name, about },
    { new: true, runValidators: true },
  )
    .orFail(() => next(new NotFound('NotFound')))
    .then((user) => res.send({ user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequest('Не удалось обновить профиль'));
      }
      return next(err);
    });
};

/** PATCH-запрос /users/me/avatar */
const updateUserAvatar = (req, res, next) => {
  // eslint-disable-next-line no-underscore-dangle
  const userId = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .orFail(() => {
      throw new NotFound('Пользователь с такими данными не найден');
    })
    .then((user) => res.send({ user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequest('Не удалось обновить аватар'));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User
    .findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'super-strong-secret', {
        expiresIn: '7d',
      });
      res.send({ token });
    })
    .catch(next);
};

module.exports = {
  getUsers,
  getUserInfo,
  getUserById,
  createUser,
  updateUser,
  updateUserAvatar,
  login,
};
