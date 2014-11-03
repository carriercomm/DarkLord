module.exports = {
	standard: function standard(res) {
		'use strict';

		return function (result) {
			res.status(result.status).send(result.data);
		};
	},
	methodNotAllowed: function methodNotAllowed(req, res) {
		'use strict';

		res.status(405).end();
	}
};