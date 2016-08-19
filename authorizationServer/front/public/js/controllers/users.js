angular.module('controller.users',['ui.router','service.userData','service.session'])
    .controller('usersCtrl', function($scope, $state, $http, $session, $rootScope, $userData) {
        $scope.users = [];
        $scope.EditUser = function(login) {
            $rootScope.editedUser = login;
            $state.go('editUser');
        };
        $scope.CreateNewUser = function() {
            $state.go('newUser');
        };
        $scope.DeleteUser = function(login) {
            $userData.deleteUser(login, $session.current())
            .then(() => $userData.getUsersList($session.current()))
            .then((result) => {
                $scope.users = result.data;
            })
            .catch((error) => {
                console.error(error);
            })
        };
        $scope.CurrentUser = function() {
            return $userData.currentUser();
        };
        $userData.getUsersList($session.current())
        .then((result) => {$scope.users = result.data})
        .catch((error) => {console.error(error)})
    })
