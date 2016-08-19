angular.module('controller.newUser',['ui.router','service.session'])
    .controller('newUserFormCtrl', function($scope, $state, $http, $window, $session) {
        $scope.newUser = {
          login: "",
          password: "",
          name: "",
          surname: "",
          patronymic: "",
          email: "",
          groups: [],
          roles: []
        };
        $scope.avalibleGroups = null;
        $scope.avalibleRoles = null;
        //запрос списка групп
        $http({
            method: 'POST',
            url: '/groupsList',
            data: {
                session: $session.current()
            }
        })
        .then((result) => {
            $scope.avalibleGroups = result.data;
        })
        .catch((error) => {
            console.error(error);
        })
        $scope.AddGroup = function(group) {
            if ($scope.newUser.groups.indexOf(group) == -1) {
                $scope.newUser.groups.push(group);
            };
        };
        $scope.RemoveGroup = function(group) {
            var index = $scope.newUser.groups.indexOf(group);
            $scope.newUser.groups.splice(index,1);
        };
        $scope.ConfirmPassword = function (passwordRepeat) {
            let result = false;
            if (passwordRepeat == $scope.newUser.password) result = true;
            return result;
        };
        $scope.Submit = function () {
            $http({
                method: 'POST',
                url: "/newUser",
                data: {
                    session: $session.current(),
                    user: $scope.newUser
                }
            })
            .then((result) => {$state.go('users')})
            .catch((error) => {console.error(error)})
        };
        $scope.GoBack = function () {
            $state.go('users');
        };
    })
