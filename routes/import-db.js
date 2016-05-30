/*jshint bitwise:true, browser:false, camelcase:true, curly:true, devel:false, eqeqeq:false, forin:true, immed:true, indent:4, newcap:true, noarg:true, noempty:true, nonew:true, quotmark:true, regexp:false, strict:true, trailing:true, undef:true, unused:true, node:true */
'use strict';
var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3'); //.verbose();
var multer = require('multer');
var fs = require('fs');

// File upload
var upload = multer({
    dest: 'tmp-import'
}).single('ahiitFile');

//router.get('/', upload, function (req, res, next) {
//    _importDb(req, res, next, 'misc/db/Sets.ahiit');
//});


router.post('/', upload, function (req, res, next) {
    _importDb(req, res, next, req.file.path);
});

function _importDb(req, res, next, dbFile) {

    console.log('Import DB', dbFile);

    var db = new sqlite3.Database(dbFile, sqlite3.OPEN_READONLY, function (error) {

        if (error) {
            console.log('Uploaded file is not a SQLite3 DB "' + dbFile + '": ' + error);
            return next(error);
        }
    });

    //db.on('profile', function (sql, ms) {
    //    console.log('db-profile: [' + sql + '](' + ms + 'ms)');
    //});
    //db.on('trace', function (sql) {
    //    console.log('db-trace  : [' + sql + ']');
    //});

    var stmtSet = db.prepare('SELECT _id, set_name AS name, rounds AS repetitions FROM table_set');
    var stmtSetMain = db.prepare('SELECT _id, set_id, action AS name, time, color FROM table_set_main ORDER BY _id');
    var stmtWorkout = db.prepare('SELECT _id, workout AS name FROM table_workout');
    var stmtWorkoutSet = db.prepare('SELECT _id, workout_id, set_name AS name, rounds AS repetitions FROM table_workout_set ORDER BY _id, workout_id');
    var stmtWorkoutMain = db.prepare('SELECT _id, workout_id, set_id, action AS name, time, color FROM table_workout_main ORDER BY _id, set_id, workout_id');

    var sets = [];
    var setActions = [];
    var workouts = [];
    var workoutSets = [];
    var workoutSetActions = [];

    stmtSet.each(function (err, row) {
        console.log(row);
        if (err) {
            return next(err);
        }
        sets.push(row);
    });

    stmtSetMain.each(function (err, row) {
        if (err) {
            return next(err);
        }
        row.color = _colorFromInt(row.color);
        setActions.push(row);
    });

    stmtWorkout.each(function (err, row) {
        if (err) {
            return next(err);
        }
        workouts.push(row);
    });

    stmtWorkoutSet.each(function (err, row) {
        if (err) {
            return next(err);
        }
        workoutSets.push(row);
    });

    stmtWorkoutMain.each(function (err, row) {
        if (err) {
            return next(err);
        }
        row.color = _colorFromInt(row.color);
        workoutSetActions.push(row);
    });

    stmtSet.finalize();
    stmtSetMain.finalize();
    stmtWorkout.finalize();
    stmtWorkoutSet.finalize();
    stmtWorkoutMain.finalize();

    db.close(function (err) {
        if (err) {
            console.log('Cannot close database: ' + err);
            return next(err);
        }

        fs.unlink(dbFile);

        res.json({
            imported: _createHiit(sets, setActions, workouts, workoutSets, workoutSetActions),
            error: null
        });
    });

}


function _createHiit(sets, setActions, workouts, workoutSets, workoutSetActions) {
    var i, j, k;
    var set, action, workout;
    var hiit = {
        sets: [],
        workouts: []
    };

    for (i = 0; i < sets.length; i++) {
        if (!sets[i]) {
            continue;
        }
        set = sets[i];
        set.actions = [];
        for (j = 0; j < setActions.length; j++) {

            if (setActions[j] && setActions[j].set_id == set._id) {
                action = setActions[j];
                delete action._id;
                delete action.set_id;
                set.actions.push(action);
            }

        }

        delete set._id;
        hiit.sets.push(set);
    }

    for (i = 0; i < workouts.length; i++) {
        if (!workouts[i]) {
            continue;
        }
        workout = workouts[i];
        workout.sets = [];

        for (k = 0; k < workoutSets.length; k++) {
            if (workoutSets[k] && workoutSets[k].workout_id == workout._id) {
                set = workoutSets[k];

                set.actions = [];
                for (j = 0; j < workoutSetActions.length; j++) {
                    if (workoutSetActions[j] && workoutSetActions[j].set_id == set._id) {
                        action = workoutSetActions[j];
                        delete action._id;
                        delete action.set_id;
                        delete action.workout_id;
                        set.actions.push(action);
                    }

                }
                delete set._id;
                delete set.workout_id;
                workout.sets.push(set);
            }

        }

        delete workout._id;
        hiit.workouts.push(workout);
    }
    return hiit;
}

/** Convert from a RGB (#FF00FF) color to Android int color code. */
function _colorFromInt(value) {
    var _2hex = function (v) {
        var hex = v.toString(16);
        while (hex.length < 2) {
            hex = '0' + hex;
        }
        return hex;
    };

    var red = _2hex(value & 0x0000FF);
    var green = _2hex((value & 0x00FF00) >> 8);
    var blue = _2hex((value & 0xFF0000) >> 16);
    return '#' + [red, green, blue].join('');
}

module.exports = router;
