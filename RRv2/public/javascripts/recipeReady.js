var app = angular.module('recipeReady', ['ngRoute', 'ngResource']).run(function($http, $rootScope) {
	$rootScope.authenticated = false;
	$rootScope.searched = false;
	$rootScope.current_user = '';
	
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

app.factory('searchService', function($resource){
	return $resource('/api/search/:id');
});

app.controller('mainController', function(searchService, $scope, $rootScope){
	$scope.recipes = searchService.query();
	$scope.newRecipe = {link: '', name: '', thumbnail: ''};

	$scope.search = function() {
		$rootScope.searched = true;
	  	$scope.newRecipe.link = $rootScope.current_user;
	  	$scope.newRecipe.thumbnail = 'temp';
	  	searchService.save($scope.newRecipe, function(){
	    	$scope.recipes = searchService.query();
	    	$scope.newRecipe = {link: '', name: '', thumbnail: ''};
	  	});
	};
});

app.controller('pantryController', function($scope, $rootScope){
	$scope.ingredientList = [{selected: false, name: 'carrot'}, {selected: true, name:'apple'}];
	$scope.ingredientInput = '';

	$scope.addIngredient = function() {
		$scope.ingredientList.push({selected: false, name: $scope.ingredientInput});
		$scope.ingredientInput = '';
	};

	$scope.remove = function() {
		for (var i = $scope.ingredientList.length - 1; i >= 0; i--) {
			if ($scope.ingredientList[i].selected) {
				$scope.ingredientList.splice(i, 1);
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