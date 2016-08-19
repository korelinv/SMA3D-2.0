angular.module('service.session',['ui.router'])
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
