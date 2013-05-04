
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , server = require('./routes/server')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
var secret = 'your secret here';
var cookieParser = express.cookieParser(secret);
var session = express.session({key: 'sid', secret:secret});
app.use(cookieParser);
app.use(session);
app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/mysql', server.mysql);
app.post('/login', server.login);

var httpServer = http.createServer(app);

var sio = require('socket.io').listen(httpServer);
sio.set('authorization', function (req, accept) {
  req.originalUrl = '/';
  req.on = function(){};
  req.removeListener = function(){};
  var res = {on:function(){},removeListener:function(){}};
  cookieParser(req,res,function() {
    session(req,res,function() {
      if (!req.sessionID) {
        return accept('No sessionID', false);
      } else {
        return accept(null, true);
      }
    });
  });
});
sio.sockets.on('connection', function(socket) {
  console.log('Client connected');
});

httpServer.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
