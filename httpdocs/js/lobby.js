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
		document.cookie = "session="+Auth.session+";path=/;domain=." + BROWSER + ";max-age=1086400";
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
		document.cookie = "session=false;path=/;domain=." + BROWSER + ";max-age=0"
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
	parse: function (raw)
		{
		// return sanitize(raw) || ""
		if (! raw)
			return ""
		if (raw.indexOf("http") !== -1)
			{
			var words = sanitize(raw).split(" ")
			var parsed = []
			for (var i = 0; i < words.length; i++)
				{
				if (words[i].indexOf("http") === 0)
					{
					if (words[i].indexOf("gif") !== -1 ||
						words[i].indexOf("jpg") !== -1 ||
						words[i].indexOf("png") !== -1 ||
						words[i].indexOf("jpeg") !== -1 ||
						words[i].indexOf("GIF") !== -1 ||
						words[i].indexOf("JPG") !== -1 ||
						words[i].indexOf("PNG") !== -1 ||
						words[i].indexOf("JPEG") !== -1)
						parsed.push ("<img src='"+words[i]+"'>")
						// parsed.push ("<a href='"+words[i]+"' target='_blank'><img src='"+words[i]+"'></a>")
					else
						parsed.push ("<a href='"+words[i]+"' target='_blank'>"+words[i]+"</a>")
					}
				else
					parsed.push (words[i])
				}
			return parsed.join(" ")
			}
		return sanitize(raw)
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
				rows.push( "<p><span class='user you'>"+line[2]+"</span><span class='msg'>"+sanitize(line[3])+"</span></p>" )
				}
			else if (line[2] in Game.ignoreList)
				continue
			else if (line[2] === "frederick")
				rows.push( "<p><span class='user'>"+line[2]+"</span><span class='msg'>"+Chat.parse(line[3])+"</span></p>" )
			else
				rows.push( "<p><span class='user'>"+line[2]+"</span><span class='msg'>"+sanitize(line[3])+"</span></p>" )
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

var Game =
	{
	last: 0,
	name: "lobbychat",
	ignoreList: {},
	join: function ()
		{
		var params = { session: Auth.session, last: Game.last, game: Game.name }
		$.post(API.URL.join, params, Game.joinCallback, "json").error(Game.joinError)
		},
	joinCallback: function (data)
		{
		if (! data)
			return Game.joinError ()
		if (Auth.username === false)
			Auth.username = data['username']
		if ("error" in data)
			return Game.pollError()
		document.cookie = "session="+Auth.session+";path=/;domain=." + BROWSER + ";max-age=1086400"
		// document.getElementById("chat-message").focus()
		Game.last = data['last']
		Game.score = data['score']
		if (Game.score < 5)
			$("#profile_triangle,#profile_welcome").hide()
		Chat.add (data['chat'])
		// Active.update(data)
		self.timeout = setTimeout (Game.poll, 10000)
		},
	poll: function ()
		{
		if (Auth.session === false)
			return
		var params = { session: Auth.session, last: Game.last, game: Game.name }
		$.post(API.URL.poll, params, Game.pollCallback, "json").error(Game.pollError)
		},
	joinError: function ()
		{ self.timeout = setTimeout (Game.join, 5000) },
	pollError: function ()
		{ self.timeout = setTimeout (Game.poll, 5000) },
	pollCallback: function (data)
		{
		if (! data)
			return Game.pollError ()
		if ("error" in data)
			return Game.pollError()
		Chat.add (data['chat'])
		// Active.update(data)
		Game.last = data['last']
		self.timeout = setTimeout (Game.poll, 1000)
		},
	}
var Active =
	{
	mouseIn: function ()
		{
		$("#chat_active_list").fadeIn(200)
		},
	mouseOut: function ()
		{
		$("#chat_active_list").fadeOut(200)
		},
	poll: function ()
		{
		$.post(API.URL.pomme_count, {}, Active.pollCallback, "json")
		},
	pollCallback: function (data)
		{
		$("#chat_active").addClass("active")
		// console.log(data)
		$("#chat_count").html(data['count'])
		// console.log(data['count'])
		setTimeout(Active.poll, 10000);
		},
	update: function (data)
		{
		if (data['players'].length > 1)
			$("#chat_active").addClass("active")
		else
			$("#chat_active").removeClass("active")
		$("#chat_count").html(data['players'].length)
		var names = []
		for (i in data['players'])
			names.push(data['players'][i].name)
		$("#chat_active_list").html( names.sort().join("<br/>") )
		},
	init: function ()
		{
		$("#chat_active_container").hover(Active.mouseIn, Active.mouseOut)
		},
	}
