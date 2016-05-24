var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var exportDb = require('./routes/export-db');
var fs = require('fs');

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/export-db', exportDb);

//TODO//app.use('/api', api); // redirect API calls
//app.use('/', express.static(__dirname + '/www')); // redirect root

app.use('/js',    express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js',    express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/js',    express.static(__dirname + '/node_modules/html5sortable/dist'));
app.use('/js',    express.static(__dirname + '/node_modules/angular'));
app.use('/js',    express.static(__dirname + '/node_modules/angular-file-saver/dist'));
app.use('/css',   express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/fonts', express.static(__dirname + '/node_modules/bootstrap/dist/fonts'));
app.use('/js',    express.static(__dirname + '/node_modules/angular-bootstrap-colorpicker/js'));
app.use('/css',   express.static(__dirname + '/node_modules/angular-bootstrap-colorpicker/css'));
app.use('/img',   express.static(__dirname + '/node_modules/angular-bootstrap-colorpicker/img'));

if (! fs.existsSync("hiit-exports")){
  fs.mkdirSync("hiit-exports");
}
app.use('/hiit',   express.static(__dirname + '/hiit-exports'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
