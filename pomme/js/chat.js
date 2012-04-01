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

