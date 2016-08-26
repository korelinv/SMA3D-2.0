/*
@ Dropdown component with option filtration

    cpConfig options:
    - source:
      - list: expected list of objects
      - request: expected api request promise
      - argument (optional, only if request): argument for api request

    - filter:
      - field: name of the field suggsestions are filtered by
      - strict: if true looks for exact match< else looks for substring
      - case: if false case in input as well as suggestion is ignored

    - selector:
      - field: name of the field that will be selected as value of the field

    cpMode options: if ==true component is in edit mode, if ==false component is in view only mode
*/

angular.module('directive.dropdown',[])

    .directive('dropdown', function() {
        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                cpConfig: '=',
                cpMode: '='
            },
            templateUrl: 'js/directives/dropdown/dropdown.html',
            controller: function($element, $scope, $http) {
                $scope.model = $element.controller('ngModel');
                $scope.unfolded = false;
                $scope.filterValue = '';
                $scope.dropdownOptions = [];

                $scope.Unfold = function () {
                    $scope.unfolded = true;
                };
                $scope.Fold = function () {
                    $scope.unfolded = false;
                };
                $scope.SwitchFold = function() {
                    $scope.unfolded = !$scope.unfolded;
                };

                if (!$scope.cpConfig) {
                    console.error('directive.dropdown: cp-config required');
                    return;
                }
                else {

                    console.log($scope.cpMode);

                    let source = $scope.cpConfig.source;
                    let filter = $scope.cpConfig.filter;
                    let selector = $scope.cpConfig.selector;

                    if (!selector.field || !filter.field) {
                        console.error('directive.dropdown: required filter target field or selector target field');
                        return undefined;
                    };

                    $scope.findOption = function() {
                        let result = null;
                        for (let index = 0; index < $scope.dropdownOptions.length; index++) {
                            if ($scope.dropdownOptions[index][selector.field] == $scope.model.$viewValue) {
                                result = $scope.dropdownOptions[index][filter.field];
                                break;
                            };
                        };
                        return result;
                    };

                    if (source.list) {
                        $scope.dropdownOptions = source.list;
                        $scope.filterValue = $scope.findOption();
                    }
                    else if (source.request) {
                        source.request(source.argument).then((list) => {
                            $scope.dropdownOptions = list.data;
                            $scope.filterValue = $scope.findOption();
                        });
                    }
                    else {
                        console.error('directive.dropdown: list of objects or api request required as source');
                        return;
                    };

                    $scope.filterBy = function (object) {
                        let result = true;
                        if (filter && filter.field) {
                            if (object[filter.field]) {
                                let target = object[filter.field];
                                let rule = $scope.filterValue;
                                if (!filter.case) {
                                    if (target) target = target.toLowerCase();
                                    if (rule) rule = rule.toLowerCase();
                                };
                                if (!filter.strict) result = (target.indexOf(rule) != -1);
                                else if (filter.strict) result = (target == rule);
                                else if (rule == '') result = true;
                            };
                        };
                        return result;
                    };

                    $scope.Select = function(object) {
                        if (selector && selector.field) {
                            if (object[selector.field]) {
                                $scope.filterValue = object[filter.field];
                                $scope.model.$setViewValue(object[selector.field]);
                                $scope.Fold();
                            };
                        };
                    };

                };
            }
        };
    })