var Newgame =
	{
	keys: function (e)
		{
		var kc = e.keyCode
		if (kc === 13) // enter
			{
			Newgame.start ()
			}
		setTimeout(Newgame.dispurl, 200)
		},
	dispurl: function ()
		{
		$("#newgame-url").html(Newgame.urlgen($("#newgame-name").val()))
		},
	urlgen: function (s)
		{
		// return s.replace(/ /g,"-").replace(/--/g, "-").replace(/[^-A-Za-z0-9!]/g,"").replace(/^-*/,"").replace(/-*$/,"")
		return s.replace(/[^A-Za-z0-9]/g,"")
		},
	privateToggle: function ()
		{
		$("#newgame-password-container").toggle()
		},
	start: function ()
		{
		var params =
			{
			name: $("#newgame-name").val(),
			capacity: $('#newgame-capacity :selected').val(),
			goal: $('#newgame-goal :selected').val(),
			timer: $('#newgame-timer :selected').val(),
			private: $('#newgame-private:checked').val() !== undefined ? "1" : "0",
			password: $("#newgame-password").val(),
			session: Auth.session,
			}
		if (params.name.length < 1)
			{
			alert("You must specify a name for the room")
			return
			}
		$.post(API.URL.create, params, Newgame.success, "json")
		},
	success: function (data)
		{
		if (data && 'error' in data)
			{
			var errors =
				{
				"empty": "Please give a name for the room",
				// "dupe": "A game already exists with this name",
				"url": "Plz name the room something that can be a url (add letters, numbers)",
				"ip": "Someone is already logged in with this name",
				"illegal": choice(ILLEGAL_SNARK),
				}
			if (data.error in errors)
				alert (errors[data.error])
			else if (data.error === "dupe")
				{}
			else
				alert ("TRY AGAIN")
			return
			}
		var path = data.path
		document.location = BROWSER + path
		},
	unload: function ()
		{
		$("#newgame-curtain, #newgame").fadeOut(500)
		},
	load: function ()
		{
		// $("#newgame-curtain, #newgame").fadeIn(500)
		// $("#newgame-name").focus()
		$.post(API.URL.newgame, {session: Auth.session}, Newgame.success, "json")
		},
	init: function ()
		{
		$("#newgame-curtain").bind("click", Newgame.unload)
		$("#newgame-open").bind("click", Newgame.load)
		$("#newgame-name").bind("keydown", Newgame.keys)
		$("#newgame-go").bind("click", Newgame.start)
		$("#newgame-private").bind("click", Newgame.privateToggle)
		},
	}
var Slideshow =
	{
	height: 250,
	width: 250,
	index: 0,
	timer: false,
	combos:
		[
      ["moebius-arzach-sketch.jpg", "cambodia004_905.jpg"],
      ["walline.jpg", "tumblr_l6npn9HUay1qd4bjmo1_500.jpg"],
      ["city.png", "cambodia005.jpg"],
      ["libris14.jpg", "tumblr_l6rzmnBUMg1qd4bjmo1_500.jpg"],
      ["meatman.png", "cobain.jpg"],
      ["mygod.png", "tumblr_lkniayM5yk1qd4bjmo1_500.jpg"]
		],
	preload: function ()
		{
		var lookup = {'player': [], 'main': []}
		if (Slideshow.combos.length > 1) {
			Preload.enqueue("player", [Slideshow.combos[0][0]]);
			Preload.enqueue("main", [Slideshow.combos[0][1]]);
			Preload.enqueue("player", [Slideshow.combos[1][0]]);
			Preload.enqueue("main", [Slideshow.combos[1][1]]);
		}
		for (var i = 2; i < Slideshow.combos.length; i++)
			{
			lookup['player'].push(Slideshow.combos[i][0])
			lookup['main'].push(Slideshow.combos[i][1])
			}
		Preload.enqueue ("player", lookup['player'])
		Preload.enqueue ("main", lookup['main'])
		},
	lastimage: "",
	load: function ()
		{
		// $("#combo").fadeOut(500, function ()
		$("#combo-wrapper").animate({"left": $(window).width() * 2}, 2000, function ()
			{
			s = "<img src='/img/player/"+Slideshow.combos[Slideshow.index][0]+"' style='margin-right: 10px'/>"
			s += "<img src='/img/main/"+Slideshow.combos[Slideshow.index][1]+"'/>"
			Slideshow.index = Math.floor(Math.random()* Slideshow.combos.length)
			// ( Slideshow.index - 1 + Slideshow.combos.length ) % Slideshow.combos.length
			$("#combo").html(s)
			$("#combo-wrapper").css({ "left": -2 * $("#combo-wrapper").width() })
			setTimeout(Slideshow.draw, 10)
			})
		},
	draw: function ()
		{
		// var margin = $("#combo").width() * -1 / 2
		// if (margin === -5)
		// 	return setTimeout(Slideshow.draw, 1000)
		// $("#combo").fadeIn(500, function()
		// $("#combo-wrapper").css({"margin-left": margin})
		// $("#combo-wrapper").animate({"opacity": 1, "margin-left": margin }, function ()
		// var offset = ($(window).width() - $("#combo-wrapper").width()) / 2
		var offset = 30;
		$("#combo-wrapper").animate({"left": offset }, 2000, function ()
			{
			// setTimeout (Slideshow.center, 200)
			Slideshow.timer = setTimeout (Slideshow.load, 5000)
			})
		},
	center: function ()
		{
		var margin = $("#combo").width() * -1 / 2
		$("#combo-wrapper").animate({"margin-left": margin}, 200)
		},
	stop: function ()
		{
		clearTimeout(Slideshow.timer)
		},
	init: function (combos)
		{
		if (combos.length)
			{
			Slideshow.combos = combos
			Slideshow.index = combos.length - 1
			}
		$("#combo-wrapper").css({"opacity": 1})
		setTimeout (Slideshow.preload, 2000)
		},
	}
