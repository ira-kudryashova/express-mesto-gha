// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcrypt'); /** для хеширования пароля */
// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const BadRequest = require('../errors/BadRequest');
const Conflict = require('../errors/Conflict');
const NotFound = require('../errors/NotFound');
const Unauthorized = require('../errors/Unauthorized');

/** GET-запрос. Получить всех пользователей  */
const getUsers = (req, res, next) => {
  User
    .find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

/** GET-запрос. Получить всех пользователей по id */
const getUserById = (req, res, next) => {
  User
    .findById(req.params.userId ? req.params.userId : req.user._id)
    .orFail(() => next(new NotFound('NotFound')))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequest('Переданы некорректные данные'));
      }
      return next(err);
    });
};

/** POST-запрос. Создать нового пользователя  */
const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  return bcrypt.hash(password, 10) // хэш пароля
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then(() => res.status(201).send({ message: 'Пользователь успешно зарегистрирован' }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные'));
      } else if (err.code === 11000) {
        next(new Conflict('Пользователь с такими данными уже сущетсвует'));
      } else {
        next(err);
      }
    });
};

/** обновить данных пользователя */
const updateUser = (req, res, next) => {
  const userId = req.user._id;
  const { name, about } = req.body;
  User
    .findByIdAndUpdate(
      userId,
      { name, about },
      { new: true, runValidators: true },
    )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Невозможно обновить профиль'));
      } else {
        next(err);
      }
    });
};

/** PATCH-запрос /users/me/avatar. Обновить аватар пользователя */
const updateUserAvatar = (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  User
    .findByIdAndUpdate(
      userId,
      { avatar },
      { new: true, runValidators: true },
    )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Невозможно обновить аватар'));
      } else {
        next(err);
      }
    });
};

/** контроллер login, который получает из запроса почту и пароль и проверяет их */
const login = (req, res, next) => {
  const { email, password } = req.body;
  let data;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) throw new Unauthorized('Ошибка авторизации');
      data = user;
      return bcrypt.compare(password, data.password);
    })
    .then((isValidPassword) => {
      if (!isValidPassword) throw new Unauthorized('Ошибка авторизации');
      const token = jwt.sign(
        { _id: data._id },
        'secret-key',
        { expiresIn: '7d' },
      );
      return res.status(200).send({ token });
    })
    .catch((err) => next(err));
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserAvatar,
  login,
};
