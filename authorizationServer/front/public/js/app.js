const app = angular.module('app',['ui.router'])


  .config(function config($stateProvider) {
    $stateProvider.state('login', {
      views: {
        "main" : {
          url: "/login",
          controller: "loginFormCtrl as loginForm",
          templateUrl: "templates/loginForm.html"
        },
        "content" : {
          template : ""
        }
      }
    });
    $stateProvider.state('dashboard', {
      url: "/dashboard",
      views : {
        "main" : {
          controller: "staticCtrl as static",
          templateUrl: "templates/static.html"
        },
        "content" : {
          template: "dash"
        }
      }
    });
    $stateProvider.state('users', {
      url: "/users",
      views: {
        "main": {
          controller: "staticCtrl as static",
          templateUrl: "templates/static.html"
        },
        "content": {
          controller: "usersCtrl as users",
          templateUrl: "templates/users.html"
        }
      }
    });
    $stateProvider.state('groups', {
      url: "/groups",
      views: {
        "main": {
          controller: "staticCtrl as static",
          templateUrl: "templates/static.html"
        },
        "content": {
          controller: "groupsCtrl as groups",
          templateUrl: "templates/groups.html"
        }
      }
    })
    $stateProvider.state('newUser', {
      url: "/newuser",
      views : {
        "main" : {
          controller: "staticCtrl as static",
          templateUrl: "templates/static.html"
        },
        "content" : {
          controller: "newUserFormCtrl as newUserForm",
          templateUrl: "templates/newUserForm.html"
        }
      }
    });
    $stateProvider.state('editUser', {
      url: "/edituser",
      views : {
        "main" : {
          controller: "staticCtrl as static",
          templateUrl: "templates/static.html"
        },
        "content" : {
          controller: "editUserFormCtrl as editUserForm",
          templateUrl: "templates/editUserForm.html"
        }
      }
    });
    $stateProvider.state('newGroup', {
      url: "/newgroup",
      views : {
        "main" : {
          controller: "staticCtrl as static",
          templateUrl: "templates/static.html"
        },
        "content" : {
          controller: "newGroupFormCtrl as newGroupForm",
          templateUrl: "templates/newGroupForm.html"
        }
      }
    });
    $stateProvider.state('logs', {
      url: "/logs",
      views : {
        "main" : {
          controller: "staticCtrl as static",
          templateUrl: "templates/static.html"
        },
        "content" : {
          controller: "logsCtrl as logs",
          templateUrl: "templates/logs.html"
        }
      }
    });
  })

  .run(['$state', function($state) {
    $state.transitionTo('login');
  }])


  .service('$session', function($window) {
    let $this = this;
    $this.current = function () {
      return $window.localStorage.getItem('session');
    };
    $this.set = function(session) {
      $window.localStorage.setItem('session',session);
    };
    $this.flush = function() {
      $window.localStorage.removeItem('session');
    };
  })
  .service('$userData', function($http, $window) {
    let $this = this;
    $this.getUser = function(login, session) {
      return $http({
        method: 'POST',
        url: '/userInfo',
        data: {
          login: login,
          session: session
        }
      });
    };
    $this.getUsersList = function(session) {
      return $http({
        method: 'POST',
        url: '/usersList',
        data: {
          session: session
        }
      });
    };
    $this.deleteUser = function(login, session) {
      return $http({
        method: 'POST',
        url: '/deleteUser',
        data: {
          session: session,
          login: login
        }
      });
    };
    $this.currentUser = function() {
      return $window.localStorage.getItem('user');
    };

    $this.setCurrentUser = function(login) {
      $window.localStorage.setItem('user',login);
    };
  })
  .service('snapshots', function($window, $http) {
    let $this = this;
    $this.setPath = function(url) {
      $window.localStorage.setItem('API/snapshots',url);
    };
    $this.getSnapshots = function(config) {
      let query = "";
      if (config.all) query = "?all=true";
      else if (config.id) query = "?id="+config.id;
      return $http({
        method: 'GET',
        url: $window.localStorage.getItem('API/snapshots')+query,
        headers: {
          session: $window.localStorage.getItem('session')
        }
      });
    };
  })


  .controller('loginFormCtrl', function($scope, $http, $state, $session, $userData, snapshots) {
    $scope.TryLogin = function (login, password) {
      $http({
       method: 'POST',
       url: '/authenticate',
       data: {
         login: login,
         password: password
       }
      })
      .then((result) => {
        $session.set(result.data);
        $userData.setCurrentUser(login);
        return $http({
          method: 'POST',
          url: '/endpoints',
          data: {
            session: $session.current()
          }
        });
      })
      .then((result) => {
        snapshots.setPath(result.data.snapshots);
        $state.go('dashboard');
      })
      .catch((error) => {console.error(error)});
    };
  })
  .controller('staticCtrl', function($scope, $state, $http, $session, $userData) {
    $scope.userInfo = {};
    $http({
     method: 'POST',
     url: '/approve',
     data: {
       session: $session.current()
     }
    })
    .then((result) => $userData.getUser($userData.currentUser(),$session.current()))
    .then((result) => {
      console.log(2);
      $scope.userInfo = result.data;
    })
    .catch((error) => {
      $session.flush();
      $state.go('login');
      console.log('session not approved');
    });
    $scope.logOut = function() {
      $http({
        method: 'POST',
        url: '/logout',
        data: {
          session: $session.current()
        }
      })
      .then((result) => {
        $session.flush();
        $state.go('login');
      })
      .catch((error) => {
        console.error(error);
      });
    };
  })
  .controller('usersCtrl', function($scope, $state, $http, $session, $rootScope, $userData) {
    $scope.users = [];
    $scope.EditUser = function(login) {
      $rootScope.editedUser = login;
      $state.go('editUser');
    };
    $scope.CreateNewUser = function() {
      $state.go('newUser');
    };
    $scope.DeleteUser = function(login) {
      $userData.deleteUser(login, $session.current())
      .then(() => $userData.getUsersList($session.current()))
      .then((result) => {
        $scope.users = result.data;
      })
      .catch((error) => {
        console.error(error);
      })
    };
    $scope.CurrentUser = function() {
      return $userData.currentUser();
    };

    $userData.getUsersList($session.current())
    .then((result) => {$scope.users = result.data})
    .catch((error) => {console.error(error)})

  })
  .controller('newUserFormCtrl', function($scope, $state, $http, $window) {
    $scope.newUser = {
      login: "",
      password: "",
      name: "",
      surname: "",
      patronymic: "",
      email: "",
      groups: [],
      roles: []
    };
    $scope.avalibleGroups = null;
    $scope.avalibleRoles = null;

    //запрос списка групп
    $http({
      method: 'POST',
      url: '/groupsList',
      data: {
        session: $window.localStorage.getItem('session')
      }
    })
    .then((result) => {
      $scope.avalibleGroups = result.data;
    })
    .catch((error) => {
      console.error(error);
    })

    $scope.AddGroup = function(group) {
      if ($scope.newUser.groups.indexOf(group) == -1) {
        $scope.newUser.groups.push(group);
      };
    };
    $scope.RemoveGroup = function(group) {
      var index = $scope.newUser.groups.indexOf(group);
      $scope.newUser.groups.splice(index,1);
    };

    $scope.ConfirmPassword = function (passwordRepeat) {
      let result = false;
      if (passwordRepeat == $scope.newUser.password) result = true;
      return result;
    };
    $scope.Submit = function () {
      $http({
        method: 'POST',
        url: "/newUser",
        data: {
          session: $window.localStorage.getItem('session'),
          user: $scope.newUser
        }
      })
      .then((result) => {$state.go('users')})
      .catch((error) => {console.error(error)})
    };
    $scope.GoBack = function () {
      $state.go('users');
    };

  })
  .controller('editUserFormCtrl', function($scope, $state, $http, $session, $rootScope, $userData) {
    $scope.user = {
      login: "",
      name: "",
      surname: "",
      patronymic: "",
      email: "",
      groups: [],
      roles: []
    };

    $scope.avalibleGroups = null;
    $scope.avalibleRoles = null;

    //запрос списка групп
    $http({
      method: 'POST',
      url: '/groupsList',
      data: {
        session: $session.current()
      }
    })
    .then((result) => {
      $scope.avalibleGroups = result.data;
    })
    .catch((error) => {
      console.error(error);
    })

    // запрос данных пользователя
    $userData.getUser($rootScope.editedUser,$session.current())
    .then((result) => {
      $scope.user = result.data;
      $rootScope.editedUser = null;
    })
    .catch((error) => {
      console.error(error);
    });

    $scope.AddGroup = function(group) {
      if ($scope.user.groups.indexOf(group) == -1) {
        $scope.user.groups.push(group);
      };
    };
    $scope.RemoveGroup = function(group) {
      var index = $scope.user.groups.indexOf(group);
      $scope.user.groups.splice(index,1);
    };
    $scope.Submit = function () {
      $http({
        method: 'POST',
        url: "/editUser",
        data: {
          session: $window.localStorage.getItem('session'),
          user: $scope.user
        }
      })
      .then((result) => {$state.go('users')})
      .catch((error) => {console.error(error)})
    };
    $scope.GoBack = function () {
      $state.go('users');
    };

  })
  .controller('logsCtrl', function($scope, $state, $http, $window) {
    $scope.logs = [];
    $scope.filter = {
      ip: "",
      login: "",
      code: ""
    };
    $scope.sdate = new Date();
    $scope.edate = new Date();

    $scope.edate.setHours(0,0,0,0);
    $scope.sdate.setHours(0,0,0,0);

    $scope.sdate.setDate($scope.sdate.getDate()-7);
    $scope.edate.setDate($scope.edate.getDate()+1);

    $scope.GetLogs = function () {
      return $http({
        method: 'POST',
        url: '/logs',
        data: {
          sdate: $scope.sdate,
          edate: $scope.edate,
          session: $window.localStorage.getItem('session')
        }
      })
    };
    $scope.UpdateLogs = function () {
      $scope.GetLogs()
      .then((result) => {$scope.logs = result.data})
      .catch((error) => {console.error(error)})
    };

    $scope.UpdateLogs();
  })
  .controller('groupsCtrl', function($scope, $state, $http, $window) {
    $scope.groups = [];
    $scope.GetGroupsList = function() {
      return $http({
        method: 'POST',
        url: '/groupsList',
        data: {
          session: $window.localStorage.getItem('session')
        }
      })
    };
    $scope.AddNewGroup = function() {
      $state.go('newGroup');
    }

    $scope.GetGroupsList()
    .then((result) => {
      $scope.groups = result.data;
    })
    .catch((error) => {
      console.error(error);
    })

  })
  .controller('newGroupFormCtrl', function($scope, $state, $http, $window, snapshots) {
    $scope.newGroup = {
      id: "",
      name: "",
      startFrom: undefined
    };

    $scope.avalibleSnapshots = [];

    // запрос снапшотов
    snapshots.getSnapshots({all: true})
    .then((result) => {
      $scope.avalibleSnapshots = result.data;
    })
    .catch((error) => {
      console.error(error);
    });

    $scope.findSnapshot = function(id) {
      let result = null;
      for (let index = 0; index < $scope.avalibleSnapshots.length; index++) {
        if ($scope.avalibleSnapshots[index].id == id) {
          result = $scope.avalibleSnapshots[index].name;
          break;
        };
      };
      return result;
    };
    $scope.setStartingSnapshot = function(id) {
      $scope.newGroup.startFrom = id;
    };

    $scope.Submit = function () {
      $http({
        method: 'POST',
        url: "/newGroup",
        data: {
          session: $window.localStorage.getItem('session'),
          group: $scope.newGroup
        }
      })
      .then((result) => {$state.go('groups')})
      .catch((error) => {console.error(error)})
    };
    $scope.GoBack = function () {
      $state.go('groups');
    };
  })


  .controller('sideMenuCtrl', function ($scope, $state) {
    $scope.rout = [
      {
        state: 'dashboard',
        caption: "Дашборд"
      },
      {
        state: 'users',
        caption: "Управление пользователями"
      },
      {
        state: 'groups',
        caption: "Управление группами"
      },
      {
        state: 'logs',
        caption: 'Архив доступа'
      },
      {
        state: 'preferences',
        caption: "Настройки"
      }
    ]
    $scope.Go = function (destination) {
      $state.go(destination);
    };
  })
  .directive('sideMenu', function () {
    return {
      restrict: 'E',
      templateUrl: 'templates/sideMenu.html',
      controller: 'sideMenuCtrl'
    };
  })
