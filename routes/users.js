const router = require('express').Router();

const {
  getUsers,
  getUser,
  getUserById,
  updateUser,
  updateAvatar,
} = require('../controllers/users');

const { validateUser, validateUserId, validateAvatar } = require('../middlewares/validation');

router.get('/', getUsers);
router.get('/me', getUser);
// router.get('/me', getUserById);
router.get('/:id', validateUserId, getUserById);
router.patch('/me', validateUser, updateUser);
router.patch('/me/avatar', validateAvatar, updateAvatar);

module.exports = router;
