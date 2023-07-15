const router = require('express').Router();

const {
  getUsers, getUserInfo, getUserById, updateUser, updateUserAvatar,
} = require('../controllers/users');
const { validateUser, validateUserId, validateAvatar } = require('../middlewares/validation');

router.get('/', getUsers);
router.get('/me', getUserInfo);
router.get('/:id', validateUserId, getUserById);
router.patch('/me', validateUser, updateUser);
router.patch('/me/avatar', validateAvatar, updateUserAvatar);

module.exports = router;
