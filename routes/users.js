const router = require('express').Router();

const {
  createUser, getUsers, getUserInfo, getUserById, updateUser, updateUserAvatar,
} = require('../controllers/users');
const { validateUser, validateUserId, validateAvatar } = require('../middlewares/validation');

router.post('/', createUser);
router.get('/me', getUserInfo);
router.get('/', getUsers);
router.get('/:id', validateUserId, getUserById);
router.patch('/me', validateUser, updateUser);
router.patch('/me/avatar', validateAvatar, updateUserAvatar);

module.exports = router;
