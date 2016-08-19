angular.module('controller.login',['ui.router','service.session'])
    .controller('loginFormCtrl', function ($scope, $state, $http, $session) {
        $scope.TryLogin = function (login, password) {
            $http({
               method: 'POST',
               url: 'http://localhost:8050/authenticate',
               data: {
                   login: login,
                   password: password
               }
            })
            .then((result) => {
                $session.set(result.data);
                $state.go('main.index');
            })
            .catch((error) => {console.error(error)});
        };

    })
