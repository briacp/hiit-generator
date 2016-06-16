/*global angular:true */
/*jshint bitwise:true, browser:true, camelcase:true, curly:true, devel:false, eqeqeq:false, forin:true, immed:true, indent:4, newcap:true, noarg:true, noempty:true, nonew:true, quotmark:true, regexp:false, strict:true, trailing:true, undef:true, unused:true */
// Factories
angular.module('hiitTimerApp').factory('durationFactory', function () {
    'use strict';
    // Converts and display time from seconds to mm:ss
    var sec2minsec = function (secs) {

        if (!secs) {
            return '00:00';
        }

        var minutes = Math.floor(secs / 60);
        var seconds = secs - (minutes * 60);

        // Zero pad
        minutes = ('00' + minutes).substr(-2, 2);
        seconds = ('00' + seconds).substr(-2, 2);

        return minutes + ':' + seconds;
    };

    var actionDuration = function (action) {
        return action && action.time ? sec2minsec(action.time) : null;
    };

    var workoutDuration = function (workout, returnSec) {
        if (!workout || !workout.sets) {
            return null;
        }
        var duration = 0;

        for (var i = 0; i < workout.sets.length; i++) {
            duration += setDuration(workout.sets[i], true);
        }

        return returnSec ? duration : sec2minsec(duration);
    };

    var setDuration = function (set, returnSec) {
        if (!set) {
            return null;
        }
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

    return {
        sec2minsec: sec2minsec,
        actionDuration: actionDuration,
        setDuration: setDuration,
        workoutDuration: workoutDuration
    };

});
