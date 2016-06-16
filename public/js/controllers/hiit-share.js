/*global angular:true */
/*jshint bitwise:true, browser:true, camelcase:true, curly:true, devel:false, eqeqeq:false, forin:true, immed:true, indent:4, newcap:true, noarg:true, noempty:true, nonew:true, quotmark:true, regexp:false, strict:true, trailing:true, undef:true, unused:true */
// Share Controller
angular.module('hiitTimerApp').controller('hiitShareCtrl', function ($scope, $window, $log, localStorageService, durationFactory) {
    'use strict';
    //XXX The attribute ng-init="share=#{JSON.stringify(share)}" is not interpolated by Jade
    $scope.share = $window._share;
    $scope.addToStorage = function () {
        $log.debug('addToStorage', $scope.share);
        if (localStorageService.isSupported) {
            $scope.hiit = localStorageService.get('hiit');
            if ($scope.share.shareType == 'set') {
                $scope.hiit.sets.push($scope.share.shareData);
            } else if ($scope.share.shareType == 'workout') {
                $scope.hiit.workouts.push($scope.share.shareData);

            }
            $log.debug('Saved share', $scope.share.shareType, $scope.hiit);
            localStorageService.set('hiit', $scope.hiit);
            $window.location = '/';
        }
    };

    // Delegate methods
    $scope.workoutDuration = function (workout) {
        return durationFactory.workoutDuration(workout);
    };
    $scope.setDuration = function (set) {
        return durationFactory.setDuration(set);
    };
    $scope.actionDuration = function (action) {
        return durationFactory.actionDuration(action);
    };
    $scope.hasLocalStorage = function () {
        return localStorageService.isSupported;
    };
});
