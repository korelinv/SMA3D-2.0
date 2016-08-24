angular.module('controller.desktop',['ui.router','service.user', 'service.startpoint'])
    .controller('desktopCtrl', function($scope, $state, $user, $startpoint, dataProvider) {

        //TO DO переделать на подкачивание данных по айдишникам

        $scope.user = $user.current();
        $scope.avalibleStartScreens = [];

        $scope.screens = [];

        $scope.openScreen = function(id) {
          $startpoint.set(id);
          $state.go('main.index');
        };

        if ($scope.user.groups) {
            $scope.user.groups.forEach(function (item) {
                if (item.startFrom) {
                  $scope.avalibleStartScreens.push(item);
                }
            });
            if ($scope.avalibleStartScreens.length == 1) {
                $startpoint.set($scope.avalibleStartScreens[0]);
                $state.go('main.index');
            }
            else {

                let list = [];
                $scope.avalibleStartScreens.forEach(function(item) {
                    if (item.startFrom) list.push(item.startFrom);
                });

                dataProvider.GetSnapshots(list)
                .then((result) => {
                    $scope.screens = result;
                })
                .catch((error) => {console.error(error);})
            }
        }
        else {};

    });
