angular.module('directive.sideMenu',['ui.router'])
.controller('sideMenuCtrl', function ($scope, $state) {
  $scope.rout = [
    {
      state: 'dashboard',
      caption: "Дашборд"
    },
    {
      state: 'users',
      caption: "Управление пользователями"
    },
    {
      state: 'groups',
      caption: "Управление группами"
    },
    {
      state: 'logs',
      caption: 'Архив доступа'
    },
    {
      state: 'preferences',
      caption: "Настройки"
    }
  ]
  $scope.Go = function (destination) {
    $state.go(destination);
  };
})
.directive('sideMenu', function () {
  return {
    restrict: 'E',
    templateUrl: 'js/directives/sideMenu/sideMenuView.html',
    controller: 'sideMenuCtrl'
  };
})
