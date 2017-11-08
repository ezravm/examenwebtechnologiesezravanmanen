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
	    			var actorObject = (data.data[0].filmography.actor); //krijgt juiste objectdeel terug YAY
	    			
	    			var actorArray = [];
	    			for(var i = 0; i < actorObject.length; i++){
		    			actorArray.push(actorObject[i].title);
		    			}
	    			console.log(actorArray);
	    			$scope.films = actorArray;
	    			
	    			//saveSrv.setObject(actor ,actorArray); dit werkt niet, niet duidelijk waarom niet
	    			
	    			var doc = {};
	    			doc.movies = actorArray;
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
			  //no info on how to get from Couchdb, and didn't googlefu it at home. so no spaGETti.
			  
		  };
	});