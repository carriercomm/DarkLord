var _ = require('lodash');
var deferred = require('deferred-http-statuses');

module.exports = function (Model) {
	'use strict';

	function create(data) {
		return deferred(function (resolve, reject) {
			var model = new Model(data);
			model.save(function (err, newModel) {
				if (err) {
					reject.internalServerError(err);
				} else {
					resolve.success(newModel);
				}
			});
		});
	}

	function update(data) {
		return deferred(function (resolve, reject, promise) {
			svc.findOne({ _id: data._id })
				.then(function (result) {
					var model = result.data;
					var tmp = _.merge(model.toJSON(), data);
					_.extend(model, tmp);
					model.save(function (err, updatedModel) {
						if (err) {
							reject.internalServerError(err);
						} else {
							resolve.success(updatedModel);
						}
					});
				}, function (result) {
					promise.reject(result.status, result.data);
				});
		});
	}

	function find(findOne, queryObject) {
		return deferred(function (resolve, reject) {
			Model.find(queryObject, function (err, models) {
				if (err) {
					reject.internalServerError(err);
				} else if (models.length === 0) {
					reject.notFound();
				} else {
					var result = findOne ? models[0] : models;
					resolve.success(result);
				}
			});
		});
	}

	function remove(queryObject) {
		return deferred(function (resolve, reject) {
			Model.remove(queryObject, function (err) {
				if (err) {
					reject.internalServerError(err);
				} else {
					resolve.noContent();
				}
			});
		});
	}

	var svc = {
		create: create,
		update: update,
		find: find.bind(this, false),
		findOne: find.bind(this, true),
		remove: remove
	};

	return svc;
};