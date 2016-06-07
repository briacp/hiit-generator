/*jshint bitwise:true, browser:false, camelcase:true, curly:true, devel:false, eqeqeq:false, forin:true, immed:true, indent:4, newcap:true, noarg:true, noempty:true, nonew:true, quotmark:true, regexp:false, strict:true, trailing:true, undef:true, unused:true, node:true */
'use strict';
var express = require('express');
var rid = require('readable-id');
var sqlite3 = require('sqlite3'); //.verbose();

var router = express.Router();
var dbFile = 'hiit.db';

function _getDb(res) {
    var db = new sqlite3.Database(dbFile, function (error) {
        if (error) {
            console.error('Cannot open database "' + dbFile + '": ' + error);
            res.json({
                error: error
            });
            return;
        }
    });

    db.on('trace', function (sql) {
        console.log('db-trace  : [' + sql + ']');
    });

    return db;
}

router.param('shareKey', function (req, res, next, shareKey) {
    req.shareKey = shareKey;
    next();
});

router.get('/:shareKey', function (req, res, next) {
    var db = _getDb(res);
    db.get('SELECT _id, share_type AS shareType, data as shareData FROM table_share WHERE key=?', req.shareKey, function (err, row) {
        if (err) {
            return next(err);
        }


        if (!row) {
            res.render('share', { error: "No matching workout found, sorry!", share: JSON.stringify({shareType:"error", shareData:{}})});
            return;
        }

        var shareData = {};

        try {
            shareData = JSON.parse(row.shareData);
        } catch (e) {
            console.warn('Invalid JSON', row.shareData);
        }

        res.render('share', {
            share: JSON.stringify({
                shareType: row.shareType,
                shareData: shareData
            })
        });
        res.json();
    });
});

router.post('/', function (req, res) {

    // TODO - Sanitize req parameters?
    var shareData = JSON.stringify(req.body.shareData);

    var db = _getDb(res);

    // TODO - Check if there is alrady an entry with the same data?
    var shareKey = rid();
    db.serialize(function () {
      db.run('INSERT INTO table_share (share_type, key, data) VALUES(?, ?, ?)', req.body.shareType, shareKey, shareData, function(err){
        if (err) {
            console.error(err);
            return next(err);
        }
      });
    });

    res.json({
        shareKey: shareKey
    });
});

module.exports = router;
