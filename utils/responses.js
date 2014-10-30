module.exports = {
	standard: function standard(res) {
		return function (result) {
			res.status(result.status).send(result.data);
		};
	},
	methodNotAllowed: function methodNotAllowed(req, res) {
		res.status(405).end();
	}
};