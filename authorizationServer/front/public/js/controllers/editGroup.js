angular.module('controller.editGroup',['ui.router', 'service.session','service.snapshots','service.groups'])
    .controller('editGroupFormCtrl', function($scope, $http, $state, $stateParams, $session, $snapshots, $groups) {

        $scope.newGroup = {
            id: "",
            name: "",
            startFrom: undefined
        };
        $scope.avalibleSnapshots = [];
        $scope.edit = false;
        $scope.snapshotName;

        $scope.nameConfig = {}
        $scope.startFromConfig = {
            source: {
                request: $snapshots.getSnapshots,
                argument: {
                    all: true
                }
            },
            filter: {
                field: 'name',
                strict: false,
                case: false
            },
            selector: {
                field: 'id'
            },
            placeholder: 'выберите группу'
        };


        $groups.Get({id: $stateParams.id}).then((result) => {
            $scope.newGroup = result;
        });

        $scope.Edit = function() {
            $scope.edit = true;
        };


        $scope.SetStartingSnapshot = function(snapshot) {
            $scope.newGroup.startFrom = snapshot.id;
            $scope.snapshotName = snapshot.name;
        };

        $scope.Submit = function (valid) {
            if (valid) {
                $http({
                    method: 'POST',
                    url: "/newGroup",
                    data: {
                        session: $session.current(),
                        group: $scope.newGroup
                    }
                })
                .then((result) => {
                  $scope.edit = false;
                })
                .catch((error) => {console.error(error)})
            }
        };

        $scope.GoBack = function () {
            $state.go('groups');
        };
    })
