'use strict';

// Setting up route
angular.module('mean.meanStarter').config(['$meanStateProvider', '$urlRouterProvider',
  function ($meanStateProvider) {
    // For unmatched routes:
    //$urlRouterProvider.otherwise('/');




    // states for my app
    $meanStateProvider
      .state('home', {
        url: '/',
        templateUrl: 'meanStarter/views/system/index.html'
      });
      $meanStateProvider
      .state('pantry', {
        url: '/pantry',
        templateUrl: 'meanStarter/views/system/pantry.html'
      });
       $meanStateProvider
      .state('results', {
        url: '/results',
        templateUrl: 'meanStarter/views/system/results.html'
      });
  }
]).config(['$locationProvider',
  function ($locationProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  }
]);
