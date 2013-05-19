var verbose = require('./verbose');
var game = require('./game');

var nameToGame = {};

function createGame(id, name, path, goal, capacity, free, startdate, lastdate,
    userid, username, bg, private, password, timer, avatar) {
  var json = {
    id: id || -1,
    name: name || '',
    path: path || '',
    goal: goal || 0,
    capacity: capacity || 10,
    free: free || 10,
    startdate: startdate || 0,
    lastdate: lastdate || 0,
    userid: userid || 0,
    username: username || '',
    bg: bg || '',
    private: private || 0,
    password: password || '',
    timer: timer || 30,
    avatar: avatar || ''
  }

  if (verbose.SHOW_FAKE_GAMES_JSON) {
    console.log(json);
    console.log();
  }

  var g = new game.Game(json);
  nameToGame[name] = g;
}

createGame(2151,'meowmix','meowmix',10,8,undefined,1359760014,1359760014,67404,'BrockObama',undefined,0,undefined,20,'');
createGame(2150,'sexytime','sexytime',10,8,undefined,1333752225,1333752225,48368,'nyxxe',undefined,0,undefined,20,'');
createGame(2149,'sandbox','sandbox',10,8,undefined,1326590172,1326590172,1,'jules',undefined,1,undefined,20,'');
createGame(2148,'The Big Apple','bigapple',10,100,undefined,1325995001,1325995001,1,'jules',undefined,0,undefined,20,'');
createGame(2147,'letsplay','letsplay',10,10,undefined,1325994785,1325994785,1,'jules',undefined,1,undefined,20,'');
createGame(2146,'lime','lime',10,10,undefined,1324330372,1324330372,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/lime.png');
createGame(2145,'blueberry','blueberry',10,10,undefined,1324302088,1324302088,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/blueberry.png');
createGame(2144,'apricot','apricot',10,10,undefined,1324294554,1324294554,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/apricot.png');
createGame(2143,'nectarine','nectarine',10,10,undefined,1324278999,1324278999,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/nectarine.png');
createGame(2142,'currants','currants',10,10,undefined,1324277571,1324277571,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/currants.png');
createGame(2141,'apple','apple',10,10,undefined,1324276734,1324276734,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/apple.png');
createGame(2140,'tamarind','tamarind',10,10,undefined,1324274900,1324274900,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/tamarind.png');
createGame(2139,'peach','peach',10,10,undefined,1324272879,1324272879,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/peach.png');
createGame(2138,'plum','plum',10,10,undefined,1324272343,1324272343,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/plum.png');
createGame(2137,'coconut','coconut',10,10,undefined,1324271985,1324271985,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/coconut.png');
createGame(2136,'raisin','raisin',10,10,undefined,1324269838,1324269838,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/raisin.png');
createGame(2135,'lobbychat','lobbychat',10,100,undefined,123456789,123456789,1,'jules',undefined,1,undefined,30,'');
createGame(2134,'passionfruit','passionfruit',10,10,undefined,1324268976,1324268976,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/passionfruit.png');
createGame(2133,'pear','pear',10,10,undefined,1324268696,1324268696,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/pear.png');
createGame(2132,'kumquat','kumquat',10,10,undefined,1324268135,1324268135,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/kumquat.png');
createGame(2131,'quince','quince',10,10,undefined,1324267643,1324267643,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/quince.png');
createGame(2130,'mango','mango',10,10,undefined,1324267465,1324267465,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/mango.png');
createGame(2129,'cantaloupe','cantaloupe',10,10,undefined,1324266983,1324266983,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/cantaloupe.png');
createGame(2128,'mulberry','mulberry',10,10,undefined,1324266874,1324266874,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/mulberry.png');
createGame(2127,'plantain','plantain',10,10,undefined,1324266743,1324266743,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/plantain.png');
createGame(2126,'persimmon','persimmon',10,10,undefined,1324266529,1324266529,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/persimmon.png');
createGame(2125,'kiwi','kiwi',10,10,undefined,1324266122,1324266122,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/kiwi.png');
createGame(2124,'lemon','lemon',10,10,undefined,1324265988,1324265988,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/lemon.png');
createGame(2123,'banana','banana',10,10,undefined,1324265597,1324265597,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/banana.png');
createGame(2122,'watermelon','watermelon',10,10,undefined,1324265429,1324265429,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/watermelon.png');
createGame(2121,'jackfruit','jackfruit',10,10,undefined,1324265403,1324265403,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/jackfruit.png');
createGame(2120,'grape','grape',10,10,undefined,1324265265,1324265265,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/grape.png');
createGame(2119,'blackberry','blackberry',10,10,undefined,1324265195,1324265195,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/blackberry.png');
createGame(2118,'tangerine','tangerine',10,10,undefined,1324265007,1324265007,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/tangerine.png');
createGame(2117,'juniper','juniper',10,10,undefined,1324264927,1324264927,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/juniper.png');
createGame(2116,'grapefruit','grapefruit',10,10,undefined,1324264826,1324264826,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/grapefruit.png');
createGame(2115,'orange','orange',10,10,undefined,1324264759,1324264759,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/orange.png');
createGame(2114,'prune','prune',10,10,undefined,1324264666,1324264666,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/prune.png');
createGame(2113,'tomato','tomato',10,10,undefined,1324264577,1324264577,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/tomato.png');
createGame(2112,'cherry','cherry',10,10,undefined,1324264444,1324264444,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/cherry.png');
createGame(2111,'avocado','avocado',10,10,undefined,1324264397,1324264397,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/avocado.png');
createGame(2110,'strawberry','strawberry',10,10,undefined,1324264330,1324264330,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/strawberry.png');
createGame(2109,'honeydew','honeydew',10,10,undefined,1324264289,1324264289,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/honeydew.png');
createGame(2108,'pineapple','pineapple',10,10,undefined,1324264282,1324264282,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/pineapple.png');
createGame(2107,'lychee','lychee',10,10,undefined,1324264093,1324264093,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/lychee.png');
createGame(2106,'papaya','papaya',10,10,undefined,1324264032,1324264032,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/papaya.png');
createGame(2105,'raspberry','raspberry',10,10,undefined,1324264007,1324264007,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/raspberry.png');
createGame(2104,'starfruit','starfruit',10,10,undefined,1324263954,1324263954,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/starfruit.png');
createGame(2103,'guava','guava',10,10,undefined,1324263932,1324263932,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/guava.png');
createGame(2102,'fig','fig',10,10,undefined,1324263859,1324263859,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/fig.png');
createGame(2101,'cranberry','cranberry',10,10,undefined,1324263849,1324263849,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/cranberry.png');
createGame(2100,'date','date',10,10,undefined,1324263843,1324263843,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/date.png');
createGame(2099,'pomegranate','pomegranate',10,10,undefined,1324263842,1324263842,0,'',undefined,0,undefined,20,'http://pomme.us/img/fruit/pomegranate.png');
