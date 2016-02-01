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

