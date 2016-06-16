/*global angular:true */
/*jshint bitwise:true, browser:true, camelcase:true, curly:true, devel:false, eqeqeq:false, forin:true, immed:true, indent:4, newcap:true, noarg:true, noempty:true, nonew:true, quotmark:true, regexp:false, strict:true, trailing:true, undef:true, unused:true */
// Custom directive for mm:ss conversion
angular.module('hiitTimerApp').directive('formatMinutesSeconds', function () {
    'use strict';
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelController) {
            // Conversion View => Model
            ngModelController.$parsers.push(function (data) {
                var match;
                if (match = data.match(/^(\d+):(\d+)$/)) {
                    var min = parseInt(match[1], 10);
                    var sec = parseInt(match[2], 10);
                    return min * 60 + sec;
                }
                return parseInt(data, 10);
            });

            // Conversion Model => View
            ngModelController.$formatters.push(function (data) {
                var secs = parseInt(data, 10);
                if (!secs) {
                    return '';
                }

                var minutes = Math.floor(secs / 60);
                var seconds = secs - (minutes * 60);

                if (!minutes) {
                    return seconds;
                }

                // Zero pad
                seconds = ('00' + seconds).substr(-2, 2);

                return minutes + ':' + seconds;
            });
        }
    };
});
