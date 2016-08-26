const app = angular.module('app',
    ['ui.router',

    'directive.sideMenu',
    'directive.dropdown',
    'directive.input',

    'service.session',
    'service.userData',
    'service.snapshots',

    'service.groups',

    'controller.login',
    'controller.static',
    'controller.users',
    'controller.newUser',
    'controller.editUser',
    'controller.logs',
    'controller.groups',
    'controller.newGroup',
    'controller.editGroup'
    ])

  .config(function config($stateProvider) {
    $stateProvider.state('login', {
      views: {
        "main" : {
          url: "/login",
          controller: "loginFormCtrl as loginForm",
          templateUrl: "views/loginForm.html"
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
          templateUrl: "views/static.html"
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
          templateUrl: "views/static.html"
        },
        "content": {
          controller: "usersCtrl as users",
          templateUrl: "views/users.html"
        }
      }
    });
    $stateProvider.state('groups', {
      url: "/groups",
      views: {
        "main": {
          controller: "staticCtrl as static",
          templateUrl: "views/static.html"
        },
        "content": {
          controller: "groupsCtrl as groups",
          templateUrl: "views/groups.html"
        }
      }
    })
    $stateProvider.state('newUser', {
      url: "/newuser",
      views : {
        "main" : {
          controller: "staticCtrl as static",
          templateUrl: "views/static.html"
        },
        "content" : {
          controller: "newUserFormCtrl as newUserForm",
          templateUrl: "views/newUserForm.html"
        }
      }
    });
    $stateProvider.state('editUser', {
      url: "/edituser",
      views : {
        "main" : {
          controller: "staticCtrl as static",
          templateUrl: "views/static.html"
        },
        "content" : {
          controller: "editUserFormCtrl as editUserForm",
          templateUrl: "views/editUserForm.html"
        }
      }
    });
    $stateProvider.state('newGroup', {
      url: "/group/new",
      views : {
        "main" : {
          controller: "staticCtrl as static",
          templateUrl: "views/static.html"
        },
        "content" : {
          controller: "newGroupFormCtrl as newGroupForm",
          templateUrl: "views/newGroupForm.html"
        }
      }
    });
    $stateProvider.state('editGroup', {
      url: "/group/:id",
      views : {
        "main" : {
          controller: "staticCtrl as static",
          templateUrl: "views/static.html"
        },
        "content" : {
          controller: "editGroupFormCtrl as editGroupForm",
          templateUrl: "views/editGroupForm.html"
        }
      }
    });
    $stateProvider.state('logs', {
      url: "/logs",
      views : {
        "main" : {
          controller: "staticCtrl as static",
          templateUrl: "views/static.html"
        },
        "content" : {
          controller: "logsCtrl as logs",
          templateUrl: "views/logs.html"
        }
      }
    });
  })
  .run(['$state', function($state) {
    $state.transitionTo('login');
  }])
