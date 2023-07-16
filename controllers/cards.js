const Card = require('../models/card');
const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');
const NotFound = require('../errors/NotFound');

/** получить все карточки */
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

/** создать карточку по id */
const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({
    name,
    link,
    owner,
  })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Невозможно создать новую карточку'));
      } else {
        next(err);
      }
    });
};

/** удалить карточку */
const deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  // const { _id } = req.user;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFound('Карточка не найдена');
      }
      if (req.user._id === card.owner.toString()) {
        return card.deleteOne();
      }
      throw new Forbidden('Нельзя удалять чужие карточки');
    })
    .then((removedCard) => res.send(removedCard))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Некорректные данные'));
      } else {
        next(err);
      }
    });
};

/** лайк карточки */
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

/** дизлайк карточки */
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
