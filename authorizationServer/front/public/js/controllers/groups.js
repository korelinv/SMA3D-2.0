angular.module('controller.groups',['ui.router','service.session', 'service.groups'])
.controller('groupsCtrl', function($scope, $state, $session, $groups) {
    $scope.groups = [];


    $groups.Get({update: true})
    .then((result) => {
        $scope.groups = result;
    });


    /*
    $scope.GetGroupsList = function() {
        return $http({
            method: 'POST',
            url: '/groupsList',
            data: {
                session: $session.current()
            }
        })
    };
    */


    $scope.AddNewGroup = function() {
        $state.go('newGroup');
    }

    $scope.EditGroup = function(id) {
        $state.go('editGroup');
    };

    /*
    $scope.GetGroupsList()
    .then((result) => {
        $scope.groups = result.data;
    })
    .catch((error) => {
        console.error(error);
    })
    */
})
