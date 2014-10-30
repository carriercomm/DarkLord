var responses = require('../../utils/responses');
var authSvc = require('./auth.svc')();
var User = require('../../models/user');

module.exports = function (router) {
	'use strict';
	
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

	router.post('/register', authSvc.register);
	router.post('/forgot', forgotPassword);
	router.post('/reset', resetPassword);
//	router.post('/verify/:token', verifyPassword);
	router.put('/change', authSvc.isAuthenticated, changePassword);
	router.post('/token', authSvc.authenticate);
	//router.post('/token/refresh', authSvc.isAuthenticated, authSvc.refreshToken);
};