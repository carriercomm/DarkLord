var validate = require('mongoose-validator');

var emailValidator = [
  validate({
  	validator: 'isEmail',
  	passIfEmpty: true,
  	message: 'Email address is invalid'
  })
];


module.exports = emailValidator;