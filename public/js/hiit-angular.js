/*global angular:true */
/*jshint bitwise:true, browser:true, camelcase:true, curly:true, devel:false, eqeqeq:false, forin:true, immed:true, indent:4, newcap:true, noarg:true, noempty:true, nonew:true, quotmark:true, regexp:false, strict:true, trailing:true, undef:true, unused:true */
(function () {
    'use strict';

    // Controller
    angular.module('hiitController', [])
        .controller('hiitEditorCtrl', function ($scope, $http, $window, localStorageService) {
        $scope.formData = {};

        $scope.showSets = function () {
            console.log('showSets');
        };

        $scope.showWorkouts = function () {
            console.log('showWorkouts');
        };

        $scope.exportHiit = function () {
            console.log($scope.hiit);
            $http.post('/export-db', $scope.hiit).success(function (data) {
                $window.location.href = data.location;
            });
        };

        $scope.setDuration = function (set) {
            var reps = set.repetitions;
            var roundDuration = 0;
            for (var i = 0; i < set.actions.length; i++) {
                var t = set.actions[i].time;
                t = t ? parseInt(t, 10) : 0;
                roundDuration += t;
            }

            //console.log('Duration "' + set.name + '":' + roundDuration + '*' + reps + '=' + (roundDuration * reps) + 'sec.');

            return sec2minsec(roundDuration * reps);
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

        $scope.addSet = function () {
            console.log('Add new set');
            var i = $scope.hiit.sets.push({
                name: '',
                repetitions: 1,
                actions: []
            });
            $scope.showSet($scope.hiit.sets[i - 1], -1);
        };

        $scope.loadHiit = function () {
            console.log('Loading data to localStorage...');
            if (localStorageService.isSupported) {
                $scope.hiit = localStorageService.get('hiit');
            }
        };

        $scope.saveHiit = function () {
            console.log('Saving data to localStorage...');
            if (localStorageService.isSupported) {
                localStorageService.set('hiit', $scope.hiit);
            }
        };

        $scope.deleteSet = function (index) {
            console.log('Delete set "' + $scope.hiit.sets[index] + '"');
            $scope.hiit.sets.splice(index, 1);
            $scope.currentSet = $scope.hiit.sets[0];
        };


        $scope.showSet = function (set, index) {
            console.log(set, index);
            //$('#set-editor').slideUp();

            //var currentSet = {};
            //angular.copy(set, currentSet);
            //$scope.currentSet = currentSet;

            $scope.currentSet = set;
            $scope.currentSet.index = index;

            $('#set-editor').slideDown();
        };

        $scope.addAction = function () {
            console.log('Add action to set "' + $scope.currentSet.name + '"');
            $scope.currentSet.actions.push({});
        };

        $scope.deleteAction = function (action, index) {
            console.log('Delete action "' + action.name + '" (#' + index + ')');
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
            });
        }

    });

    // App
    angular.module('hiitTimerApp', ['hiitController', 'htmlSortable', 'colorpicker.module', 'LocalStorageModule']);

    // done!
})();
