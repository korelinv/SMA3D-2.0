angular.module('service.snapshots',['ui.router','service.session'])
    .service('$snapshots', function($window, $http, $session) {
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
                    session: $session.current()
                }
            });
        };
    })
