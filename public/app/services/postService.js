angular.module('postService', [])

.factory('Post', function($http)
{
	// create a new obj
	var postFactory = {};

	// get a single post
	postFactory.get = function(id)
	{
		return $http.get('/api/posts/' + id);
	};

	// get all posts
	postFactory.all = function()
	{
		return $http.get('/api/posts/');
	};

	// create a post
	postFactory.create = function(postData)
	{
		return $http.post('/api/posts/', postData);
	};

	// update a user
	postFactory.update = function(id, postData)
	{
		return $http.put('/api/posts/' + id, postData);
	};

	// delete a post
	postFactory.delete = function(id)
	{
		return $http.delete('/api/posts/' + id);
	};

	// return our entire postFactory obj
	return postFactory;
});