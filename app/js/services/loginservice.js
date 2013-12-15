
'use strict';

/* Services */

angular.module('myFutsalApp.services.login', ['myFutsalApp.services.profileCreator'])
  .factory('loginService', ['angularFireAuth', 'profileCreator', '$location', '$rootScope',
    function(angularFireAuth, profileCreator, $location, $rootScope) {
      return {
        login: function(email, pass, redirect, callback) {
          var p = angularFireAuth.login('password', {
            email: email,
            password: pass,
            rememberMe: true
          });
          p.then(function(user) {
            if( redirect ) {
              $location.path(redirect);
            }
            callback && callback(null, user);
          }, callback);
        },
        logout: function(redirectPath) {
          angularFireAuth.logout();
          if(redirectPath) {
            $location.path(redirectPath);
          }
        },
        createAccount: function(name, email, pass, callback) {
          angularFireAuth._authClient.createUser(email, pass, function(err, user) {
            if(callback) {
              callback(err, user);
              $rootScope.$apply();
            }
          });
        },
        changePassword: function(params){
           if( !( params.oldpass && params.newpass && params.confirm ) ){
               if(params.callback) params.callback('Please enter a password');
               return;
           }
           if( params.newpass != params.confirm){
               if(params.callback) params.callback('New passwords do not match');
               return
           }

           angularFireAuth._authClient.changePassword($rootScope.email, params.oldpass, params.newpass, function(error, success) {
            if (error) {
                if(params.callback) params.callback('Error changing password!');
                console.log('Error changing Password!');
            } else if(success){
                if(params.callback) params.callback('Password change successfully!');
                console.log('Password change successfully');
            }
           });
        },
        createProfile: profileCreator
      }
    }])
