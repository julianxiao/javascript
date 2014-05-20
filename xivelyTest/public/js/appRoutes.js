angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

		// home page
		.when('/', {
			templateUrl: 'views/home.html',
			controller: 'MainController'
		})

		.when('/settings', {
			templateUrl: 'views/settings.html',
			controller: 'SettingsController'
		})

		.when('/queue', {
			templateUrl: 'views/queue.html',
			controller: 'QueueController'	
		});

	$locationProvider.html5Mode(true);

}]);