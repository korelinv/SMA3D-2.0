angular.module('controller.snapshotEditor',['ui.router'])
    .controller('snapshotEditorCtrl', function ($scope, $state, dataProvider, editorModel, snapshotEditorState) {
        $scope.page = 0;
        $scope.redirectDialog = false;
        $scope.deleteDialog = false;
        $scope.new = snapshotEditorState.new;
        $scope.models = editorModel.models;
        $scope.newCategory = "";
        $scope.cloneId;
        $scope.dependencies;
        $scope.snapshot;
        if ($scope.new) {
            $scope.snapshot = {
                id: null,
                name: "",
                appInpoint: false,
                imgPath: null,
                prefabId: null,
                settings: {
                  __type: "SMA.system.ViewSettings"
                },
                children: [],
                factories: [],
                category: [],
                __type: "SMA.system.Snapshot"
            };
            dataProvider.GetUuid()
            .then(function (result) {
                $scope.snapshot.id = result.data;
            })
            .catch(function (error) {
                console.error(error);
            });
        }
        else {
            dataProvider.GetSnapshot(snapshotEditorState.id)
            .then(function (result) {
                $scope.snapshot = result.data;
            })
            .catch(function (error) {
                console.error(error);
            });
        };
        $scope.categorySubmit = function (event) {
            if ($scope.snapshot) {
                if ((event.keyCode == 13) && ($scope.newCategory.length > 0) && ($scope.snapshot.category.indexOf($scope.newCategory) == -1)) {
                    $scope.snapshot.category.push($scope.newCategory);
                    $scope.newCategory = "";
                };
            };
        };
        $scope.removeCategory = function (cat) {
            if ($scope.snapshot) {
                let pos = $scope.snapshot.category.indexOf(cat);
                $scope.snapshot.category.splice(pos,1);
            };
        };
        $scope.SelectModel = function (model) {
            $scope.snapshot.prefabId = model.id;
            $scope.snapshot.settings = model.defaults.settings;
        };
        $scope.highlightedModel = function (id) {
            let result;
            if ($scope.snapshot) {
                if (id == $scope.snapshot.prefabId) result = {'background': '#F5F5F5', 'box-shadow': '2px 2px 2px rgba(0,0,0,0.2)'};
            };
            return result;
        };
        $scope.OpenRedirectDialog = function () {
            $scope.redirectDialog = true;
        };
        $scope.CloseRedirectDialog = function () {
            $scope.redirectDialog = false;
        };
        $scope.GoToClone = function () {
            snapshotEditorState.new = false;
            snapshotEditorState.id = cloneId;
            $state.reload($state.current);
        };
        $scope.OpenDeleteDialog = function () {
            $scope.deleteDialog = true;
        };
        $scope.CloseDeleteDialog = function () {
            $scope.deleteDialog = false;
        };
        $scope.Cancel = function () {
            $state.go('main.snapshotSelector');
        };
        $scope.Save = function () {
            if ($scope.snapshot) {
                dataProvider.SaveSnapshot($scope.snapshot)
                .then(function (result) {
                    $scope.Cancel();
                })
                .catch(function (error) {
                    console.error(error);
                });
            };
        };
        $scope.Clone = function () {
            let clone;
            dataProvider.GetSnapshot($scope.snapshot.id)
            .then(function (result) {
                clone = result.data;
                clone.name += " (Копия)";
                return dataProvider.GetUuid();
            })
            .then(function (result) {
                clone.id = result.data;
                cloneId = clone.id;
                return dataProvider.SaveSnapshot(clone);
            })
            .then(function (result) {
                $scope.OpenRedirectDialog();
            })
            .catch(function (error) {
                console.error(error);
            })
        };
        $scope.TryDelete = function () {
            dataProvider.GetDependedSnapshots($scope.snapshot.id)
            .then(function (result) {
                $scope.dependencies = result.data;
                $scope.OpenDeleteDialog();
            })
            .catch(function (error) {
                console.error(error);
            });
        };
        $scope.Delete = function () {
            dataProvider.DeleteSnapshot($scope.snapshot.id)
            .then(function (result) {
                $state.go('main.snapshotSelector');
            })
            .catch(function (error) {
                console.error(error);
            });
        };
    })
