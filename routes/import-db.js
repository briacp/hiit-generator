/*jshint bitwise:true, browser:false, camelcase:true, curly:true, devel:false, eqeqeq:false, forin:true, immed:true, indent:4, newcap:true, noarg:true, noempty:true, nonew:true, quotmark:true, regexp:false, strict:true, trailing:true, undef:true, unused:true, node:true */
'use strict';
var express = require('express');
var router = express.Router();
var tmp = require('tmp');
var util = require('util');
var sqlite3 = require('sqlite3').verbose();
var multer = require('multer');

// File upload
var storage = multer.diskStorage({
    destination: 'tmp-import',
    filename: function (req, file, cb) {
        var tmpFile = tmp.tmpNameSync({
            template: 'import-XXXXXXX.db'
        });
        console.log("tmp upload:" + tmpFile);
        cb(null, tmpFile)
    }
})


var upload = multer({
    storage: storage
}).single('ahiitFile');

router.post('/', upload, function (req, res, next) {
    // Use something more sensible.
    console.log("Import DB");

    var dbFile = req.file.path;

    var importedHiit = {
        sets: [],
        actions: []
    };

    var db = new sqlite3.Database(req.file.path, sqlite3.OPEN_READONLY, function (error) {
        if (error) {
            console.log('Uploaded file is not a SQLite3 DB "' + dbFile + '": ' + error);
            res.json({
                error: error,
                imported: null
            });
            return;
        }

        console.log("DB opened");
    });

    db.on('profile', function (sql, ms) {
        console.log('db-profile: [' + sql + '](' + ms + 'ms)');
    });
    db.on('trace', function (sql) {
        console.log('db-trace  : [' + sql + ']');
    });

    db.serialize(function () {
        console.log("DB selection");
        db.each("SELECT set_name, rounds FROM table_set", function (err, row) {
            console.log(row);
            if (err) {
                console.warn("Error when retrieving Sets", err);
                return;
            }
            importedHiit.sets.push({
                name: row.set_name,
                round: row.rounds
            });
        });
        db.each("SELECT workout FROM table_workout", function (err, row) {
            console.log(row);
            if (err) {
                console.warn("Error when retrieving Workouts", err);
                return;
            }
            importedHiit.workouts.push({
                name: row.workout
            });
        });

        res.json({
            imported: importedHiit,
            error: null
        });
    });

});

/** Convert from a RGB (#FF00FF) color to Android int color code. */
function _intFromColor(color) {
    var cache, red, green, blue;

    cache = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color);

    if (!cache) {
        return -1;
    }

    red = parseInt(cache[1], 16);
    green = parseInt(cache[2], 16);
    blue = parseInt(cache[3], 16);

    red = (red << 16) & 0x00FF0000; //Shift red 16-bits and mask out other stuff
    green = (green << 8) & 0x0000FF00; //Shift Green 8-bits and mask out other stuff
    blue = blue & 0x000000FF; //Mask out anything not blue.

    return 0xFF000000 | red | green | blue; //0xFF000000 for 100% Alpha. Bitwise OR everything together.
}

module.exports = router;
