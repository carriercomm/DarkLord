var _ = require('lodash');
var Deferred = require('deferred-http-statuses');

module.exports = function (Model) {
	'use strict';

	function create(data) {
		var deferred = new Deferred();
		var model = new Model(data);
		model.save(function (err, newModel) {
			if (err) {
				deferred.internalServerError(err);
			} else {
				deferred.success(newModel);
			}
		});

		return deferred.promise;
	}

	function update(data) {
		var deferred = new Deferred();
		svc.findOne({ _id: data._id })
			.then(function (result) {
				var model = result.data;
				var tmp = _.merge(model.toJSON(), data);
				_.extend(model, tmp);
				model.save(function (err, updatedModel) {
					if (err) {
						deferred.internalServerError(err);
					} else {
						deferred.success(updatedModel);
					}
				});
			}, function (result) {
				deferred.reject(result.status, result.data);
			});

		return deferred.promise;
	}

	function find(findOne, queryObject) {
		var deferred = new Deferred();
		Model.find(queryObject, function (err, models) {
			if (err) {
				deferred.internalServerError(err);
			} else if (models.length === 0) {
				deferred.notFound();
			} else {
				var result = findOne ? models[0] : models;
				deferred.success(result);
			}
		});

		return deferred.promise;
	}

	function remove(queryObject) {
		var deferred = new Deferred();
		Model.remove(queryObject, function (err) {
			if (err) {
				deferred.internalServerError(err);
			} else {
				deferred.noContent();
			}
		});

		return deferred.promise;
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