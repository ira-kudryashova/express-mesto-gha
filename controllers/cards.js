const Card = require('../models/card');
const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');
const NotFound = require('../errors/NotFound');

// const ERROR_BAD_REQUEST = 400;
// const ERROR_NOT_FOUND = 404;
// const ERROR_SERVER_ERROR = 500;

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      res.send(cards);
    })
    // .catch(() => {
    //   res
    //     .status(ERROR_SERVER_ERROR)
    //     .console.log('На сервере произошла ошибка');
    // });
    .catch(next);
};

const createCard = (req, res, next) => {
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
        next(new BadRequest('Некоррестные данные создания карточки'));
      } else {
        next(err);
      }
    });
};

const deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  const { _id } = req.user;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFound('Карточка не найдена');
      }
      if (card.owner.valueOf() !== _id) {
        throw new Forbidden('Айяйяй! Чужую карточку удалить нельзя');
      }
      Card.findByIdAndRemove(cardId)
        .then((deletedCard) => res.status(200).send(deletedCard))
        .catch(next);
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  const cardId = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true, runValidators: true },
  )
    .orFail(() => {
      throw new NotFound(`Карточка: ${cardId} не найдена`);
    })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BadRequest(`Карточка: ${cardId} не найдена`));
      } else if (err.name === 'NotFound') {
        next(new NotFound(`Карточка: ${cardId} не найдена`));
      } else {
        next(err);
      }
    });
};

const dislikeCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } },
    { new: true, runValidators: true },
  )
    .orFail(() => {
      throw new NotFound(`Карточка: ${cardId} не найдена`);
    })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest(`Карточка: ${cardId} не найдена`));
      } else if (err.name === 'NotFound') {
        next(new NotFound(`Карточка: ${cardId} не найдена`));
      } else {
        next(err);
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
