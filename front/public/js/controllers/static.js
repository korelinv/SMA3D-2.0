angular.module('controller.static',['ui.router','service.session'])
    .controller('staticCtrl', function($scope, $state, $http, $session, $timeout) {

        $scope.approved = false;
        $scope.compiled = false;
        $scope.privileges = {};

        $http({
            method: 'POST',
            url: 'http://localhost:8050/approve',
            data: {
              session: $session.current()
            }
        })
        .then((result) => {
          console.log('approved');
          $scope.approved = true;
          $timeout(function () {
              $scope.compiled = true;
          },5000);
          $scope.privileges = {
              edit: true
          }
        })
        .catch((error) => {
            $session.flush();
            $state.go('login');
        });
    })
