var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var morgan = require('morgan');
var bodyParser = require('body-parser');

var app = express();

// CORS
app.all('*', function (req, res, next) {
	'use strict';

	req.token = req.headers.authorization;
	res.header('Access-Control-Allow-Origin', req.headers.origin);
	res.header('Access-Control-Allow-Headers', 'origin, content-type, accept');
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

	if (req.method === 'OPTIONS') {
		res.status(200).end();
	}

	next();
});

// Config
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Passport config
app.use(passport.initialize());

// Routes
require('./features/auth/auth.ctrl')(router);
app.use('/', router);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
	'use strict';

	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// Error handler
app.use(function (err, req, res) {
	'use strict';

	var stack = new Error(err).stack;
	console.log(stack);
	res.status(err.status || 500).end();
});

// User and Passport config
var User = require('./models/user');
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Mongoose connection string
mongoose.connect('mongodb://localhost/darklord');

// Start server
app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function () {
	'use strict';

	console.log('Server started on port: ' + this.address().port);
});

module.exports = app;
