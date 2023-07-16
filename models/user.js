const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Поле "name" должно быть заполнено'],
      minlength: [2, 'Минимальная длина поля "name" - 2'],
      maxlength: [30, 'Максимальная длина поля "name" - 30'],
      default: 'Жак-Ив Кусто',
    },
    about: {
      type: String,
      required: [true, 'Поле "about" должно быть заполнено'],
      minlength: [2, 'Минимальная длина поля "about" - 2'],
      maxlength: [30, 'Максимальная длина поля "about" - 30'],
      default: 'Исследователь',
    },
    avatar: {
      type: String,
      required: true,
      default:
        'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
      validate: {
        validator: (url) => validator.isURL(url),
        message: 'Ссылка некорректна',
      },
    },
    email: {
      type: String,
      required: true,
      /** почта должна быть уникальной */
      unique: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: 'Некорректный формат электронной почты',
      },
    },
    password: {
      type: String,
      required: true,
      /** чтобы хеш пароля не возвращался из базы */
      select: false,
    },
  },
  { versionKey: false },
);

// const User = mongoose.model('user', userSchema);
// module.exports = User;
module.exports = mongoose.model('user', userSchema);
