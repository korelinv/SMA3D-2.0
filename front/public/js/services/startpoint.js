angular.module('service.startpoint',[])
    .service('$startpoint', function($window) {
        let $this = this;
        $this.current = function () {
          return $window.localStorage.getItem('startpoint');
        };
        $this.set = function(id) {
          $window.localStorage.setItem('startpoint',id);
        };
        $this.flush = function() {
          $window.localStorage.removeItem('startpoint');
        };
    });
