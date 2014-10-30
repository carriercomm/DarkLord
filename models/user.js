var emailValidator = require('./validators/email.validator');
var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	created: { type: Date, default: new Date(), required: true },
	email: { type: String, trim: true, unique: true, required: true, validate: emailValidator },
	active: { type: Boolean, default: true },
	forgotPasswordToken: { type: Schema.Types.ObjectId, turnOn: false },
	forgotPasswordExpires: Date,
	verified: { type: Boolean, default: false },
	verifyToken: { type: Schema.Types.ObjectId, turnOn: false }
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });


module.exports = mongoose.model('User', userSchema);