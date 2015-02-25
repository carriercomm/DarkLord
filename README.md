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
      user: <passport based user model>,
      databaseSvc: <database logic controller>,
      router: <express router>
    });

**secret** (*optional*) - provide the JWT generator a secret key that it will use to encrypt and decrypt auth tokens. Leave it blank and it will use an environment variable called `JWT_SECRET`

**user** (*optional*) - you can setup your own passport initialised User model, the default one is wrapped up as a passport mongoose model

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
    extendToken

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
      "refresh": "<short-term-refresh-date>",
      "expires": "<long-term-expiry-date>"
    }

#### POST /register
Create an account and generate an authentication token. Sets the verified flag to false and creates a verified token to email to the user.

**Request:**

    {
      "email": "myemail@address.com",
      "password": "123456"
    }

**Response:**

    {
      "token": "<authentication-token>",
      "refresh": "<short-term-refresh-date>",
      "expires": "<long-term-expiry-date>"
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
Creates a forgot password token and emails the user the link to reset.

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
Accepts a token (sent to the user's email address), then sets the verified flag on the user to true and removes the verify token


#### POST /token/extend
Checks to see if the request is already authenticated, and if so responds with a new auth token that has an extended expiry date

**Request:**

	Headers:
	Authorization: "<authentication-token>"


##### Technology Used
- [NodeJS](http://nodejs.org/)
- [PassportJS](http://passportjs.org/)
- [MongoDB](http://www.mongodb.org/)
- [Mongoose](http://mongoosejs.com/)
- [JWT Simple](https://www.npmjs.org/package/jwt-simple)
