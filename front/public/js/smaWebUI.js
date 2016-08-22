const parameterType = ["@int","@float","@double","@string","@long","@boolean","@undefined"];
const actionType = [{name: "замена", value: "swap"},{name: "отправка", value:"send"},{name: "вызов метода", value: "invoke"}];
const descriptorFieldType = [{name: "простое поле",value: "simple"},{name: "составное поле",value: "complex"},{name: "коллкеция",value: "collection"}];

const app = angular.module('smaWebUI',
		[
			'ui.router',

			'service.session',
			'service.user',
			'service.startpoint',

			'controller.login',
			'controller.desktop',
			'controller.static',
			'controller.snapshotSelector',
			'controller.snapshotEditor',
			'controller.serviceManager',
			'controller.serviceEditor',
			'controller.structureEditor',
			'controller.settingsEditor'
		])

		.config(function config($stateProvider) {
				$stateProvider.state('login', {
						url: '/login',
						views: {
					      'main' : {
						        controller: 'loginFormCtrl as loginForm',
						        templateUrl: 'views/login.html'
					      }
				    }
				});

				$stateProvider.state('desktop', {
						url: '/desktop',
						views: {
								'main' : {
										controller: 'desktopCtrl as desktop',
										templateUrl: 'views/desktop.html'
								}
						}
				});

				$stateProvider.state('main', {
						views: {
								abstract: true,
					      'main' : {
						        controller: 'staticCtrl as static',
						        templateUrl: 'views/static.html'
					      }
				    }
				});
				$stateProvider.state('main.index', {
						url: '/playground',
						views: {
								'modal@main' : {
										template: ''
								}
				    }
				});
				$stateProvider.state('main.snapshotSelector', {
						url: '/snapshots',
						views: {
								'modal@main' : {
										controller: 'snapshotSelectorCtrl as snapshotSelector',
										templateUrl: 'views/snapshotSelector.html'
								}
				    }
				});
				$stateProvider.state('main.snapshotEditor', {
						url: '/snapshot/edit',
						views: {
								'modal@main' : {
										controller: 'snapshotEditorCtrl as snapshotEditor',
										templateUrl: 'views/snapshotEditor.html'
								}
				    }
				});
				$stateProvider.state('main.serviceManager', {
						url: '/services',
						views: {
								'modal@main' : {
										controller: 'serviceManagerCtrl as serviceManager',
										templateUrl: 'views/serviceManager.html'
								}
				    }
				});
				$stateProvider.state('main.serviceEditor', {
						url: '/service/edit',
						views: {
								'modal@main' : {
										controller: 'serviceEditorCtrl as serviceEditor',
										templateUrl: 'views/serviceEditor.html'
								}
				    }
				});
				$stateProvider.state('main.structureEditor', {
						url: '/structure',
						views: {
								'modal@main' : {
										controller: 'structureEditorCtrl as structureEditor',
										templateUrl: 'views/structureEditor.html'
								}
				    }
				});
				$stateProvider.state('main.settingsEditor', {
						url: '/snapshot/settings',
						views: {
								'modal@main' : {
										controller: 'settingsEditorCtrl as settingsEditor',
										templateUrl: 'views/settingsEditor.html'
								}
				    }
				});
				$stateProvider.state('main.startScreenEditor', {
						url: '/managment',
						views: {
								'modal@main' : {
										controller: 'startScreenEditorCtrl as startScreenEditor',
										templateUrl: 'views/startScreenEditor.html'
								}
				    }
				});
	})

	.run(['$state', function($state) {
		$state.transitionTo('login');
	}])



	.directive('unityWebGl', function () {
		return {
			restrict: 'E',
			templateUrl: 'directives/WebGLTemplate.html',
			link: function ($scope) {
				$scope.width = document.getElementsByTagName('body')[0].offsetWidth;
				$scope.height = document.getElementsByTagName('body')[0].offsetHeight;
			}
		};
	})

	.directive('hamburgerMenu', function () {
		return {
			restrict: 'E',
			templateUrl: 'directives/hamburgerMenu.html',
			controller: 'hamburgerMenu'
		};
	})


	.directive('plButton', function () {
		return {
			restrict: 'E',
			template: '<div id="pl-button"><div ng-click="action()">{{caption}}</div></div>',
			scope: {
				action: '=',
				caption: '@'
			},
			link: function (scope) {}
		};
	})

	.directive('plTabButton', function () {
		return {
			restrict: 'E',
			template: '<div id="pl-tab-button" style="width: {{width}}px;"	ng-click="current = index">{{caption}}<div ng-show="current == index"></div></div>',
			scope: {
				index: "=",
				caption: "@",
				current: "=",
				width: "="
			},
			link: function (scope) {}
		};
	})



	.directive('plCheckbox', function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/checkbox.html',
			require: 'ngModel',
			scope: {
				label: "@"
			},
			link: function (scope, element, attrs, ngModel) {
				scope.Click = function () {
					ngModel.$setViewValue(!ngModel.$viewValue);
				};
				scope.Show = function () {
					return ngModel.$viewValue;
				};
			}
		};
	})



	.service('dataProvider', function ($q, $http) {
		var provider = this;
		provider.GetUuid = function (count) {
			let parameters;
			if (count)
				parameters = '?q='+count;
			else
				parameters = '';
			return $http({
				method: 'GET',
				url: '/getUuid'+parameters
			});
		};
		provider.GetSnapshotsList = function () {
			return $http({
				method: 'GET',
				url: '/snapshot?all=true'
			});
		};
		provider.GetDescriptorsList = function () {
			return $http({
				method: 'GET',
				url: '/descriptor'
			});
		};
		provider.GetBooksList = function () {
			return $http({
				method: 'GET',
				url: '/books'
			});
		};
		provider.GetDescriptor = function (id) {
			return $http({
				method: 'GET',
				url: '/descriptor?id='+id
			});
		};
		provider.DeleteDescriptor = function(id) {
			return $http({
				method: 'POST',
				url: '/remove/descriptor',
				headers: {},
				data: {
					id: id
				}
			});
		};
		provider.SaveDescriptor = function (data) {
			return $http({
				method: 'POST',
				url: '/edit/descriptor',
				headers: {},
				data: data
			});
		};
		provider.GetModelsList = function () {
			return $http({
				method: 'GET',
				url: '/models'
			});
		};
		provider.GetSnapshot = function (id) {
			return $http({
				method: 'GET',
				url: '/snapshot?id='+id
			});
		};
		provider.GetSnapshots = function (list) {
			let deferred = $q.defer();
			let promises = [];
			list.forEach(function (element, index, array) {
				let promise = $http({
					method: 'GET',
					url: '/snapshot?id='+element
				});
				promises.push(promise);
			});
			let all = $q.all(promises)
			.then(function (result) {
				let final = [];
				result.forEach(function (element, index, array) {
					final.push(element.data);
				});
				deferred.resolve(final);
			})
			.catch(function (error) {
				deferred.reject(error);
			});
			return deferred.promise;
		};
		provider.SaveSnapshot = function (snapshot) {
			return $http({
				method: 'POST',
				url: '/edit/snapshot',
				headers: {},
				data: snapshot
			});
		};
		provider.DeleteSnapshot = function (id) {
			return $http({
				method: 'POST',
				url: '/remove/snapshot',
				headers: {},
				data: {
					id: id
				}
			});
		};
		provider.GetDependedSnapshots = function (id) {
			return $http({
				method: 'GET',
				url: '/snapshot/depended?id='+id,
			});
		};
		provider.AddSnapshotChildren = function (parent, children) {
			return $http({
				method: 'post',
				url: '/edit/snapshot/addChildren',
				headers: {},
				data: {
					id: parent,
					children: children
				}
			});
		};
		provider.RemoveSnapshotChild = function (parent, child) {
			return $http({
				method: 'post',
				url: '/edit/snapshot/removeChild',
				headers: {},
				data: {
					id: parent,
					child: child
				}
			});
		};
	})

	.service('editorModel',function ($q, $timeout, dataProvider, unityIn) {
		let model = this;

		model.Start = function () {
			model.Update();
		};

		model.Update = function () {
			let deferred = $q.defer();
			let all = $q.all([
				dataProvider.GetDescriptorsList(),
				dataProvider.GetSnapshotsList(),
				dataProvider.GetModelsList()
			])
			.then(function (result) {
				model.descriptors = result[0].data;
				model.snapshots = result[1].data;
				model.categories.set(model.snapshots);
				model.models = result[2].data;
				deferred.resolve();
			})
			.catch (function (error) {
				deferred.reject(error);
			});
			return deferred.promise;
		};

		model.OpenSnapshot = function (id) {
			unityIn.ToUnity({
				receiver: "SUPER_ELEMENT",
				sender: "EDITOR_MODEL",
				code: "OPEN_SNAPSHOT",
				fields: {
					id: id
				},
				__type:"SMA.system.Message"
			});
		};

		model.RefreshView = function (id) {
			let deferred = $q.defer();
			let message = {
				receiver: "SUPER_ELEMENT",
				sender: "EDITOR_MODEL",
				code: "REFRESH",
				fields: {
					id: id
				},
				__type:"SMA.system.Message"
			};
			let callback = {
				name: "RefreshView",
				result: function(res) {
					deferred.resolve(res.fields.data);
				},
				error: function(res) {
					deferred.reject();
				}
			};
			unityIn.ToUnity (message, callback);
			return deferred.promise;
		};

		model.RequestStructureUpdate = function () {
			let deferred = $q.defer();
			let message = {
				receiver: "SUPER_ELEMENT",
				sender: "EDITOR_MODEL",
				code: "REQUEST_FOOTPRINT",
				fields: {},
				__type:"SMA.system.Message"
			};
			let callback = {
				name: "RequestStructureUpdate",
				result: function(res) {
					deferred.resolve(res.fields.data);
				},
				error: function(res) {
					deferred.reject();
				}
			};
			unityIn.ToUnity(message,callback);
			return deferred.promise;
		};

		model.GetMutatedSnapshot = function (instance) {
			let deferred = $q.defer();
			let message = {
				receiver: instance,
				sender: "EDITOR_MODEL",
				code: "REQUEST_MUTATED",
				fields: {},
				__type:"SMA.system.Message"
			}
			let callback = {
				name: "GetMutatedSnapshot",
				result: function (res) {
					deferred.resolve(res.fields.data);
				},
				error: function (res) {
					deferred.reject();
				}
			}
			unityIn.ToUnity(message, callback);
			return deferred.promise;
		};

		model.structure;
		model.snapshots;
		model.descriptors;
		model.models;
		model.categories = {
			set: function (input) {
				this.raw = {"__all": 0};
				for (let i = 0; i < input.length; i++) {
					if (input[i].category.length > 0) {
						for (let n = 0; n < input[i].category.length; n++) {
							if (this.raw.hasOwnProperty(input[i].category[n])) {
								this.raw[input[i].category[n]]++;
							}
							else {
								this.raw[input[i].category[n]] = 1;
							};
						};
					}
					else {
						if (this.raw.hasOwnProperty("__null")) {
							this.raw["__null"]++;
						}
						else {
							this.raw["__null"] = 1;
						};
					};
				};
				for (element in this.raw) {
					if (element != "__all")
						this.raw["__all"] += this.raw[element]
				};
				this.list = this.flatten();
			},
			flatten: function () {
				let result = [];
				for (category in this.raw) {
					result.push({
						name: category,
						count: this.raw[category]
					});
				};
				return result;
			},
			raw: {},
			list: []
		};
	})

	.service('unityCallbacks', function() {
			let unity = this;
			unity.callbacks = {};

			unity.AddCallback = function (callback) {
				let id = callback.name;
				// завершаем предыдуший промис если пришел такой же новый реджектом
				if (unity.callbacks[id])
					unity.RecjectCallback(id);
				unity.callbacks[id] = callback;
				return id;
			};

			unity.RecjectCallback = function (id,data) {
				unity.callbacks[id].error(data);
				delete unity.callbacks[id];
			};

			unity.ResolveCallback = function (id,data) {
				let result = unity.callbacks[id].result(data);
				delete unity.callbacks[id];
			};
	})

	.service('unityIn', function (unityCallbacks) {
		let unity = this;

		unity.ToUnity = function (data,callback) {
			if (callback) {
				data.fields.__callback = unityCallbacks.AddCallback(callback);
			};
			SendMessage('WebCoupling','PassToEngine', JSON.stringify(data));
		};
	})

	.service('unityOut', function (unityCallbacks, editorModel) {
		let unity = this;

		unity.ToModel = function (data) {
			message = JSON.parse(data);
			switch (message.code) {
				case "RECEIVE_FOOTPRINT":
					editorModel.UpdateStructure(message.fields.data);
					break;
				case "RESOLVE_STRUCTURE":
					editorModel.UpdateStructure(message.fields.data);
					break;

				default:
					console.error("Unexpected message:");
					console.error(message);
					break;
			};
		};

		unity.ResoveCallback = function (data) {
			message = JSON.parse(data);
			if (message.fields.__callback) {
				unityCallbacks.ResolveCallback(message.fields.__callback,message);
			};
		};

	})

	.service('snapshotEditorState', function () {
		this.new = false;
		this.id = null;
	})

	.service('serviceEditorState', function () {
		this.new = false;
		this.id = null;
	})

	.service('settingsEditorState', function () {
		this.id = null;
		this.instance = null;
	})


	.controller('hamburgerMenu', function ($scope, $state) {
		$scope.menuItems = [
			{
				caption: 'Информеры',
				state: 'main.snapshotSelector',
				icon: 'img/icons/ic_insert_chart_black_24dp_1x.png'
			},
			{
				caption: 'Сервисы',
				state: 'main.serviceManager',
				icon: 'img/icons/ic_archive_black_24dp_1x.png'
			},
			{
				caption: 'Структура',
				state: 'main.structureEditor',
				icon: 'img/icons/ic_layers_black_24dp_1x.png'
			},
			{
				caption: 'Настройка',
				state: 'main.startScreenEditor',
				icon: 'img/icons/ic_layers_black_24dp_1x.png'
			}
		];
		$scope.unfolded = false;
		$scope.Fold = function () {
			$scope.unfolded = !$scope.unfolded;
		};
		$scope.Open = function (state) {
			$state.go(state);
		};
	})

	.controller('unityLink', function ($scope, unityOut, editorModel, $startpoint) {
		$scope.ToModel = unityOut.ResoveCallback;
		$scope.getStartPoint = function() {
				console.log($startpoint.current());
				SendMessage('WebCoupling','KickstartFromPoint', $startpoint.current());
		};
	})




	.controller('startScreenEditorCtrl', function($scope, $state, $timeout, dataProvider, editorModel) {

		$scope.css = {
			window: "fade-in"
		};

		$scope.Close = function () {
			$timeout(function () {$state.go('index')}, 400);
			$scope.css.window = "fade-out";
		};

	})
