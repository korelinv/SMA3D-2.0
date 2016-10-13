angular.module('controller.settingsEditor',['ui.router'])
    .controller('settingsEditorCtrl', function ($scope, $state, settingsEditorState, editorModel, dataProvider) {
        $scope.instance = settingsEditorState.instance;
        $scope.parameterType = parameterType;
        $scope.snapshot;
        $scope.descriptors;
        $scope.avalibles = {
            avalibleParameters: [],
            avalibleFields: []
        };
        $scope.parameterAdding = false;
        $scope.snapshotSelection = false;
        $scope.mutatedSnapshot;
        $scope.mutatedView = false;
        $scope.newParameter;
        $scope.parameterType = parameterType;
        $scope.actionType = actionType;
        $scope.selectedCategory = "__all";
        $scope.snapshotSelectionTarget;
        $scope.snapshotSelectionTemp;
        $scope.avalibleSnapshots = editorModel.snapshots;
        $scope.avalibleCategories = editorModel.categories.list;
        $scope.targetModificator = null;
        dataProvider.GetDescriptorsList()
        .then(result => {$scope.descriptors = result.data;})
        .catch(error => console.error(error));
        dataProvider.GetSnapshot(settingsEditorState.id)
        .then(result => {
            $scope.snapshot = result.data;
            return dataProvider.GetDescriptor($scope.snapshot.settings.dataset);
        })
        .then(result => {
            let compiled = Flatten(result.data.compiled);
            let extend = Flatten(result.data.compiledExtend);
            $scope.avalibles.avalibleFields = compiled.concat(extend);
        })
        .catch(error => console.error(error));
        $scope.MutatedSwitchStyle = function () {
            let result;
            if (!$scope.mutatedView)
                result = [{background: "#FFD740", color: "#424242"},{background: "#FAFAFA", color: "#000000"}];
            else
                result = [{background: "#FAFAFA", color: "#000000"},{background: "#FFD740", color: "#424242"}];
            return result;
        };
        $scope.ShowMutated = function () {
            $scope.mutatedView = true;
            editorModel.GetMutatedSnapshot($scope.instance)
            .then(result => {$scope.mutatedSnapshot = result;})
            .catch(error => console.error(error));
        };
        $scope.ShowDefault = function () {
            $scope.mutatedView = false;
        };

        $scope.AddNewVariable = function () {
            $scope.snapshot.settings.variables.push({
                id: "",
                name: "",
                value: "",
                protect: false,
                pass: false,
                native: false,
                type: "INT",
                __type: "SMA.system.Variable"
            });
        };
        $scope.DeleteVariable = function (variable) {
            let index = $scope.snapshot.settings.variables.indexOf(variable);
            $scope.snapshot.settings.variables.splice(index,1);
        };
        $scope.IsEnum = function (id) {
            let result = false;
            if ($scope.snapshot.settings.enumerators) {
                if ($scope.snapshot.settings.enumerators[id]) result = true;
            };
            return result;
        };
        $scope.GetEnum = function (id) {
            let result = null;
            if ($scope.IsEnum(id)) result = $scope.snapshot.settings.enumerators[id];
            return result;
        };
        $scope.GetEnumByValue = function (target,value) {
            let result = null;
            for (let i = 0; i < target.length; i++) {
                if (target[i].value == value) {
                    result = target[i];
                    break;
                };
            };
            return result;
        };
        function Flatten (data) {
            let result = [];
            for (let property in data) {
                result.push({
                    id: property,
                    type: data[property].type,
                    path: data[property].path
                });
            };
            return result;
        };
        $scope.SetSelectedDescriptor = function (id, target, host) {
            if (id) {
                dataProvider.GetDescriptor(id)
                .then(result => {
                    target.avalibleParameters = result.data.service.parameters;
                    target.avalibleFields = Flatten(result.data.compiled);
                    host.dataset = result.data.id;
                })
                .catch(error => console.error(error));
            }
            else {
                target.avalibleParameters = [];
                target.avalibleFields = [];
                host.dataset = null;
            };
        };
        $scope.OpenNewParameterDialog = function (target, avalibles) {
            $scope.dialogAvalibles = avalibles;
            $scope.targetModificator = target;
            $scope.parameterAdding = true;
            $scope.newParameter = {
                dynamic: false,
                value: "",
                to: {},
                from: {},
                treset: function () {
                    this.from = {};
                },
                dreset: function () {
                    this.treset();
                    this.value = "";
                }
            };
        };
        $scope.CloseNewParameterDialog = function () {
            $scope.parameterAdding = false;
            $scope.newParameter = null;
            $scope.targetModificator = null;
            $scope.dialogAvalibles = {
                avalibleFields: [],
                avalibleParameters: []
            };
        };
        $scope.AddStep = function(action) {
            action.steps.push({
                actionType: "",
                target: [],
                substitute: {
                    id: "",
                    name: "",
                    imgPath: "",
                    __type: "SMA.system.SnapshotMini"
                },
                passingValues: {},
                methodName: "",
                methodParameters: {},
                __type: "SMA.system.ActionStep"
            });
        };
        $scope.RemoveStep = function (action,target) {
            let index = action.steps.indexOf(target);
            action.steps.splice(index,1);
        };
        $scope.AddParameter = function () {
            let result = {
                id: $scope.newParameter.to.id,
                name: $scope.newParameter.to.name,
                type: $scope.newParameter.to.type,
                dependency: $scope.newParameter.dynamic,
                affectorId: $scope.newParameter.from.id,
                affectorName: $scope.newParameter.from.name,
                value: $scope.newParameter.value,
                __type: "SMA.system.Modificator"
            };
            $scope.targetModificator.modificators.push(result);
            $scope.CloseNewParameterDialog();
        };
        $scope.RemoveParameter = function (target,parameter) {
            let index = target.indexOf(parameter);
            target.splice(index,1);
        };
        $scope.AddPassingValue = function (target, key, decorator) {
            target[key] = decorator;
        };
        $scope.RemovePassingValue = function (target, key) {
            if (target[key]) delete target[key];
        };
        $scope.GetCommonMethods = function (targets) {
            let result = [];
            let first = true;
            let combined = {};
            if (targets) {
                targets.forEach(function (element, index, array) {
                    if (first) {
                        first = false;
                        combined = JSON.parse(JSON.stringify(element.methods));
                    }
                    else {
                        for (let methodName in combined) {
                            if (!element.methods.hasOwnProperty(methodName)) {
                                delete combined[methodName];
                            };
                        };
                    };
                });
            };
            for (let methodName in combined) {
                result.push({
                    name: methodName,
                    parameters: combined[methodName]
                });
            };
            return result;
        };
        $scope.FindMethod = function (methodName, methods) {
            let result = null;
              for (let i = 0; i < methods.length; i ++) {
                  if (methods[i].name == methodName) {
                      result = methods[i];
                      break;
                  };
              };
            return result;
        };
        $scope.StripMethodParameters = function (parameters) {
            let result = {};
            for (let parameterName in parameters) {
                result[parameterName] = "";
            };
            return result;
        };
        $scope.FindVariable = function (id, type) {
            let result = {};
            for (let i = 0; i < $scope.snapshot.settings.variables.length; i++) {
                if (($scope.snapshot.settings.variables[i].id == id) && ($scope.snapshot.settings.variables[i].type == type)) {
                    result = $scope.snapshot.settings.variables[i];
                    break;
                };
            };
            return result;
        };
        $scope.AddTarget = function (target) {
            target.push({
                id: "",
                name: "",
                imgPath: "",
                methods: {},
                __type: "SMA.system.SnapshotMini"
            });
        };
        $scope.RemoveTarget = function (target,key) {
            let index = target.indexOf(key);
            target.splice(index,1);
        };
        $scope.FindDescriptorById = function (id) {
            let result = null;
            $scope.descriptors.forEach(function (element, index, array) {
                if (element.id == id) result = element;
            });
            return result;
        };
        $scope.AddFactory = function () {
            dataProvider.GetUuid()
            .then((result) => {
                let newFactory = {
                    id: result.data,
                    name: "",
                    target: {
                        id: "",
                        name: "",
                        imgPath: "",
                        __type: "SMA.system.SnapshotMini"
                    },
                    dataset: "",
                    modificators: [],
                    fields: [],
                    __type:"SMA.system.Factory"
                };
                $scope.snapshot.factories.push(newFactory);
            })
            .catch((error) => {console.error(error);});
        };
        $scope.RemoveFactory = function (target) {
            let index = $scope.snapshot.factories.indexOf(target);
            $scope.snapshot.factories.splice(index,1);
        };
        $scope.SetFactorySelectedDescritor = function (id, _parameters, _factory) {
            if (id) {
                dataProvider.GetDescriptor(id)
                .then(result => {
                    let compiled = Flatten(result.data.compiled);
                    let extend = Flatten(result.data.compiledExtend);
                    _parameters.avalibleParameters = result.data.service.parameters;
                    _parameters.avalibleFields = compiled.concat(extend);
                    _factory.dataset = result.data.id;
                })
                .catch(error => console.error(error));
            }
            else {
                _parameters.avalibleParameters = [];
                _parameters.avalibleFields = [];
                _factory.dataset = null;
            };
        };
        $scope.AddFactoryField = function (_factory) {
            let newField = {
                id: "",
                name: "",
                type: "@int",
                path: "",
                __type: "SMA.system.Field"
            };
            _factory.fields.push(newField);
        };
        $scope.RemoveFactoryField = function (_factory, target) {
            let index =	_factory.fields.indexOf(target);
            _factory.fields.splice(index,1);
        };
        $scope.OpenSnapshotSelectionDialog = function (target) {
            $scope.snapshotSelection = true;
            $scope.snapshotSelectionTarget = target;
            $scope.snapshotSelectionTemp = target;
        };
        $scope.CloseSnapshotSelectionDialog = function () {
            $scope.snapshotSelection = false;
            $scope.snapshotSelectionTarget = null;
            $scope.snapshotSelectionTemp = null;
        };
        $scope.SelectSnapshot = function (snapshot) {
            $scope.snapshotSelectionTemp = snapshot;
        };
        $scope.ConfirmSelection = function () {
            $scope.snapshotSelectionTarget.id = $scope.snapshotSelectionTemp.id;
            $scope.snapshotSelectionTarget.name = $scope.snapshotSelectionTemp.name,
            $scope.snapshotSelectionTarget.imgPath = $scope.snapshotSelectionTemp.imgPath,
            $scope.snapshotSelectionTarget.methods = $scope.snapshotSelectionTemp.settings.methods
            $scope.CloseSnapshotSelectionDialog();
        };
        $scope.FitsCategory = function(list, cat) {
            let result;
            if (cat == "__all") result = true;
            else if ((list.length == 0) && (cat == "__null")) result = true;
            else {
              if (list.indexOf(cat) != -1) result = true;
              else result = false;
            };
            return result;
        };
        $scope.setCategoryHeader = function (input) {
            let result;
            if (input == "__all") result = "Все";
            else if (input == "__null") result = "Без категории"
            else result = input;
            return result;
        };
        $scope.Save = function () {
            if ($scope.snapshot) {
                dataProvider.SaveSnapshot($scope.snapshot)
                .then((result) => {
                    return editorModel.RefreshView($scope.snapshot.id);
                })
                .then((result) => {$scope.Close();})
                .catch((error) => {console.error(error);});
            };
        };
        $scope.Close = function () {
            settingsEditorState.id = null;
            settingsEditorState.instance = null;
            $state.go('main.structureEditor');
        };
    })
