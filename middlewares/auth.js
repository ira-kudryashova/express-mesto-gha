// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
// eslint-disable-next-line import/no-unresolved
const { UnauthorizedError } = require('../errors/UnauthorizedError');
/** генерация сикрет-ключа из терминала через */
/** node -e "console.log(require('crypto').randomBytes(32).toString('hex'));" */
const SECRET_KEY = '4d0923c9e302fb1d40300635ce23d5ee4fe5d22dda4bb34221aad7f1964f412b';

module.exports = (req, _, next) => {
  const { authorization } = req.headers;
  const bearer = 'Bearer ';
  const errorMsg = 'Неправильные почта или пароль';

  if (!authorization || !authorization.startsWith(bearer)) {
    return next(new UnauthorizedError(`${errorMsg}(${authorization})!`));
  }

  const token = authorization.replace(bearer, '');
  let payload;
  try {
    payload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return next(new UnauthorizedError(`${errorMsg}!`));
  }
  req.user = payload;
  return next();
};
