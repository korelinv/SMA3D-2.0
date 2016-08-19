angular.module('service.userData',['ui.router'])
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
