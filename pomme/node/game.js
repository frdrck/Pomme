var _ = require('underscore');

function Game(json) {
  this.id = json.id;
  this.name = json.name;
  this.path = json.path;
  this.goal = json.goal;
  this.capacity = json.capacity;
  this.free = json.free;
  this.startdate = json.startdate;
  this.lastdate = json.lastdate;
  this.userid = json.userid;
  this.username = json.username;
  this.bg = json.bg;
  this.private = json.private;
  this.password = json.password;
  this.timer = json.timer;
  this.avatar = json.avatar
}

module.exports.Game = Game;
