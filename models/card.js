const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const validator = require('validator');
const user = require('./user');

const cardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Поле "name" должно быть заполнено'],
      minlength: [2, 'Минимальная длина поля "name" - 2'],
      maxlength: [30, 'Максимальная длина поля "name" - 30'],
    },
    link: {
      type: String,
      required: true,
      validate: {
        validator: (url) => validator.isURL(url),
        message: 'Некорректная ссылка',
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: user,
      required: true,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      default: [],
      ref: user,
    }],
    createdAt: {
      type: Date,
      default: new Date(Date.now()),
    },
  },
  { versionKey: false },
);

module.exports = mongoose.model('card', cardSchema);
