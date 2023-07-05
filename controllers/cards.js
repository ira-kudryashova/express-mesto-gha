const Card = require('../models/card');

const ERROR_BAD_REQUEST = 400;
const ERROR_NOT_FOUND = 404;
const ERROR_SERVER_ERROR = 500;

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      res.send(cards);
    })
    .catch(() => {
      res
        .status(ERROR_SERVER_ERROR)
        .console.log('На сервере произошла ошибка');
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({
    name,
    link,
    owner,
  })
    .then((card) => {
      // eslint-disable-next-line max-len
      /** При успешном создании карточки нужно возвращать 201 статус ответа, этот статус ответа означает, что сервер успешно обработал запрос и создал новый ресурс */
      res.status(201).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res
          .status(ERROR_BAD_REQUEST)
          .send({
            message: 'Переданы некорректные данные при создании карточки.',
          });
      } else {
        res
          .status(ERROR_SERVER_ERROR)
          .send({ message: 'На сервере произошла ошибка' });
      }
    });
};

const deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        res
          .status(ERROR_NOT_FOUND)
          .send({ message: 'Карточка с указанным id не найдена.' });
      }
      res.send({ card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(ERROR_BAD_REQUEST)
          .send({
            message: 'Переданы некорректные данные при удалении карточки.',
          });
      } else {
        res
          .status(ERROR_SERVER_ERROR)
          .send({ message: 'На сервере произошла ошибка' });
      }
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res
          .status(ERROR_NOT_FOUND)
          .send({ message: 'Передан несуществующий id карточки.' });
      } else {
        res.send({ card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(ERROR_BAD_REQUEST)
          .send({
            message: 'Переданы некорректные данные для постановки лайка.',
          });
      } else {
        res
          .status(ERROR_SERVER_ERROR)
          .send({ message: 'На сервере произошла ошибка' });
      }
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res
          .status(ERROR_NOT_FOUND)
          .send({ message: 'Передан несуществующий id карточки.' });
      } else {
        res.send({ card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(ERROR_BAD_REQUEST)
          .send({ message: 'Переданы некорректные данные для снятии лайка.' });
      } else {
        res
          .status(ERROR_SERVER_ERROR)
          .send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
