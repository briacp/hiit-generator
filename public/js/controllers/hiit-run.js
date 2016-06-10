/*global angular:true */
/*jshint bitwise:true, browser:true, camelcase:true, curly:true, devel:false, eqeqeq:false, forin:true, immed:true, indent:4, newcap:true, noarg:true, noempty:true, nonew:true, quotmark:true, regexp:false, strict:true, trailing:true, undef:true, unused:true */
// Run Controller
angular.module('hiitTimerApp').controller('runCtrl', function ($scope, $rootScope, $window, $log, $interval, durationFactory) {
    'use strict';
    var runInterval;

    $rootScope.$on('runEvent', function (ev, args) {
        $log.debug('runEvent', ev, args);
        _initRun(args.runType, args.runData);
    });

    var _initRun = function (type, runData) {
        $log.debug('_initRun', type, runData);
        var run = {};
        angular.copy(runData, run);
        $scope.run = run;
        $scope.run.type = type;

        var totalSeconds = durationFactory.workoutDuration(run, true);

        run.sets.push({
            name: 'Prepare!',
            repetitions: 1,
            actions: [{
                name: 'Prepare',
                time: 5,
                color: '#FFFFFF'
            }]
        });

        $scope.countDown = totalSeconds;
        $scope.timer = {
            running: false,
            totalSeconds: parseInt(totalSeconds, 10),
            timeLeft: durationFactory.sec2minsec(totalSeconds),
            currSeconds: 0,
        };
        $scope.timer.percent = 98; // $scope.timer.currSeconds == 0 ? 0.1 :$scope.timer.currSeconds / $scope.timer.totalSeconds * 100;

        $scope.actionCountDown = '01:22';
        $scope.currentRound = 1;
        $scope.totalRounds = 8;
        $scope.setTimeLeft = '2:33';

        $('#runModal').modal();
    };

    $scope.stopRun = function () {
        $interval.cancel(runInterval);
    };

    $scope.startRun = function () {
        $scope.timer.running = true;
        runInterval = $interval(function () {
            $scope.timer.timeLeft -= 1;
            $scope.timer.currSeconds += 1;
            $scope.countDown -= 1;

            $log.debug($scope.timer, $scope.countDown);
        }, 1000);
    };

    $scope.stepForward = function () {
        $log.debug('nextStep');
    };
});
