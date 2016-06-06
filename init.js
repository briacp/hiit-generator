/*jshint bitwise:true, browser:false, camelcase:true, curly:true, devel:false, eqeqeq:false, forin:true, immed:true, indent:4, newcap:true, noarg:true, noempty:true, nonew:true, quotmark:true, regexp:false, strict:true, trailing:true, undef:true, unused:true, node:true */
'use strict';
var sqlite3 = require('sqlite3'); //.verbose();
var fs = require('fs');

var dbFile = 'hiit.db';

if (!fs.existsSync(dbFile)) {
    console.log('Creating new "' + dbFile + '" db.');

    var db = new sqlite3.Database(dbFile, function (error) {
        if (error) {
            console.log('Cannot create HIIT Db', error);
        }
    });

    db.serialize(function () {
        console.log('Tables creation');
        db.run('BEGIN TRANSACTION');
        db.run('CREATE TABLE table_share (_id INTEGER PRIMARY KEY, share_type TEXT, key TEXT, data TEXT)');
        db.run('COMMIT');
    });


    db.close();
}

if (!fs.existsSync('hiit-exports')) {
    fs.mkdirSync('hiit-exports');
}

if (!fs.existsSync('tmp-import')) {
    fs.mkdirSync('tmp-import');
}

