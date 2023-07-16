const router = require('express').Router();

const {
  getUsers,
  getUserById,
  updateUser,
  updateUserAvatar,
} = require('../controllers/users');

// const { validateUser, validateUserId, validateAvatar } = require('../middlewares/validation');

router.get('/', getUsers);
router.get('/me', getUserById);
router.get('/:id', getUserById);
router.patch('/me', updateUser);
router.patch('/me/avatar', updateUserAvatar);

module.exports = router;
