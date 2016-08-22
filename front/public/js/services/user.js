angular.module('service.user',['service.session'])
    .service('$user', function($http, $window, $q, $session) {
        let $this = this;

        $this.set = function(data) {
          $window.localStorage.setItem('currentuser',angular.toJson(data));
        };
        $this.flush = function() {
          $window.localStorage.removeItem('currentuser');
        }
        $this.current = function() {
          return angular.fromJson($window.localStorage.getItem('currentuser'));
        };


        $this.request = function(login) {
            let deferred = $q.defer();
            $http({
                method: 'POST',
                url: 'http://localhost:8050/userInfo',
                data: {
                    login: login,
                    session: $session.current()
                }
            })
            .then((result) => {
              $this.set(result.data);
              deferred.resolve(true);
            })
            .catch((error) => {
              deferred.reject(error);
            })
            return deferred.promise;
        };

    });
