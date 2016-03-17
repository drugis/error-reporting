'use strict';
/* globals angular */
angular.module('errorReporting', [])

.factory('ErrorReportingService', ['$rootScope', '$q', function($rootScope, $q) {

  function handleReaction(rejection) {
    var errorHolder = {
      type: 'BACK_END_ERROR',
      cause: 'An unknown error occurred' // defualt message
    };
    if (rejection && rejection.status, rejection.data) {
      errorHolder = {
        code: rejection.status,
        cause: rejection.data
      };
    }

    $rootScope.$broadcast('error', errorHolder);
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
.directive('errorReporting', ['$rootScope', '$window','ErrorReportingService', function($rootScope, $window) {
  return {
    restrict: 'E',
    template: '' +
    '<div ng-if="error" class="row" ng-cloak>' +
      '<div class="columns large-10 medium-10 small-12 medium-centered large-centered ">' +
      '<div class="alert-box alert">' +
        '<div class="alert-box-message" style="font-size: 1.25rem">' +
      	  '<a ng-click="closeError()" class="close" style="top: 1.25rem; font-size: 2rem">&times;</a>' +
      	  '<div ng-if="error.type !== \'patavi\'">' +
      		  '<div>{{error.code}}</div> <div>{{error.cause}}</div> <div>{{error.message}}</div>' +
          '</div>' +
          '<div ng-if="error.type === \'patavi\'">' +
      		  '<p>An error has occured while running the model in R.</p>' +
      		  '{{error.message}}' +
      	  '</div>' +
        '</div>' +
       '</div>' +
      '</div>' +
    '</div>',
    link: function(scope, element) {
      $rootScope.$on('error', function(e, error) {
        $rootScope.error = error;
        // todo need to scroll to top
      });

      $rootScope.closeError = function() {
        delete $rootScope.error;
      };
    }
  };
}])
.config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push('ErrorReportingService');
}]);
