function NoSuchComponentPoolException(message) {
  this.name = "NoSuchComponentPoolException";
  this.message = message;
}

NoSuchComponentPoolException.prototype = Error.prototype;

module.exports = NoSuchComponentPoolException;
