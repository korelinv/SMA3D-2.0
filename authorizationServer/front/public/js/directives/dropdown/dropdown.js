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

    - placeholder (optional): sets input placeholder

    cpMode options: if ==true component is in edit mode, if ==false component is in view only mode
*/

angular.module('directive.dropdown',[])

    .directive('dropdown', function() {

        let height = 24;
        let width = 256;
        let fontSize = 12;
        let optionFontSize = 12;
        let optionHeight = 22;
        let dropdownSize = 10;

        let style = {

            caretLink: '',

            warpper: {
              'position' : 'relative'
            },
            container: {
              'position' : 'absolute',
              'height' : height + 'px',
              'width': width + 'px',
              'border': '1px solid rgb(219, 219, 219)',
              'border-radius': '2px'
            },

            input: {
              wrapper: {
                'float' : 'left'
              },
              input: {
                'border': '0px solid rgb(255, 255, 255)',
                'margin': '0px',
                'width': (width - height - 8) + 'px',
                'height': height + 'px',
                'font-size': fontSize + 'pt',
                'margin' : '0px',
                'padding-left': '4px',
                'padding-right': '4px',
                'padding-top': '0px',
                'padding-bottom': '0px',
              }
            },
            caret: {
              'float': 'left',
              'width': height+'px',
              'height': height+'px',
              'cursor': 'pointer'
            },

            dropdown: {
              wrapper: {
                'position': 'absolute',
                'top': height + 'px',
                'left': 0,
                'max-height': optionHeight * dropdownSize +'px',
                'min-width': width +'px',
                'border': '1px solid rgb(101, 195, 255)',
                'border-radius': '2px',
                'overflow-y': 'auto',
                'overflow-x': 'hidden',
                'box-shadow': '2px 2px 8px 4px rgba(196,196,196,0.3)'
              },
              list: {
                'list-style': 'none',
                'padding-left': '8px',
                'padding-right': '4px',
                'padding-top': '4px',
                'padding-bottom': '4px',
                'margin': '0px'
              },
              item: {
                'height': optionHeight+'px',
                'font-size': optionFontSize+'pt',
                'white-space': 'nowrap',
                'cursor': 'pointer'
              }
            }


        };

        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                cpConfig: '=',
                cpMode: '='
            },
            templateUrl: 'js/directives/dropdown/dropdown.html',
            controller: function($element, $scope, $http) {

                $scope.style = style;

                $scope.model = $element.controller('ngModel');
                $scope.unfolded = false;
                $scope.placeholder = '';
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

                    let source = $scope.cpConfig.source;
                    let filter = $scope.cpConfig.filter;
                    let selector = $scope.cpConfig.selector;

                    if (!selector.field || !filter.field) {
                        console.error('directive.dropdown: required filter target field or selector target field');
                        return undefined;
                    };

                    if ($scope.cpConfig.placeholder) $scope.placeholder = $scope.cpConfig.placeholder;

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
