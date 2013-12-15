/**
 * Created by mauro on 08/12/13.
 */


describe('service', function () {

    function FireBaseMock() {

        function Firebase(url){

            this.spyLink = jasmine.createSpy();

            this.path = url;
            this.spyLink(url);
        }

        return Firebase;
    }

    beforeEach(function () {
        module('fantasyApp.services.firebaseRefs');
    });

    beforeEach(module(function ($provide) {
        $provide.value('Firebase', FireBaseMock());
        $provide.value('FBURL', 'base/test');
    }));

    describe('FireRef', function () {
        it('should invoke new Firebase with right leagues URL',
            inject(function (FireRef, FBURL, Firebase) {

                var leagues = FireRef.leagues();

                expect(leagues.spyLink).toHaveBeenCalledWith('base/test/leagues');
            })
        );

        it('should invoke new Firebase with right users URL',
            inject(function (FireRef, FBURL, Firebase) {

                var users = FireRef.users();

                expect(users.spyLink).toHaveBeenCalledWith('base/test/users');
            })
        );


        it('should invoke new Firebase with right players URL',
            inject(function (FireRef, FBURL, Firebase) {

                var players = FireRef.players();

                expect(players.spyLink).toHaveBeenCalledWith('base/test/players');
            })
        );

        it('should invoke new Firebase with right fantasyTeams URL',
            inject(function (FireRef, FBURL, Firebase) {

                var fantasyTeams = FireRef.fantasyTeams();

                expect(fantasyTeams.spyLink).toHaveBeenCalledWith('base/test/fantasyTeams');
            })
        );
    });

});



