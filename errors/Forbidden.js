class Forbidden extends Error {
  constructor(message) {
    super();
    this.name = this.constructor.name;
    this.message = message;
    this.status = 403;
  }
}

module.exports = Forbidden;
