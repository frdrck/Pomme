var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  port     : 3306,
  user     : 'root',
  password : 'password',
  database : 'asdfus'
});

connection.connect();

function user_new() {

}

function insert(table, expected, data) {
  sql = 'INSERT INTO ' + table + ' ';
  fields = []
  values = []
  for (var i = 0; i < expected.length; i++) {
    field = expected[i];
    value = data[field];
    if (value) {
      fields.push(field);
      values.push(value);
    }
  }
  sql += '(' + fields.join(',') + ')';
  sql += '(' + values.join(',') + ')';
}

function user_new() {
  sql = 'INSERT INTO pomme_user (username, password, score, wins_10, wins_20, wins_30, joindate, seendate, fbid, email, avatar, bio, admin, remote_addr, facebook, twitter, tumblr) ' +
        'VALUES('')'

}

function user_list_all() {
  sql = 'SELECT * FROM pomme_user ORDER BY id';
  connection.query(sql, handlesql);
};

function handlesql(err, rows, fields) {
  if (err) {
  	console.log(err);
  }

  console.log('rows');
  for (var i = 0; i < rows.length; i++) {
    console.log(rows[i]);
  }

  console.log('fields');
  for (var i = 0; i < fields.length; i++) {
    console.log(fields[i]);
  }
}

user_list_all();