var verbose = require('./verbose');
var combo = require('./combo');

var idToCombo = {};

function createCombo(id, date, gameid, gamename, free, userid, username,
    judgeid, judgename, pairtype, pair, imagetype, image, score, likers) {
  var json = {
    id: id,
    date: date,
    gameid: gameid,
    gamename: gamename,
    free: free,
    userid: userid,
    username: username,
    judgeid: judgeid,
    judgename: judgename,
    pairtype: pairtype,
    pair: pair,
    imagetype: imagetype,
    image: image,
    score: score,
    likers: likers
  }

  if (verbose.SHOW_FAKE_COMBOS_JSON) {
    console.log(json);
    console.log();
  }

  var c = new combo.Combo(json);
  idToCombo[id] = c;
}

createCombo(5001,1313448112,100,'prettyroom',0,244,'karine',891,'wowowow','player','purp.jpg','main','tt6972249fltt.gif',0,'');
createCombo(5002,1313448166,100,'prettyroom',0,839,'Char',244,'karine','player','quit_your_job_and_become.png','main','zedd2.jpg',0,'');
createCombo(5003,1313448166,105,'secrets',0,780,'Ballen',813,'haley','player','tumblr_kqht8aM0kU1qziykqo1_400.jpg','main','cool-website-design.gif',0,'');
createCombo(5004,1313448205,105,'secrets',0,843,'lindsay',780,'Ballen','player','41bCKjVMuxL._SL500_AA280_.jpg','main','Gucci.gif',0,'');
createCombo(5005,1313448215,100,'prettyroom',0,839,'Char',796,'aga','player','tumblr_l2aq20FEoO1qzxuoxo1_400.gif','main','tumblr_lpmue4IsUO1r0sm24o1_500.jpg',0,'');
createCombo(5006,1313448253,105,'secrets',0,780,'Ballen',843,'lindsay','player','1312697372006-dumpfm-frakbuddy-Screen-shot-2011-08-06-at-3.54.54-PM.png','main','tt6245103fltt.gif',0,'');
createCombo(5007,1313448271,100,'prettyroom',0,891,'wowowow',896,'steve','player','anim_loup12.gif','main','1285436051408.jpg',0,'');
createCombo(5008,1313448306,105,'secrets',0,780,'Ballen',393,'crow','player','DNA_orbit_animated_small.gif','main','1290314871985-dumpfm-nekochuu-tommy_cat_hanging_on_fan_lg_clr.gif',0,'');
createCombo(5009,1313448321,100,'prettyroom',0,824,'Women',837,'dv','player','1276918779088.jpg','main','1312775723318dumpfmFAUXrealtumblr_lgblz34hmf1qgy0w4o1_500_1312825699.gif',0,'');
