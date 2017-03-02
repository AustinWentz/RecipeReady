var express = require('express');
var router = express.Router();

router.route('/api/getRecipesByIngredient')

	.get(function(req, res){

		//temporary
		res.send({message: "We're getting recipes..."})
	});

module.exports = router;