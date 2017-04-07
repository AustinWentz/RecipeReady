var app = angular.module('chirpApp', ['ngRoute', 'ngResource']).run(function(shoppingService, $http, $rootScope) {

	$rootScope.authenticated = false;
	$rootScope.searched = false;
	$rootScope.expanded = new Array(100).fill(false);
	$rootScope.current_user = '';

	$rootScope.shoppingList = shoppingService.query();
	$rootScope.itemInShoppingList = {name: ''};
	/*$rootScope.addToShoppingList= function(){
		console.log("ADD TO SHOPPING LIST");

	}*/

	$rootScope.addItemToShopping = function() {

		console.log("Reached addItemToShopping function");

		shoppingService.save($rootScope.itemInShoppingList, function() {
			$rootScope.shoppingList = shoppingService.query();
			$rootScope.itemInShoppingList = {name: ''};
		});

		for (i = 0; i < $rootScope.shoppingList.length; i++) {
			console.log($rootScope.shoppingList[i]);
		}
	};

	$rootScope.signout = function(){
    	$http.get('auth/signout');
    	$rootScope.authenticated = false;
    	$rootScope.current_user = '';
	};

	$rootScope.clear_search = function(){
    	$rootScope.searched = false;
	};
});

app.config(function($routeProvider){
	$routeProvider
		//the timeline display
		.when('/', {
			templateUrl: 'main.html',
			controller: 'mainController'
		})
		//the pantry page
		.when('/pantry', {
			templateUrl: 'pantry.html',
			controller: 'pantryController'
		})

		.when('/shopping', {
			templateUrl: 'shopping.html',
			controller: 'shoppingController'
		})

		//the diet display
		.when('/diet', {
			templateUrl: 'diet.html',
			controller: 'dietController'
		})

		//the login display
		.when('/login', {
			templateUrl: 'login.html',
			controller: 'authController'
		})


		//the signup display
		.when('/signup', {
			templateUrl: 'register.html',
			controller: 'authController'
		});

});


app.factory('dietService', function($resource){
	return $resource('/api/diet/:id',{id: '@id'});
});

app.factory('shoppingService', function($resource){
	return $resource('/api/shopping/:id', {id: '@id'}, 
		{
        'update': { method:'PUT' }
    	});
});

app.factory('shoppingManager', function($resource){
	return $resource('/api/shopManage/:id', {id: '@id'},
		{
        'update': { method:'PUT' }
    	});
});

app.factory('searchService', function($resource){
	return $resource('/api/search/:id');
});

app.factory('pantryService', function($resource){
	return $resource('/api/pantry/:id', {id: '@id'});
});

app.factory('recipeSearchService', function($resource){
	return $resource('https://api.edamam.com/search/');
});