var Lobby =
	{
	games: {},
	unload: function ()
		{
		$("#lobby").hide()
		// wtf
		// $("#lobby").fadeOut(500)
		// $("#lobby").animate({"opacity": 0}, function(){$("#lobby").hide()})
		Slideshow.stop()
		Auth.load ()
		},
	load: function ()
		{
		$("#login").fadeOut(100)
		$("#loading").fadeIn(100)
		var params =
			{
			session: Auth.session,
			}
		$.post(API.URL.list, params, Lobby.loadCallback, "json")
		},
	loadCallback: function (data)
		{
		if (data.error)
			{
			return Auth.logout ()
			}
		Auth.username = data['username']
		$("#score").html(data['score'])
		$("#profile-username").html(Auth.username)
		Lobby.games = data['games']
		var first_key = Lobby.gamesBox ()
		if (first_key)
			Lobby.manifestUpdatePath (first_key)
		// Lobby.room_to_autojoin = first_key
		$("#joingame-open").click(Lobby.autojoin)
		Slideshow.init(data['combos'])
		Slideshow.load ()
		Active.poll()
		$("#chat-message").bind("keydown", Chat.keys)
		$("#loading").fadeOut(200)
		$("#lobby").fadeIn(500)
		$("#profile").click(Lobby.redirect_to_profile)
		// Lobby.reloadDelay()
		},
	room_to_autojoin: "bigapple",
	autojoin: function ()
		{
		clearTimeout (Game.timeout)
                $("#loading").show()
                $("#lobby").fadeOut(200)
		$.post( API.URL.active, { "session": Auth.session }, Lobby.autojoinCallback, "json" )
		},
	autojoinCallback: function (data)
		{
		document.location = BROWSER + data['path']
		},
	redirect_to_profile: function ()
		{
		document.location = BROWSER + "profile/" + Auth.username
		},
	reload: function ()
		{
		var params =
			{
			session: Auth.session,
			}
		$.post(API.URL.list, params, Lobby.reloadCallback, "json")
		},
	reloadCallback: function (data)
		{
		if ("error" in data)
			return Lobby.reloadDelay ()
		if (console)
			console.log("RELOADING")
		Lobby.games = data['games']
		Lobby.gamesBox ()
		Slideshow.combos = data['combos']
		Slideshow.preload()
		setTimeout (Lobby.reload, 30000)
		},
	reloadDelay: function ()
		{
		setTimeout (Lobby.reload, 30000)
		},
	gamesBox: function ()
		{
		var keys = []
		var game_list = []
		var first_key = "bigapple"
		var first_score = 0
		for (key in Lobby.games)
			keys.push(key)
		// Lobby.games["bigapple"].name = "Main Room"
		keys = keys.sort ()
		game_list.push (Lobby.gameRow(Lobby.games["bigapple"]))
		for (var i = 0; i < keys.length; i++)
			{
			var game = Lobby.games[keys[i]]
			if (game.players.length < 1)
				continue
			if (game.private)
				continue
			if (keys[i] === "lobbychat")
				continue
			if (first_key === "bigapple" || (game.players.length > first_score && game.players.length !== game.capacity))
				{
				first_key = keys[i]
				first_score = game.players.length
				}
			if (keys[i] === "bigapple")
				continue
			game_list.push (Lobby.gameRow(game))
			}
		if (game_list.length < 2 && AUTOJOIN)
			{
			if (!(first_key in Lobby.games) || Lobby.games[first_key].players.length < 4)
				document.location = BROWSER + first_key
			}
		$("#game-list").html(game_list.join(""))
		return first_key
		},
	gameRow: function (game)
		{
		if (typeof game === "undefined") return "";
		var div = "<li data-path='" + game.path + "'"
		if (game.players.length >= game.capacity)
			div += " class='full'"
		else if (game.private)
			div += " class='private'"
		div += ">"
		div += "<span class='name'>" + game.name + "</span>"
		if (game.players.length >= game.capacity)
			div += "<span class='size'>FULL</span>"
		else if (game.private === 1)
			div += "<span class='size'>PRIVATE</span>"
		else
			div += "<span class='size'>" + game.players.length + " / " + game.capacity + "</span>"
		div += "</li>"
		return div
		},
	manifestUpdate: function ()
		{
		var path = $(this).data("path")
		Lobby.manifestUpdatePath (path)
		},
	joinClick: function ()
		{
		var path = $(this).data("path")
		if (Lobby.games[path].private)
			return
		document.location = BROWSER + path
		},
	manifestUpdatePath: function (path)
		{
		var game = Lobby.games[path]
    if (!game) {
      return;
    }
		if (game.players.length >= game.capacity)
			{
			$("#game-manifest span.full").show()
			$("#game-manifest span.private").hide()
			}
		else if (game.private)
			{
			$("#game-manifest span.full").hide()
			$("#game-manifest span.private").show()
			}
		else
			{
			$("#game-manifest span.full").hide()
			$("#game-manifest span.private").hide()
			}
		$("#game-name").html(game.name)
		var occupants = []
		var scores = {}
		for (var i = 0; i < game.players.length; i++)
			{
			var li = "<li>"
			li += "<span class='name'>" + game.players[i].name + "</span>"
			li += "<span class='score'>" + game.players[i].score + "</span>"
			li += "</li>"
			if (! (game.players[i].score in scores))
				scores[game.players[i].score] = []
			scores[game.players[i].score].push(li)
			}
		var sorted = keys(scores).sort().reverse()
		for (var i in sorted)
			occupants.push(scores[sorted[i]].join(""))
		$("#game-occupants").html(occupants.join(""))
		},
	init: function ()
		{
		$("#game-list li").live("mouseover", Lobby.manifestUpdate)
		$("#game-list li").live("click", Lobby.joinClick)
		Active.init()
		},
	}
