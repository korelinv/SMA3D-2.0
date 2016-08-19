angular.module('controller.static',['ui.router','service.userData','service.session'])
    .controller('staticCtrl', function($scope, $state, $http, $session, $userData) {
        $scope.userInfo = {};
        $http({
            method: 'POST',
            url: '/approve',
            data: {
              session: $session.current()
            }
        })
        .then((result) => $userData.getUser($userData.currentUser(),$session.current()))
        .then((result) => {
            $scope.userInfo = result.data;
        })
        .catch((error) => {
            $session.flush();
            $state.go('login');
        });
        $scope.logOut = function() {
            $http({
            method: 'POST',
            url: '/logout',
            data: {
                session: $session.current()
            }
            })
            .then((result) => {
                $session.flush();
                $state.go('login');
            })
            .catch((error) => {
                console.error(error);
            });
        };
    })
