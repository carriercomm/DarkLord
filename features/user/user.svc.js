var Deferred = require('../../utils/deferred');
var User = require('../../models/user');

function getByEmail(email) {
	'use strict';

	var deferred = new Deferred();
	User.findOne({ email: email }, function (err, user) {
		if (err) {
			deferred.internalServerError(err);
		} else if (!user) {
			deferred.notFound();
		} else {
			deferred.success(user);
		}
	});

	return deferred.promise;
}

function getByPasswordToken(token) {
	'use strict';

	var deferred = new Deferred();
	User.findOne({
		forgotPasswordToken: token
	}, function (err, user) {
		if (err) {
			deferred.internalServerError(err);
		} else if (!user) {
			deferred.notFound();
		} else {
			if (user.forgotPasswordExpires > Date.now()) {
				deferred.success(user);
			} else {
				deferred.gone();
			}
		}
	});

	return deferred.promise;
}

function getByVerifyToken(token) {
	'use strict';

	var deferred = new Deferred();
	User.findOne({
		verifyToken: token
	}, function (err, user) {
		if (err) {
			deferred.internalServerError(err);
		} else if (!user) {
			deferred.notFound();
		} else {
			deferred.success(user);
		}
	});

	return deferred.promise;
}

module.exports = {
	getByEmail: getByEmail,
	getByPasswordToken: getByPasswordToken,
	getByVerifyToken: getByVerifyToken
};
