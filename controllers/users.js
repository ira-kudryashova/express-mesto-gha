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
  User.find({})
    .then((users) => res.send({ users }))
    .catch(next);
};

/** GET-запрос. Получить всех пользователей по id */
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
        next(new BadRequest('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
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

/** POST-запрос. Создать нового пользователя  */
const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  return bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then(() => res.status(201).send({ message: 'Пользователь зарегистрирован' }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные'));
      } else if (err.code === 11000) {
        next(new Conflict('Пользователь не найден'));
      } else {
        next(err);
      }
    });
};

/** обновить данных пользователя */
const updateUser = (req, res, next) => {
  const userId = req.user._id;
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    userId,
    { name, about },
    { new: true, runValidators: true },
  )
    // .orFail(() => next(new NotFound('NotFound')))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Не удалось обновить профиль'));
      } else {
        next(err);
      }
    });
};

/** PATCH-запрос /users/me/avatar. Обновить аватар пользователя */
const updateUserAvatar = (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    userId,
    { avatar },
    { new: true, runValidators: true },
  )
    // .orFail(() => {
    //   throw new NotFound('Пользователь с такими данными не найден');
    // })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Не удалось обновить аватар'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  let data;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) throw new Unauthorized('Ошибка авторизации');
      data = user;
      return bcrypt.compare(password, data.password);
    })
    .then((matched) => {
      if (!matched) throw new Unauthorized('Ошибка авторизации');
      const token = jwt.sign({ _id: data._id }, 'secret-key', { expiresIn: '10d' });
      return res.status(200).send({ token });
    })
    .catch((err) => next(err));
};

module.exports = {
  getUsers,
  getUserById,
  getUserInfo,
  createUser,
  updateUser,
  updateUserAvatar,
  login,
};
