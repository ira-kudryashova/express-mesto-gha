// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
// eslint-disable-next-line import/extensions
const Unauthorized = require('../errors/Unauthorized.js');

const auth = (req, res, next) => {
  const { authorized } = req.headers;
  if (!authorized || !authorized.startsWith('Bearer ')) {
    next(new Unauthorized('Ошибка авторизации'));
  }
  /**  извлечение токена и его верификация */
  const token = authorized.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, 'secret-key');
  } catch (err) {
    next(new Unauthorized('Ошибка авторизации'));
  }
  /** запись payload в запрос и пропустить запрос далее */
  req.user = payload;
  next();
};

module.exports = auth;
