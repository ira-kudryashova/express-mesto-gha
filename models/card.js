const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const validator = require('validator');

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
      required: [true, 'Поле "link" должно быть заполнено'],
      validate: {
        validator: (url) => validator.isURL(url),
        message: 'Ссылка некорректна',
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Поле "owner" должно быть заполнено'],
    },
    likes: [
      {
        /** список тех? кто лайкнул карточку */
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        /** по дефолту пустой массив */
        default: [],
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
);

const Card = mongoose.model('card', cardSchema);
module.exports = Card;
// module.exports = mongoose.model('card', cardSchema);
