var responses = require('./utils/responses');

module.exports = function (opts) {
	'use strict';
	var authSvc = require('./auth.svc.js')(opts);

	function forgotPassword(req, res) {
		authSvc
			.forgotPassword(req)
			.then(responses.standard(res), responses.standard(res));
	}

	function resetPassword(req, res) {
		authSvc
			.resetPassword(req)
			.then(responses.standard(res), responses.standard(res));
	}

	function changePassword(req, res) {
		authSvc
			.changePassword(req)
			.then(responses.standard(res), responses.standard(res));
	}

	function verifyEmail(req, res) {
		authSvc
			.verifyEmail(req)
			.then(responses.standard(res), responses.standard(res));
	}

	if (opts.router) {
		opts.router.get('/access', function (req, res) {
			authSvc
				.hasAccess(req, res)
				.then(function () {
					res.status(200).end();
				}, function () {
					res.status(401).end();
				});
		});
		opts.router.post('/register', authSvc.register);
		opts.router.post('/forgot', forgotPassword);
		opts.router.post('/reset', resetPassword);
		opts.router.get('/verify/:token', verifyEmail);
		opts.router.post('/token', authSvc.authenticate);
		opts.router.post('/token/extend', authSvc.isAuthenticated, authSvc.extendToken);
		opts.router.put('/change', authSvc.isAuthenticated, changePassword);
	}

	return {
		register: authSvc.register,
		authenticate: authSvc.authenticate,
		hasAccess: authSvc.hasAccess,
		isAuthenticated: authSvc.isAuthenticated,
		forgotPassword: authSvc.forgotPassword,
		resetPassword: authSvc.resetPassword,
		changePassword: authSvc.changePassword,
		verifyEmail: authSvc.verifyEmail,
		extendToken: authSvc.extendToken
	};
};