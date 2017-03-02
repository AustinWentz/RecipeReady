'use strict';

var express = require('express');
var router = express.Router();

router.route('/api/getRecipesByIngredient')

	.get(function(req, res){

		//temporary
		res.send({message: 'Were getting recipes...'});
		console.log('dicks');
	});

module.exports = router;