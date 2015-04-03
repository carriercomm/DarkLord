var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var morgan = require('morgan');
var bodyParser = require('body-parser');

var app = express();

// CORS
app.all('*', function (req, res, next) {
	'use strict';

	req.token = req.headers.authorization;
	// TODO: Update to check a white list of origins to prevent a free for all ;-)
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
var router = express.Router();
app.use('/', router);

var User = require('./src/models/user.js');
var darklord = require('./src/darklord.js')({
	router: router,
	databaseSvc: require('./src/database.svc.mongoose.js')(User),
	user: User,
	secret: process.env.JWT_SECRET || '85705984723056481905789579841057457023894570128572908173548590167438947918057893215791305728395767138075190574315674816510948',
	cookie: true
});

darklord.events.on('registered', function (user) {
	console.log('darklord registered user: ' + user);
});

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

// Mongoose connection string
mongoose.connect('mongodb://localhost/DarkLord');

// Start server
app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function () {
	'use strict';

	console.log('Server started on port: ' + this.address().port);
});

module.exports = app;
