var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var CORS = require('cors')();
//var fs = require('fs');

var index = require('./routes/index');
var auth = require('./routes/auth');
var brand = require('./routes/brand');
var lineup = require('./routes/lineup');
var generation = require('./routes/generation');
var gninfo = require('./routes/gninfo');
var model = require('./routes/model');
var api = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('port', process.env.PORT || 9000);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
app.use(CORS);
// index <- admin <- lineup <- generation <- grade <- trim
app.use('/', index);
app.use('/auth', auth);
app.use('/brand', brand);
app.use('/lineup', lineup);
app.use('/generation', generation);
app.use('/gninfo', gninfo);
app.use('/model', model);
app.use('/api', api);

// app.get('/cartypedir', function(req, res) {
//   //var br_id = req.query.br_id;

//   // for(var i = 1; i < 78; i++){
//   //   fs.mkdir('./public/images/'+i+'/'+16, function(err) {});
//   // }
//   // res.send('mkdir : ./public/images/'+15+'/');

//   // var deleteFolderRecursive = function(path) {
//   //       if(fs.existsSync(path)){
//   //         fs.readdirSync(path).forEach(function(file,index){
//   //             var curPath = path + "/" + file;
//   //             if(fs.lstatSync(curPath).isDirectory()) { // recurse
//   //                 deleteFolderRecursive(curPath);
//   //             } else { // delete file
//   //                 fs.unlinkSync(curPath);
//   //             }
//   //           });
//   //           fs.rmdirSync(path);
//   //       }
//   //     };
//   // for(var i = 1; i < 78; i++){
//   //   for(var j = 1; j < 17; j++){
//   //     deleteFolderRecursive('./public/images/'+i+'/'+j);
//   //   }
//   // }
// });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log("↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ 404 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓");
  console.log("connect IP : " + req.connection.remoteAddress);
  console.log("↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑ 404 ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑");
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
var server = app.listen(app.get('port'), function(){
  console.log("Double Clutch Server Listening (PORT : " + server.address().port + ")");
});

module.exports = app;
