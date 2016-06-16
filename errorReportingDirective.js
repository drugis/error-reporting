'use strict';
/* globals angular */
angular.module('errorReporting', [])

.factory('ErrorReportingService', ['$rootScope', '$q',
  function($rootScope, $q) {

    function handleReaction(rejection) {

      // Dirty work-around to swallow error on patavi warm-up request, needs to be replaced in new error handeling
      // As an example look at :
      // http://stackoverflow.com/questions/33605486/handle-angular-http-errors-locally-with-fallback-to-global-error-handling
      // http://www.codelord.net/2014/06/25/generic-error-handling-in-angularjs/
      if (rejection && rejection.config && rejection.config.url.indexOf('warm-up', rejection.config.url.length - rejection.config.url.length) !== -1) {
        return $q.resolve();
      }


      var errorHolder = {
        type: 'BACK_END_ERROR',
        cause: 'An unknown error occurred' // default message
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
  }
])
  .directive('errorReporting', ['$rootScope', '$window', 'ErrorReportingService',
    function($rootScope, $window) {
      return {
        restrict: 'E',
        template: '' +
          '<div ng-if="error" class="row" ng-cloak>' +
          '<div class="columns large-10 medium-10 small-12 medium-centered large-centered"  style="margin: 1rem;">' +
          '<div class="alert-box alert">' +
          '<div class="alert-box-message" style="font-size: 1.25rem">' +
          '<a ng-click="closeError()" class="close" style="top: 1.25rem; font-size: 2rem">&times;</a>' +
          '<div ng-if="error.type !== \'PATAVI\'">' +
          '  <div ng-if="error.code">{{::error.code}}</div> ' +
          '  <div ng-if="error.cause">{{::error.cause}}</div> ' +
          '  <div>{{::error.message}}</div>' +
          '</div>' +
          '<div ng-if="error.type === \'PATAVI\'">' +
          '  <p>An error has occured while running the model in R.</p>' +
          '  <div ng-if="error.cause">{{::error.cause}}</div>' +
          '  <div ng-if="error.message">{{::error.message}}</div>' +
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

          $rootScope.$on("$stateChangeSuccess",
            function(event, toState) {
              $rootScope.currentStateName = toState.name;
              delete $rootScope.error;
            }
          );

          $rootScope.closeError = function() {
            delete $rootScope.error;
          };
        }
      };
    }
  ])
  .config(['$httpProvider',
    function($httpProvider) {
      $httpProvider.interceptors.push('ErrorReportingService');
    }
  ]);
