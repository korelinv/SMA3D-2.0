angular.module('directive.input',[])
    .directive('regularInput', function() {

        //default styles (minimal required)
        let height = 24;
        let width = 256;
        let fontSize = 12;

        let style = {

          wrapper: {},
          container: {
              'height' : height + 'px',
              'width': width + 'px',
              'border': '1px solid rgb(219, 219, 219)',
              'border-radius': '2px'
          },
          input: {
              wrapper: {},
              input: {
                  'border': '0px solid rgb(255, 255, 255)',
                  'margin': '0px',
                  'width': (width - 8) + 'px',
                  'height': height + 'px',
                  'font-size': fontSize + 'pt',
                  'margin' : '0px',
                  'padding-left': '4px',
                  'padding-right': '4px',
                  'padding-top': '0px',
                  'padding-bottom': '0px'
              }
          }

        };

        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                model: '=ngModel',
                cpConfig: '=',
                cpMode: '='
            },
            templateUrl: 'js/directives/input/input.html',
            controller: function($element, $scope) {

                $scope.type = 'text';
                $scope.placeholder = '';

                if ($scope.cpStyle) $scope.style = $scope.cpStyle;
                else $scope.style = style;


                if (!$scope.cpConfig) {
                    console.error('directive.input: cp-config required');
                    return;
                }
                else {
                    if ($scope.cpConfig.type) $scope.type = $scope.cpConfig.type;
                };

            }
        };
    })