app.controller('mainController', function(searchService, recipeSearchService, pantryService, dietService, $scope, $rootScope, $http){
	$scope.recipes; //= searchService.query();
	$scope.newRecipe = {link: '', name: '', thumbnail: ''};
	$scope.suggestions = [];

	//Get list of ingredients to be filtered from the search
	$scope.diet = new Array();
	var tempDiet = dietService.query();


	//Get the user's pantry to compare ingredients in search results
	$scope.availableIngredients = new Array();
	var tempAvail = pantryService.query();

	$scope.saveRecipe = function(label) {
		$rootScope.searched = true;
	  	$scope.newRecipe.link = $rootScope.current_user;
	  	$scope.newRecipe.thumbnail = 'temp';
	  	$scope.newRecipe.name = label;
	  	console.log("SAVERECIPE")
	  	searchService.save($scope.newRecipe, function(){
	    	//$scope.recipes = searchService.query($scope.newRecipe);
	    	//$scope.newRecipe = {link: '', name: '', thumbnail: ''};
	  	});
	};

	//For your sake, please, please don't read this code
	$scope.search = function() {

		//Update the scope now that get diet has finally returned
		if($scope.diet.length == 0) {
			for(var i = 0; i < tempDiet.length; i++) {
				$scope.diet.push(tempDiet[i].name);
			}
		}

		//Update the scope now that get diet has finally returned
		if($scope.availableIngredients.length == 0) {
			for(var i = 0; i < tempAvail.length; i++) {

				var newAvail = new Object();
				newAvail.name = tempAvail[i].name;
				newAvail.amount = 0;
				newAvail.unit = "";

				for(var j in tempAvail[i].instances){
					var curInst = tempAvail[i].instances[j];

					if( j == 0) {
						newAvail.unit = curInst.unit;
					}

					if(curInst.unit == newAvail.unit) {
						newAvail.amount += Number(curInst.amount);
					}

					else {
						console.log("AHH, FUCK, THEY\'RE DIFFERENT UNITS");
					}
				}
				$scope.availableIngredients.push(newAvail);
			}
		}

		recipeSearchService.get({app_id: 'bc10ee11', app_key: 'c11676313bdddb4e5c68da63eb01941d', q: $scope.newRecipe.name, from: 0, to: 100}, function(resp) {

			//The array of formatted recipe objects to return to the search view
			var results = new Array();

			/*List of possible unit types. I wasn't able to find any decent
			unit conversion libraries for this purpose. If you encounter or
			think of some unit not in the list please add it below */
			var units = ["x", "kg", "kilograms", "kilogram", "g", "gram", "grams",
				"lb", "lbs", "pound", "pounds", "ounce", "ounces", "oz", "ozs",
				"tbsp", "tbsps", "tbs", "tablespoon", "tablespoons", "tsp", "tsps",
				"teaspoon", "teaspoons", "cups", "cup", "clove", "cloves",
				"clove(s)", "bottle", "can", "jar", "pinch", "dash", "bushel",
				"peck"];

			//Format each recipe returned
			for (var cur in resp.hits) {

				var isRestricted = false;
				var curRecipe = resp.hits[cur].recipe;

				//The object to represent the formatted recipe
				var newResult = new Object();
				newResult.label = curRecipe.label;
				newResult.url = curRecipe.url;
				newResult.image = curRecipe.image;
				newResult.fullIng = new Array();
				newResult.ingredients = new Array();
				newResult.other = new Array();
				newResult.have = new Array();
				newResult.need = new Array();
				newResult.full = new Array();

				var ingList = resp.hits[cur].recipe.ingredientLines;//.split(" ");

				//Format each ingredient in ingredientLines to objects
				for( var i in ingList) {


					//Prevents rogue numbers elsewhere in the string from
					//interfering with the actual quantity of the ingredient
					var amountIsOver = false;
					var ingredient = new Object();

					/*Remove anything in parentheses from the ingredient. It is
					almost always an alternate unit of measurement or some
					other redundant information and unnecessarily complicates
					parsing everything else out */
					ingList[i] = ingList[i].replace(/\([^\~]*\)/g, '');
					ingList[i] = ingList[i].replace(/\ of\ /g, ' ');
					var curIng = ingList[i].split(" ");

					var fullAmount = 0;
					var unit = "";
					var ingType = "";

					for( var j in curIng) {
						//First check if current word is whole number
						var amount1 = curIng[j].match(/[0-9]+/g);
						if(amount1 && amount1.length == 1  && !amountIsOver) {
							fullAmount += Number(amount1);
						}
						//Or it is fraction (NUM/NUM), decimal (NUM.NUM), or range (NUM-NUM)
						else if (curIng[j].match(/[0-9]+[\/][0-9]+/g) && !amountIsOver) {
							var params = curIng[j].split("/");
							fullAmount += Math.trunc((Number(params[0]) / Number(params[1])) * 100) / 100;
							amountIsOver = true;
						}

						else if (curIng[j].match(/[0-9]+[\.][0-9]+/g) && !amountIsOver) {
							fullAmount += Number(curIng[j]);
							amountIsOver = true;
						}

						else if (curIng[j].match(/[0-9]+[\-][0-9]+/g) && !amountIsOver) {
							var params = curIng[j].split("-");
							fullAmount += Number(params[1]);
							amountIsOver = true;
						}

						else {
							amountIsOver = true;

							/*Remove periods, so we don't need seperate entries
							for 'lbs' and 'lbs.' for exammple */
							curIng[j] = curIng[j].replace(".", "");

							/*Anything after "or" is going to be some alternative
							ingredient, but the user doesn't need to know that...*/
							if(curIng[j] == "or")
								break;

							//If we don't already have a unit and the current word matches one in the list
							if(unit == "" && fullAmount != "" && units.indexOf(curIng[j]) != -1) {
								unit = curIng[j];
							}

							/*Otherwise we (erroneously) assume it is part of
							the actual ingredient's name*/
							else {
								//Eliminate leading space in ingredient name
								if(ingType != "")
									ingType += " ";
								ingType += curIng[j];
							}
						}
					}

					//Check if new ingredient is dietary restriction before adding
					for (var curRestriction in $scope.diet) {
						if( ingType.toLowerCase().indexOf($scope.diet[curRestriction]) != -1) {
							isRestricted = true;
							break;
						}
					}

					if(isRestricted)
						break;

					ingredient.amount = fullAmount;
					ingredient.unit = unit;
					ingredient.name = ingType;

					if(ingredient.amount != "" ) {
						newResult.ingredients.push(ingredient);
					}
					else {
						newResult.other.push(ingredient.name);
					}
					//console.log("ingredient: " + JSON.stringify(ingredient));
				}

				for(var i in newResult.ingredients) {

					var isAvailable = false;
					var isEnough = true;
					var foundIng = newResult.ingredients[i];

					var formatIng= new Object();
					formatIng.have = 0;
					formatIng.req = foundIng.amount;
					formatIng.unit = foundIng.unit;
					formatIng.name = foundIng.name;
					formatIng.surplus = -foundIng.amount;

					for(var j in $scope.availableIngredients) {
						var ownedIng = $scope.availableIngredients[j];

						//console.log("found: " + JSON.stringify(foundIng) + " owned: " + ownedIng);

						if(ownedIng.name == foundIng.name) {
							newResult.have.push(ownedIng);
							formatIng.have = ownedIng.amount;
							formatIng.surplus += ownedIng.amount;

							if (ownedIng.amount < foundIng.amount) {
								var neededIng = new Object();
								neededIng.unit = ownedIng.unit;
								neededIng.name = ownedIng.name + "!";

								if(ownedIng.unit != foundIng.unit) {
									neededIng.amount = " whatever " + foundIng.amount + " " + foundIng.unit + " minus " + ownedIng.amount + " " + ownedIng.unit + " is, figure out yourself asshole";
								}

								else {
									neededIng.amount = foundIng.amount - ownedIng.amount;
								}
								newResult.need.push(neededIng);
							}

							else if(ownedIng.unit != foundIng.unit) {
								var neededIng = new Object();
								neededIng.unit = ownedIng.unit;
								neededIng.name = ownedIng.name + "!";
								neededIng.amount = " whatever the hell " + foundIng.amount + " " + foundIng.unit + " minus " + ownedIng.amount + " " + ownedIng.unit + " is, figure out yourself asshole";
								newResult.need.push(neededIng);
							}

							isAvailable = true;
							break;
						}
					}

					if(!isAvailable) {
						newResult.need.push(foundIng);
					}
					newResult.full.push(formatIng);
				}


				if(!isRestricted)
					results.push(newResult);
			}
			$scope.recipes = results;
		});
	};

	$scope.autocompleteQuery = function() {

		if(!$scope.newRecipe.name) {
			$scope.suggestions = [];
			return;
		}
		return;

		//Update the scope now that get diet has finally returned
		if($scope.diet.length == 0) {
			for(var i = 0; i < tempDiet.length; i++) {
				$scope.diet.push(tempDiet[i].name);
			}
		}

		var ret = new Array();
		var searchString = "https://api.nutritionix.com/v1_1/search/" + $scope.newRecipe.name;

		var NutritionixQuery = {"appKey":"e7ac4da83fe5ee54e356bd53c0abb7ac",
			"appId":"9126443f"};

		$http({
			method: 'GET',
			url: searchString,
			params: NutritionixQuery
		}).then(function formatResults(response) {
			var arr = response.data.hits;
			if(arr) {
				for (var cur in arr) {
					var isRestricted = false;
					var newSuggest = arr[cur].fields.item_name;

					//Check if the suggestion contains a restriction
					for (var curRestriction = 0; curRestriction < $scope.diet.length; curRestriction++) {
						if( newSuggest.toLowerCase().indexOf($scope.diet[curRestriction]) != -1) {
							isRestricted = true;
							break;
						}
					}

					if( !isRestricted  ) {
						if( ret.indexOf(newSuggest) == -1) {
							ret.push(newSuggest);
						}
					}
				}
			}
		}, function getErr(response) {
			console.log("ERR: " + JSON.stringify(response));
		});
		$scope.suggestions = ret;
	};

	$scope.autocomplete = function(entry) {
		console.log(entry);
		$scope.newRecipe.name = entry;
	};

	$scope.expandRecipe = function(index) {
		$rootScope.expanded[index] = !$rootScope.expanded[index];
	};

});

