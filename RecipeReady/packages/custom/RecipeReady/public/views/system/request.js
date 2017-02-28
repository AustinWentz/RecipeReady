//Implement server API cals below


var server = angular.module('server', []);

server.controller('serverCtrl', [], function($http) {
    
}



//TODO:
$scope.getIngredients = function(prefix) {
    $http.post("dummy-url/api/getIngredients")
}

//TODO
$scope.getRecipesByIngredient = function(ingredients) {
    $http.post("dummy-url/api/getRecipesByIngredient", ).then(
        function (resp) 
        {    
            console.log("success", resp);
        }, 
        function(resp)
        {
            console.log("failure", resp);
        }
    );
};

//TODO: get the user's saved recipes
$scope.getRecipesByUser = function(user)
{
    $http.post("dummy-url/api/getRecipesByUser", ).then(
        function (resp) 
        {    
            console.log("success", resp);
        }, 
        function(resp)
        {
            console.log("failure", resp);
        }
    );
};

//TODO get the ingredients in the user's pantry
$scope.getPantry = function(user)
{
    $http.post("dummy-url/api/getPantry", ).then(
        function (resp) 
        {    
            console.log("success", resp);
        }, 
        function(resp)
        {
            console.log("failure", resp);
        }
    );
}

//TODO: get a list of the user's dietary restrictions
$scope.getDietaryRestrictions = function(user)
{
    $http.post("dummy-url/api/getRecipesByUser", ).then(
        function (resp) 
        {    
            console.log("success", resp);
        }, 
        function(resp)
        {
            console.log("failure", resp);
        }
    );
}