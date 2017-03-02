var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var Recipe = mongoose.model('Recipe');
//Used for routes that must be authenticated.
function isAuthenticated (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects

	//allow all get request methods
	if(req.method === "GET"){
		return next();
	}
	if (req.isAuthenticated()){
		return next();
	}

	// if the user is not authenticated then redirect him to the login page
	return res.redirect('/#login');
};

//Register the authentication middleware
router.use('/search', isAuthenticated);

router.route('/search')
	//creates a new post
	.post(function(req, res){

		var post = new Recipe();
		post.name = req.body.name;
		post.link = req.body.link;
		post.thumbnail = req.body.thumbnail;
		post.save(function(err, post) {
			if (err){
				return res.send(500, err);
			}
			return res.json(post);
		});
	})
	//gets all posts
	.get(function(req, res){
		console.log('debug1');
		Recipe.find(function(err, posts){
			console.log('debug2');
			if(err){
				return res.send(500, err);
			}
			return res.send(200,posts);
		});
	});

//post-specific commands. likely won't be used
router.route('/search/:id')
	//gets specified post
	.get(function(req, res){
		Recipe.findById(req.params.id, function(err, post){
			if(err)
				res.send(err);
			res.json(post);
		});
	}) 
	//updates specified post
	.put(function(req, res){
		Recipe.findById(req.params.id, function(err, post){
			if(err)
				res.send(err);

			post.link = req.body.link;
			post.name = req.body.name;
			post.thumbnail = req.body.thumbnail;

			post.save(function(err, post){
				if(err)
					res.send(err);

				res.json(post);
			});
		});
	})
	//deletes the post
	.delete(function(req, res) {
		Recipe.remove({
			_id: req.params.id
		}, function(err) {
			if (err)
				res.send(err);
			res.json("deleted :(");
		});
	});

module.exports = router;