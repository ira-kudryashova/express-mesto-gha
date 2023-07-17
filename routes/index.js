const router = require('express').Router();

const usersRouter = require('./users');
const cardsRouter = require('./cards');
const auth = require('../middlewares/auth');
const { createUser, login } = require('../controllers/users');
const { validateAuth, validateReg } = require('../middlewares/validation');
const NotFoundError = require('../errors/NotFoundError');

router.post('/signup', validateReg, createUser);
router.post('/signin', validateAuth, login);

router.use(auth);

router.use('/cards', cardsRouter);
router.use('/users', usersRouter);

router.use(() => {
  throw new NotFoundError('Страница не найдена');
});

module.exports = router;