// Controller for shopping lists
app.controller('shoppingController', function(shoppingService, shoppingManager, $scope, $rootScope){
	$scope.masterList = shoppingManager.query();
	$scope.listNum = {number: ''};
	$scope.shoppingListName = {name: ''};
	$scope.shopIngredient = [];

	// Add a list to the database
	$scope.addList = function() {
		console.log("newList");
		shoppingManager.save($scope.shoppingListName, function() {
			$scope.masterList = shoppingManager.query();
			$scope.shoppingListName = '';
		});

		for (i = 0; i < $scope.masterList.length; i++) {
			console.log($scope.masterList[i]);
		}

	};

	// Remove a list from the database
	$scope.removeList = function(item) {
		console.log("ToRomove: " + item._id);
		shoppingManager.delete({id: item._id}, function(resp){
  			$scope.masterList = shoppingManager.query();
		});
	};

	// Add item to specific list in database
	// "item" is the list youre adding it to
	$scope.addItemToList = function(item, index) {
		console.log("Reached addItemToList function");
		//var num = parseInt($scope.listNum.number);

		shoppingService.update({id: item._id}, {name: $scope.shopIngredient[index]}, function(resp) {
			$scope.masterList = shoppingManager.query();
			$scope.shopIngredient = [];
			console.log($scope.masterList);
		});
	};
	// Remove item from specific list in database
	$scope.removeItemFromList = function(list, index) {
		console.log("ToRomove: " + list._id);
		shoppingManager.update({id: list._id}, {i: index}, function(resp){
  			$scope.masterList = shoppingManager.query();
  			console.log($scope.masterList);
		});
	};

	$scope.viewItem = function(item) {
		console.log(item);
	};

});

