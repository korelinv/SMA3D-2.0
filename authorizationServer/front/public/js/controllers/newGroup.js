angular.module('controller.newGroup',['ui.router','service.session','service.snapshots'])
.controller('newGroupFormCtrl', function($scope, $state, $http, $session, $snapshots) {
    $scope.newGroup = {
        id: "",
        name: "",
        startFrom: undefined
    };
    $scope.avalibleSnapshots = [];
    // запрос снапшотов
    $snapshots.getSnapshots({all: true})
    .then((result) => {
        $scope.avalibleSnapshots = result.data;
    })
    .catch((error) => {
        console.error(error);
    });
    $scope.findSnapshot = function(id) {
        let result = null;
        for (let index = 0; index < $scope.avalibleSnapshots.length; index++) {
            if ($scope.avalibleSnapshots[index].id == id) {
                result = $scope.avalibleSnapshots[index].name;
                break;
            };
        };
        return result;
    };
    $scope.setStartingSnapshot = function(id) {
        $scope.newGroup.startFrom = id;
    };
    $scope.Submit = function () {
        $http({
            method: 'POST',
            url: "/newGroup",
            data: {
                session: $session.current(),
                group: $scope.newGroup
            }
        })
        .then((result) => {$state.go('groups')})
        .catch((error) => {console.error(error)})
    };
    $scope.GoBack = function () {
        $state.go('groups');
    };
})
