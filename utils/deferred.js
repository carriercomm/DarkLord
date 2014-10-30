var Q = require('q');

module.exports = function () {
	var deferred = Q.defer();

	function reject(status, data) {
		return deferred.reject({
			data: data,
			status: status
		});
	}

	function resolve(status, data) {
		return deferred.resolve({
			data: data,
			status: status
		});
	}

	return {
		// 200s
		success: resolve.bind(resolve, 200),
		noContent: resolve.bind(resolve, 204),
		// 400s
		badRequest: reject.bind(reject, 400),
		unauthorized: reject.bind(reject, 401),
		notFound: reject.bind(reject, 404),
		conflict: reject.bind(reject, 409),
		gone: reject.bind(reject, 410),
		// 500s
		internalServerError: reject.bind(reject, 500),
		// Exposure
		reject: deferred.reject,
		resolve: deferred.resolve,
		promise: deferred.promise
	}
}