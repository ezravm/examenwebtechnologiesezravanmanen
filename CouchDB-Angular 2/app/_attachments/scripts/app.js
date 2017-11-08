'use strict'

/*var tariffs = [
	    			{'kleur': 'Rood', 'max': 3, 'start': 9, 'einde': 22, 'dagen': [0, 1, 2, 3, 4, 5],
	    			'tarief': [1.60, 2.70, 3.80]},
	    			{'kleur': 'Donkergroen', 'max': 10, 'start': 9, 'einde': 19, 'dagen': [0, 1, 2, 3, 4, 5],
	    			'tarief': [0.70, 1.10], 'dagticket': 3.80},
	    			{'kleur': 'Lichtgroen', 'max': 10, 'start': 9, 'einde': 19, 'dagen': [0, 1, 2, 3, 4, 5],
	    			'tarief': [0.70, 1.10]},
	    			{'kleur': 'Geel', 'max': 10, 'start': 9, 'einde': 19, 'dagen': [0, 1, 2, 3, 4, 5],
	    			'tarief': [0.50]},
	    			{'kleur': 'Oranje', 'max': 10, 'start': 9, 'einde': 19, 'dagen': [0, 1, 2, 3, 4, 5],
	    			'tarief': [0.50], 'dagticket': 2.70},
	    			{'kleur': 'Blauw', 'max': 2, 'start': 9, 'einde': 18, 'dagen': [0, 1, 2, 3, 4, 5],
	    			'tarief': [0]}
	    		];*/

angular.module('parkingApp', ['ngRoute'])

	.config(function($routeProvider) {
	    $routeProvider
	        .when('/home', {
	            templateUrl: 'assets/views/home.html',
	            controller: 'homeCtrl'
	        });
	})
	
	.controller('homeCtrl', function($scope, addressSrv, zoneSrv, saveSrv) {
		
	    	$('#searchButton').on('click', function (e) {

	    		$scope.color = '';

	    		var address = $('#addressText').val();
	    		
	    		addressSrv.getCoordinates(address).then(function(data){
	    			var lat = parseFloat(data.data[0].lat);
	    			var lon = parseFloat(data.data[0].lon);
		    		var zones = saveSrv.getObject('zones');
		    		
		    		if(Object.keys(zones).length == 0){
		    			zoneSrv.getZones().then(function(data){
		    				zones = data;
		    				saveSrv.setObject('zones', data);
		    				$scope.color = zoneSrv.getTariff(lon, lat, zones.data);
		    			});
		    		}
		    		else {
		    			$scope.color = zoneSrv.getTariff(lon, lat, zones.data);
		    		}
	    		});
	    	});
    })
   
    .service('addressSrv', function($http, $q) {
    		this.getCoordinates = function(address) {
	    		var q = $q.defer();
	    		var url = 'http://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(address) + '&format=json';

	    		$http.get(url)
	    			.then(function(data){
	    				q.resolve(data);
	    			}, function error(err) {
	    				q.reject(err);
	    			});
	    			
	    			return q.promise;
	    		};
    })
    
    .service('zoneSrv', function($http, $q) {
    		this.getZones = function() {
			var q = $q.defer();
			$http.get('http://datasets.antwerpen.be/v4/gis/paparkeertariefzones.json')
				.then(function(data, status, headers, config){
					q.resolve(data.data);
				}, function error(err) {
					q.reject(err);
				});
			
			return q.promise;
		};
		
		// http://alienryderflex.com/polygon/
		this.inPolygon = function(location, polyLoc){
			var lastPoint = polyLoc[polyLoc.length-1];
			var isInside = false;
			var x = location[0];

			for(var i = 0; i < polyLoc.length; i++){
				var point = polyLoc[i];
				var x1 = lastPoint[0];
				var x2 = point[0];
				var dx = x2 - x1;

				if(Math.abs(dx) > 180.0){
					if(x > 0){
						while(x1 < 0)
							x1 += 360;
						while(x2 < 0)
							x2 += 360;
					}
					else{
						while(x1 > 0)
							x1 -= 360;
						while(x2 > 0)
							x2 -= 360;
					}
					dx = x2 - x1;
				}

				if((x1 <= x && x2 > x) || (x1 >= x && x2 < x)){
					var grad = (point[1] - lastPoint[1]) / dx;
					var intersectAtLat = lastPoint[1] + ((x - x1) * grad);

					if(intersectAtLat > location[1])
						isInside = !isInside;
				}
				lastPoint = point;
			}
			return isInside;
		};
		
		this.getTariff = function(lng, lat, zones){
			for(var i = 0; i < zones.length; i++) {
				var geo = JSON.parse(zones[i].geometry);
				var coordinates = geo.coordinates[0];
				if(this.inPolygon([lng, lat], coordinates)) {
					return zones[i].tariefkleur;
				}
			}
		};
    })
    
    .service('saveSrv', function($window, $http){
		  this.setObject = function(key, value){
			  $window.localStorage[key] = JSON.stringify(value);
			  //Save in CouchDB
			  //$http.put('../../' + key, value);
		  };
		  
		  this.getObject = function(key){
			  return JSON.parse($window.localStorage[key] || '{}');
		  };
	});