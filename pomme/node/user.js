function User(json) {
  this.id = json.id;
  this.username = json.username;
  this.password = json.password;
  this.score = json.score;
  this.wins_10 = json.wins_10;
  this.wins_20 = json.wins_20;  
  this.wins_30 = json.wins_30;
  this.joindate = json.joindate;
  this.seendate = json.seendate;
  this.fbid = json.fbid;
  this.email = json.email;
  this.avatar = json.avatar;
  this.bio = json.bio;
}

User.prototype.is_confirmed = function() {
  return this.password.length > 0 && this.email.length > 0;
}

User.prototype.is_admin = function() {
  return this.admin == 1;
}

User.prototype.check_ip = function() {
  return true;
  /* TODO(geluso) implement actual check_ip logic
  try:
    curtime = now ()
    if int(self.seendate) > curtime - 1200:
      if self.last_ip is not None and self.last_ip[0] != client_address[0]:
        return False
    self.seendate = curtime
    self.last_ip = client_address
    return True
  except:
    return False
  */
}

module.exports.User = User;
