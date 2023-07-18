// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcrypt'); /** для хеширования пароля */
// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');

/** GET-запрос. Получить всех пользователей  */
const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

/** GET-запрос. Получить всех пользователей  */
const getUser = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((user) => {
      res.send({ data: user });
    })
    .catch(next);
};

/** GET-запрос. Получить всех пользователей по id */
const getUserById = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((users) => {
      if (!users) {
        next(new NotFoundError('Пользователь не найден'));
      }
      return res.send({ data: users });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

/** POST-запрос. Создать нового пользователя  */
const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    })
      .then((data) => res.status(201).send({
        name: data.name, about: data.about, avatar: data.avatar, email: data.email,
      }))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError('Переданы некорректные данные'));
        } else if (err.code === 11000) {
          next(new ConflictError('Пользователь с такими данными существует'));
        } else {
          next(err);
        }
      }));
};

/** обновить данных пользователя */
const updateUser = (req, res, next) => {
  const userId = req.user._id;
  const { name, about } = req.body;
  User.findByIdAndUpdate(userId, { name, about }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!userId) {
        next(new NotFoundError('Пользователь не найден.'));
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

/** PATCH-запрос /users/me/avatar. Обновить аватар пользователя */
const updateAvatar = (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(userId, { avatar }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!userId) {
        next(new NotFoundError('Пользователь не найден.'));
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

/** контроллер login, который получает из запроса почту и пароль и проверяет их */
const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'secret-key', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(next);
};

// const login = (req, res, next) => {
//   const { email, password } = req.body;
//   let data;

//   User.findOne({ email }).select('+password')
//     .then((user) => {
//       if (!user) throw new Unauthorized('Ошибка авторизации');
//       data = user;
//       return bcrypt.compare(password, data.password);
//     })
//     .then((isValidPassword) => {
//       if (!isValidPassword) throw new Unauthorized('Ошибка авторизации');
//       const token = jwt.sign(
//         { _id: data._id },
//         'secret-key',
//         { expiresIn: '7d' },
//       );
//       return res.status(200).send({ token });
//     })
//     .catch((err) => next(err));
// };

module.exports = {
  getUsers,
  getUser,
  getUserById,
  createUser,
  updateUser,
  updateAvatar,
  login,
};
