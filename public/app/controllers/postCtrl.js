angular.module('postCtrl', ['postService'])

.controller('postController', function(Post) {

	var vm = this;

	// set a processing variable to show loading things
	vm.processing = true;

	// grab all the posts at page load
	Post.all()
		.success(function(data) {

			// when all the posts come back, remove the processing variable
			vm.processing = false;

			// bind the posts that come back to vm.posts
			vm.posts = data;
		});

	// function to delete a post
	vm.deletePost = function(id) {
		vm.processing = true;

		Post.delete(id)
			.success(function(data) {

				// get all posts to update the table
				// you can also set up your api 
				// to return the list of posts with the delete call
				Post.all()
					.success(function(data) {
						vm.processing = false;
						vm.posts = data;
					});

			});
	};

})

// controller applied to post creation page
.controller('postCreateController', function(Post) {
	
	var vm = this;

	// variable to hide/show elements of the view
	// differentiates between create or edit pages
	vm.type = 'create';

	// function to create a post
	vm.savePost = function() {
		vm.processing = true;
		vm.message = '';

		// use the create function in the postService
		Post.create(vm.postData)
			.success(function(data) {
				vm.processing = false;
				vm.postData = {};
				vm.message = data.message;
			});
			
	};	

})

// controller applied to post edit page
.controller('postEditController', function($routeParams, Post) {

	var vm = this;

	// variable to hide/show elements of the view
	// differentiates between create or edit pages
	vm.type = 'edit';

	// get the post data for the post you want to edit
	// $routeParams is the way we grab data from the URL
	Post.get($routeParams.post_id)
		.success(function(data) {
			vm.postData = data;
		});

	// function to save the post
	vm.savePost = function() {
		vm.processing = true;
		vm.message = '';

		// call the postService function to update 
		Post.update($routeParams.post_id, vm.postData)
			.success(function(data) {
				vm.processing = false;

				// clear the form
				vm.postData = {};

				// bind the message from our API to vm.message
				vm.message = data.message;
			});
	};

});