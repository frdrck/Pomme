var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'teveaver',
  database: 'asdfus'
});

connection.connect();

exports.mysql = function(req, res) {
  connection.query('SELECT * FROM pomme_user;', function(err, rows) {
    res.send("rows:", rows);
  });
};

exports.login = function(req, res) {
  var username = req.param('username');
  var password = req.param('password');

  res.send("json:", {username: username, password: password});  
};
