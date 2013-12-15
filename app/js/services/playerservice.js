/**
 * Created by mauro on 21/11/13.
 */
'use strict';

angular.module('myFutsalApp.services.players', ['myFutsalApp.services.firebaseRefs'])
    .factory('Players', ['FBURL', 'Firebase', 'angularFireCollection', 'FireRef',
        function(FBURL, Firebase, angularFireCollection, FireRef) {
            return {
                collection: function() {
                    return angularFireCollection(FireRef.players());
                }
                , find: function(playerId) {
                    return FireRef.players().child(playerId);
                }
            }
        }])