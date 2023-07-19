const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');

/** получение информации о карточках */
const getCards = (_, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => {
      res.send({ data: cards });
    })
    .catch(next);
};

/** создание новой карточки */
const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const { userId } = req.user;
  Card.create({
    name,
    link,
    owner: userId,
  })
    .then((card) => {
      res.status(201).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

/** удаление карточки */
const deleteCard = (req, res, next) => {
  const { id: cardId } = req.params;
  const { userId } = req.user;

  Card.findById({ _id: cardId })
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Данные не найдены');
      }

      const { owner: cardOwnerId } = card;

      if (cardOwnerId.valueOf() !== userId) {
        throw new ForbiddenError('Недостаточно прав доступа');
      }

      return Card.findByIdAndDelete(cardId);
    })
    .then((deletedCard) => {
      if (!deletedCard) {
        throw new NotFoundError('Карточка уже удалена');
      }

      res.send({ data: deletedCard });
    })
    .catch(next);
};

/** лайк карточки */
const likeCard = (req, res, next) => {
  const { cardId } = req.params;
  const { userId } = req.user;

  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: userId } },
    { new: true, runValidators: true },
  )
    .then((card) => {
      if (card) return res.send({ data: card });
      throw new NotFoundError('Карточка не найдена');
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

/** дизлайк карточки */
const dislikeCard = (req, res, next) => {
  const { cardId } = req.params;
  const { userId } = req.user;

  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: userId } },
    { new: true, runValidators: true },
  )
    .then((card) => {
      if (card) return res.send({ data: card });
      throw new NotFoundError('Данные не найдены');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные'));
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
