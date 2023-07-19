/** генерация сикрет-ключа в терминале через
 * node -e "console.log(require('crypto').randomBytes(32).toString('hex'));" */

const SECRET_KEY = '4d0923c9e302fb1d40300635ce23d5ee4fe5d22dda4bb34221aad7f1964f412b';

/** регулярное выражение */
const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const CREATED_STATUS = 201;

module.exports = {
  SECRET_KEY,
  URL_REGEX,
  CREATED_STATUS,

};
