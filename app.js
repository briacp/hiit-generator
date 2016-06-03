/*jshint bitwise:true, browser:false, camelcase:true, curly:true, devel:false, eqeqeq:false, forin:true, immed:true, indent:4, newcap:true, noarg:true, noempty:true, nonew:true, quotmark:true, regexp:false, strict:true, trailing:true, undef:true, unused:true, node:true */
'use strict';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

var routes = require('./routes/index');
var shareRoute = require('./routes/share');
var exportRoute = require('./routes/export');
var importRoute = require('./routes/import');

var app = express();
if (app.get('env') === 'development') {
    app.locals.pretty = true;
}
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Setup Routes
app.use('/', routes);
app.use('/export', exportRoute);
app.use('/import', importRoute);
app.use('/share', shareRoute);

//TODO//app.use('/api', api); // redirect API calls
//app.use('/', express.static(__dirname + '/www')); // redirect root

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/js', express.static(__dirname + '/node_modules/html5sortable/dist'));
app.use('/js', express.static(__dirname + '/node_modules/angular'));
app.use('/js', express.static(__dirname + '/node_modules/angular-file-saver/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/fonts', express.static(__dirname + '/node_modules/bootstrap/dist/fonts'));

app.use('/js', express.static(__dirname + '/node_modules/angular-local-storage/dist'));
app.use('/js', express.static(__dirname + '/node_modules/angular-file-upload/dist'));

// Angular Bootstrap UI
app.use('/js', express.static(__dirname + '/node_modules/angular-ui-bootstrap/dist'));
app.use('/css', express.static(__dirname + '/node_modules/angular-ui-bootstrap/dist'));
app.use('/uib/template', express.static(__dirname + '/node_modules/angular-ui-bootstrap/template'));

// XXX To remove
app.use('/js', express.static(__dirname + '/node_modules/angular-bootstrap-colorpicker/js'));
app.use('/css', express.static(__dirname + '/node_modules/angular-bootstrap-colorpicker/css'));
app.use('/img', express.static(__dirname + '/node_modules/angular-bootstrap-colorpicker/img'));

if (!fs.existsSync('hiit-exports')) {
    fs.mkdirSync('hiit-exports');
}
app.use('/hiit', express.static(__dirname + '/hiit-exports'));


if (!fs.existsSync('tmp-import')) {
    fs.mkdirSync('tmp-import');
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
