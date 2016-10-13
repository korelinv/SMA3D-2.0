angular.module('controller.login',['ui.router','service.session','service.user'])
    .controller('loginFormCtrl', function ($scope, $state, $http, $session, $user) {
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
              return $user.request(login);
            })
            .then((result) => {
                $state.go('desktop');
            })
            .catch((error) => {console.error(error)});
        };

    })
