var Deferred = require('./deferred');

module.exports = function (Model) {
	'use strict';

	function save(data) {
		var deferred = new Deferred();
		Model.findByIdAndUpdate(data._id, data, { upsert: true }, function (err, newModel) {
			if (err) {
				deferred.internalServerError(err);
			} else {
				deferred.success(newModel);
			}
		});

		 return deferred.promise;
	}

	function query(queryObject) {
		var deferred = new Deferred();
		Model.find(queryObject, function (err, models) {
			if (err) {
				deferred.internalServerError(err);
			} else if (models.length === 0) {
				deferred.notFound();
			} else {
				deferred.success(models);
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
		save: save,
		query: query,
		getById: getById,
		removeById: removeById
	};
};