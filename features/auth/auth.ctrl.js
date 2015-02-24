var responses = require('../../utils/responses');

module.exports = function (imports) {
	'use strict';
	var router = imports.router;
	var authSvc = require('./auth.svc')(imports);

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

	router.post('/register', authSvc.register);
	router.post('/forgot', forgotPassword);
	router.post('/reset', resetPassword);
	router.get('/verify/:token', verifyEmail);
	router.post('/token', authSvc.authenticate);
	router.post('/token/extend', authSvc.isAuthenticated, authSvc.extendToken);
	router.put('/change', authSvc.isAuthenticated, changePassword);
};