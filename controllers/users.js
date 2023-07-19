// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcrypt'); /** для хеширования пароля */
// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');
const UnauthorizedError = require('../errors/UnauthorizedError');

/** генерация сикрет-ключа из терминала через */
/** node -e "console.log(require('crypto').randomBytes(32).toString('hex'));" */
const SECRET_KEY = '4d0923c9e302fb1d40300635ce23d5ee4fe5d22dda4bb34221aad7f1964f412b';

/** GET-запрос. Получить всех пользователей  */
const getUsers = (req, res, next) => {
  User
    .find({})
    .then((users) => res.send(users))
    .catch(next);
};

/** GET-запрос. Получить всех пользователей по id */
function getUserById(req, res, next) {
  const { id } = req.params;
  User.findById(id)
    .then((user) => {
      if (user) return res.send({ user });

      throw new NotFoundError('Пользователь с таким id не найден');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Передан некорректный id'));
      } else {
        next(err);
      }
    });
}

/** GET-запрос. Получить пользователя по адресу /me */
function getCurrentUserInfo(req, res, next) {
  const { userId } = req.user;

  User.findById(userId)
    .then((user) => {
      if (user) return res.send({ user });

      throw new NotFoundError('Пользователь с таким id не найден');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Передан некорректный id'));
      } else {
        next(err);
      }
    });
}

/** POST-запрос. Создать нового пользователя  */
const createUser = (req, res, next) => {
  const {
    name, about, avatar, password, email,
  } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      password: hash,
      email,
    }))
    .then((user) => {
      const { _id } = user;
      return res.status(201).send({
        name,
        _id,
        about,
        avatar,
        email,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(
          new ConflictError(
            'Пользователь уже зарегистрирован',
          ),
        );
      } else if (err.name === 'ValidationError') {
        next(
          new BadRequestError(
            'Переданы некорректные данные',
          ),
        );
      } else {
        next(err);
      }
    });
};

/** обновить данных пользователя */
function updateUser(req, res, next) {
  const { name, about } = req.body;
  const { userId } = req.user;

  User.findByIdAndUpdate(
    userId,
    {
      name,
      about,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (user) return res.send({ user });

      throw new NotFoundError('Пользователь не найден');
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(
          new BadRequestError(
            'Переданы некорректные данные',
          ),
        );
      } else {
        next(err);
      }
    });
}

/** PATCH-запрос /users/me/avatar. Обновить аватар пользователя */
function updateUserAvatar(req, res, next) {
  const { avatar } = req.body;
  const { userId } = req.user;

  User.findByIdAndUpdate(
    userId,
    {
      avatar,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (user) return res.send({ user });

      throw new NotFoundError('Пользователь с таким id не найден');
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(
          new BadRequestError(
            'Переданы некорректные данные при обновлении профиля пользователя',
          ),
        );
      } else {
        next(err);
      }
    });
}

/** контроллер login, который получает из запроса почту и пароль и проверяет их */
function login(req, res, next) {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then(({ _id: userId }) => {
      if (userId) {
        const token = jwt.sign({ userId }, SECRET_KEY, { expiresIn: '7d' });

        return res.send({ _id: token });
      }

      throw new UnauthorizedError('Неправильные почта или пароль');
    })
    .catch(next);
}

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
  getUserById,
  getCurrentUserInfo,
  createUser,
  updateUser,
  updateUserAvatar,
  login,
};
