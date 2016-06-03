/*global angular:true */
/*jshint bitwise:true, browser:true, camelcase:true, curly:true, devel:false, eqeqeq:false, forin:true, immed:true, indent:4, newcap:true, noarg:true, noempty:true, nonew:true, quotmark:true, regexp:false, strict:true, trailing:true, undef:true, unused:true */ (function () {
    'use strict';

    angular
    // App
    .module('hiitTimerApp', ['htmlSortable', 'colorpicker.module', 'ui.bootstrap', 'LocalStorageModule', 'angularFileUpload'])
    // Controller
    .controller('hiitEditorCtrl', function ($scope, $http, $window, $log, localStorageService, FileUploader) {
        $scope.modeWorkout = false;
        $scope.debug = false;
        $scope.uploading = false;

        $scope.uploader = new FileUploader({
            url: '/import-db',
            autoUpload: true,
            alias: 'ahiitFile',
            removeAfterUpload: true
        });

        $scope.uploader.onBeforeUploadItem = function (item) {
            item.onSuccess = function (res) {
                $log.debug('item.onSuccess', res);
                if (res.imported.sets) {
                    for (var i = 0; i < res.imported.sets.length; i++) {
                        $scope.hiit.sets.push(res.imported.sets[i]);
                    }
                }
                if (res.imported.workouts) {
                    for (i = 0; i < res.imported.workouts.length; i++) {
                        $scope.hiit.workouts.push(res.imported.workouts[i]);
                    }
                }

                $scope.uploading = false;
            };
        };

        $scope.toggleDebug = function () {
            $scope.debug = !$scope.debug;
        };

        $scope.showSets = function () {
            $log.debug('showSets');
            $scope.modeWorkout = false;
            $scope.currentWorkout = null;
            if ($scope.hiit) {
                $scope.displayedSets = $scope.hiit.sets;
            }
            $scope.currentSet = null;
        };

        $scope.showWorkouts = function () {
            $log.debug('showWorkouts');
            $scope.modeWorkout = true;
            if ($scope.hiit) {
                $scope.currentWorkout = $scope.hiit.workouts[0];
                $scope.displayedSets = $scope.currentWorkout.sets;
            }
            $scope.currentSet = null;
        };


        $scope.showUpload = function () {
            $scope.uploading = !$scope.uploading;
        };

        $scope.importHiit = function () {
            $log.debug("import .ahiit");
            $log.debug($scope.uploader);
        };

        $scope.exportHiit = function () {
            $log.debug($scope.hiit);
            $http.post('/export-db', $scope.hiit).success(function (data) {
                $window.location.href = data.location;
            });
        };

        $scope.workoutDuration = function (workout, returnSec) {
            var duration = 0;

            for (var i = 0; i < workout.sets.length; i++) {
                duration += $scope.setDuration(workout.sets[i], true);
            }

            return returnSec ? duration : sec2minsec(duration);
        };

        $scope.setDuration = function (set, returnSec) {
            var reps = set.repetitions;
            var roundDuration = 0;
            for (var i = 0; i < set.actions.length; i++) {
                var t = set.actions[i].time;
                t = t ? parseInt(t, 10) : 0;
                roundDuration += t;
            }

            //$log.debug('Duration "' + set.name + '":' + roundDuration + '*' + reps + '=' + (roundDuration * reps) + 'sec.');

            return returnSec ? roundDuration * reps : sec2minsec(roundDuration * reps);
        };

        // Converts and display time from seconds to mm:ss
        var sec2minsec = function (secs) {

            if (!secs) {
                return '';
            }

            var minutes = Math.floor(secs / 60);
            var seconds = secs - (minutes * 60);

            // Zero pad
            minutes = ('00' + minutes).substr(-2, 2);
            seconds = ('00' + seconds).substr(-2, 2);

            return minutes + ':' + seconds;
        };

        $scope.createWorkout = function () {
            $log.debug('Create new workout');
            var i = $scope.hiit.workouts.push({
                name: '',
                sets: []
            });
            $scope.showWorkout($scope.hiit.workouts[i - 1], -1);
        };

        $scope.createSet = function () {
            $log.debug('Create new set');
            var i = $scope.displayedSets.push({
                name: '',
                repetitions: 1,
                actions: []
            });
            $scope.showSet($scope.displayedSets[i - 1], -1);
        };

        $scope.loadHiit = function () {
            $log.debug('Loading data to localStorage...');
            if (localStorageService.isSupported) {
                $scope.hiit = localStorageService.get('hiit');
            }
        };

        $scope.saveHiit = function () {
            $log.debug('Saving data to localStorage...');
            if (localStorageService.isSupported) {
                localStorageService.set('hiit', $scope.hiit);
            }
        };

        $scope.showWorkout = function (workout, index) {
            $log.debug(workout, index);
            $scope.currentSet = null;

            if (!workout) {
                return;
            }

            $scope.currentWorkout = workout;
            $scope.currentWorkout.index = index;
            $scope.displayedSets = $scope.currentWorkout.sets;

            $('#set-editor').slideDown();
        };


        $scope.shareSet = function (index) {
            $log.debug("shareSet", index);
        };
        $scope.shareWorkout = function (index) {
            $log.debug("shareWorkout", index);
        };


        $scope.deleteSet = function (index) {
            $log.debug('Delete set "' + $scope.displayedSets[index] + '"');
            $scope.displayedSets.splice(index, 1);
            $scope.currentSet = $scope.displayedSets[0];
        };

        $scope.deleteWorkout = function (index) {
            $log.debug('Delete workout "' + $scope.hiit.workouts[index] + '"');
            $scope.hiit.workouts.splice(index, 1);
            $scope.showWorkout($scope.hiit.workouts[0], 0);
        };


        $scope.showSet = function (set, index) {
            $log.debug(set, index);

            //var currentSet = {};
            //angular.copy(set, currentSet);
            //$scope.currentSet = currentSet;

            $scope.currentSet = set;
            $scope.currentSet.index = index;

            $('#set-editor').slideDown();
        };

        $scope.addAction = function () {
            $log.debug('Add action to set "' + $scope.currentSet.name + '"');
            $scope.currentSet.actions.push({});
        };

        $scope.deleteAction = function (action, index) {
            $log.debug('Delete action "' + action.name + '" (#' + index + ')');
            $scope.currentSet.actions.splice(index, 1);
        };


        if (localStorageService.isSupported) {
            $scope.loadHiit();
            //$scope.unbindHiit = localStorageService.bind($scope, 'hiit');
        }

        // If no data, load a default set
        if (!$scope.hiit) {
            $http.get('/hiit_data.js').success(function (data) {
                $scope.hiit = data;
                $scope.showSets();
            });
        } else {
            $scope.showSets();
        }


    });

})();
