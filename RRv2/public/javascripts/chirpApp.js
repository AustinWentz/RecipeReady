

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

	$rootScope.accessors = {
    getScore: function(row) {
      return row.fields._score;
    }
  }
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
	return $resource('/api/diet/:id');
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

app.controller('mainController', function(searchService, recipeSearchService, $scope, $rootScope, $http){
	$scope.recipes; //= searchService.query();
	$scope.newRecipe = {link: '', name: '', thumbnail: ''};
	$scope.suggestions;

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
	$scope.search = function() {
		recipeSearchService.get({app_id: 'bc10ee11', app_key: 'c11676313bdddb4e5c68da63eb01941d', q: $scope.newRecipe.name, from: 0, to: 100}, function(resp) {
			console.log(JSON.stringify(resp.hits[0].recipe.ingredientLines));

			var results = new Array();

			var units = ["kg", "kilograms", "kilogram", "g", "gram", "grams",
				"lb", "lbs", "pound", "pounds", "ounce", "ounces", "oz", "ozs",
				"tbsp", "tbsps", "tsp", "tsps", "cups", "cup", "clove", "cloves",
				"clove(s)", "bottle", "can", "jar"];

			for (var cur in resp.hits) {

				var curRecipe = resp.hits[cur].recipe;
				var newResult = new Object();

				newResult.label = curRecipe.label;
				newResult.url = curRecipe.url;
				newResult.image = curRecipe.image;
				newResult.ingredients = new Array();

				var ingList = resp.hits[cur].recipe.ingredientLines;//.split(" ");

				for( var i in ingList) {
					var amountIsOver = false;
					var ingredient = new Object();
					var curIng = ingList[i].split(" ");
					var alt = ingList[i].match(/\([a-z|A-Z|0-9]*\)/g);
					var ref = ingList[i].replace(/\([^s]*\)/g, '');
					//if(alt && alt.length > 0)
						//console.log("full: " + curIng + "\nparenths: " + alt
							//+ "\nwith no parenths: " + ref);

					ingList[i].replace(/\([a-z|A-Z|0-9]*\)/g, '');
					var fullAmount = "";
					var unit = "";
					var ingType = "";

					for( var j in curIng) {
						var amount1 = curIng[j].match(/[0-9]+/g);

						if(amount1 && amount1.length == 1  && !amountIsOver) {
							fullAmount += amount1;
						}

						else if (curIng[j].match(/[0-9]+[\/|\.|\-][0-9]+/g) && !amountIsOver) {
							fullAmount += " " + curIng[j];
							amountIsOver = true;
						}

						else {
							amountIsOver = true;
							if(unit == "" && fullAmount != "" && units.indexOf(curIng[j]) != -1) {
								unit = curIng[j];
							}

							else {
								ingType += " " + curIng[j];
							}
						}
					}

					ingredient.quantity = fullAmount;
					ingredient.unit = unit;
					ingredient.type = ingType;

					newResult.ingredients.push(ingredient);
					console.log("ingredient: " + JSON.stringify(ingredient));
				}

				results.push(newResult);
			}
			$scope.recipes = results;
		});
	};

	$scope.autocompleteQuery = function() {
		console.log("autocomplete + " + $scope.newRecipe.name);

		return;

		var searchString = "https://api.nutritionix.com/v1_1/search/" + $scope.newRecipe.name;

		var NutritionixQuery = {"appKey":"e7ac4da83fe5ee54e356bd53c0abb7ac",
			"appId":"9126443f"};

		$http({
			method: 'GET',
			url: searchString,
			params: NutritionixQuery
		}).then(function formatResults(response) {
			var arr = response.data.hits;
			$scope.suggestions = arr;
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
