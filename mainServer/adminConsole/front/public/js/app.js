const app = angular.module('adminConsole',[])

  .service('dataProvider', function($http) {
    let provider = this;
    provider.GetModels = () => $http({method: 'GET', url: '/models'});
    provider.EditModel = (input) => $http({ method: 'POST', url: '/models/edit', headers: {}, data: input });
    provider.DeleteModel = (input) => $http({ method: 'POST', url: '/models/delete', headers: {}, data: input });
  })

  .controller('modelManagerCtrl',function($scope, dataProvider) {

    $scope.models = [];
    $scope.addingForm = false;
    $scope.file;

    $scope.refresh = function() {
      dataProvider.GetModels()
      .then((result) => {$scope.models = result.data;})
      .catch((error) => {console.error(error);});
    };
    $scope.read = (input) => $scope.file = JSON.parse(input);
    $scope.add = function (input) {
      dataProvider.EditModel(input)
      .then((result) => {
        console.log(result);
        $scope.close();
        $scope.refresh();
      })
      .catch((error) => {console.error(error);});
    };
    $scope.delete = function (input) {
      dataProvider.DeleteModel(input)
      .then((result) => {
        console.log(result);
        $scope.refresh();
      })
      .catch((error) => {console.error(error);});
    };
    $scope.open = function () {
      $scope.addingForm = true;
    };
    $scope.close = function () {
      $scope.addingForm = false;
      $scope.file = undefined;
    };

    $scope.refresh();

  })

  .directive('settingsLine', function () {
    return {
      restrict: 'E',
      template: '<div ng-click="collapse()"><span class="{{slClass}}">{{slCaption}}</span> {{slValue}} <span ng-if="collapsed && slNested">{...}</span></div><div ng-if="!collapsed && slNested">{<div class="code-padding"><settings-line ng-repeat="sub in slNested" sl-value="sub.value" sl-caption="{{sub.name}}" sl-class="sub.class" sl-nested="sub.nested"></settings-line></div>}</div>',
      scope: {
        slValue: '=',
        slNested: '=',
        slCaption: '@',
        slClass: '@'
      },
      link: function (scope) {
        scope.collapsed = true;
        scope.collapse = function () {
          scope.collapsed = !scope.collapsed;
        };
      }
    };
  })

  .directive('onReadFile', function ($parse) {
    return {
      restrict: 'A',
      scope: false,
      link: function(scope, element, attrs) {
              var fn = $parse(attrs.onReadFile);
        element.on('change', function(onChangeEvent) {
          var reader = new FileReader();
          reader.onload = function(onLoadEvent) {
            scope.$apply(function() {
              fn(scope, {$fileContent:onLoadEvent.target.result});
            });
          };
          reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
        });
      }
    };
  })
