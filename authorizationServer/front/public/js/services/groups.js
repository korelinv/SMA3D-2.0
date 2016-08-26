angular.module('service.groups',['service.session'])
    .service('$groups', function($http, $q, $session) {
        let $this = this;

        $this.$list;
        $this.$currentGroup;

        $this.$getList = function() {
            let result = [];
            if ($this.$list) result = $this.$list;
            return result;
        };
        $this.$getById = function(id) {
            let deferred = $q.defer();
            if (id) {
                $http({
                    method: 'POST',
                    url: '/group',
                    data: {
                        id: id,
                        session: $session.current()
                    }
                })
                .then((result) => {
                    deferred.resolve(result.data);
                })
                .catch((error) => {
                    deferred.reject(error);
                });
            }
            else deferred.reject('id required')
            return deferred.promise;
        };


        $this.UpdateList = function() {
          let deferred = $q.defer();
          $http({
              method: 'POST',
              url: '/groupsList',
              data: {
                  session: $session.current()
              }
          })
          .then((result) => {
              $this.$list = result.data;
              deferred.resolve($this.$list);
          })
          .catch((error) => {
              deferred.reject(error);
          });
          return deferred.promise;
        };

        $this.Get = function(config) {
            let deferred = $q.defer()
            if (config) {
                if (config.id) {
                    $this.$getById(config.id)
                    .then((result) => {
                        deferred.resolve(result);
                    })
                    .catch((error) => {
                        deferred.reject(error);
                    })
                }
                else {
                    if (config.update) {
                        $this.UpdateList()
                        .then((result) => {
                            deferred.resolve($this.$getList());
                        })
                        .catch((error) => {
                            deferred.reject(error);
                        });
                    }
                    else {
                        deferred.resolve($this.$getList());
                    };
                };
            }
            else deferred.reject('config required');

            return deferred.promise;
        };
    })
