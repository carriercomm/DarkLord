var validate = require('mongoose-validator');

var passwordValidator = [
  validate({
  	validator: 'isLength',
  	arguments: [6],
  	message: 'Password should be at least 6 characters long'
  })
];


module.exports = passwordValidator;