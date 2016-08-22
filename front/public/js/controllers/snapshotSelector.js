angular.module('controller.snapshotSelector',['ui.router',])
    .controller('snapshotSelectorCtrl', function ($scope, $state, $timeout, editorModel, snapshotEditorState) {
        $scope.css = {
            window: "fade-in"
        };
        editorModel.Update()
        .then(function (result) {
            $scope.selectedCategory = "__all";
            $scope.snapshots = editorModel.snapshots;
            $scope.categories = editorModel.categories.list;
            $scope.totalTags = editorModel.categories.raw["__all"];
        })
        .catch(function (error) {
            console.error(error);
        });
        $scope.setCategoryHeader = function (input) {
            let result;
            if (input == "__all")
                result = "Все";
            else if (input == "__null")
                result = "Без категории"
            else
                result = input;
            return result;
        };
        $scope.SetTagSize = function (count) {
            let result = "normal"
            if ($scope.totalTags > 0) {
                let relative = count / $scope.totalTags;
                if (relative < 0.25) result = "small";
                else if ((relative >= 0.25) && (relative < 0.5)) result = "normal";
                else if ((relative >= 0.5) && (relative < 0.75)) result = "big";
                else result = "huge"
            };
            return result;
        };
        $scope.SetTagHighlight = function (input) {
            let result = "not-selected"
            if (input == $scope.selectedCategory) result = "selected";
            return result;
        };
        $scope.SnapshotHasPic = function (link) {
            let result = true;
            if (link == null) result = false;
            else if (link.length == 0) result = false;
            return result;
        };
        $scope.selectCategory = function (input) {
            $scope.selectedCategory = input;
        };
        $scope.Open = function (id) {
            editorModel.OpenSnapshot(id);
            $scope.Close();
        };
        $scope.CreateNew = function () {
            snapshotEditorState.new = true;
            $state.go('main.snapshotEditor');
        };
        $scope.Edit = function (id) {
            snapshotEditorState.new = false;
            snapshotEditorState.id = id;
            $state.go('main.snapshotEditor');
        };
        $scope.FitsCategory = function(list, cat) {
            let result;
            if (cat == "__all")
                result = true;
            else if ((list.length == 0) && (cat == "__null"))
                result = true;
            else {
                if (list.indexOf(cat) != -1) result = true;
                else result = false;
            };
            return result;
        };
        $scope.FitsType = function (target, app, element) {
            let result;
            if ((app) && (element)) result = true;
            else if ((!target) && (element)) result = true;
            else if ((target) && (app)) result = true;
            else result = false
            return result;
        };
        $scope.Close = function () {
            $timeout(function () {$state.go('main.index')}, 400);
            $scope.css.window = "fade-out";
        };
    })
