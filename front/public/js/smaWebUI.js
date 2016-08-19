const parameterType = ["@int","@float","@double","@string","@long","@boolean","@undefined"];
const actionType = [{name: "замена", value: "swap"},{name: "отправка", value:"send"},{name: "вызов метода", value: "invoke"}];
const descriptorFieldType = [{name: "простое поле",value: "simple"},{name: "составное поле",value: "complex"},{name: "коллкеция",value: "collection"}];

const app = angular.module('smaWebUI',['ui.router'])

	.config(function config($stateProvider) {
		$stateProvider.state("index", {
			templateUrl: "templates/index.html"
		})
		$stateProvider.state('snapshotSelector', {
			controller: "snapshotSelectorCtrl as snapshotSelector",
			templateUrl: "templates/snapshotSelector.html"
		})
		$stateProvider.state('snapshotEditor', {
			controller: "snapshotEditorCtrl as snapshotEditor",
			templateUrl: "templates/snapshotEditor.html"
		})
		$stateProvider.state('serviceManager', {
			controller: "serviceManagerCtrl as serviceManager",
			templateUrl: "templates/serviceManager.html"
		})
		$stateProvider.state('serviceEditor', {
			controller: "serviceEditorCtrl as serviceEditor",
			templateUrl: "templates/serviceEditor.html"
		})
		$stateProvider.state('structureEditor', {
			controller: "structureEditorCtrl as structureEditor",
			templateUrl: "templates/structureEditor.html"
		})
		$stateProvider.state('settingsEditor', {
			controller: "settingsEditorCtrl as settingsEditor",
			templateUrl: "templates/settingsEditor.html"
		})
		$stateProvider.state('startScreenEditor', {
			controller: "startScreenEditorCtrl as startScreenEditor",
			templateUrl: "templates/startScreenEditor.html"
		})
	})



	.run(function ($http, editorModel) {
		editorModel.Start();
	})


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


	.controller('loginForm', function ($scope, $http) {
		$scope.Authorize = function (login,password) {
			$http({
				method: 'POST',
				url: 'http://localhost:8050/endpoints',
				headers: {},
				data: {
					auth: btoa(login + password)
				}
			})
			.then((result) => {console.log(result)})
			.catch((error) => {console.error(error)})
		};
	})

	.controller('hamburgerMenu', function ($scope, $state) {
		$scope.menuItems = [
			{
				caption: 'Информеры',
				state: 'snapshotSelector',
				icon: 'img/icons/ic_insert_chart_black_24dp_1x.png'
			},
			{
				caption: 'Сервисы',
				state: 'serviceManager',
				icon: 'img/icons/ic_archive_black_24dp_1x.png'
			},
			{
				caption: 'Структура',
				state: 'structureEditor',
				icon: 'img/icons/ic_layers_black_24dp_1x.png'
			},
			{
				caption: 'Настройка',
				state: 'startScreenEditor',
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

	.controller('unityLink', function ($scope, unityOut, editorModel) {
		$scope.ToModel = unityOut.ResoveCallback;
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
		};

		$scope.CreateNew = function () {
			snapshotEditorState.new = true;
			$state.go('snapshotEditor');
		};

		$scope.Edit = function (id) {
			snapshotEditorState.new = false;
			snapshotEditorState.id = id;
			$state.go('snapshotEditor');
		};

		$scope.FitsCategory = function(list, cat) {
			let result;
			if (cat == "__all")
				result = true;
			else if ((list.length == 0) && (cat == "__null"))
				result = true;
			else {
				if (list.indexOf(cat) != -1)
					result = true;
				else
					result = false;
			};
			return result;
		};

		$scope.FitsType = function (target, app, element) {
			let result;
			if ((app) && (element))
				result = true;
			else if ((!target) && (element))
				result = true;
			else if ((target) && (app))
				result = true;
			else
				result = false
			return result;
		};

		$scope.Close = function () {
			$timeout(function () {$state.go('index')}, 400);
			$scope.css.window = "fade-out";
		};
	})

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
				if (id == $scope.snapshot.prefabId)
					result = {'background': '#F5F5F5', 'box-shadow': '2px 2px 2px rgba(0,0,0,0.2)'};
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
			$state.go('snapshotSelector');
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
				$state.go('snapshotSelector');
			})
			.catch(function (error) {
				console.error(error);
			});
		};

	})

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
			$state.go('serviceEditor');
		};

		$scope.Edit = function (id) {
			serviceEditorState.new = false;
			serviceEditorState.id = id;
			$state.go('serviceEditor');
		};

		$scope.Delete = function (id) {
			dataProvider.DeleteDescriptor(id);
			Update();
		};

		$scope.Close = function () {
			$state.go('index');
		};

	})

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
					if (_root)
						return newReflection(element,collection);
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
			if ($scope.schedule.dayOfWeek.length > 0)
				$scope.descriptor.schedule = $scope.descriptor.schedule +" "+ $scope.schedule.dayOfWeek;
		};

		$scope.Save = function () {
			dataProvider.SaveDescriptor($scope.descriptor)
			.then(function (result) {
				$state.go('serviceManager');
			})
			.catch(function (error) {
				console.error(error);
			});
		};

		$scope.Close = function () {
			$state.go('serviceManager');
		};

	})

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
			$state.go('settingsEditor');
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
			if (cat == "__all")
				result = true;
			else if ((list.length == 0) && (cat == "__null"))
				result = true;
			else {
				if (list.indexOf(cat) != -1)
					result = true;
				else
					result = false;
			};
			return result;
		};

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
			$state.go('index');
		};
	})

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
				treset: function () { this.from = {}; },
				dreset: function () { this.treset(); this.value = "";}
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
				if (($scope.snapshot.settings.variables[i].id == id) &&
						($scope.snapshot.settings.variables[i].type == type)) {
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
			if (cat == "__all")
				result = true;
			else if ((list.length == 0) && (cat == "__null"))
				result = true;
			else {
				if (list.indexOf(cat) != -1)
					result = true;
				else
					result = false;
			};
			return result;
		};

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
			$state.go('structureEditor');
		};

	})
