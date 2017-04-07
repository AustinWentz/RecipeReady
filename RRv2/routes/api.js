var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var Recipe = mongoose.model('Recipe');
var UserIngredient = mongoose.model('User_Ingredient');
var Instance = mongoose.model('Instances');
var DietIngredient = mongoose.model('Diet_Ingredient')
var ShoppingIngredient = mongoose.model('Shop_Ingredient');
var ShoppingList = mongoose.model('Shopping_List');

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
router.use('/pantry', isAuthenticated);
router.use('/diet', isAuthenticated);
router.use('/shopping', isAuthenticated);
router.use('/shopManage', isAuthenticated);


// This route is USELESS
router.route('/shopping')
	//Adds to first list it finds
	.post(function(req, res){
		
		var post = new ShoppingIngredient();
		post.name = req.body.name;

		ShoppingList.findOneAndUpdate({name: req.body.name}, {$addToSet: {list: post}}, {upsert:true, new:true}, function(err, doc){
		    if(err){
		        return res.send(500, err);
		    }

		    return res.json(doc);
		});
	})

	//gets items in first list
	.get(function(req, res){
		console.log('Getting an ingredient');
		ShoppingIngredient.find(function(err, posts){
			console.log('Returned an ingredient');
			if(err){
				return res.send(500, err);
			}
			return res.send(200,posts);
		});
	});

router.route('/shopping/:id')
	//creates a new post

	// Useless get method
	.get(function(req, res){
		ShoppingIngredient.findById(req.params.id, function(err, post){
			if(err)
				res.send(err);
			res.json(post);
		});
	}) 
	
	//updates specified post
	.put(function(req, res){
		
		ShoppingList.findById(req.params.id, function(err, post){
			if(err)
				res.send(err);

			var listSize = (post.list).length;

			post.list[listSize-1] = req.body.name;

			post.save(function(err, post){
				if(err)
					res.send(err);

				res.json(post);
			});
		});
	})
	//deletes the post
	.delete(function(req, res) {
		console.log("hi");
		ShoppingIngredient.remove({
			_id: req.params.id
		}, function(err) {

			if (err)
				res.send(err);
			res.json("deleted :(");
		});
	});

router.route('/shopManage')
	//creates a new post
	.post(function(req, res){
		
		var post = new ShoppingList();
		post.name = req.body.name;
		post.list = [];

		post.save(function(err, post) {
			if (err){
				return res.send(500, err);
			}
			return res.json(post);
		});
	})
	//gets all posts
	.get(function(req, res){
		console.log('Getting an ingredient');
		ShoppingList.find(function(err, posts){
			console.log('Returned an ingredient');
			if(err){
				return res.send(500, err);
			}
			return res.send(200,posts);
		});
	});

router.route('/shopManage/:id')
	//creates a new post

	.get(function(req, res){
		ShoppingList.findById(req.params.id, function(err, post){
			if(err)
				res.send(err);
			res.json(post);
		});
	}) 

	//updates specified post
	.put(function(req, res){
		
		ShoppingList.findById(req.params.id, function(err, post){
			if(err)
				res.send(err);

			post.name = req.body.name;

			post.save(function(err, post){
				if(err)
					res.send(err);

				res.json(post);
			});
		});
	})

	//deletes the post
	.delete(function(req, res) {
		console.log("hi");
		ShoppingList.remove({
			_id: req.params.id
		}, function(err) {

			if (err)
				res.send(err);
			res.json("deleted :(");
		});
	});	


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
		Recipe.find({name: req.query.name}, function(err, posts){
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

router.route('/pantry')
	//creates a new post
	.post(function(req, res){

		var instance = new Instance();
		instance.amount = Number(req.body.amount);
		instance.unit = req.body.unit;

		var parts = req.body.purchase.split('/');
		instance.purchased_date = new Date(parts[1],parts[0]-1); 

		parts = req.body.expiration.split('/');
		instance.expiration_date = new Date(parts[1],parts[0]-1);

		// var user_ingredient = req.user.pantry.some(function(currentValue) {
		// 	return (currentValue.name === req.body.name);
		// });

		// if (user_ingredient) {
		// 	user_ingredient.instances.push(instance);
		// } else {
		// 	user_ingredient = new UserIngredient();
		// 	user_ingredient.name = req.body.name;
		// 	user_ingredient.instances.push(instance);
		// 	req.user.pantry.push(user_ingredient);
		// }

		console.log(req.user.pantry);
		// return res.json(user_ingredient);
		UserIngredient.findOneAndUpdate({name: req.body.name}, {$addToSet: {instances: instance}}, {upsert:true, new:true}, function(err, doc){
		    if(err){
		        return res.send(500, err);
		    }

		    return res.json(doc);
		});
	})
	//gets all posts
	.get(function(req, res){
		// console.log(req.user.pantry);
		// return res.send(200, req.user.pantry);

		console.log('debug1');
		UserIngredient.find(function(err, posts){
			console.log('debug2');
			if(err){
				return res.send(500, err);
			}
			return res.send(200, posts);
		});
	});

//post-specific commands. likely won't be used
router.route('/pantry/:id')
	//gets specified post
	.get(function(req, res){
		UserIngredient.findById(req.params.id, function(err, post){
			if(err)
				res.send(err);
			res.json(post);
		});
	}) 
	//updates specified post
	.put(function(req, res){
		console.log("in pantry api");
		UserIngredient.findById(req.params.id, function(err, post){
			if(err)
				res.send(err);

			post.name = req.body.name;

			post.save(function(err, post){
				if(err)
					res.send(err);

				res.json(post);
			});
		});
	})
	//deletes the post
	.delete(function(req, res) {
		console.log("hi");
		UserIngredient.remove({
			_id: req.params.id
		}, function(err) {

			if (err)
				res.send(err);
			res.json("deleted :(");
		});
	});

router.route('/diet')
	//creates a new post
	.post(function(req, res){

		var post = new DietIngredient();
		post.name = req.body.name;

		post.save(function(err, post) {
			if (err){
				return res.send(500, err);
			}
			return res.json(post);
		});
	})
	//gets all posts
	.get(function(req, res){
		DietIngredient.find(function(err, posts){
			console.log('debug2');
			if(err){
				return res.send(500, err);
			}
			return res.send(200,posts);
		});
	});

router.route('/diet/:id')
	//gets specified post
	.get(function(req, res){
		DietIngredient.findById(req.params.id, function(err, post){
			if(err)
				res.send(err);
			res.json(post);
		});
	}) 
	//updates specified post
	.put(function(req, res){
		DietIngredient.findById(req.params.id, function(err, post){
			if(err)
				res.send(err);

			post.name = req.body.name;

			post.save(function(err, post){
				if(err)
					res.send(err);

				res.json(post);
			});
		});
	})
	//deletes the post
	.delete(function(req, res) {
		DietIngredient.remove({
			_id: req.params.id
		}, function(err) {

			if (err)
				res.send(err);
			res.json("deleted :(");
		});
	});
module.exports = router;