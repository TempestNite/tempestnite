var bodyParser = require('body-parser'); 	// get body-parser
var User       = require('../models/user');
var Post 	   = require('../models/post');
var jwt        = require('jsonwebtoken');
var config     = require('../../config/db');

// super secret for creating tokens
var superSecret = config.secret;


module.exports = function(app, express, passport) 
{

	var apiRouter = express.Router();

	apiRouter.route('/posts')
		// create a post (accessed at POST http://tempestnite.com/api)
		.post(function(req, res)
		{
			// create a new instance of the User model
			var post = new Post();

			//set the posts information (come from request)
			post.title = req.body.title;
			post.pg = req.body.pg;
			post.created_at = req.body.created_at;
			post.updated_at = req.body.updated_at;

			// save the post and check for errors
			post.save(function(err) 
			{
				if (err)
				{
					// duplicate entry
					if (err.code == 11000)
						return res.json({ success: false, message: 'A post\
							with that id already exists'});
					else
						return res.send(err);
				}

				res.json({ message: 'Post created!' });
			});
		})

		// get all the posts
		.get(function(req, res)
		{
			Post.find(function(err, posts)
			{
				if (err) res.send(err);

				// return the posts
				res.json(posts);
			});
		});

		apiRouter.route('posts/:post_id')

			// get the post w/ id
			.get(function(req, res)
			{
				Post.findById(req.params.post_id, function(err, post)
				{
					if (err) res.send(err);

					res.json(post);
				});
			})

			.put(function(req, res)
			{
				Post.findById(req.params.post_id, function(err, post)
				{
					if (err) res.send(err);

					// update the posts info only if new
					// save the user
					post.save(function(err)
					{
						if (err) res.send(err);

						res.json({ message: 'Post updated!' });
					});
				});
			})

			.delete(function(req, res)
			{
				Post.remove(
				{
					_id: req.params.post_id
				}, 

				function(err, post)
				{
					if (err) return res.send(err);

					res.json({ message: 'Successfully deleted.' });
				});
			});

	// route to generate sample user
	apiRouter.post('/sample', function(req, res) {

		// look for the user named chris
		User.findOne({ 'username': 'chris' }, function(err, user) {

			// if there is no chris user, create one
			if (!user) {
				var sampleUser = new User();

				sampleUser.name = 'Chris';  
				sampleUser.username = 'chris'; 
				sampleUser.password = 'supersecret';

				sampleUser.save();
			} else {
				console.log(user);

				// if there is a chris, update his password
				user.password = 'supersecret';
				user.save();
			}

		});

	});

	// ====================================
	// G-RECAPTCHA-------------------------
	// ====================================
	var https = require('https');

	function verifyRecaptcha(key, callback)
	{
		https.get('https://www.google.com/recaptcha/api/siteverify' + 
			db.secret + '&response' + key, function(res)
			{
				var data = '';
				res.on('data', function(chunk)
				{
					data+=chunk.toString();
				});

				res.on('end', function()
				{
					try {
						var parsedData = JSON.parse(data);
						callback(parsedData.success);
					} catch (e) {
						callback(false);
					}
				});
			});
	}

	apiRouter.route('/register')

		// create a user (accessed at POST http://localhost:8080/users)
		.post(function(req, res) {
			
			var user = new User();		// create a new instance of the User model
			user.name = req.body.name;  // set the users name (comes from the request)
			user.username = req.body.username;  // set the users username (comes from the request)
			user.password = req.body.password;  // set the users password (comes from the request)
			user.email = req.body.email;

			verifyRecaptcha(req,body['g-recaptcha-response'], function(success)
			{
				if (success)
				{
					res.end("Success!");
					user.save(function(err) {
						if (err) {
							// duplicate entry
							if (err.code == 11000) 
								return res.json({ success: false, 
									message: 'A user with that username already exists. '});
							else 
								return res.send(err);
						}

						// return a message
						res.json({ message: 'User created!' });
					});
				}

				else
				{
					res.end('Captcha failed, sorry.');
				}

			});

		})

		// get all the users (accessed at GET http://localhost:8080/api/users)
		.get(function(req, res) {

			User.find({}, function(err, users) {
				if (err) res.send(err);

				// return the users
				res.json(users);
			});
		});

	// route to authenticate a user (POST http://localhost:8080/api/authenticate)
	apiRouter.post('/authenticate', function(req, res) 
	{

	  // find the user
	  User.findOne({
	    username: req.body.username
	  }).select('name username password').exec(function(err, user) {

	    if (err) throw err;

	    // no user with that username was found
	    if (!user) {
	      res.json({ 
	      	success: false, 
	      	message: 'Authentication failed. User not found.' 
	    	});
	    } else if (user) {

	      // check if password matches
	      var validPassword = user.comparePassword(req.body.password);
	      if (!validPassword) {
	        res.json({ 
	        	success: false, 
	        	message: 'Authentication failed. Wrong password.' 
	      	});
	      } else {

	        // if user is found and password is right
	        // create a token
	        var token = jwt.sign({
	        	name: user.name,
	        	username: user.username
	        }, superSecret, {
	          expiresInMinutes: 1440 // expires in 24 hours
	        });

	        // return the information including token as JSON
	        res.json({
	          success: true,
	          message: 'Enjoy your token!',
	          token: token
	        });
	      }   

	    }

	  });
	});

	// route middleware to verify a token
	apiRouter.use(function(req, res, next) {
		// do logging
		console.log('Somebody just came to our app!');

	  // check header or url parameters or post parameters for token
	  var token = req.body.token || req.query.token || req.headers['x-access-token'];

	  // decode token
	  if (token) {

	    // verifies secret and checks exp
	    jwt.verify(token, superSecret, function(err, decoded) {      

	      if (err) {
	        res.status(403).send({ 
	        	success: false, 
	        	message: 'Failed to authenticate token.' 
	    	});  	   
	      } else { 
	        // if everything is good, save to request for use in other routes
	        req.decoded = decoded;
	            
	        next(); // make sure we go to the next routes and don't stop here
	      }
	    });

	  } else {

	    // if there is no token
	    // return an HTTP response of 403 (access forbidden) and an error message
   	 	res.status(403).send({ 
   	 		success: false, 
   	 		message: 'No token provided.' 
   	 	});
	    
	  }
	});

	// test route to make sure everything is working 
	// accessed at GET http://localhost:8080/api
	apiRouter.get('/', function(req, res) {
		res.json({ message: 'hooray! welcome to our api!' });	
	});

	// on routes that end in /users
	// ----------------------------------------------------
	apiRouter.route('/users')

		// create a user (accessed at POST http://localhost:8080/users)
		.post(function(req, res) {
			
			var user = new User();		// create a new instance of the User model
			user.name = req.body.name;  // set the users name (comes from the request)
			user.username = req.body.username;  // set the users username (comes from the request)
			user.password = req.body.password;  // set the users password (comes from the request)

			user.save(function(err) {
				if (err) {
					// duplicate entry
					if (err.code == 11000) 
						return res.json({ success: false, message: 'A user with that username already exists. '});
					else 
						return res.send(err);
				}

				// return a message
				res.json({ message: 'User created!' });
			});

		})

		// get all the users (accessed at GET http://localhost:8080/api/users)
		.get(function(req, res) {

			User.find({}, function(err, users) {
				if (err) res.send(err);

				// return the users
				res.json(users);
			});
		});

	// on routes that end in /users/:user_id
	// ----------------------------------------------------
	apiRouter.route('/users/:user_id')

		// get the user with that id
		.get(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {
				if (err) res.send(err);

				// return that user
				res.json(user);
			});
		})

		// update the user with this id
		.put(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {

				if (err) res.send(err);

				// set the new user information if it exists in the request
				if (req.body.name) user.name = req.body.name;
				if (req.body.username) user.username = req.body.username;
				if (req.body.password) user.password = req.body.password;

				// save the user
				user.save(function(err) {
					if (err) res.send(err);

					// return a message
					res.json({ message: 'User updated!' });
				});

			});
		})

		// delete the user with this id
		.delete(function(req, res) {
			User.remove({
				_id: req.params.user_id
			}, function(err, user) {
				if (err) res.send(err);

				res.json({ message: 'Successfully deleted' });
			});
		});

	// api endpoint to get user information
	apiRouter.get('/me', function(req, res) {
		res.send(req.decoded);
	});

	apiRouter.get('/register', function(req, res)
	{
		res.json({ message: 'Successfully created user!' });
	});

	apiRouter.get('*', function(req, res)
	{
		res.sendFile(path.join(__dirname + '/public/views/index.html'));
	});

	return apiRouter;
};