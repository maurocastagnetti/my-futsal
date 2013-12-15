'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('myFutsalApp',
  [ 'myFutsalApp.config'
  , 'myFutsalApp.controllers.header'
  , 'myFutsalApp.controllers.signin'
  , 'myFutsalApp.controllers.signup'
  , 'myFutsalApp.controllers.leagues'
  , 'myFutsalApp.controllers.players'
  , 'myFutsalApp.controllers.fantasyTeams'
  , 'firebase', 'ui.bootstrap', 'ngRoute']
  )
