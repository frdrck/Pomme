var API =
	{
	URL:
		{
		"list":        SERVER + "game/list",
		"active":      SERVER + "game/active",
		"newgame":     SERVER + "game/newgame",
		"create":      SERVER + "game/new",
		"edit":        SERVER + "game/edit",
		"view":        SERVER + "game/view",
		"join":        SERVER + "game/join",
		"join":        SERVER + "game/join",
		"poll":        SERVER + "game/poll",
		"send":        SERVER + "game/send",
		"bet":         SERVER + "game/bet",
		"judge":       SERVER + "game/judge",
		"vote":        SERVER + "game/vote",
		"skip":        SERVER + "game/skip",
		"rejoin":      SERVER + "game/rejoin",
		"pass":        SERVER + "game/pass",
		"restart":     SERVER + "game/restart",
		"deal":        SERVER + "game/deal",
		"login":       SERVER + "user/login",
		"checkin":     SERVER + "game/list",
		"discard":     SERVER + "game/discard",
		"user_view":   SERVER + "user/view",
		"user_edit":   SERVER + "user/edit",
		"combo_user":  SERVER + "combo/user",
		"combo_judge": SERVER + "combo/judge",
		"combo_game":  SERVER + "combo/game",
		"like_add":    SERVER + "like/add",
		"like_remove": SERVER + "like/remove",
		"pomme_count": SERVER + "pomme/count",
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

