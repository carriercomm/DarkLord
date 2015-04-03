var Cookies = require('cookies');
var passport = require('passport');
var jwt = require('jwt-simple');
var uuid = require('node-uuid');
var deferred = require('deferred-http-statuses');
var EventEmitter = require("events").EventEmitter;

module.exports = function (opts) {
	'use strict';

	/*
	 * Defaults
	 */
	var User = opts.user || require('./models/user');
	var databaseSvc = opts.databaseSvc || require('./database.svc.mongoose.js')(User);
	var secret = opts.secret || process.env.JWT_SECRET;
	var activateCookie = opts.cookie || false;
	var cookiekKeys = require("keygrip")([secret]);

	// Let's assume passport is used always
	passport.use(User.createStrategy());
	passport.serializeUser(User.serializeUser());
	passport.deserializeUser(User.deserializeUser());

	var emitter = new EventEmitter();

	function register(req, res, next) {
		User.register({
			email: req.body.email,
			verifyToken: uuid.v4()
		}, req.body.password, function (err, user) {
			console.log('ok', err);
			if (err) {
				res.status(400).send({ error: err });
			} else {
				// User created
				emitter.emit('registered', user);
				authenticate(req, res, next);
			}
		});
	}

	function authenticate(req, res, next) {
		passport.authenticate('local', { session: false }, function (err, user) {
			if (err) {
				res.status(500).send(err);
			} else if (!user) {
				res.status(401).end();
			} else {
				emitter.emit('authenticated', user);
				res.status(200).send(generateToken(req, res, user));
			}
		})(req, res, next);
	}

	function hasAccess(req, res) {
		return deferred(function (resolve, reject, promise) {
			// Get token from authorization header or cookie fallback
			var cookies = new Cookies(req, res, cookiekKeys);
			req.token = req.headers.authorization || cookies.get('darklord', { signed: true });

			// If no token then not authenticated
			if (!req.token) {
				promise.reject();
			} else {
				req.token = req.token.replace(/^bearer /i, '');

				// Decode the user information
				var user;
				try {
					user = jwt.decode(req.token, secret);

					// Check expiry date
					var expiryDate = new Date(user.expires);
					if (expiryDate <= new Date()) {
						promise.reject();
					} else {

						// Token still in date, get user by id
						databaseSvc
							.findOne({ _id: user.id })
							.then(function (result) {
								req.user = result.data;
								promise.resolve();
							}, function () {
								promise.reject();
							});
					}
				} catch (e) {
					promise.reject();
				}
			}
		});
	}

	function isAuthenticated(req, res, next) {
		hasAccess(req, res).then(function () {
			// Has access and req.user has been set
			next();
		}, function () {
			// Does not have access
			res.status(401).end();
		});
	}

	function extendToken(req, res) {
		if (!req.user) {
			return res.status(401).end();
		}
		res.status(200).send(generateToken(req, res, req.user));
	}

	// Check validity of verify token and set verified flag
	function verifyEmail(req) {
		return deferred(function (resolve, reject, promise) {
			databaseSvc
				.findOne({ verifyToken: req.params.token })
				.then(function (result) {
					var user = result.data;
					user.verified = true;
					user.verifyToken = undefined;
					user.save(function (err) {
						if (err) {
							reject.badRequest(err);
						} else {
							resolve.success();
						}
					});
				}, promise.reject);
		});
	}

	// Generate forgotten password token, then send link in email
	function forgotPassword(req) {
		return deferred(function (resolve, reject, promise) {
			databaseSvc
				.findOne({ email: req.body.email })
				.then(function (result) {
					var user = result.data;
					user.forgotPasswordToken = uuid.v4();
					user.forgotPasswordExpires = Date.now() + 3600000; // an hour from now
					user.save(function (err) {
						if (err) {
							reject.internalServerError(err);
						} else {
							emitter.emit('forgotpassword', user);
							resolve.success();
						}
					});
				}, promise.reject);
		});
	}

	// Check validity of forgotten password token and set new password
	function resetPassword(req) {
		return deferred(function (resolve, reject, promise) {
			databaseSvc
				.findOne({ forgotPasswordToken: req.body.token })
				.then(function (result) {
					var user = result.data;
					if (Date.now() > user.forgotPasswordExpires) {
						reject.gone();
					} else {
						user.setPassword(req.body.password, function (err, user) {
							if (err) {
								reject.badRequest(err);
							} else {
								user.forgotPasswordToken = undefined;
								user.forgotPasswordExpires = undefined;
								user.save(function (err) {
									if (err) {
										reject.badRequest(err);
									} else {
										emitter.emit('resetpassword', user);
										resolve.success();
									}
								});
							}
						});
					}
				}, promise.reject);
		});
	}

	function changePassword(req) {
		return deferred(function (resolve, reject) {
			var user = req.user;
			user.setPassword(req.body.password, function (err, user) {
				if (err) {
					reject.badRequest(err);
				} else {
					user.forgotPasswordToken = undefined;
					user.forgotPasswordExpires = undefined;
					user.save(function (err) {
						if (err) {
							reject.badRequest(err);
						} else {
							emitter.emit('changepassword', user);
							resolve.success();
						}
					});
				}
			});
		});
	}

	function logout(req, res) {
		if (activateCookie) {
			// Remove the cookie
			var cookies = new Cookies(req, res, cookiekKeys);
			cookies.set('darklord', null, { signed: true });
		}
	}

	function generateToken(req, res, user) {
		// When to force a new manual login
		var expiryDate = new Date();
		expiryDate.setDate(expiryDate.getDate() + 5);

		// Encode the user information
		var token = jwt.encode({
			id: user._id,
			email: user.email,
			verified: user.verified,
			active: user.active,
			expires: expiryDate
		}, secret);

		if (activateCookie) {
			// Store the token in a cookie
			var cookies = new Cookies(req, res, cookiekKeys);
			cookies.set('darklord', token, {
				expires: expiryDate,
				signed: true
			});
		}

		return {
			token: token,
			expiryDate: expiryDate
		};
	}

	return {
		events: emitter,
		register: register,
		authenticate: authenticate,
		hasAccess: hasAccess,
		isAuthenticated: isAuthenticated,
		forgotPassword: forgotPassword,
		resetPassword: resetPassword,
		changePassword: changePassword,
		verifyEmail: verifyEmail,
		extendToken: extendToken,
		logout: logout
	};
};
