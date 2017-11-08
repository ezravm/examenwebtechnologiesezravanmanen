'use strict'


angular.module('movieApp', ['ngRoute'])

	.config(function($routeProvider) {
	    $routeProvider
	        .when('/home', {
	            templateUrl: 'assets/views/home.html',
	            controller: 'homeCtrl'
	        });
	})
	
	.controller('homeCtrl', function($scope, actorSrv, saveSrv) {
		
	    	$('#searchButton').on('click', function (e) {

	    		$scope.films = '';

	    		var actor = $('#actorText').val();
	    		
	    		actorSrv.getActor(actor).then(function(data){
	    			var actorObject = (data.data[0].filmography.actor); //krijg juiste objectdeel terug
	    			
	    			var actorString = "";
	    			var actorArray = [];
	    			for(var i = 0; i < actorObject.length; i++){
		    			actorString += (actorObject[i].title) + " ; ";
		    			actorArray.push(actorObject[i].title);
		    			}
	    			console.log(actorArray);
	    			$scope.films = actorArray;
	    			
	    			//saveSrv.setObject(actor ,actorArray); dit werkt niet, niet duidelijk waarom niet
	    			
	    			var doc = {};
	    			doc.movies = actorString;
	    			var json = JSON.stringify(doc)
	    			console.log(json)

	    			saveSrv.setObject(json, actor);
	    			
	    			
	    			
	    		});
	    	});
    })
   
    .service('actorSrv', function($http, $q) {
    		this.getActor = function(actor) {
	    		var q = $q.defer();
	    		var url = 'http://theimdbapi.org/api/find/person?name=' + encodeURIComponent(actor) + '&format=json'; //url werkt
	    		
	    		$http.get(url)
	    			.then(function(data){
	    				q.resolve(data);
	    			}, function error(err) {
	    				q.reject(err);
	    			});
	    			console.log(q.promise);
	    			return q.promise;
	    		};
    })
    
    /*.service('zoneSrv', function($http, $q) {
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
    })*/
    
    .service('saveSrv', function($window, $http){
		  this.setObject = function(json, actor){
			 //$window.localStorage[key] = JSON.stringify(value);
			  //Save in CouchDB
			  //$http.put('http://127.0.0.1:5984/examenwebtechnologies/' + key, value");
			  
  			$.ajax({
				type:			'PUT',
				url:				'http://127.0.0.1:5984/examenwebtechnologies/' + actor,
				data:			json,
				contentType: 	'application/json',
				async:			true,
				success:		function(data){
				},
				error:		function(XMLHttpRequest, textStatus, errorThrown){
					console.log(errorThrown); 
				}
			});
			  
			  
		  };
		  
		  this.getObject = function(key){
			  return JSON.parse($window.localStorage[key] || '{}');
		  };
	});