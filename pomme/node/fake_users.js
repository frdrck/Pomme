var verbose = require('./verbose');
var user = require('./user')

var usernameToUser = {};
function createUser(id, username, password, score, wins_10, wins_20, wins_30,
    joindate, seendate, fbid, email, avatar, bio, admin, remote_addr, facebook,
    twitter, tumblr) {
  var json = {
    id: id || -1, 
    username: username || '',
    password: password || '',
    score: score || 0,
    wins_10: wins_10 || 0,
    wins_20: wins_20 || 0,
    wins_30: wins_30 || 0,
    joindate: joindate || 0,
    seendate: seendate || 0,
    fbid: fbid || '',
    email: email || '',
    avatar: avatar || '',
    bio: bio || undefined,
    admin: admin || 0,
    remote_addr: remote_addr || '',
    facebook: facebook || '',
    twitter: twitter || '',
    tumblr: tumblr || ''
  }

  if (verbose.SHOW_FAKE_USERS_JSON) {
    console.log(json);
  }

  var u = new user.User(json);
  usernameToUser[username] = u;
}

createUser(5001,'lvh','',3,0,0,0,1317951931,1317952189,'','','',undefined,0,'','','','')
createUser(5002,'Kripa','',0,0,0,0,1317951985,1317952095,'','','',undefined,0,'','','','')
createUser(5003,'Melissa','bde65cd4869a63811e589c885c021a5e',634,10,1,0,1317952060,1366325951,'','','',undefined,0,'','','','')
createUser(5004,'dsamz','',14,0,0,0,1317953796,1322887593,'','','',undefined,0,'','','','')
createUser(5005,'gorbe','',21,0,0,0,1317954432,1317977354,'','','',undefined,0,'','','','')
createUser(5006,'Caram','',1,0,0,0,1317958674,1317958674,'','','',undefined,0,'','','','')
createUser(5007,'DrPotatopickles','',0,0,0,0,1317958716,1317958716,'','','',undefined,0,'','','','')
createUser(5008,'RollingTsundere','',230,3,0,0,1317958722,1362192484,'','','',undefined,0,'','','','')
createUser(5009,'GeoMitch','',28,0,0,0,1317958734,1319779647,'','','',undefined,0,'','','','')
