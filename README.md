## DarkLord - JWT based stateless authentication

DarkLord is designed to work with Express and provides a configurable authentication solution. It will provide you with a set of API end points straight out of the box. It also has a default User model and Mongo connectivity, however you can easily provide your own.

### Getting started

    npm install darklord --save

Next:

    var darklord = require('darklord')({ router: router });

This is the simplest way of getting DarkLord up and running.

### Options

    var darklord = require('darklord')({
      secret: <secret string>,
      cookie: <turn on token cookie>,
      user: <passport based user model>,
      passwordValidator: <regex condition>
      databaseSvc: <database logic controller>,
      router: <express router>
    });

**secret** (*optional*) - provide the JWT generator a secret key that it will use to encrypt and decrypt auth tokens. Leave it blank and it will use an environment variable called `JWT_SECRET`

**cookie** (*optional*) - turn token cookie on. The token will be stored in a signed cookie based on your *secret*. Useful if you want to use DarkLord for normal webpages as well as APIs.

**user** (*optional*) - you can setup your own passport initialised User model, the default one is wrapped up as a passport mongoose model

**passwordValidator** (*optional*) - use a Regular Expression to password validity e.g. `/^.{6,}$/` for minimum length of 6

**databaseSvc** (*optional*) - if you are building your own User model and you don't want to use Mongo as a database then you probably already have a database logic layer. That's cool, you can provide DarkLord a database service that has the following interface where ***each method must return a promise***.:

    {
      create: 
      update: 
      find: 
      findOne: 
      remove:
    };

**router** (*optional*) - provide DarkLord with an express router and it will add all the routes you need. If you leave it blank you will need to configure your own routes, but that should be easy enough since `require('darklord')()` returns a list of authentication middleware methods you can execute:

    register
    authenticate,
    isAuthenticated,
    forgotPassword,
    resetPassword,
    changePassword,
    verifyEmail,
    extendToken,
    closeAccount,
    verifyClosure

If however you do supply DarkLord with a router then you'll get the following end points for free.

### API

Remember to create a JWT token you'll need to set a secret to the `JWT_SECRET` env variable

#### POST /token
Generate an authentication token.

**Request:**

    {
      "email": "myemail@address.com",
      "password": "123456"
    }

**Response:**

    {
      "token": "<authentication-token>",
      "expiresInMinutes": "<number-of-minutes-of-validity>"
    }

#### POST /register
Create an account and generate an authentication token. Sets the verified flag to false and creates a verified token

**Request:**

    {
      "email": "myemail@address.com",
      "password": "123456"
    }

**Response:**

    {
      "token": "<authentication-token>",
      "expiresInMinutes": "<number-of-minutes-of-validity>"
    }

#### PUT /change
Change the password on the account.

**Request:**

    {
      "email": "myemail@address.com",
      "password": "abcdef"
    }
		Headers:
		Authorization: "<authentication-token>"

#### POST /forgot
Creates a forgot password token that can be emailed to the user as a link to reset.

**Request:**

    {
      "email": "myemail@address.com"
    }

#### POST /reset
Accepts a token and a password, the server then update the account password

**Request:**

    {
      "token": "<forgotten-password-token>",
      "password": "654321"
    }

#### GET /verify/:token
Accepts a token that can be emailed to the user, then sets the verified flag on the user to true and removes the verify token

#### POST /token/extend
Checks to see if the request is already authenticated, and if so responds with a new auth token that has an extended expiry date

**Request:**

	Headers:
	Authorization: "<authentication-token>"

#### POST /close
Request account clousre. Sets the closure verification token and expiry date

**Request:**

	Headers:
	Authorization: "<authentication-token>"

#### GET /close/:token
Accepts a token, deletes the users account from the database

#### POST /logout
Since the cookies are httpOnly to improve security you won't be able to remove them via JavaScript. Therefore call this end point to instruct the server to remove them.

**Response:**

	Cookies are removed

### Middleware

#### hasAccess
If you want to check if the current request has access, ie. they are authenticated, then you can use the `hasAccess` method which returns a promise.

    router.get('/access', function (req, res) {
      authSvc
        .hasAccess(req, res)
        .then(function () {
          res.status(200).end();
        }, function () {
          res.status(401).end();
        });
      });

#### logout
To logout call the logout method, it will simply remove the cookies

    router.post('/logout', function (req, res) {
      authSvc.logout(req, res);
      res.status(200).end();
    });

### Events
The following are events you can hook into for when certain actions happen, they all return the user

    registered
    authenticated
    forgotpassword
    resetpassword
    changepassword
    closeaccount
    accountclosed
    
E.g.

    var darklord = require('darklord')({ router: router });
    
    darklord.events.on('registered', function (user) {
      ...
    });

##### Technology Used
- [NodeJS](http://nodejs.org/)
- [PassportJS](http://passportjs.org/)
- [MongoDB](http://www.mongodb.org/)
- [Mongoose](http://mongoosejs.com/)
- [JSONWebToken](https://www.npmjs.com/package/jsonwebtoken)
- [Cookies](https://www.npmjs.com/package/cookies)
- [KeyGrip](https://www.npmjs.com/package/keygrip)
