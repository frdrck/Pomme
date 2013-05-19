var _ = require('underscore');

function Combo(json) {
  this.validate(json);

  this.id = json.id;
  this.date = json.date || 0;
  this.gameid = json.gameid || 0;
  this.gamename = json.gamename || '';
  this.free = json.free || 0;
  this.userid = json.userid || 0;
  this.username = json.username || '';
  this.judgeid = json.judgeid || '';
  this.judgename = json.judgename || '';
  this.pairtype = json.pairtype || '';
  this.pair = json.pair || '';
  this.imagetype = json.imagetype || '';
  this.image = json.image || '';
  this.score = json.score || 0;
  this.likers = json.likers || '';
}

Combo.prototype.validate = function(json) {
  var requiredProperties = ['id'];
  _.each(requiredProperties, function(property) {
    if (!_.contains(json, property)) {
      console.log('error: json does not contain property:', property);
    };
  });
}

module.exports.Combo = Combo;
