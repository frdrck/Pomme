var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , pomme_db = require('./routes/server');


server.listen(3000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});
app.get('/angular.js', function (req, res) {
  res.sendfile(__dirname + '/angular.js');
});
app.get('/ApiCtrl.js', function (req, res) {
  res.sendfile(__dirname + '/ApiCtrl.js');
});

var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'asdfus'
});

connection.connect();

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });

  socket.on('login', function(data) {
    console.log('login', data);
    pomme_db.login(socket, data.username, data.password);
  });
});