var Main =
	{
	focus: function ()
		{
		$.fx.off = true
		$.fx.off = false
                // document.getElementById("chat-message").focus()
		},
	resize: function ()
		{
		var w = $(window).width ()
		var h = $(window).height ()
		var p = 10
		var fh = 20

		var gh = h - 100 - 250 - 40
		var nh = gh - 70

		var hh = 250

		var status_width = 280
		var cw = status_width + 5

		var ch = 310 // h - fh - hh - p

		var cbot = h - ch + 30 // hh + fh + p + 32 + 50

		$("#chat_active_container").css({"top": 20, "left": 340 })
		$("#chat_active_list").css({"top": 20, "left": 340 })
		$("#chat_container").css({ "bottom": cbot, "left": 0, "height": ch, "width": w+20*p, })
		$("#chat_bg").css({ "bottom": cbot-fh-7, "left": 0, "height": h - cbot + fh + 15, "width": cw+5, "opacity": 0.8 })
		$("#chat_shim").css({ "height": h - cbot / 2 })
		$("#chat").css({ "width": cw-15, })

		$("#form").css({ "top": ch-2-32, "left": 8, "width": cw-15, "height": fh, "padding-right": "+= 10", "padding-bottom": 15 })

		$("#games").css({ "height": h - 100 })
		$("#game-manifest").css({ "height": nh })
		// $("#combo-wrapper").css({ "top": gh + 70 })
		// $("#combo-wrapper").css({ "top": 70 })
		// $("#combo-wrapper").css({ "bottom": 30 })
		$("#combo-wrapper").css({ "bottom": 50 })
		scrollToBottom("#chat_container")
		},
	init: function ()
		{
		$(window).bind("resize", Main.resize)
		// $(window).bind("blur", Main.blur)
		$(window).bind("focus", Main.focus)
		$("#logout").bind("click", Auth.logout)
		Main.resize ()
		Lobby.init ()
		Newgame.init()
		Auth.loginCallback = Lobby.load
		Auth.logoutCallback = Lobby.unload
		if ( Auth.init () )
		 	Lobby.load ()
		else
		 	Auth.load ()
		},
	}
Main.init ()

