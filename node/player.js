function Player(username) {
  this.username = username;  
  this.score = 0;
};

Player.prototype.reset = function() {
  this.score = 0;
}

module.exports.Player = Player;
