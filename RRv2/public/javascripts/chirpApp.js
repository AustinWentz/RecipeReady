

var app = angular.module('chirpApp', ['ngRoute', 'ngResource']).run(function($http, $rootScope) {
	$rootScope.authenticated = false;
	$rootScope.searched = false;
	$rootScope.current_user = '';

	/*$rootScope.addToShoppingList= function(){
		console.log("ADD TO SHOPPING LIST");

	}*/

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
	return $resource('/api/shopping/:id', {id: '@id'});
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

app.controller('mainController', function(searchService, recipeSearchService, dietService, $scope, $rootScope, $http){
	$scope.recipes; //= searchService.query();
	$scope.newRecipe = {link: '', name: '', thumbnail: ''};

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

		recipeSearchService.get({app_id: 'bc10ee11', app_key: 'c11676313bdddb4e5c68da63eb01941d', q: $scope.newRecipe.name, from: 0, to: 100}, function(resp) {
			console.log(JSON.stringify(resp.hits[0].recipe.ingredientLines));

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

			//Get list of ingredients to be filtered from the search
			var restrictions = dietService.query();
			console.log("restrictions: " + JSON.stringify(restrictions));

			//Format each recipe returned
			for (var cur in resp.hits) {

				var isRestricted = false;
				var curRecipe = resp.hits[cur].recipe;

				//The object to represent the formatted recipe
				var newResult = new Object();
				newResult.label = curRecipe.label;
				newResult.url = curRecipe.url;
				newResult.image = curRecipe.image;
				newResult.ingredients = new Array();
				newResult.other = new Array();


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

					var fullAmount = "";
					var unit = "";
					var ingType = "";

					for( var j in curIng) {
						//First check if current word is whole number
						var amount1 = curIng[j].match(/[0-9]+/g);
						if(amount1 && amount1.length == 1  && !amountIsOver) {
							fullAmount += amount1;
						}
						//Or it is fraction (NUM/NUM), decimal (NUM.NUM), or range (NUM-NUM)
						else if (curIng[j].match(/[0-9]+[\/|\.|\-][0-9]+/g) && !amountIsOver) {
							if(fullAmount != "")
								fullAmount += " ";

							fullAmount += curIng[j];
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
					for (var curRestriction in restrictions) {

						if( ingType.toLowerCase().indexOf(restrictions[curRestriction]) != -1) {
							isRestricted = true;
							break;
						}
					}

					if(isRestricted)
						break;
					ingredient.quantity = fullAmount;
					ingredient.unit = unit;
					ingredient.type = ingType;

					if(ingredient.quantity != "")
						newResult.ingredients.push(ingredient);
					else {
						newResult.other.push(ingredient.type);
					}
					console.log("ingredient: " + JSON.stringify(ingredient));
				}
				if(!isRestricted)
					results.push(newResult);
				else {
					console.log("restricted!");
				}
			}
			$scope.recipes = results;
		});
	};

	$scope.autocompleteQuery = function() {
		console.log("autocomplete");
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
					console.log("result " + cur + JSON.stringify(arr[cur].fields.item_name));
				}
			}
		}, function getErr(response) {
			console.log("ERR: " + JSON.stringify(response));
		});
	};

	$scope.autocomplete = function() {

	};
});

// Controller for shopping lists
app.controller('shoppingController', function(shoppingService, $scope, $rootScope){
	$rootScope.shoppingList = shoppingService.query();
	$rootScope.itemInShoppingList = ''

	$rootScope.addItemToShopping = function() {
		shoppingService.save($rootScope.itemInShoppingList, function() {
			console.log("9/femboi/nonbinary/genderqueer");
			$rootScope.shoppingList = shoppingService.query();
			$rootScope.itemInShoppingList = '';
		});
	}

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
	/*
	for (i = 0; i < $scope.ingredientList.length; i++) {
		console.log("Sorting");
		for (j = i + 1; j < $scope.ingredientList.length; j++) {
			if ($scope.ingredientList[i].expiration_date> $scope.ingredientList[j].expiration_date) {
				var temp = $scope.ingredientList[i]
				$scope.ingredientList[i] = $scope.ingredientList[j];
				$scope.ingredientList[j] = temp;
			}
		}
	}*/

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
		/*for (i = 0; i < item.length; i++) {
			console.log("Sorting");
			for (j = i + 1; j < $item.length; j++) {
				if (item[i].expiration_date> item.expiration_date) {
					var temp = item[i]
					$item[i] = $item[j];
					$item[j] = temp;
				}
			}
		}*/
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
