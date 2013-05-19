var _ = require('underscore');

function Game() {
  this.main_deck = [

  ];
  this.player_deck = [

  ];

  this.new_game();
  this.next_round();
};

Game.prototype.receive_player_join = function(player) {
  this.players.push(player);
  this.scores[player] = 0;
};

Game.prototype.receive_player_exit = function(player) {
  var index = this.players.indexOf(player);
  if (index != -1 && index < this.players.length) {
    this.players.splice(index, 1); 
  }
};

// draw cards from player deck and deal to player.
Game.prototype.deal_cards = function(size) {
  var cards = [];
  for (var i = 0; i < size; i++) {
    cards.push(this.player_deck.pop());
  }
  return cards;
};

Game.prototype.receive_submit_card = function(player, card) {
  if (!_.contains(this.current_combos, player)) {
    this.current_combos[card] = player;
  }
};

Game.prototype.receive_judges_choice = function(judge, card) {
  var player = this.current_combos[card];
  if (this.current_judge === judge) {
    this.winning_combo = {
      card: card,
      player: player
    };
    this.scores[player]++;
  }  
};

Game.prototype.next_judge = function() {
  var index = this.players.indexOf(this.current_judge);
  if (index == -1 || index >= this.players.length) {
    this.current_judge = this.players[0];
  } else {
    this.current_judge = this.players[index];
  }
}

Game.prototype.next_round = function() {
  this.advance_judge();
  this.current_card = main_deck.pop();
  this.current_combos = [];
  this.winning_submission = undefined;
};

Game.prototype.new_game = function() {
  this.current_judge = this.players[0];
  this.scores = {};
  for (var i = 0; i < this.players.length; i++) {
    var player = this.players[i];
    this.scores[player] = 0;
  } 
};

module.exports.Game = Game;
