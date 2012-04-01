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
		document.cookie = "session="+Auth.session+";path=/;domain=.pomme.us;max-age=1086400"
		document.getElementById("chat-message").focus()
		Game.last = data['last']
		Chat.add (data['chat'])
		Active.update(data)
		self.timeout = setTimeout (Game.poll, 1000)
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
		Active.update(data)
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
		document.location = "http://pomme.us/" + path
		},
	unload: function ()
		{
		$("#newgame-curtain, #newgame").fadeOut(500)
		},
	load: function ()
		{
		$("#newgame-curtain, #newgame").fadeIn(500)
		$("#newgame-name").focus()
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
		["1279213983813-dumpfm-noisia-slimer-at-the-door.gif", "1279235222382-dumpfm-neue-slimer_walk.gif",],
		[ "chairsta.gif", "gun-guy.gif", ],
		],
	preload: function ()
		{
		var lookup = {'player': [], 'main': []}
		for (var i = 0; i < Slideshow.combos.length; i++)
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
		$("#combo-wrapper").animate({"opacity": 0}, function ()
			{
			s = "<img src='/img/player/"+Slideshow.combos[Slideshow.index][0]+"' style='margin-right: 10px'/>"
			s += "<img src='/img/main/"+Slideshow.combos[Slideshow.index][1]+"'/>"
			Slideshow.index = Math.floor(Math.random()* Slideshow.combos.length)
			// ( Slideshow.index - 1 + Slideshow.combos.length ) % Slideshow.combos.length
			$("#combo").html(s)
			setTimeout(Slideshow.draw, 10)
			})
		},
	draw: function ()
		{
		var margin = $("#combo").width() * -1 / 2
		if (margin === -5)
			return setTimeout(Slideshow.draw, 1000)
		// $("#combo").fadeIn(500, function()
		$("#combo-wrapper").css({"margin-left": margin})
		$("#combo-wrapper").animate({"opacity": 1, "margin-left": margin }, function ()
			{
			setTimeout (Slideshow.center, 200)
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
		$("#combo-wrapper").css({"opacity": 0})
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
		Lobby.games = data['games']
		var first_key = Lobby.gamesBox ()
		if (first_key)
			Lobby.manifestUpdatePath (first_key)
		Slideshow.init(data['combos'])
		Slideshow.load ()
		Game.join ()
		$("#chat-message").bind("keydown", Chat.keys)
		$("#loading").fadeOut(200)
		$("#lobby").fadeIn(500)
		Lobby.reloadDelay()
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
		var first_key = false
		var first_score = 0
		for (key in Lobby.games)
			keys.push(key)
		// Lobby.games["pomme"].name = "Main Room"
		keys = keys.sort ()
		// game_list.push (Lobby.gameRow(Lobby.games["pomme"]))
		for (var i = 0; i < keys.length; i++)
			{
			var game = Lobby.games[keys[i]]
			if (game.players.length < 1)
				continue
			if (game.private)
				continue
			if (keys[i] === "lobby")
				continue
			if (first_key === false || (game.players.length > first_score && game.players.length !== game.capacity))
				{
				first_key = keys[i]
				first_score = game.players.length
				}
			// if (keys[i] === "pomme")
			// 	continue
			game_list.push (Lobby.gameRow(game))
			}
		$("#game-list").html(game_list.join(""))
		return first_key
		},
	gameRow: function (game)
		{
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
		document.location = "http://pomme.us/" + path
		},
	manifestUpdatePath: function (path)
		{
		var game = Lobby.games[path]
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
                document.getElementById("chat-message").focus()
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

		$("#chat_active_container").css({"right": w - cw + 5})
		$("#chat_active_list").css({"left": cw})
		$("#chat_container").css({ "bottom": cbot, "left": 0, "height": ch, "width": w+20*p, })
		$("#chat_bg").css({ "bottom": cbot-fh-7, "left": 0, "height": h - cbot + fh + 15, "width": cw+5, "opacity": 0.8 })
		$("#chat_shim").css({ "height": h - cbot / 2 })
		$("#chat").css({ "width": cw-15, })

		$("#form").css({ "top": ch-2-32, "left": 8, "width": cw-15, "height": fh, "padding-right": "+= 10", "padding-bottom": 15 })

		$("#games").css({ "height": gh })
		$("#game-manifest").css({ "height": nh })
		$("#combo-wrapper").css({ "top": gh + 70 })
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

