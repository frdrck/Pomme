var Placement =
	{
	centerMatchDiv: function ()
		{
		$("#match").css({ "left": (Game.width - 2* Game.chatWidth - $("#match").width()) / 2 + Game.chatWidth, })
		},
	setupVotesRedraw: function ()
		{
		if (! Game.votesVisible)
			$("#votes").show()
		var divwidth = $("#votes").width()
		$("#votes").css({ "margin-left": -1 * divwidth / 2 })
		$("#votes").children().each( function ()
			{
			var divheight = $(this).height()
			var offset = (Game.handHeight - divheight) / 2
			$(this).animate({ "opacity": 1, "top": offset })
			})
		if (! Game.votesVisible)
			$("#votes").hide()
		},
	}
var Game =
	{
	pollFreq: 1000,
	last: 0,
	name: window.location.pathname.split("/")[1],
	judge: "",
	judged: false,
	picked: false,
	timeout: false,
	current_match: "",
	height: 768,
	width: 1024,
	cardWidth: 270,
	cardHeight: 270,
	matchWidth: 270,
	matchHeight: 270,
	winWidth: 270,
	winHeight: 270,
	handHeight: 270,
	handTop: 600,
	voteWidth: 600,
	matchRight: 9,
	goal: 10,
	capacity: 10,
	bg: "",
	join: function ()
		{
		var params = { session: Auth.session, last: Game.last, game: Game.name }
		$.post(API.URL.join, params, Game.joinCallback, "json").error(Game.joinError)
		},
	joinCallback: function (data)
		{
		if (! data)
			return Game.joinError ()
		if ("error" in data)
			return Game.fatalError(data['error'])
		if (Auth.username === false)
			Auth.username = data['username']
		document.cookie = "session="+Auth.session+";path=/;domain=.pomme.us;max-age=1086400"
		Game.last = data['last']
		Game.goal = data['goal']
		Game.capacity = data['capacity']
		Game.bg = data['bg']
		Game.title = data['name']

		$("#title").html(Game.title)
		$("#loading").fadeOut(200)
		$("#game").fadeIn(500)
		// $("#beta").css({"left": $("h1").width() - $("#beta").width() + 15 })
		 $("#beta").css({"left": 55 })
		document.getElementById("chat-message").focus()
		Game.setupCards (data)
		Game.updateStatus (data)
		Game.updateScores (data)
		Chat.add (data['chat'])
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
	fatalError: function (error)
		{
		$("#game").hide ()
		var verbose_error = "An unspecified error has occured!"
		if (error === "notloggedin")
			return Auth.logout ()
		if (error === "capacity")
			verbose_error = "<p>Sorry, this room is full!</p><p>Pick another room from <a href='/'>the lobby</a></p>"
		if (error.indexOf ("game does not exist") !== -1)
			verbose_error = "<p>This room has not been created yet.</p><p>Please go to <a href='/'>the lobby</a> to set it up.</p>"
		$("body").css({"background-color": "#888"})
		$("#curtain").fadeOut(1000)
		$("#login").html(verbose_error).fadeIn(500)
		clearTimeout(Game.timeout)
		// Auth.logout ()
		},
	pollCallback: function (data)
		{
		if (! data)
			return Game.pollError ()
		if ("error" in data)
			return Game.fatalError(data['error'])
		Chat.add (data['chat'])
		Game.updateStatus (data)
		Game.updateScores (data)
		Game.last = data['last']
		Main.toggle ()
		self.timeout = setTimeout (Game.poll, 1000)
		if (data['bets'].length)
			Preload.enqueue("player", data['bets'])
		if (data['next_image'].length)
			Preload.enqueue("main", [data['next_image']])
		},
	setupCards: function (data)
		{
		Game.cards = data['cards']
		$("#win,#champion").hide()
		$("#hand").html("")
		for (var i = 0; i < Game.cards.length; i++)
			$("#hand").append( Game.handCard ("player", Game.cards[i]) )
		Game.setupMatch (data)
		},
	setupMatch: function (data)
		{
		if (data['image'] && data['image'] !== Game.current_match)
			{
			Game.current_match = data['image']
			Game.appendMatch ()
			}
		},
	appendMatch: function ()
		{
		var card = Game.matchCard("main", Game.current_match)
		$("#match").hide().html("")
		$("#match").append(card)
		},
	setupVotes: function (data)
		{
		$("#votes").html("")
		Game.voteWidth = (Game.width - 10*(data['bets'].length + 6)) / (data['bets'].length)
		if (data.state !== STATE_VOTE)
			shuffle(data['bets'])
		divs = []
		for (var i = 0; i < data['bets'].length; i++)
			{
			if (data.state === STATE_VOTE && data['bets']['i'] === Game.pickedImage)
				continue
			var card = Game.voteCard ("player", data['bets'][i])
			divs.push(card)
			}
		if (data.state !== STATE_VOTE)
			shuffle(divs)
		for (var i = 0; i < divs.length; i++)
			{
			$("#votes").append(divs[i])
			}
		setTimeout(Placement.setupVotesRedraw, 50)
		},
	last_players: {},
	started: false,
	updateScores: function (data)
		{
		var betters = {}
		if ("betters" in data)
			{
			for (var i = 0; i < data['betters'].length; i++)
				betters[data['betters'][i]] = true
			}
		var s = ""
		players = {}
		if (! data.players)
			return
		for (var i = 0; i < data.players.length; i++)
			{
			var player = data.players[i]
			if (Game.started && ! (player.name in Game.last_players))
				Sound.new_player.play()

			players[player.name] = true
			var cl = ""
			if (player.skipped)
				s += "<p class='idle'>"
			else if (player.name === Auth.username)
				s += "<p class='you'>"
			else
				s += "<p>"

			if (player.name === data['judge'])
				s += "<span class='state'>JUDGE</span>"
			else if (player.name in betters)
				s += "<span class='state'>&#10003;</span>"
			else if (player.name === data['winner'])
				s += "<span class='state winner'>WINNER</span>"
			else
				s += "<span class='state'>&nbsp;</span>"

			s += "<span class='username'>" + player.name + "</span>"
			if (player.score === 0)
				s += "<span class='score'>&nbsp;</span>"
			else
				s += "<span class='score'>" + player.score + "</span>"

			if (player.name === Auth.username)
				{
				if (player.skipped && ! player.rejoined)
					{
					s += "<span class='skipped'>skipped</span>"
					$("#rejoin").show()
					$("#pass").hide()
					}
				}
			else
				{
				if (player.skipped)
					{
					delete Game.skipVotes[player.name]
					s += "<span class='skipped'>skipped</span>"
					}
				else if (player.name in Game.skipVotes)
					{
					s += "<span class='skipvote'>waiting..</span>"
					}
				else
					{
					s += "<span class='skip' data-name='"+player.name+"'>skip?</span>"
					}
				if (Game.ignoreList[player.name])
					s += "<span class='ignore' data-name='"+player.name+"'>ignored!</span>"
				else
					s += "<span class='ignore' data-name='"+player.name+"'>ignore</span>"
				}
			s += "</p>"
			}
		$("#scores").html(s)
		Game.last_players = players
		Game.started = true
		},

	stateDelayMode:
		[
		1, // STATE_IDLE
		1, // STATE_SETUP
		1, // STATE_BET
		1, // STATE_PICKED
		1, // STATE_JUDGE
		1, // STATE_VOTE
		9, // STATE_WIN
		4, // STATE_GAMEOVER
		],
	stateDelay: 0,
	updateStatus: function (data)
		{
		if (Game.passing && data['idle'] === false)
			{
			Game.rejoinDisplay ()
			}
		if ((Game.state > STATE_SETUP && Game.state < STATE_WIN) && $("#match div img").length === 0)
			{
			Game.appendMatch ()
			}
		if ((data['state'] == STATE_BET || data['state'] == STATE_PICKED) && data['judge'] === Auth.username)
			{
			if (Countdown.interval === false)
				Countdown.start (data['countdown'])
			Game.updateInstructions([" ", "you are the judge"])
			}
		else if (data['state'] === STATE_PICKED)
			{
			var s = " "
			var p = " "
			var wait_count = data.players.length - data.betters.length - data.skipped.length -1

			if (wait_count < 1)
				{
				s = " "
				p = " "
				}
			else if (wait_count === 1)
				{
				var betters = {}
				var skipped = {}
				for (var i = 0; i < data['betters'].length; i++)
					betters[data['betters'][i]] = true
				for (var i = 0; i < data['skipped'].length; i++)
					skipped[data['skipped'][i]] = true
				for (i in data['players'])
					{
					var name = data['players'][i]['name']
					if (name in betters)
						continue
					if (name in skipped)
						continue
					if (name === data['judge'])
						continue
					s = "Waiting for " + name + "..."
					// s = " "
					p = "waiting for " + name
					break
					}
				}
			else if (data.betters.length === 0)
				{
				s = "Waiting for players to pick images..."
				p = " "
				}
			else
				{
				s += "Waiting for " + wait_count
				if (Auth.username !== data['judge'])
					s += " other"
				s += " players to make picks..."
				p = NUMBERS[wait_count] + " to go"
				}
			Game.updateInstructions([s, p])
			}
		if (data['state'] === STATE_WIN)
			Game.stateDelay = 0
		else
			Game.stateDelay -= 1
		if (Game.stateDelay > 0 || Game.state === data['state'])
			return
		Game.stateDelay = Game.stateDelayMode[data['state']]
		Game.state = data['state']

		if (data['round'] > 0)
			 $("#round").html("Round "+data['round'])
		else
			 $("#round").html("New Game")

		Game.current_judge = data['judge']
		Game.is_judge = Game.current_judge === Auth.username

		Game.setupMatch(data)

		var pair = ["",""]
		if (data['state'] in Game.states)
			pair = Game.states[data['state']](data)
		else
			pair = ["Waiting for next round...", "waiting"]
		if (data['idle'])
			{
			if (Game.passing)
				pair = ["Sitting out.  Click rejoin to play.", "sitting out"]
			else
				pair = ["You are idle. Click rejoin to play.", "you are idle"]
			}
		Game.updateInstructions(pair)
		},
	lastInstructions: "",
	lastBanner: "",
	updateInstructions: function (pair)
		{
		if (pair[0] && pair[0].length && pair[0] !== Game.lastInstructions)
			{
			Game.lastInstructions = pair[0]
			$("#instructions").html(pair[0])
			}
		if (pair[1] && pair[1].length && pair[1] !== Game.lastBanner)
			{
			Game.lastBanner = pair[1]
			$("#banner").html(pair[1])
			}
		},
	states: {},
	handVisible: false,
	votesVisible: false,
	showHand: function ()
		{
		$("#hand").show()
		$("#hand").children().each(function ()
			{
			var offset = (Game.handHeight - $(this).height()) / 2
			$(this).css({ "opacity": 1, "top": offset })
			})
		$("#hand").css({ "margin-left": -1 * $("#hand").width() / 2 })
		if (! Game.handVisible)
			{
			$("#hand").animate({'opacity': 1, 'top': Game.handTop })
			$("#votes").animate({'opacity': 0.2, 'top': Game.height })
			}
		setTimeout('$("#votes").hide()', 500)
		if (! Game.is_judge)
			{
			$("#whose").html("your hand:").fadeIn(200)
			$("#orders").html("Pick your best match &darr;")
			$("#orders").fadeIn(500)
			}
		else
			{
			$("#orders").html("Waiting for the others to pick images...")
			$("#orders").fadeIn(500)
			}
		Game.handVisible = true
		Game.votesVisible = false
		},
	showVotes: function ()
		{
		$("#votes").show()
		$("#whose").html("judge's hand:").fadeIn(200)
		$("#votes").children().each(function ()
			{
			var offset = (Game.handHeight - $(this).height()) / 2
			$(this).css({ "opacity": 1, "top": offset })
			})
		if (! Game.votesVisible)
			{
			$("#votes").show().animate({'opacity': 1, 'top': Game.handTop })
			}
		setTimeout('$("#hand").hide()', 500)
		Game.handVisible = false
		Game.votesVisible = true
		if (Game.state === STATE_VOTE)
			{
			$("#orders").html("Judge took too long -- Vote for the best match!")
			$("#orders").fadeIn(500)
			}
		else if (Game.is_judge)
			{
			$("#orders").html("Pick the best match for the image above")
			$("#orders").fadeIn(500)
			}
		else
			{
			$("#orders").html("<b>" +Game.current_judge+ "</b> is judging...")
			$("#orders").fadeIn(500)
			}
		},
	hideCards: function ()
		{
		$("#orders,#whose").fadeOut(500)
		$("#hand").animate({'opacity': 0.2, 'top': Game.height })
		$("#votes").animate({'opacity': 0.2, 'top': Game.height })
		setTimeout('$("#hand,#votes").hide()', 500)
		Game.handVisible = false
		Game.votesVisible = false
		},
	setupStates: function ()
		{
		Game.states[STATE_IDLE] = function (data)
			{
			$("#win,#champion").hide()
			Main.title_msg = ""
			Countdown.stop ()
			Game.hideCards ()
			if (data['round'] > 0)
				return ["Nobody here -- Send the link to your friends!", " "]
			else
				return ["Nobody here -- Send the link to your friends!", " "]
			}
		Game.states[STATE_SETUP] = function (data)
			{
			$("#win,#champion").hide()
			Main.title_msg = "NEW GAME"
			return ["Starting the next round!", "new round"]
			}
		Game.states[STATE_BET] = function (data)
			{
			Sound.new_round.play ()
			Countdown.start (data['countdown'])
			$("#win,#champion").hide()
			if (data['judge'] === Auth.username)
				{
				Game.hideCards ()
				$("#hand").removeClass("live")
				Game.picked = true
				Main.title_msg = ""
				var waiters = data.players.length - data.betters.length - 1
				return ["Waiting for "+waiters+" players...", "you are the judge"]
				}
			else
				{
				Game.showHand ()
				$("#hand").addClass("live")
				Game.picked = false
				Main.title_msg = "YOUR TURN"
				return ["Pick the best match below!", " "]
				return [" ", " "]
				}
			}
		Game.states[STATE_PICKED] = function (data)
			{
			$("#win,#champion").hide()
			Game.hideCards ()
			Main.title_msg = ""
			return [" ", " "]
			}
		Game.states[STATE_JUDGE] = function (data)
			{
			Countdown.start (data['countdown'])
			$("#win,#champion").hide ()
			Game.showVotes ()
			Game.setupVotes (data)
			if (Game.is_judge)
				{
				$("#votes").addClass("live")
				Game.judged = false
				Main.title_msg = "TIME TO JUDGE"
				return ["Judge the best match!", " "]
				return [" ", " "]
				}
			else
				{
				Game.judged = true
				Main.title_msg = ""
				return ["Waiting for " + data['judge'] + " to judge...", " "]
				return [" ", " "]
				}
			}
		Game.states[STATE_VOTE] = function (data)
			{
			Countdown.start (data['countdown'])
			$("#win,#champion").hide ()
			Game.setupVotes (data)
			$(".mycard").hide()
			Game.showVotes ()
			Game.judged = false
			$("#votes").addClass("live")
			Main.title_msg = "VOTE!"
			$("#votes div").each(function ()
				{
				if ($(this).data("filename") === Game.pickedImage)
					$(this).fadeOut(500)
				})
			return ["The judge took too long -- vote!", " "]
			}
		Game.states[STATE_WIN] = function (data)
			{
			Countdown.stop ()
			$("#match").fadeOut(500, function(){$("#match").html ("")})
			Game.hideCards ()
			$("#votes").removeClass("live")
			var win = ""
			Game.winCount = 0
			var player_card = Game.winCard ("player", data['win_image'])
			player_card.style.paddingRight = "10px"
			var match_card = Game.winCard ("main", data['image'])
			$("#win").html("")
			$("#win").append (player_card)
			$("#win").append (match_card)
			if (data['winner'] === Auth.username)
				{
				Main.title_msg = "YOU WON"
				return [" ", "you won!"]
				return ["<b>You won!</b>", "you won!"]
				}
			else
				{
				Main.title_msg = data['winner'].toUpperCase() + " WON"
				return ["<b>"+data['winner']+"</b> is the winner!", data['winner']+" won!"]
				return [" ", data['winner']+ " won!"]
				}
			}
		Game.states[STATE_GAMEOVER] = function (data)
			{
			Countdown.stop ()
			$("#match").fadeOut(500, function(){$("#match").html ("")})
			Game.hideCards ()
			$("#votes").removeClass("live")
			var win = ""
			Game.winCount = 0
			var player_card = Game.winCard ("player", data['win_image'])
			player_card.style.paddingRight = "10px"
			var match_card = Game.winCard ("main", data['image'])
			$("#win").html("")
			$("#win").append (player_card)
			$("#win").append (match_card)
			Main.title_msg = ""
			var params =
				{
				"session": Auth.session,
				"game": Game.name,
				}
			$("#champion-name").html(data['winner'])
			$("#champion-goal").html(Game.goal)
			$("#champion-waiting").hide()
			$("#champion-restart").show()
			Sound.wongame.play()
			$("#champion").fadeIn(500)
			$("#champion-restart").bind("click", Game.restart)
			$.post(API.URL.deal, params, Game.dealCallback, "json")
			return ["",""]
			// return ["The judge has abandoned the game! Starting over...", "game reset"]
			}
		},
	restart: function ()
		{
		$("#champion-restart").hide()
		$("#champion-waiting").fadeIn(500)
		var params =
			{
			"session": Auth.session,
			"game": Game.name,
			}
		$.post(API.URL.restart, params)
		},
	dealCallback: function (data)
		{
		var cards = data.cards
		$("#hand").html("")
		for (var i = 0; i < cards.length; i++)
			$("#hand").append( Game.handCard ("player", cards[i]) )
		},
	pickedDiv: false,
	pickedImage: "",
	pickMouseover: function ()
		{
		if (! Game.picked)
			Sound.click.play ()
		},
	judgeMouseover: function ()
		{
		if (! Game.judged)
			Sound.click.play ()
		},
	pick: function ()
		{
		if (Game.is_judge)
			return
		if (Game.picked)
			return
		Sound.click.play ()
		Sound.ticking.stop ()
		var filename = $(this).data("file")
		Game.pickedDiv = this
		Game.pickedImage = filename
		setTimeout('$(Game.pickedDiv).parent().remove()', 2000)
		document.getElementById("chat-message").focus()
		Game.picked = true
		$("#hand").removeClass("live")
		Game.hideCards ()
		Game.rejoinDisplay ()

		var params =
			{
			"session": Auth.session,
			"game": Game.name,
			"card": filename,
			}
		$.post(API.URL.bet, params, Game.pickCallback, "json")
		for (var i = 0; i < Game.cards.length; i++)
			{
			if (Game.cards[i] === filename)
				{
				Game.cards.splice(i, 1)
				break
				}
			}
		},
	winCard: function (set, card)
		{
		var newimg = document.createElement("img")
		newimg.onload = Game.displayWinCard
		newimg.setAttribute("src", "/img/"+set+"/"+card)
		newimg.setAttribute("data-file", card)
		newimg.style.maxWidth = Game.winWidth + "px"
		newimg.style.maxHeight = Game.winHeight + "px"
		return newimg
		},
	winCount: 0,
	displayWinCard: function ()
		{
		if (Game.winCount < 2)
			{
			Game.winCount += 1
			}
		if (Game.winCount > 1)
			{
			$("#win").fadeIn (500)
			$("#win").css({"left": (Game.width - 2* Game.chatWidth - $("#win").width()) / 2 + Game.chatWidth - 10 })
			if (Game.state !== STATE_GAMEOVER)
				$("#win").delay(10000).fadeOut(500)
			Game.winCount = 0
			}
		},
	matchCard: function (set, card)
		{
		var newdiv = document.createElement("div")
		var newimg = document.createElement("img")
		newimg.onload = function ()
			{
			$(this).parent().animate({"opacity": 1})
			$("#match").fadeIn(500)
			Placement.centerMatchDiv ()
			setTimeout(Placement.centerMatchDiv, 10)
			}
		newimg.setAttribute("src", "/img/"+set+"/"+card)
		newimg.setAttribute("data-file", card)
		newimg.style.maxWidth = Game.matchWidth + "px"
		newimg.style.maxHeight = Game.matchHeight + "px"
		newdiv.appendChild(newimg)
		return newdiv
		},
	voteCardCount: 0,
	voteCard: function (set, card)
		{
		var newdiv = document.createElement("div")
		newdiv.style.opacity = 0.1
		newdiv.style.position = "relative"
		newdiv.style.top = Game.handHeight + "px"
		if (card === Game.pickedImage)
			newdiv.className === "mycard"
		newdiv.setAttribute("data-file", card)
		newdiv.setAttribute("data-set", set)
		newdiv.setAttribute("data-overlay", Game.voteCardCount)
		// Game.voteCardCount += 1
		// newdiv.onmouseover = Game.voteOver
		// newdiv.onmouseout = Game.voteOut

		var newimg = document.createElement("img")
		newimg.onload = function ()
			{
			if (! Game.votesVisible)
				$("#votes").show()
			var divheight = $(this).height()
			if (! Game.votesVisible)
				$("#votes").hide()
			var par = $(this).parent().parent()
			par.css({ "margin-left": -1 * par.width() / 2 })
			var offset = (Game.handHeight - divheight) / 2
			$(this).parent().animate({ "opacity": 1, "top": offset })
			}
		newimg.setAttribute("src", "/img/"+set+"/"+card)
		newimg.setAttribute("data-file", card)
		
		newimg.style.maxWidth = Game.voteWidth + "px"
		newimg.style.maxHeight = Game.cardHeight + "px"

		newdiv.appendChild(newimg)
		return newdiv
		},
	voteOut: function ()
		{
		var idx = $(this).data("overlay")
		$("#overlay-"+idx).remove()
		},
	voteOver: function ()
		{
		var idx = $(this).data("overlay")
		var card = $(this).data("file")
		var set = $(this).data("set")
		var divheight = $(this).height()
		var divwidth = $(this).width()
		var offset = $(this).offset()
		var ratio = Game.cardHeight / divheight - 1

		// console.log(["creating", idx,card,set].join(" "))
		// console.log(offset.left)
		// console.log(offset.left - (divwidth * ratio) / 2)

		var newdiv = document.createElement("div")
		newdiv.classname = "overlay"
		newdiv.setAttribute("id", "overlay-"+idx)
		newdiv.style.top = (offset.top - (divheight * ratio) / 2) + "px"
		newdiv.style.left = (offset.left - (divwidth * ratio) / 2) + "px"

		var newimg = document.createElement("img")
		newimg.setAttribute("src", "/img/"+set+"/"+card)
		newimg.style.maxWidth = Game.cardWidth + "px"
		newimg.style.maxHeight = Game.cardHeight + "px"

		$("body").append(newdiv)
		$(newdiv).show()
		},
	handCard: function (set, card)
		{
		var newdiv = document.createElement("div")
		newdiv.style.opacity = 0.1
		newdiv.style.position = "relative"
		newdiv.style.top = Game.handHeight + "px"

		var newimg = document.createElement("img")
		newimg.onload = function ()
			{
			if (! Game.handVisible)
				$("#hand").show()
			var divheight = $(this).height()
			if (! Game.handVisible)
				$("#hand").hide()
			var offset = (Game.handHeight - divheight) / 2
			$(this).parent().animate({ "opacity": 1, "top": offset })
			var par = $(this).parent().parent()
			par.css({ "margin-left": -1 * par.width() / 2 })
			}
		newimg.setAttribute("src", "/img/"+set+"/"+card)
		newimg.setAttribute("data-file", card)
		
		newimg.style.maxWidth = Game.cardWidth + "px"
		newimg.style.maxHeight = Game.cardHeight + "px"

		newdiv.appendChild(newimg)
		return newdiv
		},
	pickedNewCard: false,
	pickCallback: function (data)
		{
		if (data['card'])
			Game.cards.push(data['card'])
		Game.pickedNewCard = Game.handCard ("player", data['card'])
		var delay_card_load = function ()
			{
			if (! Game.handVisible)
				$("#hand").show()
			$("#hand").append(Game.pickedNewCard)
			var divheight = $($(Game.pickedNewCard).children("img")[0]).height()
			if (! Game.handVisible)
				$("#hand").hide()
			var offset = (Game.handHeight - divheight) / 2
			$(this).css({ "opacity": 1, "top": offset })
			$("#hand").css({ "margin-left": -1 * $("#hand").width() / 2 })
			}
		setTimeout(delay_card_load, 1000)
		},
	judge: function ()
		{
		if (Game.judged)
			return
		Sound.click.play ()
		Sound.ticking.stop ()
		if (Game.state === STATE_VOTE)
			{
			Game.hideCards ()
			var filename = $(this).data("file")
			var params =
				{
				"session": Auth.session,
				"game": Game.name,
				"card": filename,
				}
			$.post(API.URL.vote, params, Game.judgeCallback, "json")
			Game.judged = true
			document.getElementById("chat-message").focus()
			}
		else if (Game.is_judge)
			{
			$("#match").fadeOut(500)
			var filename = $(this).data("file")
			var params =
				{
				"session": Auth.session,
				"game": Game.name,
				"card": filename,
				}
			$.post(API.URL.judge, params, Game.judgeCallback, "json")
			Game.judged = true
			document.getElementById("chat-message").focus()
			Game.hideCards ()
			}
		},
	judgeCallback: function (data)
		{
		},
	skipVotes: {},
	skip: function ()
		{
		var skip = $(this).data("name")
		Game.skipVotes[skip] = true
		$.post(API.URL.skip, {"session": Auth.session, "game": Game.name, "skip": skip })
		},
	ignoreList: {},
	ignore: function ()
		{
		var name = $(this).data("name")
		if (name in Game.ignoreList)
			delete Game.ignoreList[name]
		else
			Game.ignoreList[name] = true
		},
	passing: false,
	pass: function ()
		{
		Game.passing = true
		$("#rejoin").show()
		$("#pass").hide()
		$.post(API.URL.pass, {"session": Auth.session, "game": Game.name,})
		},
	rejoined: false,
	rejoin: function ()
		{
		Game.rejoined = true
		Game.rejoinDisplay ()
		$.post(API.URL.rejoin, {"session": Auth.session, "game": Game.name,})
		},
	rejoinDisplay: function ()
		{
		Game.passing = false
		$("#rejoin").hide()
		$("#pass").show()
		},
	load: function ()
		{
		$("#loading").fadeIn(100)
		Game.join ()
		},
	unload: function ()
		{
		clearTimeout (Game.timeout)
		$("#game").fadeOut(500, Auth.load)
		},
	init: function ()
		{
		$("#chat-message").bind("keydown", Chat.keys)
		$("#hand img").live("click", Game.pick)
		$("#votes img").live("click", Game.judge)
		$("#hand img").live("mouseover", Game.pickMouseover)
		$("#votes img").live("mouseover", Game.judgeMouseover)
		$("#rejoin").bind("click", Game.rejoin)
		$("#pass").bind("click", Game.pass)
		$(".skip").live("click", Game.skip)
		$(".ignore").live("click", Game.ignore)
		Game.ignoreList[name] = true
		$("#logout").bind("click", Auth.logout)
		$("#rejoin").hide()
		$("#pass").show()
		Game.setupStates ()
		},
	}
var Main =
	{
	blurred: false,
	title_msg: "",
	title_toggle: false,
	focus: function ()
		{
		Main.focused = true
		// Main.resize()
		document.getElementById("chat-message").focus()
		/*
		if (console)
			{
			console.log("_____________________")
			console.log($("#match"))
			console.log($("#match div"))
			console.log($("#match div img").length === 0)
			console.log(Game.state)
			}
		*/
		if (Game.state > STATE_VOTE)
			$("#win").show()
		else
			$("#win").hide()
		if (Game.state === STATE_BET)
			{
			if (! Game.is_judge)
				Game.showHand ()
			}
		else if (Game.state === STATE_JUDGE)
			Game.showVotes ()
		},
	blur: function ()
		{
		Main.focused = false
		},
	toggle: function ()
		{
		Main.title_toggle = ! Main.title_toggle
		if (! Game.passing && ! Main.focused && Main.title_toggle && Main.title_msg)
			document.title = Main.title_msg
		else
			document.title = "Pomme"
		},
	resize: function ()
		{
		var w = $(window).width ()
		var h = $(window).height ()

		var p = 10

		var status_width = Math.max(360, w * 1/4)

		Game.cardHeight = (h / 3)
		// Game.cardWidth = (((w-status_width) - 8 * p) / 5)
		Game.cardWidth = ((w - 8 * p) / 5)

		var hw = (Game.cardWidth+p) * 5
		var hh = Game.cardHeight + 3*p
		var fh = 20

		// var cw = w * 2/5 - p
		var cw = status_width + 5
		var ch = h - fh - hh - p

		var ml = w * 2/5
		var vw = w * 3/5
		var vh = h - hh

		var bh = 38

		Game.height = h
		Game.width = w

		Game.chatWidth = cw

		Game.handHeight = Game.cardHeight
		Game.handTop = ch+fh+2*p
		Game.voteWidth = 270
		Game.matchRight = 4

		Game.matchHeight = ch - 6*p - bh - 20
		Game.matchWidth = w - cw*2 - 6*p

		Game.winHeight = Game.matchHeight
		Game.winWidth = Game.matchWidth / 2

		var mh = Game.matchHeight

		var sh = h - hh - mh
		var cbot = hh + fh + p + 32

		var mbox = w - cw - 3*p

		Chat.height = h - cbot

		$("#chat_container").css({ "bottom": cbot, "left": 0, "height": h - cbot + 35, "width": w+20*p, })
		$("#chat_bg").css({ "bottom": cbot-fh-7, "left": 0, "height": h - cbot + fh + 15, "width": cw+5, })
		$("#chat_shim").css({ "height": h - cbot / 2 })
		$("#chat").css({ "width": cw-15, })

		$("#form").css({ "top": ch-2-32, "left": 8, "width": cw-15, "height": fh, "padding-right": "+= 10", "padding-bottom": 15 })
		$("#orders").css({ "top": ch+2, })

		$("#hand, #votes").css({ "top": h, "left": "50%", "height": hh, })
		$("#banner").css({ "top": ch+fh+2*p+50, "left": 0, width: "100%" })
		$("#whose").css({ "top": h - Game.handHeight - 2*p - 32 - 5, "left": p, })

		$("#champion").css({ "top": h - Game.handHeight, "left": "50%", "width": 600, "margin-left": -310, })
		// $("#votes").css({ "top": -1 * vh, "left": cw+2*p, "padding-top": vh+2*p, "padding-bottom": vh, "width": w, "height": vh })
		$("#win").css({ "bottom": hh+fh+20, })

		$("#match").css({ "bottom": hh+fh+20, })
		$("#status").css({ "top": 70, "right": p, "width": status_width-2*p, })
		$("#buttons").css({ "top": p, "right": 0, })
		scrollToBottom("#chat_container")
		if (Game.state === STATE_BET)
			{
			if (! Game.is_judge)
				{
				Game.handVisible = false
				Game.showHand ()
				}
			}
		else if (Game.state === STATE_JUDGE)
			Game.showVotes ()
		},
	init: function ()
		{
		$(window).bind("resize", Main.resize)
		$(window).bind("blur", Main.blur)
		$(window).bind("focus", Main.focus)
		Main.resize ()
		Auth.loginCallback = Game.load
		Auth.logoutCallback = Game.unload
		Game.init ()
		if ( Auth.init () )
			Game.load ()
		else
			Auth.load ()
		},
	}
Main.init ()

