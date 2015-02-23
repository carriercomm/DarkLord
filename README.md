#DarkLord
Stateless Authentication Server - JWT based authentication

## API

To create a JWT token you'll need to set a secret to the `JWTSECRET` env variable

### POST /token
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

### POST /register
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

### PUT /change
Change the password on the account.

**Request:**

    {
      "email": "myemail@address.com",
      "password": "abcdef"
    }
		Headers:
		Authorization: "<authentication-token>"

### POST /forgot
Creates a forgot password token and emails the user the link to reset.

**Request:**

    {
      "email": "myemail@address.com"
    }

### POST /reset
Accepts a token and a password, the server then update the account password

**Request:**

    {
      "token": "<forgotten-password-token>",
      "password": "654321"
    }

### GET /verify/:token
Accepts a token (sent to the user's email address), then sets the verified flag on the user to true and removes the verify token


### POST /token/extend
Checks to see if the request is already authenticated, and if so responds with a new auth token that has an extended expiry date

**Request:**

	Headers:
	Authorization: "<authentication-token>"


### Your own solution required for

- **Emails** - the server should send emails to users

### Technology Used
- [NodeJS](http://nodejs.org/)
- [PassportJS](http://passportjs.org/)
- [MongoDB](http://www.mongodb.org/)
- [Mongoose](http://mongoosejs.com/)
- [JWT Simple](https://www.npmjs.org/package/jwt-simple)
