var _ = require('lodash');
var Deferred = require('./deferred');

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
		getById(data._id)
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

	function query(findOne, queryObject) {
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

	function getById(id) {
		var deferred = new Deferred();
		Model.findById(id, function (err, model) {
			if (err) {
				deferred.internalServerError(err);
			} else if (!model) {
				deferred.notFound();
			} else {
				deferred.success(model);
			}
		});
		return deferred.promise;
	}

	function removeById(id) {
		var deferred = new Deferred();
		Model.findByIdAndRemove(id, function (err, model) {
			if (err) {
				deferred.internalServerError(err);
			} else if (!model) {
				deferred.notFound();
			} else {
				deferred.noContent();
			}
		});

		return deferred.promise;
	}

	return {
		create: create,
		update: update,
		getById: getById,
		query: query.bind(this, false),
		findOne: query.bind(this, true),
		removeById: removeById
	};
};