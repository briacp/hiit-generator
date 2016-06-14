/*global angular:true */
/*jshint bitwise:true, browser:true, camelcase:true, curly:true, devel:false, eqeqeq:false, forin:true, immed:true, indent:4, newcap:true, noarg:true, noempty:true, nonew:true, quotmark:true, regexp:false, strict:true, trailing:true, undef:true, unused:true */
// Run Controller
angular.module('hiitTimerApp').controller('runCtrl', function ($scope, $rootScope, $window, $log, $interval, durationFactory) {
    'use strict';
    var runInterval;
    var setIndex;
    var actionIndex;

    $rootScope.$on('runEvent', function (ev, args) {
        _initRun(args.runType, args.runData);
    });

    var _ucfirst = function (s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    var _initRun = function (type, runData) {
        $log.debug('_initRun', type, runData);
        var data = {};
        angular.copy(runData, data);

        var run = {
            title: _ucfirst(type) + ' - ' + runData.name,
            type: type,
            data: data,
            workout: {},
            sets: [],
            actions: []
        };

        var totalSeconds = durationFactory.workoutDuration(run.data, true);

        //run.data.sets.unshift({
        //    name: 'Prepare!',
        //    repetitions: 1,
        //    actions: [{
        //        name: 'Prepare',
        //        time: 5,
        //        color: '#FFFFFF'
        //    }]
        //});

        // Workout ------------------------------------------------------------
        run.workout.totalSeconds = totalSeconds;
        run.workout.timeLeft = totalSeconds;
        run.workout.percent = 0.01;
        run.workout.currSeconds = 0;

        // Sets ---------------------------------------------------------------
        setIndex = 0;
        var currentSet = run.data.sets[setIndex];
        run.set = currentSet;
        run.set.index = setIndex;
        run.set.previous = null;
        run.set.next = run.data.sets[setIndex + 1] || null;
        run.set.round = 1;
        run.set.timeLeft = durationFactory.setDuration(currentSet, true);

        // Actions ------------------------------------------------------------
        actionIndex = 0;
        run.action = currentSet.actions[actionIndex];
        run.action.index = actionIndex;
        run.action.previous = null;
        run.action.next = currentSet[actionIndex + 1] || null;
        run.action.timeLeft = run.action.time;

        $scope.run = run;

        $('#runModal').modal();
    };

    var _nextSet = function () {};

    var _nextAction = function () {
        var run = $scope.run;
        var currentSet = run.set;
        var actionIndex = run.action.index + 1;
        run.action = currentSet.actions[actionIndex];
        if (!run.action) {
            _nextSet();
            return;
        }
        run.action.index = actionIndex;
        run.action.previous = currentSet.actions[actionIndex - 1];
        run.action.next = currentSet[actionIndex + 1] || null;
        run.action.timeLeft = run.action.time;
    };

    var _intervalRun = function () {
        $scope.run.timeLeft -= 1;

        var run = $scope.run;

        // Workout Update -----------------------------------------------------
        run.workout.currSeconds += 1;
        run.workout.timeLeft -= 1;
        run.workout.percent = run.workout.currSeconds / run.workout.totalSeconds * 100;

        // Set Update ---------------------------------------------------------
        run.set.timeLeft -= 1;

        // Action Update ------------------------------------------------------
        run.action.timeLeft -= 1;

        if (run.action.timeLeft === 0) {
            _nextAction();
        }

        // Check for finish condition -----------------------------------------
        if (run.workout.timeLeft === 0) {
            console('DONE!');
            $interval.cancel(runInterval);
        }
        if (run.set.timeLeft <= 5) {
            // Play sound
            $log.debug('TODO - Play sound.');
        }

        $log.debug(run, run.workout.timeLeft);
    };

    $scope.startRun = function () {
        $scope.run.timerRunning = true;
        if (runInterval) {
            return;
        }
        runInterval = $interval(_intervalRun, 1000);
    };

    $scope.stopRun = function () {
        $scope.run.timerRunning = false;
        $interval.cancel(runInterval);
        runInterval = null;
    };


    $scope.stepForward = function () {
        $log.debug('nextStep');
    };

    $scope.sec2minsec = function (s) {
        return durationFactory.sec2minsec(s);
    };
});