app.controller('dietController', function(dietService, $scope, $rootScope){
	// TODO
	$scope.ingredientList = dietService.query();
	$scope.ingredient = {name: ''};
	$scope.addIngredient = function() {
		dietService.save($scope.ingredient, function() {
			console.log("hello from add_In");
			$scope.ingredientList = dietService.query();
			$scope.ingredient = {name: ''};
		});
	};
	$scope.removeIngredient = function(item) {
		console.log("ToRomove: " + item._id);
		dietService.delete({id: item._id}, function(resp){
  			$scope.ingredientList = dietService.query();
		});
	};
	$scope.viewIngredient = function(item) {
		console.log(item);
	};
});


app.controller('pantryController', function(pantryService, searchService, $scope, $rootScope){
	$scope.ingredientList = pantryService.query(); //{selected: false, name: 'carrot'}, {selected: true, name:'apple'}];
	$scope.ingredient = {name: '', amount:'', unit:'', purchase:'', expiration:''};
	$scope.recipes = searchService.query();

	$scope.addIngredient = function() {
		pantryService.save($scope.ingredient, function() {
			console.log("hello from add_In");
			$scope.ingredientList = pantryService.query();
			$scope.ingredient = {name: '', amount:'', unit:'', purchase:'', expiration:''};
		});
	};

	$scope.removeIngredient = function(item) {
		console.log("ToRemove: " + item._id);
		pantryService.delete({id: item._id}, function(resp){
  			$scope.ingredientList = pantryService.query();
		});
	};

	$scope.viewIngredient = function(item) {
		console.log(item);
	};

	$scope.sortIngredient = function() {
		for (i = 0; i < $scope.ingredientList.length; i++) {
			console.log("Sorting");
			for (j = i + 1; j < $scope.ingredientList.length; j++) {
				if ($scope.ingredientList[i].expiration_date> $scope.ingredientList[j].expiration_date) {
					var temp = $scope.ingredientList[i]
					$scope.ingredientList[i] = $scope.ingredientList[j];
					$scope.ingredientList[j] = temp;
				}
			}
		}
	};

});

app.controller('authController', function($scope, $http, $rootScope, $location){
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';

  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };

  $scope.register = function(){
    $http.post('/auth/signup', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };
});
