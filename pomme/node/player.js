var HAND_SIZE = 5

function Player(game, username, avatar) {
  this.game = game;
  this.username = username;
  this.avatar = avatar;
  // TODO(geluso) port python's now() function.
  this.lastseen = 0;
  // TODO(geluso) deck.js
  this.cards = game.player_deck.hand(HAND_SIZE);
  this.score = 0;
  this.discards = 3;
  this.webcams = 3
}

Player.prototype.reset = function() {
  this.score = 0;
  this.discards = 3
  this.webcams = 3
}

Player.prototype.update = function() {
  // TODO(geluso) port python's now() function.
  this.lastseen = 0;
}

Player.prototype.report = function() {
  var rec = {
    username: this.username,
    score: this.score,
    avatar: this.avatar
  }
  return rec;
}

module.exports.Player = Player;
