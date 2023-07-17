const Card = require('../models/card');
const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');
const NotFound = require('../errors/NotFound');

/** получить все карточки */
const getCards = (req, res, next) => {
  Card
    .find({})
    .then((cards) => {
      res.send(cards);
    })
    .catch(next);
};

/** создать новую карточку */
const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card
    .create({
      name,
      link,
      owner,
    })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest(
          'Невозможно создать новую карточку',
        ));
      } else {
        next(err);
      }
    });
};

/** удалить карточку */
const deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findById(cardId)
    .orFail(() => {
      throw new NotFound('Карточка не найдена');
    })
    .then((card) => {
      if (card.owner.toString() === req.user._id) {
        Card.deleteOne(card).then(() => res.send(card));
      } else {
        throw new Forbidden('Нельзя удалять чужие карточки');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest(
          'Переданы некорректные данные',
        ));
      } else if (err.name === 'NotFoundError') {
        next(new NotFound('Карточка не найдена'));
      } else {
        next(err);
      }
    });
};

/** лайк карточки */
const likeCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true, runValidators: true },
  )
    .orFail(() => {
      throw new NotFound('Карточка не найдена');
    })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BadRequest(
          'Переданы некорректные данные',
        ));
      } else if (err.name === 'NotFoundError') {
        next(new NotFound('Карточка не найдена'));
      } else {
        next(err);
      }
    });
};

/** дизоайк карточки */
const dislikeCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } },
    { new: true, runValidators: true },
  )
    .orFail(() => {
      throw new NotFound('Карточка не найдена');
    })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest(
          'Переданы некорректные данные',
        ));
      } else if (err.name === 'NotFoundError') {
        next(new NotFound('Карточка не найдена'));
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
