BASE_URL = "http://heavyfeathered.com:32123"

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

var Preload =
	{
	queue: [],
	lookup: {"main": {}, "player": {}},
	timeout: false,
	enqueue: function (set, images)
		{
		for (var i = 0; i < images.length; i++)
			{
			if (images[i] in Preload.lookup[set])
				continue
			Preload.lookup[set][images[i]] = true
			var j = Preload.queue.length
			Preload.queue[j] = new Image ()
			Preload.queue[j].src = "/img/" + set + "/" + images[i]
			}
		if (Preload.timeout === false)
			Preload.checkQueue ()
		},
	checkQueue: function ()
		{
		var loaded = 0
		for (var i = 0; i < Preload.queue.length; i++)
			{
			if (Preload.queue[i].complete)
				loaded += 1
			}
		if (loaded === Preload.queue.length)
			{
			Preload.queue = []
			Preload.timeout = false
			}
		else
			{
			Preload.timeout = setTimeout(Preload.checkQueue, 500)
			}
		},
	}

var nullplayer = { play: function(){}, stop: function (){} }
var Sound =
	{
	new_player: nullplayer,
	new_round: nullplayer,
	click: nullplayer,
	ticking: nullplayer,
	chat: nullplayer,
	wongame: nullplayer,
	init: function ()
		{
		Sound.new_player = soundManager.createSound
			({
			id: 'newplayer',
			url: '/mp3/newplayer.mp3',
			volume: 100,
			})
		Sound.new_round = soundManager.createSound
			({
			id: 'new_round',
			url: '/mp3/newround4.mp3',
			volume: 100,
			})
		Sound.click = soundManager.createSound
			({
			id: 'click',
			url: '/mp3/click.mp3',
			volume: 100,
			multiShot: false,
			})
		Sound.ticking = soundManager.createSound
			({
			id: 'ticking',
			url: '/mp3/10secondtick_fadein.mp3',
			volume: 100,
			})
		Sound.chat = soundManager.createSound
			({
			id: 'chat',
			url: '/mp3/chat1.mp3',
			volume: 100,
			})
		Sound.wonround = soundManager.createSound
			({
			id: 'wonround',
			url: '/mp3/roundwin.mp3',
			volume: 100,
			})
		Sound.wongame = soundManager.createSound
			({
			id: 'wongame',
			url: '/mp3/won.mp3',
			volume: 100,
			})
		$("#mute").bind("click", Sound.mute)
		},
	muted: false,
	mute: function ()
		{
		if (self.muted)
			{
			$("#mute").html("Mute")
			$("#mute").removeClass("muted")
			soundManager.unmute()
			self.muted = false
			}
		else
			{
			$("#mute").html("Unmute")
			$("#mute").addClass("muted")
			soundManager.mute()
			self.muted = true
			}
		},
	}
soundManager.onready(Sound.init)

