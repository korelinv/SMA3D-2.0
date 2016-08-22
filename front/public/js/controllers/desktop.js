angular.module('controller.desktop',['ui.router','service.user', 'service.startpoint'])
    .controller('desktopCtrl', function($scope, $state, $user, $startpoint) {
        $scope.user = $user.current();
        $scope.avalibleStartScreens = [];

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
            };
        }
        else {};

    });
