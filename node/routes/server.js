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
  connection.query(
    'select id from pomme_user where username = ? and password = ?',
    [username, password],
    function(err,rows) {
      if (err || rows.length !== 1) {
        res.writeHead(403);
        res.end('Invalid username or password');
        return;
      }
      req.session['userid'] = rows[0][0];
      res.end();
    }
  );
};

exports.logout = function(req,res) {
  delete req.session['userid'];
  res.end();
};

exports.loggedin = function(fn) {
  return function(req,res) {
    if (req.session['userid']) {
      fn(req,res);
    } else {
      res.writeHead(403);
      res.end();
    }
  };
};