'use strict';

/* jasmine specs for services go here */

describe('service', function () {
    beforeEach(function () {
        module('fantasyApp.services.login');
        module('fantasyApp.services.players');
        module('fantasyApp.services.leagues');
        module('fantasyApp.services.fantasyTeams');
    });

    beforeEach(module(function ($provide) {
        $provide.value('Firebase', firebaseStub());
        $provide.value('$location', stub('path'));
        $provide.value('FBURL', 'base/test');
        $provide.value('angularFireAuth', angularAuthStub());
        $provide.value('FireRef', fireRefStub());
        $provide.value('angularFireCollection', angularFireCollectionStub());
    }));

    it('should call the sub method defined on jasmine createObj used only to understand jasmine itself',
        inject(function (FireRef) {
            FireRef.players().child(1);
            expect(FireRef.players).toHaveBeenCalled();
            expect(FireRef.players().child).toHaveBeenCalledWith(1);
        })
    );

    describe('loginService', function () {
        describe('#login', function () {
            it('should return error if angularFireAuth.login fails',
                inject(function ($q, $rootScope, loginService, angularFireAuth) {
                    var cb = jasmine.createSpy();
                    angularFireAuth.login.andReturn(reject($q, 'test_error'));
                    loginService.login('test@test.com', '123', null, cb);
                    $rootScope.$apply();
                    expect(cb).toHaveBeenCalledWith('test_error');
                })
            );

            it('should return user if angularFireAuth.login succeeds',
                inject(function (loginService, angularFireAuth, $rootScope, $q) {
                    var cb = jasmine.createSpy();
                    angularFireAuth.login.andReturn(resolve($q, {hello: 'world'}));
                    loginService.login('test@test.com', '123', null, cb);
                    $rootScope.$apply();
                    expect(cb).toHaveBeenCalledWith(null, {hello: 'world'});
                })
            );

            it('should invoke the redirect if angularFireAuth.login succeeds',
                inject(function (loginService, angularFireAuth, $rootScope, $location, $q) {
                    angularFireAuth.login.andReturn(resolve($q, {hello: 'world'}));
                    loginService.login('test@test.com', '123', '/hello');
                    $rootScope.$apply();
                    expect($location.path).toHaveBeenCalledWith('/hello');
                })
            );

            it('should not invoke the redirect if angularFireAuth.login fails',
                inject(function (loginService, angularFireAuth, $rootScope, $location, $q) {
                    angularFireAuth.login.andReturn(reject($q, 'Nooooooo!'));
                    loginService.login('test@test.com', '123', '/hello');
                    $rootScope.$apply();
                    expect($location.path).not.toHaveBeenCalled();
                })
            )
        });

        describe('#logout', function () {
            it('should invoke angularFireAuth.logout()', function () {
                inject(function (loginService, angularFireAuth) {
                    loginService.logout('/bye');
                    expect(angularFireAuth.logout).toHaveBeenCalled();
                });
            });

            it('should invoke redirect after calling logout', function () {
                inject(function (loginService, angularFireAuth, $rootScope, $location) {
                    loginService.logout('/bye');
                    expect($location.path).toHaveBeenCalledWith('/bye');
                });
            });
        });

        describe('#changePassword', function () {
            it('should fail if old password is missing',
                inject(function (loginService, angularFireAuth) {
                    var cb = jasmine.createSpy();
                    loginService.changePassword({
                        newpass: 123,
                        confirm: 123,
                        callback: cb
                    });
                    expect(cb).toHaveBeenCalledWith('Please enter a password');
                    expect(angularFireAuth.changePassword).not.toHaveBeenCalled();
                })
            );

            it('should fail if new password is missing',
                inject(function (loginService, angularFireAuth) {
                    var cb = jasmine.createSpy();
                    loginService.changePassword({
                        oldpass: 123,
                        confirm: 123,
                        callback: cb
                    });
                    expect(cb).toHaveBeenCalledWith('Please enter a password');
                    expect(angularFireAuth.changePassword).not.toHaveBeenCalled();
                })
            );

            it('should fail if passwords don\'t match',
                inject(function (loginService, angularFireAuth) {
                    var cb = jasmine.createSpy();
                    loginService.changePassword({
                        oldpass: 123,
                        newpass: 123,
                        confirm: 124,
                        callback: cb
                    });
                    expect(cb).toHaveBeenCalledWith('New passwords do not match');
                    expect(angularFireAuth.changePassword).not.toHaveBeenCalled();
                })
            );

            it('should fail if angularFireAuth fails',
                inject(function (loginService, angularFireAuth) {
                    var cb = jasmine.createSpy();

                    customSpy(angularFireAuth._authClient, 'changePassword', function (oldp, newp, confp, cb) {
                        cb(new ErrorWithCode(123, 'errr'));
                    });

                    loginService.changePassword({
                        oldpass: 124,
                        newpass: 123,
                        confirm: 123,
                        callback: cb
                    });
                    expect(cb).toHaveBeenCalledWith('Error changing password!');
                    expect(angularFireAuth._authClient.changePassword).toHaveBeenCalled();
                })
            );

            it('should return null if angularFireAuth succeeds',
                inject(function (loginService, angularFireAuth) {
                    var cb = jasmine.createSpy();

                    customSpy(angularFireAuth._authClient, 'changePassword', function (oldp, newp, confp, cb) {
                        cb(null);
                    });

                    loginService.changePassword({
                        oldpass: 124,
                        newpass: 123,
                        confirm: 123,
                        callback: cb
                    });
                    expect(cb).toHaveBeenCalledWith(null);
                    expect(angularFireAuth._authClient.changePassword).toHaveBeenCalled();
                })
            );
        });

        describe('#createAccount', function () {
            it('should invoke angularFireAuth',
                inject(function (loginService, angularFireAuth) {
                    loginService.createAccount('test@test.com', 123);
                    expect(angularFireAuth._authClient.createUser).toHaveBeenCalled();
                })
            );

            it('should invoke callback if error',
                inject(function (loginService, angularFireAuth) {
                    var cb = jasmine.createSpy(), undefined;
                    customSpy(angularFireAuth._authClient, 'createUser', function (e, p, cb) {
                        cb('errr');
                    });
                    loginService.createAccount('test', 'test@test.com', 123, cb);
                    expect(cb).toHaveBeenCalledWith('errr', undefined);
                })
            );

            it('should invoke callback if success',
                inject(function (loginService, angularFireAuth) {
                    var cb = jasmine.createSpy();
                    customSpy(angularFireAuth._authClient, 'createUser', function (e, p, cb) {
                        cb(null, 'oh hai!');
                    });
                    loginService.createAccount('test', 'test@test.com', 123, cb);
                    expect(cb).toHaveBeenCalledWith(null, 'oh hai!');
                })
            )
        });

        describe('#createProfile', function () {
            it('should be the createProfile service',
                inject(function (loginService, profileCreator) {
                    expect(loginService.createProfile).toBe(profileCreator);
                })
            );
        });
    });

    describe('profileCreator', function () {
        it('should invoke set on Firebase',
            inject(function (profileCreator, Firebase) {
                profileCreator(123, 'Test', 'test@test.com');
                expect(Firebase.fns.set.argsForCall[0][0]).toEqual({email: 'test@test.com', name: 'Test'});
            })
        );

        it('should invoke the callback', function () {
            inject(function (profileCreator, Firebase) {
                var cb = jasmine.createSpy();
                customSpy(Firebase.fns, 'set', function (val, cb) {
                    cb();
                });
                profileCreator(456, 'test2', 'test2@test2.com', cb);
                expect(cb).toHaveBeenCalled();
            })
        });

        it('should return any error in the callback',
            inject(function (profileCreator, Firebase) {
                var cb = jasmine.createSpy();
                customSpy(Firebase.fns, 'set', function (val, cb) {
                    cb('noooooo');
                });
                profileCreator(456, 'test2', 'test2@test2.com', cb);
                expect(cb).toHaveBeenCalledWith('noooooo');
            })
        );
    });

    describe('Players', function () {

        it('should invoke angularFireCollection ',
            inject(function (Players, angularFireCollection, FireRef) {
                Players.collection();
                expect(angularFireCollection).toHaveBeenCalledWith(FireRef.players());
            })
        );


        it('should invoke child on FireRef',
            inject(function (Players, angularFireCollection, FireRef) {
                Players.find(1);
                expect(FireRef.players().child).toHaveBeenCalledWith(1);
            })
        );
    });

    describe('Leagues', function () {

        describe('collection', function () {
            var cb = function(){};
            it('should invoke angularFireCollection ',
                inject(function (Leagues, angularFireCollection, FireRef) {
                    Leagues.collection(cb);
                    expect(angularFireCollection).toHaveBeenCalledWith(FireRef.leagues(),cb);
                })
            );

            it('should invoke FireRef.players ',
                inject(function (Leagues, angularFireCollection, FireRef) {
                    Leagues.collection(cb);
                    expect(FireRef.leagues).toHaveBeenCalled()
                })
            );
        });


        it('find should invoke child on FireRef players',
            inject(function (Leagues, angularFireCollection, FireRef) {
                Leagues.find(1);
                expect(FireRef.players().child).toHaveBeenCalledWith('/1');
            })
        );


        describe('create', function () {
            var league = { name: 'prova'};
            var commissioner = { id: 1 };
            var cb = function(){};

            it('should invoke push on FireRef leagues',
                inject(function (Leagues, angularFireCollection, FireRef) {
                    Leagues.create(league,commissioner,cb);
                    expect(FireRef.players().push).toHaveBeenCalledWith(
                        {
                            name: league.name,
                            commissionerId: commissioner.id,
                            fantasyTeams: []
                        }, cb
                    );
                })
            );
        });

        describe('removeLeague', function () {
            it('should invoke child on FireRef',
                inject(function (Leagues, angularFireCollection, FireRef) {
                    Leagues.removeLeague(1);
                    expect(FireRef.players().child).toHaveBeenCalledWith('/1');
                })
            );

            it('should invoke remove on FireRef child',
                inject(function (Leagues, angularFireCollection, FireRef) {
                    Leagues.removeLeague(1);
                    expect(FireRef.players().child().remove).toHaveBeenCalled();
                })
            );
        });
    });

    describe('FantasyTeams', function () {
        var data = { val: function(){ return {leagueId: 100, ownerId: 1000}} };
        var fantasyTeam = {
            name: 'prova',
            leagueId: 1,
            once: function(cmd,fnc){ fnc(data); },
            remove: jasmine.createSpy()
        };
        spyOn(fantasyTeam,'once').andCallThrough();

        var owner = { id: 10 };
        var cb = function(){};


        describe('collection', function () {
            var cb = function(){};
            it('should invoke angularFireCollection ',
                inject(function (FantasyTeams, angularFireCollection, FireRef) {
                    FantasyTeams.collection(cb);
                    expect(angularFireCollection).toHaveBeenCalledWith(FireRef.fantasyTeams(),cb);
                })
            );

            it('should invoke FireRef.fantasyTeams ',
                inject(function (FantasyTeams, angularFireCollection, FireRef) {
                    FantasyTeams.collection(cb);
                    expect(FireRef.fantasyTeams).toHaveBeenCalled()
                })
            );
        });

        it('find should invoke child on FireRef players',
            inject(function (FantasyTeams, angularFireCollection, FireRef) {
                FantasyTeams.find(1);
                expect(FireRef.fantasyTeams().child).toHaveBeenCalledWith(1);
            })
        );

        describe('create', function () {
            it('should invoke push on FireRef fantasyTeams',
                inject(function (FantasyTeams, angularFireCollection, FireRef) {
                    FantasyTeams.create(fantasyTeam,owner,cb);

                    expect(FireRef.fantasyTeams().push).toHaveBeenCalledWith(
                        {
                            name: fantasyTeam.name,
                            leagueId: fantasyTeam.leagueId,
                            ownerId: owner.id
                        }, cb
                    );
                })
            );

            it('should invoke child set true on FireRef leagues',
                inject(function (FantasyTeams, angularFireCollection, FireRef) {
                    FireRef.fantasyTeams().push().innerName = fantasyTeam.name;

                    FantasyTeams.create(fantasyTeam,owner,cb);
                    expect(FireRef.leagues().child).toHaveBeenCalledWith('/1/fantasyTeams/prova');
                    expect(FireRef.leagues().child().set).toHaveBeenCalledWith(true);
                })
            );

            it('should invoke child set true on FireRef users',
                inject(function (FantasyTeams, angularFireCollection, FireRef) {
                    FireRef.fantasyTeams().push().innerName = fantasyTeam.name;

                    FantasyTeams.create(fantasyTeam,owner,cb);

                    expect(FireRef.users().child).toHaveBeenCalledWith('/10/fantasyTeams/prova');
                    expect(FireRef.users().child().set).toHaveBeenCalledWith(true);
                })
            );
        });

        it('removeFantasyTeam should invoke removeFantasyTeam',
            inject(function (FantasyTeams, angularFireCollection, FireRef) {
                //preparing a fake find only to test the rest

                FantasyTeams['find'] = function(id){ return fantasyTeam;}
                spyOn(FantasyTeams,'find').andCallThrough();

                FantasyTeams.removeFantasyTeam(1);

                expect(FireRef.leagues().child).toHaveBeenCalledWith('/100');
                expect(FireRef.leagues().child().child).toHaveBeenCalledWith('/fantasyTeams/1');
                expect(FireRef.leagues().child().child().remove).toHaveBeenCalled();

                expect(FireRef.users().child).toHaveBeenCalledWith('/1000');
                expect(FireRef.users().child().child).toHaveBeenCalledWith('/fantasyTeams/1');
                expect(FireRef.users().child().child().remove).toHaveBeenCalled();



            })
        );
    });


    function stub() {
        var out = {};
        angular.forEach(arguments, function (m) {
            out[m] = jasmine.createSpy();
        });
        return out;
    }

    function reject($q, error) {
        var def = $q.defer();
        def.reject(error);
        return def.promise;
    }

    function resolve($q, val) {
        var def = $q.defer();
        def.resolve(val);
        return def.promise;
    }

    function firebaseStub() {
        // firebase is invoked using new Firebase, but we need a static ref
        // to the functions before it is instantiated, so we cheat here by
        // attaching the functions as Firebase.fns, and ignore new (we don't use `this` or `prototype`)
        var fns = stub('set');
        customSpy(fns, 'child', function () {
            return fns;
        });
        var path = '';
        var Firebase = function (url) {
            angular.extend(this, fns);
            this.spyLink = jasmine.createSpy();
            this.spyLink(url);
            return fns;
        };
        Firebase.path = path;
        Firebase.fns = fns;
        return Firebase;
    }

    function fireRefStub() {
        var col = {
            innerName: '_name',
            name: function() { return this.innerName; },
            remove: jasmine.createSpy(),
            set: jasmine.createSpy(),
            child: function() { return col; }
        };
        spyOn(col, 'name').andCallThrough();
        spyOn(col, 'child').andCallThrough();

        var fb = {
            child: function() { return col; },
            push: function() { return col; }
        };
        spyOn(fb, 'child').andCallThrough();
        spyOn(fb, 'push').andCallThrough();

        var fireRef = {
            players: function () { return fb; },
            leagues: function() { return fb; },
            fantasyTeams: function() { return fb; },
            users: function() { return fb; }
        };
        spyOn(fireRef, 'players').andCallThrough();
        spyOn(fireRef, 'leagues').andCallThrough();
        spyOn(fireRef, 'fantasyTeams').andCallThrough();
        spyOn(fireRef, 'users').andCallThrough();

        return fireRef;
    }

    function angularFireCollectionStub() {
        var spy = jasmine.createSpy();
        spy.tag = 'stub_afc';
        return spy;
    }

    function angularAuthStub() {
        var auth = stub('login', 'logout', 'createAccount', 'changePassword');
        auth._authClient = stub('changePassword', 'createUser');
        return auth;
    }

    function customSpy(obj, m, fn) {
        obj[m] = fn;
        spyOn(obj, m).andCallThrough();
    }

    function ErrorWithCode(code, msg) {
        this.code = code;
        this.msg = msg;
    }



    ErrorWithCode.prototype.toString = function () {
        return this.msg;
    }
});

