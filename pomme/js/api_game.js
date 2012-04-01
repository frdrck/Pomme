BASE_URL = "http://pomme.us:32123"

var API =
	{
	URL:
		{
		"list":        BASE_URL + "/game/list",
		"active":      BASE_URL + "/game/active",
		"newgame":     BASE_URL + "/game/newgame",
		"create":      BASE_URL + "/game/new",
		"edit":        BASE_URL + "/game/edit",
		"view":        BASE_URL + "/game/view",
		"join":        BASE_URL + "/game/join",
		"join":        BASE_URL + "/game/join",
		"poll":        BASE_URL + "/game/poll",
		"send":        BASE_URL + "/game/send",
		"bet":         BASE_URL + "/game/bet",
		"judge":       BASE_URL + "/game/judge",
		"vote":        BASE_URL + "/game/vote",
		"skip":        BASE_URL + "/game/skip",
		"rejoin":      BASE_URL + "/game/rejoin",
		"pass":        BASE_URL + "/game/pass",
		"restart":     BASE_URL + "/game/restart",
		"deal":        BASE_URL + "/game/deal",
		"login":       BASE_URL + "/user/login",
		"checkin":     BASE_URL + "/game/list",
		"discard":     BASE_URL + "/game/discard",
		"user_view":   BASE_URL + "/user/view",
		"user_edit":   BASE_URL + "/user/edit",
		"combo_user":  BASE_URL + "/combo/user",
		"combo_judge": BASE_URL + "/combo/judge",
		"combo_game":  BASE_URL + "/combo/game",
		"like_add":    BASE_URL + "/like/add",
		"like_remove": BASE_URL + "/like/remove",
		"pomme_count": BASE_URL + "/pomme/count",
		},
	is_safari: navigator.appVersion.indexOf("Safari") !== -1 && navigator.appVersion.indexOf("Chrome") === -1,
	}
function trim (s)
	{
	return s.replace(/^\s+/, "").replace(/\s+$/, "")
	}
function sanitize (s)
	{
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;")
	}
function prepare_url (s)
	{
	s = trim(s);
	if (s.length < 5) return "";
	if (s.indexOf("javascript") === 0) return "";
	if (s.indexOf("http") !== 0) return "http://" + s;
	return s;
	}
function scrollToBottom (elem)
	{
	try { $(elem).scrollTop( $(elem)[0].scrollHeight ) }
	catch (err) { }
	}
function shuffle (list)
	{
	var i, j, t;
	for (i = 1; i < list.length; i++)
		{
		j = Math.floor(Math.random()*(1+i));  // choose j in [0..i]
		if (j != i)
			{
			t = list[i];                        // swap list[i] and list[j]
			list[i] = list[j];
			list[j] = t;
			}
		}
	}
function keys (o)
	{
	var keys = []
	for(var key in o)
		keys.push(key)
	return keys
	}
function choice (list)
	{
	return list[Math.floor(Math.random() * list.length)]
	}
NUMBERS = "none one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twenty-one twenty-two twenty-three twenty-four twenty-five twenty-six twenty-seven twenty-eight twenty-nine thirty".split(" ")
ILLEGAL_SNARK =
	[
	'That\'s not your name!',
	'You don\'t want people really calling you that, do you?',
	'I highly doubt that\'s your name',
	'Maybe people do really call you that..',
	'Try a name that won\'t make your mother cry',
	]

STATE_IDLE      = 0
STATE_SETUP     = 1
STATE_BET       = 2
STATE_PICKED	= 3
STATE_JUDGE     = 4
STATE_VOTE	= 5
STATE_WIN       = 6
STATE_GAMEOVER  = 7

$(function(){

	$("#howto-close").click(function(){
		$("#howto").fadeOut(500);
	});
	$("#howto a").click(function(){
		$("#howto iframe").show();
		$("#howto a").hide();
		return false;
	});

});

