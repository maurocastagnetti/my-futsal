/**
 * Created by mauro on 21/11/13.
 */
'use strict';

angular.module('myFutsalApp.controllers.players', ['myFutsalApp.services.players'])
    .controller('PlayersController', ['$scope','$routeParams', 'angularFire', 'Players',
        function ($scope, $routeParams, angularFire, NFL, Players) {

            $scope.searchsize = {
                "limit": 10
            }
            $scope.strictsearch = {};

            $scope.findPlayers = function() {
                $scope.players = Players.collection();
            }

            $scope.findOnePlayer = function() {
                angularFire(Players.find($routeParams.playerId), $scope, 'player');
            }
        }]);