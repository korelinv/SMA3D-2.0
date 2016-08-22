angular.module('controller.serviceManager',['ui.router'])
    .controller('serviceManagerCtrl', function ($scope, $state, editorModel, serviceEditorState, dataProvider) {
        Update();
        $scope.descriptors;
        function Update () {
            editorModel.Update()
            .then(function (result) {
                $scope.descriptors = editorModel.descriptors;
            })
            .catch(function (error) {
                console.error(error);
            });
        };
        $scope.CreateNew = function () {
            serviceEditorState.new = true;
            $state.go('main.serviceEditor');
        };
        $scope.Edit = function (id) {
            serviceEditorState.new = false;
            serviceEditorState.id = id;
            $state.go('main.serviceEditor');
        };
        $scope.Delete = function (id) {
            dataProvider.DeleteDescriptor(id);
            Update();
        };
        $scope.Close = function () {
            $state.go('main.index');
        };
    })
