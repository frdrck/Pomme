
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , server = require('./routes/server')
  , http = require('http')
  , path = require('path')
  , assert = require('assert')
  , debug = require('debug');

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
sio.set('authorization', function (handshake, accept) {
  // Hack to get cookie and session-info in Socket.IO
  handshake.originalUrl = '/';
  handshake.on = function(){};
  handshake.removeListener = function(){};
  var res = {on:function(){},removeListener:function(){}};
  cookieParser(handshake,res,function() {
    session(handshake,res,function() {
      if (!handshake.sessionID) {
        return accept('No sessionID', false);
      } else {
        return accept(null, true);
      }
    });
  });
});

(function() {
var debug = require('debug')('game');

app.get('/rooms', function(req,res) {
  res.json(rooms.map(function(room) {
    return {
      id: room.id,
      name: room.name,
      participants: room.participants.length
    };
  }));
});

function remove(arr,elem) {
  var i = arr.indexOf(elem);
  if (i >= 0) {
    return arr.splice(i,1);
  } else {
    return null;
  }
}
function removeIf(arr,condition) {
  for(var i=0;i<arr.length;i++) {
    if (condition(arr[i])) {
      arr.splice(i,1);
      i--;
    }
  }
}
function contains(arr,elem) {
  var i = arr.indexOf(elem);
  return i >= 0;
}

var users = [];
var rooms = [];
function getUserById(id) {
  assert(id);
  return users.filter(function(user) { return user.id === id; })[0];
}
function getRoomByName(name) {
  assert(name);
  return rooms.filter(function(room) { return room.name === name; })[0];
}
function clientRoom(room) {
  return {
    id: room.id,
    name: room.name,
    participants: room.participants.map(clientParticipant)
  };
}
function clientParticipant(participant) {
  return {
    id: participant.user.id,
    name: participant.user.name
  };
}
function createRoom(name) {
  debug('createRoom',name);
  assert(name);
  assert(!getRoomByName(name));
  var room = {
    name: name,
    participants: []
  };
  rooms.push(room);
  return room;
}
function joinRoom(room,newuser) {
  debug('joinRoom',room.name,newuser.id);
  assert(room); assert(newuser);
  var newparticipant = {
    user: newuser
  };
  newuser.rooms.push(room);
  room.participants.forEach(function(participant) {
    participant.user.socket.emit('joinedParticipant',{room: room.name, participant: clientParticipant(newparticipant)});
  });
  room.participants.push(newparticipant);
  newuser.socket.emit('joinedRoom',{ room: clientRoom(room) });
}
function leaveRoom(room,leftuser) {
  debug('leaveRoom',room.name,leftuser.id);
  assert(room); assert(leftuser);
  var leftparticipant = room.participants.filter(function(participant) { return participant.user === leftuser; })[0];
  assert(leftparticipant);
  remove(leftuser.rooms,room);
  remove(room.participants,leftparticipant);

  room.participants.forEach(function(participant) {
    participant.user.socket.emit('leftParticipant',{room: room.name, participant: leftparticipant.user.id});
  });
}
function destroyRoom(room) {
  debug('destroyRoom',room.name);
  assert(room);
  // TODO: Let users leave room
  remove(rooms,room);
}
function createUser(id,socket) {
  debug('createUser',id);
  assert(id);
  assert(socket);
  var user = {
    id: id,
    name: 'New User',
    socket: socket,
    rooms: []
  };
  users.push(user);
  return user;
}
function setUserName(user,name) {
  debug('setUserName',user.id,user.name,'->',name);
  assert(user);
  assert(name);
  // TODO: Send name change to others
  user.name = name;
}
function destroyUser(user) {
  debug('destroyUser',user.id);
  assert(user);
  // TODO: Leave rooms
  remove(users,user);
}
sio.sockets.on('connection', function(socket) {
  var userID = socket.handshake.sessionID;
  var user = createUser(userID, socket);
  socket.on('name',function(data) {
    setUserName(user,data.name);
  });
  socket.on('createRoom',function(data) {
    assert(data.name);
    var room = createRoom(data.name);
    joinRoom(room,user);
  });
  socket.on('joinRoom',function(data) {
    assert(data.name);
    var room = getRoomByName(data.name);
    assert(room);
    joinRoom(room,user);
  });
  socket.on('leaveRoom',function(data) {
    assert(data.name);
    var room = getRoomByName(data.name);
    assert(room);
    leaveRoom(room,user);
  });
  socket.on('disconnect',function() {
    destroyUser(user);
  });
});

})();
httpServer.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
