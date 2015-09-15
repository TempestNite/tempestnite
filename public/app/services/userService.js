angular.module('userService', [])

.factory('User', function($http) {

	// create a new object
	var userFactory = {};

	// get a single user
	userFactory.get = function(id) {
		return $http.get('/api/register/' + id);
	};

	// get all users
	userFactory.all = function() {
		return $http.get('/api/register/');
	};

	// create a user
	userFactory.create = function(userData) {
		console.log(userData);
		return $http.post('/api/register/', userData);
	};

	// update a user
	userFactory.update = function(id, userData) {
		return $http.put('/api/register/' + id, userData);
	};

	// delete a user
	userFactory.delete = function(id) {
		return $http.delete('/api/register/' + id);
	};

	// return our entire userFactory object
	return userFactory;

});