var Auth =
	{
	session: false,
	username: false,
	login: function ()
		{
		var nick = $("#login-name").val().replace (/\W+/g,'')
		if (! nick.length)
			return
		if (nick === "false" || nick === "None")
			{
			alert("Pick a different name dude sorry")
			return
			}
		Auth.username = nick
		$("#login-altname").html(nick)
		var params =
			{
			'name': nick,
			}
		$.post(API.URL.login, params, Auth.loginCheck, "json")
		},
	loginCheck: function (data)
		{
		if (data && 'error' in data)
			{
			if (data.error === "password")
				return Auth.passwordForm ()
			if (data.error === "bad_password")
				{
				$("#password-error").html("Wrong password, try again")
				return Auth.passwordForm ()
				}
			if (data.error === "illegal")
				{
				alert (choice(ILLEGAL_SNARK))
				return
				}
			alert (data.error)
			return
			}
		Auth.session = data.session
		document.cookie = "session="+Auth.session+";path=/;domain=.heavyfeathered.com;max-age=1086400"
		Auth.unload ()
		Auth.loginCallback ()
		},
	passwordForm: function ()
		{
		Auth.currentForm = Auth.passwordClick
		$("#login-password").val("")
		$("#login-info").hide()
		$("#password-info").show()
		$("#login-password").focus()
		},
	checkin: function ()
		{
		var params = { 'session': Auth.session }
		$.post(API.URL.checkin, params, Auth.checkinCallback, "json")
		},
	checkinCallback: function (data)
		{
		Auth.username = data['username']
		Auth.loginCallback ()
		},
	passwordClick: function ()
		{
		var password = $("#login-password").val()
		password =  $.md5("pomme"+password)
		var params =
			{
			'name': Auth.username,
			'password': password,
			}
		$.post(API.URL.login, params, Auth.loginCheck, "json")
		},
	loginCallback: function () {},
	logout: function ()
		{
		document.cookie = "session=false;path=/;domain=.heavyfeathered.com;max-age=0"
		Auth.username = false
		Auth.session = false
		Auth.logoutCallback ()
		Auth.load ()
		},
	logoutCallback: function () {},
	unload: function ()
		{
		$("#login").hide ()
		$("#login-name").val("")
		$("#login-password").val("")
		},
	reset: function ()
		{
		Auth.unload()
		Auth.load()
		return false
		},
	currentForm: function () {},
	keys: function (e)
		{
		if (e.keyCode === 13)
			Auth.currentForm ()
		},
	load: function ()
		{
		$("#loading").hide()
		Auth.currentForm = Auth.login
		$("#login-name").val("")
		$("#login-password").val("")
		$("#login-info").show()
		$("#password-info").hide()
		$("#login").show ()
		$("#login-name").focus()
		},
	init: function ()
		{
		Auth.currentForm = Auth.login
		$("#login-name").bind("keydown", Auth.keys)
		$("#login-password").bind("keydown", Auth.keys)
		$("#login-go").bind("click", Auth.login)
		$("#login-back").bind("click", Auth.reset)
		$("#password-go").bind("click", Auth.passwordClick)
		$("#credits").bind("click", function(){$("#credits_box,#credits_curtain").fadeIn(500)})
		$("#credits_curtain,#credits_close").bind("click", function(){$("#credits_box,#credits_curtain").fadeOut(500)})
		if (document.cookie)
			{
			var cookies = document.cookie.split(";")
			for (i in cookies)
				{
				var cookie = cookies[i].split("=")
				if (cookie[0].indexOf("session") !== -1)
					{
					if (cookie[1] !== 'false' && cookie[1] !== 'undefined')
						{
						Auth.session = cookie[1]
						break
						}
					}
				}
			if (Auth.session)
				return true
			}
		return false
		}
	}

var EMOTICONS = {
	
	":beer:" : "/img/emoticons/beer.gif",
	"D:" : "/img/emoticons/mad.gif",
	"D-:" : "/img/emoticons/mad.gif",
	":((" : "/img/emoticons/mad.gif",
	":-((" : "/img/emoticons/mad.gif",
	":judge:" : "/img/emoticons/judge.gif",
	"???" : "/img/emoticons/question.gif",	
	":creep:" : "/img/emoticons/creep.gif",
	"8-)" : "/img/emoticons/cool.gif",
	"8)" : "/img/emoticons/cool.gif",
	"B-)" : "/img/emoticons/cool.gif",
	"B)" : "/img/emoticons/cool.gif",
	":-*" : "/img/emoticons/kiss.gif",
	":*" : "/img/emoticons/kiss.gif",
	"(n)" : "/img/emoticons/no.gif",
	":-x" : "/img/emoticons/notspeaking.gif",
	":-X" : "/img/emoticons/notspeaking.gif",
	":X" : "/img/emoticons/notspeaking.gif",
	":x" : "/img/emoticons/notspeaking.gif",
	":(" : "/img/emoticons/sad.gif",
	":-(" : "/img/emoticons/sad.gif",
	":-s" : "/img/emoticons/smouth.gif",
	":-S" : "/img/emoticons/smouth.gif",
	":S" : "/img/emoticons/smouth.gif",
	":s" : "/img/emoticons/smouth.gif",
	":'-(" : "/img/emoticons/tear.gif",
	":'(" : "/img/emoticons/tear.gif",
	":-/" : "/img/emoticons/unsure.gif",
	":/" : "/img/emoticons/unsure.gif",
	":-\\" : "/img/emoticons/embarrassed.gif",
	":\\" : "/img/emoticons/embarrassed.gif",
	";-)" : "/img/emoticons/wink.gif",
	";)" : "/img/emoticons/wink.gif",
	":srs:" : "/img/emoticons/wat.gif",
	":-|" : "/img/emoticons/wat.gif",
	"<3"  : "/img/emoticons/heartsmile.gif",
	"&lt;3"  : "/img/emoticons/heartsmile.gif",
	":sleepy:" : "/img/emoticons/sleepy.gif",
	":crazy:" : "/img/emoticons/crazy.gif",
	":imdead:" : "/img/emoticons/imdead.gif",
	":-)" : "/img/emoticons/happy.gif",
	":)" : "/img/emoticons/happy.gif",
	":sly:" : "/img/emoticons/sly.gif",
	":proud:" : "/img/emoticons/proud.gif",
	":timid:" : "/img/emoticons/timid.gif"

}
var Emotiwidget = {
  init: function(){	
		var EMOTICON_REVERSE = {};
		for (var emoticon in EMOTICONS) {
			if (emoticon.indexOf("&lt;") !== -1) {
				continue;
			}
			var image = EMOTICONS[emoticon];
			EMOTICON_REVERSE[image] = emoticon;
		}
		for (var image in EMOTICON_REVERSE) {
			var emoticon = EMOTICON_REVERSE[image];
			Emotiwidget.add(emoticon, image);
		}
		$("#open-emoticons").click(Emotiwidget.toggle);
	},
	
	add: function (emoticon, image) {
		var $img = $("<img>").attr("src", image);
		$img.click(function(){
		  var newval = $("#chat-message").val();
		  newval += " " + emoticon + " ";
		  $("#chat-message").val(newval);
		  Emotiwidget.hide();
		  $("#chat-message").focus();
		});
		$("#emoticons").append($img);
	},

	toggle: function(){
		$("#emoticons").toggle();
	},
	
	show: function(){
		$("#emoticons").show();
	},
	
	hide: function(){
		$("#emoticons").hide();
	}
}
$(Emotiwidget.init());

