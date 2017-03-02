// //Front-end API calls for requesting data from the server


// var server = angular.module('server', []);

// server.controller('serverCtrl', ['$scope', '$http', function($scope, $http) {

    
    
//     //TODO: Get a list of ingredients matching the given expression
//     $scope.getIngredients = function() {
//         $http.post("dummy-url/api/getIngredients", $scope.prefix).then(
//             function (resp) 
//             {    
//                 console.log("success", resp);
                
//                 for each(var ingredient in resp)
//                 {
//                     console.log(ingredient);
//                 }
                
//                 $scope.ingredients = resp;
//             }, 
//             function(resp)
//             {
//                 console.log("failure", resp);
//             }
//         );
//     };

//     //TODO: get a listing of recipes containing the given ingredients
//     $scope.getRecipesByIngredient = function() {
//         $http.post("dummy-url/api/getRecipesByIngredient", $scope.ingredients).then(
//             function (resp) 
//             {    
//                 console.log("success", resp);
                
//                 for each(var recipe in resp)
//                 {
//                     console.log(recipe.name);
//                 }
                
//                 $scope.recipes = resp;
//             }, 
//             function(resp)
//             {
//                 console.log("failure", resp);
//             }
//         );
//     };

//     //TODO: get the user's saved recipes
//     $scope.getRecipesByUser = function()
//     {
//         $http.post("dummy-url/api/getRecipesByUser", $scope.user).then(
//             function (resp) 
//             {    
//                 console.log("success", resp);
                
//                 for each(var recipe in resp)
//                 {
//                     console.log(recipe.name);
//                 }
                
//                 $scope.recipes = resp;
//             }, 
//             function(resp)
//             {
//                 console.log("failure", resp);
//             }
//         );
//     };

//     //TODO get the ingredients in the user's pantry
//     $scope.getPantry = function()
//     {
//         $http.post("dummy-url/api/getPantry", $scope.user).then(
//             function (resp) 
//             {    
//                 console.log("success", resp);
                
//                 for each(var ingredient in resp)
//                 {
//                     console.log(ingredient.name);
//                 }
                
//                 $scope.ingredients = resp;
//             }, 
//             function(resp)
//             {
//                 console.log("failure", resp);
//             }
//         );
//     }

//     //TODO: get a list of the user's dietary restrictions
//     $scope.getDietaryRestrictions = function()
//     {
//         $http.post("dummy-url/api/getRecipesByUser", $scope.user).then(
//             function (resp) 
//             {    
//                 console.log("success", resp);
                
                
//             }, 
//             function(resp)
//             {
//                 console.log("failure", resp);
                
                
//             }
//         );
//     }
// }