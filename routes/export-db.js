/*jshint bitwise:true, browser:false, camelcase:true, curly:true, devel:false, eqeqeq:false, forin:true, immed:true, indent:4, newcap:true, noarg:true, noempty:true, nonew:true, quotmark:true, regexp:false, strict:true, trailing:true, undef:true, unused:true, node:true */
'use strict';
var express = require('express');
var router = express.Router();
var tmp = require('tmp');
var sqlite3 = require('sqlite3'); //.verbose();

router.post('/', function (req, res, next) {
    // Use something more sensible.
    var locale = 'fr_FR';

    exportToDB(req.body, locale, res);
});

function exportToDB(hiit, locale, res) {
    console.log('Post Export DB');

    var tmpFile = tmp.tmpNameSync({ template: 'export-XXXXXX.ahiit' });
    var dbFile  = __dirname + '/../hiit-exports/' + tmpFile;

    var db = new sqlite3.Database(dbFile, function (error) {
        if (error) {
            console.log('Cannot open database "' + dbFile + '": ' + error);
            res.json({
                error: error
            });
            return;
        }
    });

    db.serialize(function () {
        db.exec([
            'BEGIN TRANSACTION',
            'PRAGMA foreign_keys=OFF',
            'CREATE TABLE android_metadata (locale TEXT)',
            'CREATE TABLE table_set (_id INTEGER PRIMARY KEY, set_name TEXT, rounds integer)',
            'CREATE TABLE table_set_main (_id INTEGER PRIMARY KEY, set_id integer, action integer, time integer, color)',
            'CREATE TABLE table_workout (_id INTEGER PRIMARY KEY, workout TEXT)',
            'CREATE TABLE table_workout_main (_id INTEGER PRIMARY KEY, workout_id integer, set_id integer, action integer, time integer, color)',
            'CREATE TABLE table_workout_set (_id INTEGER PRIMARY KEY, workout_id integer, set_name text, rounds integer)'].join(';'));


        db.run('INSERT INTO android_metadata VALUES(?)', locale);

        // Add Ids to data
        var setId = 1;
        var actionId = 1;

        var stmtSet = db.prepare('INSERT INTO "table_set" VALUES(?,?,?)');
        var stmtSetMain = db.prepare('INSERT INTO "table_set_main" VALUES(?,?,?,?,?)');

        for (var i = 0; i < hiit.sets.length; i++) {
            var set = hiit.sets[i];
            set.id = setId;

            console.log(set.id + '\t' + set.name);

            stmtSet.run([set.id, set.name, set.repetitions]);

            for (var j = 0; j < set.actions.length; j++) {
                var action = set.actions[j];
                console.log('\t' + actionId + '\t' + action.name);

                action.id = actionId;
                //console.log([action.id, set.id, action.name, action.time, _intFromColor(action.color)])
                stmtSetMain.run([action.id, set.id, action.name, action.time, _intFromColor(action.color)]);

                actionId++;
            }
            setId++;
        }
        stmtSet.finalize();
        stmtSetMain.finalize();

        db.run('COMMIT; VACUUM');

        db.close(function (error) {
            if (error) {
                console.log('Cannot close database: ' + error);
                res.json({
                    error: error
                });
                return;
            }

            res.json({ error: null, location: '/hiit/' + tmpFile });

            //res.download(dbFile, function (err) {
            //    if (error) {
            //        console.log(err);
            //        res.status(err.status).end();
            //    }});

        });
    });

}

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
