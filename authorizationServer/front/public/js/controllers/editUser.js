angular.module('controller.editUser',['ui.router','service.session','service.userData'])
.controller('editUserFormCtrl', function($scope, $state, $http, $session, $rootScope, $userData) {
    $scope.user = {
        login: "",
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
    // запрос данных пользователя
    $userData.getUser($rootScope.editedUser,$session.current())
    .then((result) => {
        $scope.user = result.data;
        if (!$scope.user.groups) $scope.user.groups = [];
        $rootScope.editedUser = null;
    })
    .catch((error) => {
        console.error(error);
    });
    $scope.AddGroup = function(group) {
        if ($scope.user.groups.indexOf(group) == -1) {
            $scope.user.groups.push(group);
        };
    };
    $scope.RemoveGroup = function(group) {
        var index = $scope.user.groups.indexOf(group);
        $scope.user.groups.splice(index,1);
    };
    $scope.Submit = function () {
        $http({
            method: 'POST',
            url: "/editUser",
            data: {
              session: $session.current(),
              user: $scope.user
            }
        })
        .then((result) => {$state.go('users')})
        .catch((error) => {console.error(error)})
    };
    $scope.GoBack = function () {
        $state.go('users');
    };
})
