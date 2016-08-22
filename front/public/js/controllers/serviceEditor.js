angular.module('controller.serviceEditor',['ui.router'])
    .controller('serviceEditorCtrl', function ($scope, $state, serviceEditorState, dataProvider) {
        function newReflection (st, cl) {
            return {
                structure: st,
                collections: cl,
                Dublicate: function (element) {
                    let copy = angular.copy(element)
                    return this.Replace(copy, [], [], true);
                },
                Replace: function (element, path, collection, _root) {
                    let id ="";
                    for (let i = 0; i < path.length; i++) {
                        id += path[i] + "\/";
                    };
                    id += element.tag;
                    element.id = id;
                    let newPath = angular.copy(path);
                    element.path = newPath;
                    newPath.push(element.tag);
                    if (element.elementType == "collection") {
                        collection.push(element);
                    };
                    for (let i = 0; i < element.children.length; i++) {
                      this.Replace(element.children[i],newPath,collection,false);
                    };
                    if (_root) return newReflection(element,collection);
                },
                Drop: function () {
                    this.structure = {};
                    this.collections = [];
                }
            };
        };
        $scope.page = 0;
        $scope.parameterType = parameterType;
        $scope.descriptorFieldType = descriptorFieldType;
        $scope.reflection = newReflection({},[]);
        $scope.reflechtionChanged = false;
        $scope.mapCompiled;
        $scope.compileDialog = false;
        $scope.descriptor;
        $scope.schedule;
        $scope.keyPath;
        $scope.Books;
        $scope.BooksMap = {};
        $scope.root;
        if (serviceEditorState.new) {
            dataProvider.GetUuid()
            .then(function (result) {
                $scope.descriptor = {
                    id: result.data,
                    name: "",
                    icon: "",
                    service: {
                        type: "",
                        path: "",
                        parameters: [],
                        referenceBook: false
                    },
                    structure: {
                        name: "",
                        elementType: "collection",
                        dataType: "",
                        tag: "",
                        children: []
                    },
                    collection: {
                        path: [],
                        key: {
                            id: "",
                            type: "",
                            path: []
                        }
                    },
                    compiled: {},
                    compiledExtend: {},
                    extension: [],
                    schedule: ""
                };
                $scope.mapCompiled = false;
                $scope.schedule = {
                    minute: "",
                    hour: "",
                    day: "",
                    month: "",
                    dayOfWeek: ""
                };
            })
            .catch(function (error) {
                console.error(error);
            })
        }
        else {
            dataProvider.GetDescriptor(serviceEditorState.id)
            .then(function (result) {
                $scope.descriptor = result.data;
                $scope.mapCompiled = true;
                let parsedSchedule = $scope.descriptor.schedule.split(" ");
                $scope.schedule = {
                    minute: parsedSchedule[0],
                    hour: parsedSchedule[1],
                    day: parsedSchedule[2],
                    month: parsedSchedule[3],
                    dayOfWeek: parsedSchedule[4]
                };
            })
            .catch(function (error) {
                console.error(error);
            });
        };
        dataProvider.GetBooksList()
        .then((result) => {
            $scope.Books = result.data;
            $scope.Books.forEach(function (element, index, array) {
                $scope.BooksMap[element.id] = element;
            });
        })
        .catch((error) => {console.error(error)});
        $scope.AddParameter = function (parameter) {
            $scope.descriptor.service.parameters.push({
                id: "",
                name: "",
                type: "int",
                required: false,
                default: ""
            });
        };
        $scope.RemoveParameter = function (parameter) {
            $scope.descriptor.service.parameters.splice($scope.descriptor.service.parameters.indexOf(parameter),1);
        };
        $scope.AddChild = function (target) {
            target.children.push({
                name: "",
                elementType: "",
                dataType: "",
                tag: "",
                children: []
            });
            $scope.DetectChanges();
        };
        $scope.DeleteChild = function (parent, element) {
            parent.children.splice(parent.children.indexOf(element),1);
            $scope.DetectChanges();
        };
        $scope.DetectChanges = function () {
            if (!$scope.reflechtionChanged) {
                $scope.reflechtionChanged = true;
                $scope.mapCompiled = false;
            };
        };
        $scope.CompileMap = function () {
            if ($scope.root) {
                $scope.descriptor.compiled = Compile({},true,null,$scope.root);
                $scope.descriptor.collection.path = _root.path;
                $scope.compileDialog = false;
                $scope.mapCompiled = true;
                $scope.reflechtionChanged = false;
            };
        };
        $scope.OpenCompileDialog = function () {
            $scope.compileDialog = true;
            $scope.reflection.Drop();
            $scope.reflection = $scope.reflection.Dublicate($scope.descriptor.structure);
        };
        $scope.CloseCompileDialog = function () {
            $scope.compileDialog = false;
        };
        $scope.FilterKeys = function (input) {
            let result = [];
            for (key in input) {
                if ((input[key].type) && (input[key].path.length == 1)) {
                    let option = {
                        id: key,
                        type: input[key].type,
                        path: input[key].path
                    };
                    result.push(option);
                };
            };
            return result;
        };
        $scope.AddExtension = function () {
            let newExtension = {
                id: "",
                book: ""
            };
            $scope.descriptor.extension.push(newExtension);
        };
        $scope.RemoveExtension = function (input) {
            let index = $scope.descriptor.extension.indexOf(input);
            $scope.descriptor.extension.splice(index,1);
        };
        $scope.BuildBookRequest = function () {
            if ($scope.descriptor.collection.key) {
                if ($scope.descriptor.collection.key.id) {
                    let request = {};
                    for (var element in $scope.descriptor.compiled) {
                        if (element != $scope.descriptor.collection.key.id) request[$scope.descriptor.compiled[element].path.join("/")] = element;
                    };
                    $scope.descriptor.collection.bookRequest = request;
                };
            };
        };
        $scope.GetExpandedFields = function (id) {
            return $scope.BooksMap[id];
        };
        $scope.SetExpansionDetails = function(extension,book) {
            if (book) {
                extension.request = book.request;
                extension.parameters = book.parameters;
                extension.key = book.key;
            };
        };
        $scope.CompileExpandedFields = function () {
            let result = {};
            $scope.descriptor.extension.forEach(function (element, index, array) {
                if (element.book) {
                    let ce = $scope.BooksMap[element.book].compiledExtend;
                    for (var item in ce) {
                        result[item] = ce[item];
                    };
                };
            });
            $scope.descriptor.compiledExtend = result;
        };
        function Compile (container,isRoot,rootPath,element) {
            if (!isRoot) {
                let relativePath = angular.copy(element.path);
                relativePath.splice(0,rootPath.length);
                container[element.id] = {
                    type: element.dataType,
                    path: relativePath
                };
            }
            else {
                rootPath = element.path;
            };
            for (let i = 0; i < element.children.length; i++) {
                Compile(container,false,rootPath,element.children[i]);
            };
            return container;
        };
        $scope.RefreshSchedule = function () {
            $scope.descriptor.schedule = $scope.schedule.minute +" "+ $scope.schedule.hour +" "+ $scope.schedule.day +" "+ $scope.schedule.month;
            if ($scope.schedule.dayOfWeek.length > 0) $scope.descriptor.schedule = $scope.descriptor.schedule +" "+ $scope.schedule.dayOfWeek;
        };
        $scope.Save = function () {
            dataProvider.SaveDescriptor($scope.descriptor)
            .then(function (result) {
                $state.go('main.serviceManager');
            })
            .catch(function (error) {
                console.error(error);
            });
        };
        $scope.Close = function () {
            $state.go('main.serviceManager');
        };
    })