var Chat =
	{
	seen: {},
	sendCount: -1,
	height: 300,
	badwords: "nigg faggot n1gg".split(" "),
	keys: function (e)
		{
		switch (e.keyCode)
			{
			case 13: // enter
				Chat.send ()
				break
			case 33: // pageup
				var x = $("#chat_container").scrollTop() - Chat.height + 20 
				$("#chat_container").scrollTop( x )
				break
			case 34: // pagedown
				var x = $("#chat_container").scrollTop() + Chat.height + 20 
				$("#chat_container").scrollTop( x )
				break
			}
		},
	send: function ()
		{
		var msg = $("#chat-message").val()
		$("#chat-message").val("")
		if (! msg)
			return
		var mlow = msg.toLowerCase();
		for (i in Chat.badwords) {
			if (mlow.indexOf(Chat.badwords[i]) !== -1)
				return alert("BE NICE :(");
		}
		Sound.chat.play ()
		Chat.sendCount -= 1
		var hash = $.md5 (msg)
		Chat.seen[hash] = true
		var newchat = "<p><span class='user you'>"+Auth.username+"</span><span class='msg'>"+Chat.parse(msg)+"</span></p>"
		$("#chat").append(newchat)
		scrollToBottom("#chat_container")
		var params = { 'session': Auth.session, 'game': Game.name, 'msg': msg }
		$.post(API.URL.send, params)
		// Game.rejoinDisplay ()
		},
	parse: function (raw, name)
		{
		// return sanitize(raw) || ""
		if (! raw)
			return ""
		name = name || "frederick";
		var words = sanitize(raw).split(" ")
		var parsed = []
		for (var i = 0; i < words.length; i++)
			{
			var word = words[i];
			if (word.indexOf("http") === 0)
				{
				if (name == "frederick" && 
					(
					words[i].indexOf("gif") !== -1 ||
					words[i].indexOf("jpg") !== -1 ||
					words[i].indexOf("png") !== -1 ||
					words[i].indexOf("jpeg") !== -1 ||
					words[i].indexOf("GIF") !== -1 ||
					words[i].indexOf("JPG") !== -1 ||
					words[i].indexOf("PNG") !== -1 ||
					words[i].indexOf("JPEG") !== -1
					))
					{
					parsed.push ("<img src='"+word+"'>")
					// parsed.push ("<a href='"+word+"' target='_blank'><img src='"+word+"'></a>")
					}						
				else
					{
					parsed.push ("<a href='"+word+"' target='_blank'>"+word+"</a>")
					}
				}
			else if (word in EMOTICONS)
				{
				parsed.push ("<img src='" + EMOTICONS[word] + "'>");
				}
			else
				parsed.push (word)
			}
		return parsed.join(" ")
		},
	add: function (lines)
		{
		if (! lines)
			return
		if (! lines.length)
			return
		var rows = []
		var has_images = false
		for (var i = 0; i < lines.length; i++)
			{
			var line = lines[i]
			if (line[0] in Chat.seen)
				continue
			if (line[2] === Auth.username)
				{
				var hash = $.md5 (line[3])
				if (hash in Chat.seen)
					continue
				rows.push( "<p><span class='user you'>"+line[2]+"</span><span class='msg'>"+Chat.parse(line[3], line[2])+"</span></p>" )
				}
			else if (line[2] in Game.ignoreList)
				continue
			else
				rows.push( "<p><span class='user'>"+line[2]+"</span><span class='msg'>"+Chat.parse(line[3], line[2])+"</span></p>" )
			Chat.seen[line[0]] = true
			if (line[3].indexOf("http") !== -1)
				has_images = true
			}
		if (rows.length)
			{
			// Sound.chat.play ()
			$("#chat").append( rows.join('') )
			scrollToBottom("#chat_container")
			if (has_images)
				{
				setTimeout ('scrollToBottom("#chat_container")', 200)
				setTimeout ('scrollToBottom("#chat_container")', 500)
				setTimeout ('scrollToBottom("#chat_container")', 1000)
				if (rows.length > 10)
					setTimeout ('scrollToBottom("#chat_container")', 2000)
				}
			}
		},
	}

