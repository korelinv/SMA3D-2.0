angular.module('controller.groups',['ui.router','service.session'])
.controller('groupsCtrl', function($scope, $state, $http, $window, $session) {
    $scope.groups = [];
    $scope.GetGroupsList = function() {
        return $http({
            method: 'POST',
            url: '/groupsList',
            data: {
                session: $session.current()
            }
        })
    };
    $scope.AddNewGroup = function() {
        $state.go('newGroup');
    }

    $scope.GetGroupsList()
    .then((result) => {
        $scope.groups = result.data;
    })
    .catch((error) => {
        console.error(error);
    })
})
