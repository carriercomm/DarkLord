var validate = require('mongoose-validator');

var usernameValidator = [
  validate({
  	validator: 'isLength',
  	arguments: [3],
  	message: 'Username should be at least 3 characters long'
  })
];


module.exports = usernameValidator;