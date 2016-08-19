angular.module('controller.login',['ui.router','service.userData','service.session','service.snapshots'])
    .controller('loginFormCtrl', function($scope, $http, $state, $session, $userData, snapshots) {
        $scope.TryLogin = function (login, password) {
            $http({
               method: 'POST',
               url: '/authenticate',
               data: {
                   login: login,
                   password: password
               }
            })
            .then((result) => {
                $session.set(result.data);
                $userData.setCurrentUser(login);
                return $http({
                    method: 'POST',
                    url: '/endpoints',
                    data: {
                        session: $session.current()
                    }
                });
            })
            .then((result) => {
                $snapshots.setPath(result.data.snapshots);
                $state.go('dashboard');
            })
            .catch((error) => {console.error(error)});
        };
    })
