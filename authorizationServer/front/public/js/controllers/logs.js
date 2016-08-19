angular.module('controller.logs',['ui.router','service.session'])
.controller('logsCtrl', function($scope, $state, $http, $window, $session) {
    $scope.logs = [];
    $scope.filter = {
        ip: "",
        login: "",
        code: ""
    };
    $scope.sdate = new Date();
    $scope.edate = new Date();
    $scope.edate.setHours(0,0,0,0);
    $scope.sdate.setHours(0,0,0,0);
    $scope.sdate.setDate($scope.sdate.getDate()-7);
    $scope.edate.setDate($scope.edate.getDate()+1);
    $scope.GetLogs = function () {
        return $http({
            method: 'POST',
            url: '/logs',
            data: {
                sdate: $scope.sdate,
                edate: $scope.edate,
                session: $session.current()
            }
        })
    };
    $scope.UpdateLogs = function () {
        $scope.GetLogs()
        .then((result) => {$scope.logs = result.data})
        .catch((error) => {console.error(error)})
    };
    $scope.UpdateLogs();
})
