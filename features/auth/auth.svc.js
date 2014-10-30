var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('jwt-simple');
var Deferred = require('../../utils/deferred');
var databaseSvc = require('../../utils/database.svc');
var User = require('../../models/user');
var userSvc = require('../user/user.svc');
var secret = require('./secret.json');

module.exports = function () {
	'use strict';

	function register(req, res) {
		var user = new User({
			email: req.body.email
		});
		User.register(user, req.body.password, function (err) {
			if (err) {
				res.status(400).send({ error: err });
			} else {
				authenticate(req, res);
			}
		});
	}

	function authenticate(req, res) {
		passport.authenticate('local', { session: false }, function (err, user, info) {
			if (err) {
				res.status(500).send(err);
			} else if (!user) {
				res.status(401).end();
			} else {
				// When to refresh the token
				var refreshDate = new Date();
				refreshDate.setMinutes(refreshDate.getMinutes() + 15);

				// When to force a new manual login
				var expiryDate = new Date();
				expiryDate.setDate(expiryDate.getDate() + 5);

				// Encode the user information
				var token = jwt.encode({
					id: user._id,
					email: user.email,
					verified: user.verified,
					active: user.active,
					refresh: refreshDate,
					expires: expiryDate
				}, secret.value);
				res.status(200).send({
					token: token,
					refresh: refreshDate,
					expires: expiryDate
				});
			}
		})(req, res);
	}

	function isAuthenticated(req, res, next) {
		// If no token then not authenticated
		if (!req.token) {
			return res.status(401).end();
		} else {
			req.token = req.token.replace(/^bearer /i, '');
		}

		// Decode the user information	
		var user;
		try {
			user = jwt.decode(req.token, secret.value);
		} catch (e) {
			return res.status(401).end();
		}
		// Check expiry date
		var expiryDate = new Date(user.expires);
		if (expiryDate <= new Date()) {
			return res.status(401).end();
		}

		// Token still in date, get user by id
		databaseSvc(User)
			.getById(user.id)
			.then(function (result) {
				var user = result.data;
				req.user = user;
				next();
			}, function () {
				res.status(401).end();
			});
	}

	// Generate forgotten password token, then send link in email
	function forgotPassword(req) {
		var deferred = new Deferred();
		userSvc
			.getByEmail(req.body.email)
			.then(function (result) {
				var user = result.data;
				user.forgotPasswordToken = new mongoose.Types.ObjectId;
				user.forgotPasswordExpires = Date.now() + 3600000; // an hour from now
				user.save(function (err, user) {
					if (err) {
						deferred.internalServerError(err);
					} else {
						// TODO: Login link email which user clicks to login
						deferred.success(user);
					}
				});
			}, deferred.reject);

		return deferred.promise;
	}

	// Check validity of forgotten password token and set new password
	function resetPassword(req) {
		var deferred = new Deferred();
		userSvc
			.getByPasswordToken(req.params.token)
			.then(function (result) {
				var user = result.data;
				user.setPassword(req.body.password, function (err, user) {
					if (err) {
						deferred.badRequest(err);
					} else {
						user.forgotPasswordToken = undefined;
						user.forgotPasswordExpires = undefined;
						user.save(function (err, user) {
							if (err) {
								deferred.badRequest(err);
							} else {
								// TODO: Send password has changed notifcation email
								deferred.success();
							}
						});
					}
				});
			}, deferred.reject);

		return deferred.promise;
	}

	function changePassword(req) {
		var deferred = new Deferred();
		var user = req.user;
		user.setPassword(req.body.password, function (err, user) {
			if (err) {
				deferred.badRequest(err);
			} else {
				user.forgotPasswordToken = undefined;
				user.forgotPasswordExpires = undefined;
				user.save(function (err) {
					if (err) {
						deferred.badRequest(err);
					} else {
						// TODO: Send password has changed notifcation email
						deferred.success();
					}
				});
			}
		});

		return deferred.promise;
	}

	return {
		register: register,
		authenticate: authenticate,
		isAuthenticated: isAuthenticated,
		forgotPassword: forgotPassword,
		resetPassword: resetPassword,
		changePassword: changePassword
	}
};