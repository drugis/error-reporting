"use strict";
/* globals angular */
angular
  .module("errorReporting", [])

  .factory("ErrorReportingService", [
    "$rootScope",
    "$q",
    function ($rootScope, $q) {
      function handleReaction(rejection) {
        var errorHolder = {
          type: "BACK_END_ERROR",
          cause: "An unknown error occurred", // default message
        };
        if (
          rejection &&
          rejection.status === 403 &&
          rejection.data === "SESSION_EXPIRED"
        ) {
          errorHolder = {
            code: rejection.status,
            cause: "User session has expired",
          };
          window.location.assign("/");
        } else if (
          rejection &&
          rejection.status &&
          (rejection.statusText || rejection.data)
        ) {
          errorHolder = {
            code: rejection.status,
            cause: rejection.data || rejection.statusText,
          };
        }

        $rootScope.$broadcast("error", errorHolder);
        return $q.reject(rejection);
      }

      return {
        requestError: function (rejection) {
          return handleReaction(rejection);
        },
        responseError: function (rejection) {
          return handleReaction(rejection);
        },
      };
    },
  ])

  .directive("errorReporting", [
    "$rootScope",
    "$transitions",
    "$window",
    function ($rootScope, $transitions, $window) {
      return {
        restrict: "E",
        template:
          "" +
          '<div ng-if="error" class="grid-x" ng-cloak>' +
          ' <div class="cell large-10 medium-10 small-12 medium-centered large-centered"  style="margin: 1rem;">' +
          '   <alert type="\'alert\'" close="closeError()">' +
          "     <div ng-if=\"error.type !== 'PATAVI'\">" +
          '       <div ng-if="error.code">{{::error.code}}</div> ' +
          '       <div ng-if="error.cause">{{::error.cause}}</div> ' +
          "       <div>{{::error.message}}</div>" +
          "     </div>" +
          "     <div ng-if=\"error.type === 'PATAVI'\">" +
          "       <p>An error has occured while running the model in R.</p>" +
          '       <div ng-if="error.cause">{{::error.cause}}</div>' +
          '       <div ng-if="error.message">{{::error.message}}</div>' +
          "     </div>" +
          "   </alert>" +
          " </div>" +
          "</div>",
        link: function () {
          $rootScope.$on("error", function (e, error) {
            $rootScope.error = error;
            $window.scrollTo(0, 0);
          });

          $transitions.onStart({}, function (transition) {
            $rootScope.currentStateName = transition.to();
            delete $rootScope.error;
          });

          $rootScope.closeError = function () {
            delete $rootScope.error;
          };
        },
      };
    },
  ])
  .config([
    "$httpProvider",
    function ($httpProvider) {
      $httpProvider.interceptors.push("ErrorReportingService");
    },
  ]);
