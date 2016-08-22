angular.module('controller.structureEditor',['ui.router'])
    .controller('structureEditorCtrl', function ($scope, $state, settingsEditorState, editorModel, dataProvider) {
        $scope.head;
        $scope.snapshots;
        $scope.categories;
        $scope.selectedCategory = "__all";
        $scope.AddingDialog = false;
        $scope.DeletingDialog = false;
        $scope.ChildrenBulk = [];
        $scope.SelectedParent;
        $scope.SelectedElement;
        editorModel.RequestStructureUpdate()
        .then(function (result) {
            $scope.head = result;
            return editorModel.Update()
        })
        .then(function (result) {
            $scope.snapshots = editorModel.snapshots;
            $scope.categories = editorModel.categories.list;
        })
        .catch(function (error) {
            console.error(error);
        });
        $scope.Edit = function (element) {
            settingsEditorState.id = element.id;
            settingsEditorState.instance = element.instanceID;
            $state.go('main.settingsEditor');
        };
        $scope.OpenAddingDialog = function (parent) {
            $scope.AddingDialog = true;
            $scope.SelectedParent = parent;
        };
        $scope.CloseAddingDialog = function () {
            $scope.AddingDialog = false;
            $scope.SelectedParent = null;
            $scope.ChildrenBulk = [];
            $scope.snapshots.forEach(function (element, index, array) {
                element.count = 0;
            })
        };
        $scope.PushIn = function (element) {
            $scope.ChildrenBulk.push(element);
            return Tracker($scope.ChildrenBulk,element);
        };
        $scope.PushOut = function (element) {
            let index = $scope.ChildrenBulk.indexOf(element);
            if (index != -1)
                $scope.ChildrenBulk.splice(index,1);
            return Tracker($scope.ChildrenBulk,element);
        };
        function Tracker (array, element) {
            let result = 0;
            array.forEach(function (_element, _index, _array) {
                if (_element.id == element.id) result++;
            });
            return result;
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
        $scope.Add = function () {
            if (($scope.ChildrenBulk.length <= 10) && ($scope.ChildrenBulk.length > 0)) {
                dataProvider.GetUuid($scope.ChildrenBulk.length)
                .then(function (result) {
                    let children = [];
                    let uuids = result.data;
                    $scope.ChildrenBulk.forEach(function (element, index, array) {
                        children.push({
                            isArray: false,
                            localId: uuids[index],
                            id: element.id,
                            __type: "SMA.system.ElementChild"
                        });
                    });
                    return dataProvider.AddSnapshotChildren($scope.SelectedParent.id, children)
                })
                .then(function (result) {
                    return editorModel.RefreshView($scope.SelectedParent.id);
                })
                .then(function (result) {
                    $scope.head = result;
                    $scope.CloseAddingDialog();
                })
                .catch(function (error) {
                    console.error(error);
                });
            };
        };
        $scope.OpenDeleteDialog = function (element) {
            $scope.DeletingDialog = true;
            $scope.SelectedElement = element;
        };

        $scope.CloseDeleteDialog = function () {
            $scope.DeletingDialog = false;
            $scope.SelectedElement = null;
        };

        $scope.Remove = function () {
            dataProvider.RemoveSnapshotChild($scope.SelectedElement.parent, $scope.SelectedElement.id)
            .then(function (result) {
                return editorModel.RefreshView($scope.SelectedElement.parent)
            })
            .then(function (result) {
                $scope.head = result;
                $scope.CloseDeleteDialog();
            })
            .catch(function (error) {
                console.error(error);
            });
        };
        $scope.Close = function () {
            $state.go('main.index');
        };
    })
