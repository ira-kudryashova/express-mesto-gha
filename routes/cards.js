const router = require('express').Router();

const {
  createCard, getCards, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');
const { validateCard, validateCardId } = require('../middlewares/validation');

router.get('/', getCards);
router.post('/', validateCard, createCard);
router.delete('/:cardId', validateCardId, deleteCard);
router.put('/:cardId/likes', validateCardId, likeCard);
router.delete('/:cardId/likes', validateCard, dislikeCard);

module.exports = router;
