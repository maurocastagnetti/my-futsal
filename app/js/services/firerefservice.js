/**
 * Created by mauro on 17/11/13.
 */
'use strict';

angular.module('myFutsalApp.services.firebaseRefs', [])
    .factory('FireRef', ['FBURL', 'Firebase',
        function(FBURL, Firebase) {
            return {
                leagues: function() {
                    return new Firebase(FBURL+'/leagues');
                }
                , users: function() {
                    return new Firebase(FBURL+'/users');
                }
                , players: function() {
                    return new Firebase(FBURL+'/players');
                }
                , fantasyTeams: function() {
                    return new Firebase(FBURL+'/fantasyTeams');
                }
            }
        }])