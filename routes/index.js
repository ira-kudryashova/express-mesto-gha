const router = require('express').Router();

const usersRouter = require('./users');
const cardsRouter = require('./cards');
const { createUser, login } = require('../controllers/users');
const auth = require('../middlewares/auth');
const NotFound = require('../errors/NotFound');
const { validateAuth, validateReg } = require('../middlewares/validation');

router.use('/cards', cardsRouter);
router.use('/users', usersRouter);

router.use(auth);

router.post('/signup', validateReg, createUser);
router.post('/signin', validateAuth, login);

router.use(() => {
  throw new NotFound('Страница не найдена');
});

module.exports = router;
