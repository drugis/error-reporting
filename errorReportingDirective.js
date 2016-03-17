angular.module('error-reporting-directive', [])

.factory('ErrorReportingService', ['$rootScope', '$q', function($rootScope, $q) {

  function handleReaction(rejection) {
    var message;
    if (rejection && rejection.status === 404) {
      $rootScope.$broadcast('error', {
        code: 404,
        cause: rejection.data.error
      });
      return $q.reject(rejection);
    } else if (rejection && rejection.data && rejection.data !== "") {
      message = {
        code: rejection.data.code,
        cause: rejection.data.message
      };
    } else {
      message = {
        cause: 'An unknown error occurred'
      };
    }

    $rootScope.$broadcast('error', message);
    return $q.reject(rejection);
  }

  return {
    'requestError': function(rejection) {
      return handleReaction(rejection);
    },
    'responseError': function(rejection) {
      return handleReaction(rejection);
    }
  };
}])
.directive('errorReporting', ['$rootScope','ErrorReportingService', function($rootScope, ErrorReportingService) {
  return {
    restrict: 'E',
    template: '' +
    '<div ng-if="error" class="row" ng-cloak>' +
      '<div class="columns">' +
      '<div class="alert-box {{type}}">' +
        '<div class="alert-box-message">' +
      	  '<a ng-click="animatedClose()" class="close" style="top: 1rem;">&times;</a>' +
      	  '<div ng-if="error.type !== \'patavi\'">' +
      		  '{{error.code}} {{error.cause}} {{error.message}}' +
          '</div>' +
          '<div ng-if="error.type === \'patavi\'">' +
      		  '<p>An error has occured while running the model in R.</p>' +
      		  '{{error.message}}' +
      	  '</div>' +
        '</div>' +
       '</div>' +
      '</div>' +
    '</div>',
    link: function() {
      $rootScope.$on('error', function(e, error) {
        $rootScope.error = _.extend(error, {
          close: function() {
            delete $rootScope.error;
          }
        });
      })
    }
  }
}])
.config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push('errorInterceptor');
}]);