NO_AVATAR = "/img/empty-avatar.png"
var Profile =
	{
	username: "",
	userdata: {},
	viewProfile: function ()
		{
		Profile.view(Auth.username)
		},
	viewFromDiv: function ()
		{
		var username = $(this).html()
		Profile.view (username)
		},
	view: function (username)
		{
		Profile.username = username
		var params =
			{
			'name': username,
			'session': Auth.session,
			}
		$.post(API.URL.user_view, params, Profile.viewCallback, "json")
		},
	viewCallback: function (data)
		{
		$("#profile_username").html(data['username'])
		if (data['score'])
			$("#profile_score").html(data['score']+ " points")
		else
			$("#profile_score").html("")
		if (data['bio'])
			{
			var lines = data['bio'].split("\n")
			var parsed = []
			for (var i = 0; i < lines.length; i++)
				parsed.push(Chat.parse(lines[i]))
			$("#profile_bio").html(parsed.join("<br/>"))
			}
		else
			{
			$("#profile_bio").html("")
			}
		if ("avatar" in data && data['avatar'].length && data['avatar'].indexOf("http://") === 0)
			$("#profile_avatar").attr("src", data['avatar'])
		else
			$("#profile_avatar").attr("src", NO_AVATAR)
		var ftt = "facebook twitter tumblr".split(" ")
		for (i in ftt)
			{
			what = ftt[i]
			if (what in data)
				{
				var url = prepare_url(data[what])
				if (url.length)
					{
					$("#profile_"+what).show().attr("href", url)
					continue;
					}
				}
			$("#profile_"+what).hide()
			}
		if (data['username'] === Auth.username)
			$("#profile_edit_open").show()
		else
			$("#profile_edit_open").hide()
		$("#profile").show()
		$("#profile_curtain,#profile_view,#profile_menu_container").fadeIn(300)
		},
	edit: function ()
		{
		$("#profile_view").fadeOut(300)
		$("#profile_menu_container").fadeOut(300)
		var params =
			{
			'name': Auth.username,
			'session': Auth.session,
			}
		$.post(API.URL.user_view, params, Profile.editCallback, "json")
		},
	editCallback: function (data)
		{
		var fields = "avatar facebook tumblr twitter email".split(" ")
		for (i in fields)
			{
			what = fields[i]
			$("#profile_edit_"+what).val(sanitize(data[what]))
			}
		$("#profile_edit_bio").html(data["bio"])
		$("#profile_edit").fadeIn(300)
		},
	save: function ()
		{
		var params =
			{
			'name': Auth.username,
			'session': Auth.session,
			'avatar': $("#profile_edit_avatar").val (),
			'facebook': prepare_url($("#profile_edit_facebook").val()),
			'tumblr': prepare_url($("#profile_edit_tumblr").val()),
			'twitter': prepare_url($("#profile_edit_twitter").val()),
			'bio': $("#profile_edit_bio").val (),
			'email': $("#profile_edit_email").val (),
			}
		var pw = $("#profile_edit_password").val ()
		var pw2 = $("#profile_edit_password").val ()
		if (pw.length && pw2.length && pw === pw2)
			params['password'] = $.md5("pomme"+pw)
		$.post(API.URL.user_edit, params, Profile.saveCallback, "json")
		},
	saveCallback: function (data)
		{
		if ("error" in data)
			{
			alert(data.error)
			return
			}
		$("#profile_edit").fadeOut(300)
		Profile.view (Auth.username)
		},
	edit_unload: function ()
		{
		$("#profile_curtain,#profile_edit").fadeOut(300)
		},
	unload: function ()
		{
		$("#profile").fadeOut(300)
		$("#profile_curtain,#profile_view,#profile_menu_container,#profile_edit").fadeOut(300)
		},
	load: function ()
		{
		Combos.unload()
		},
	viewUserCombos: function ()
		{ Combos.viewUser (Profile.username) },
	viewJudgeCombos: function ()
		{ Combos.viewJudge (Profile.username) },
	init: function ()
		{
		$("#your-profile").bind("click", Profile.viewProfile)
		$("#profile_curtain").bind("click", Profile.unload)
		$("#profile_close").bind("click", Profile.unload)
		$("#profile_edit_close").bind("click", Profile.edit_unload)
		$("#profile_edit_open").bind("click", Profile.edit)
		$("#profile_edit_save").bind("click", Profile.save)
		$("#combos_won").bind("click", Profile.viewUserCombos)
		$("#combos_judged").bind("click", Profile.viewJudgeCombos)
		$("#combo_curtain").bind("click", Combos.unload)
		$("#combos_load_more").bind("click", Combos.loadMore)
		$(".user").live("click", Profile.viewFromDiv)
		$(".username").live("click", Profile.viewFromDiv)
		$("#history").live("click", Combos.viewGame)
		},
	}
