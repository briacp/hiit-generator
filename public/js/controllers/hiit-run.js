/*global angular:true */
/*jshint bitwise:true, browser:true, camelcase:true, curly:true, devel:false, eqeqeq:false, forin:true, immed:true, indent:4, newcap:true, noarg:true, noempty:true, nonew:true, quotmark:true, regexp:false, strict:true, trailing:true, undef:true, unused:true */
// Run Controller
angular.module('hiitTimerApp').controller('runCtrl', function ($scope, $rootScope, $window, $log, $interval, durationFactory) {
    'use strict';
    var runInterval;

    $scope.prepareRun = 5;

    $rootScope.$on('runEvent', function (ev, args) {
        _initRun(args.runType, args.runData);
    });

    var _ucfirst = function (s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    var _initRun = function (type, runData) {
        $log.debug('_initRun', type, runData);

        $scope.runButtonState = 'glyphicon-play';
        $scope.isRunning = false;
        $scope.isFinished = false;

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

        if ($scope.prepareRun) {
            run.data.sets.unshift({
                name: 'Prepare!',
                repetitions: 1,
                actions: [{
                    name: 'Prepare',
                    time: $scope.prepareRun,
                    color: '#ffffff'
                }]
            });
        }

        var totalSeconds = durationFactory.workoutDuration(run.data, true);

        // Workout ------------------------------------------------------------
        run.workout.totalSeconds = totalSeconds;
        run.workout.timeLeft = totalSeconds;
        run.workout.percent = 0.01;
        run.workout.currSeconds = 0;
        $scope.run = run;

        _selectSet(0);

        $('#runModal').on('hidden.bs.modal', function () {
            $log.debug('Closing window, canceling interval');
            $scope.stopRun();
        });

        $('#runModal').modal();
    };

    var _selectSet = function (setIndex) {
        var run = $scope.run;
        var currentSet = run.data.sets[setIndex];

        if (!currentSet) {
            return null;
        }

        run.set = currentSet;
        run.set.index = setIndex;
        run.set.previous = setIndex === 0 ? null : (run.data.sets[setIndex - 1] || null);
        run.set.next = run.data.sets[setIndex + 1] || null;
        run.set.round = 1;
        run.set.timeLeft = durationFactory.setDuration(currentSet, true);
        _selectAction(0);

        return run.set;
    };

    var _selectAction = function (actionIndex) {
        var run = $scope.run;
        var currentSet = run.set;
        run.action = currentSet.actions[actionIndex];
        if (!run.action) {
            return null;
        }
        run.action.index = actionIndex;
        run.action.previous = actionIndex === 0 ? null : (currentSet.actions[actionIndex - 1] || null);
        run.action.next = currentSet.actions[actionIndex + 1] || null;
        run.action.timeLeft = run.action.time;

        return run.action;
    };

    var _nextSet = function () {
        var set = _selectSet($scope.run.set.index + 1);
        if (!set) {
            $log.warn('No more sets!');
        }
    };

    var _nextAction = function () {
        var run = $scope.run;
        var action = _selectAction(run.action.index + 1);
        if (!action) {
            // Repeat Set
            if (run.set.round < run.set.repetitions) {
                run.set.round += 1;
                _selectAction(0);
            } else {
                _nextSet();
            }
        }
    };

    var _intervalRun = function () {
        var run = $scope.run;

        // FIXME Off by one error in set timer somewhere ?

        // Workout Update -----------------------------------------------------
        run.workout.currSeconds += 1;
        run.workout.timeLeft -= 1;
        run.workout.percent = run.workout.currSeconds / run.workout.totalSeconds * 100;
        run.set.timeLeft -= 1;
        run.action.timeLeft -= 1;

        // Check for finish condition -----------------------------------------
        if (run.action.timeLeft < 0) {
            _nextAction();
        }
        if (run.set.timeLeft < 0) {
            _nextSet();
        }
        if (run.workout.timeLeft < 0) {
            $scope.isFinished = true;
            $scope.runButtonState = 'glyphicon-flag';
            $interval.cancel(runInterval);
        }
        if (run.action.timeLeft <= 5) {
            // Play sound
            $log.debug('TODO - Play sound.');
        }


        //$log.debug(run, run.workout.timeLeft);
    };

    $scope.toggleRun = function () {
        if ($scope.isFinished) {
            $('#runModal').modal('hide');
        }
        if ($scope.isRunning) {
            $scope.runButtonState = 'glyphicon-play';
            $scope.stopRun();
        } else {
            $scope.runButtonState = 'glyphicon-pause';
            $scope.startRun();
        }
    };

    $scope.startRun = function () {
        if (runInterval) {
            return;
        }
        runInterval = $interval(_intervalRun, 1000);
        $scope.isRunning = true;
    };

    $scope.stopRun = function () {
        if (runInterval) {
            $interval.cancel(runInterval);
            runInterval = null;
        }
        $scope.isRunning = false;
    };

    $scope.sec2minsec = function (s) {
        return durationFactory.sec2minsec(s);
    };

});