var Combos =
	{
	viewReset: function (title)
		{
		$("#combo_curtain").fadeIn(300)
		$("#combo_list_wrapper").css({"opacity": 0}).show().animate({"top": "0%", "opacity": 1})
		$("#combo_label").html(title)
		$("#combo_list").html("")
		$("#combos_loading").html("Loading...").show()
		$("#combos_load_more_wrapper").hide()
		},
	viewUser: function (username)
		{
		Combos.viewReset(username + "'s winning pommes")
		Combos.viewApi = API.URL.combo_user
		Combos.params = { 'name': username, }
		$.post(API.URL.combo_user, Combos.params, Combos.viewCallback, "json")
		},
	viewJudge: function (username)
		{
		Combos.viewReset(username + "'s judged pommes")
		Combos.viewApi = API.URL.combo_judge
		Combos.params = { 'name': username, }
		$.post(API.URL.combo_judge, Combos.params, Combos.viewCallback, "json")
		},
	viewGame: function ()
		{
		$("#profile").show()
		Combos.viewReset(Game.name + " pomme history")
		Combos.viewApi = API.URL.combo_game
		Combos.params = { 'name': Game.name, 'session': Auth.session, }
		$.post(API.URL.combo_game, Combos.params, Combos.viewCallback, "json")
		},
	params: {},
	viewApi: "/",
	loadMore: function ()
		{
		$.post(Combos.viewApi, Combos.params, Combos.viewCallback, "json")
		},
	viewCallback: function (data)
		{
		if (! data || data.length === 0)
			{
			$("#combos_loading").html("No Pommes!").show()
			$("#combos_load_more_wrapper").hide()
			}
		var items = []
		for (var i = 0; i < data.length; i++)
			{
			var r = data[i]
			var s = "<li>"
			s += Combos.image(r['pairtype'], r['pair'])
			s += Combos.image(r['imagetype'], r['image'])
			s += "<span class='mask'></span>"
			s += "</li>"
			items.push(s)
			}
		$("#combo_list").append(items.join(""))
		if (data.length === 30)
			{
			Combos.params['start'] = data[data.length-1]['id']
			$("#combos_load_more_wrapper").show()
			$("#combos_loading").hide()
			}
		else
			{
			$("#combos_load_more_wrapper").hide()
			$("#combos_loading").html("No More Pommes!").show()
			}
		},
	image: function (type, name)
		{
		if ("type" === "free")
			return '<img src="'+name+'"/>'
		else
			return '<img src="/img/'+type+'/'+name+'"/>'
		},
	unload: function ()
		{
		$("#combo_list_wrapper").animate({"top": "100%", "opacity": 0}, function(){$("#combo_list_wrapper").hide()})
		$("#combo_curtain").fadeOut(300)
		},
	load: function ()
		{
		},
	init: function ()
		{
		},
	}

var Main =
	{
	init: function ()
		{
		$("#loading").fadeOut(500)
		var username = window.location.pathname.split("/")[2]
		Profile.init ()
		Auth.loginCallback = function() {
				console.log(username, Auth.username)
			if (username === Auth.username)
				{
				$("#profile").show()
				Profile.edit()
				}
			else
				Profile.view(username)
		}
		if ( Auth.init () )
			Auth.checkin ()
		else
			Auth.load ()
		},
	}
Main.init ()
