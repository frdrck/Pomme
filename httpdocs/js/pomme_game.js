/*!
 * jQuery Wiggle
 * http://www.userdot.net/#!/jquery
 *
 * Copyright 2011, UserDot www.userdot.net
 * Licensed under the GPL Version 3 license.
 * Version 1.0.0
 *
 */
(function($) {
    $.fn.wiggle = function(method, options) {
        options = $.extend({
            degrees: ['2','4','2','0','-2','-4','-2','0'],
            delay: 35,
            limit: null,
            randomStart: true,
            onWiggle: function(o) {},
            onWiggleStart: function(o) {},
            onWiggleStop: function(o) {}
        }, options);
        var methods = {
            wiggle: function(o, step){
                if (step === undefined) {
                    step = options.randomStart ? Math.floor(Math.random() * options.degrees.length) : 0;
                }
                if (!$(o).hasClass('wiggling')) {
                    $(o).addClass('wiggling');
                }
                var degree = options.degrees[step];
                $(o).css({
                    '-webkit-transform': 'rotate(' + degree + 'deg)',
                    '-moz-transform': 'rotate(' + degree + 'deg)',
                    '-o-transform': 'rotate(' + degree + 'deg)',
                    '-sand-transform': 'rotate(' + degree + 'deg)',
                    'transform': 'rotate(' + degree + 'deg)'
                });
                if (step == (options.degrees.length - 1)) {
                    step = 0;
                    if ($(o).data('wiggles') === undefined) {
                        $(o).data('wiggles', 1);
                    }
                    else {
                        $(o).data('wiggles', $(o).data('wiggles') + 1);
                    }
                    options.onWiggle(o);
                }
                if (options.limit && $(o).data('wiggles') == options.limit) {
                    return methods.stop(o);
                }
                o.timeout = setTimeout(function() {
                    methods.wiggle(o, step + 1);
                }, options.delay);
            },
            stop: function(o) {
                $(o).data('wiggles', 0);
                $(o).css({
                    '-webkit-transform': 'rotate(0deg)',
                    '-moz-transform': 'rotate(0deg)',
                    '-o-transform': 'rotate(0deg)',
                    '-sand-transform': 'rotate(0deg)',
                    'transform': 'rotate(0deg)'
                });
                if ($(o).hasClass('wiggling')) {
                    $(o).removeClass('wiggling');
                }
                clearTimeout(o.timeout);
                o.timeout = null;
                options.onWiggleStop(o);
            },
            isWiggling: function(o) {
                return !o.timeout ? false : true;
            }
        };
        if (method == 'isWiggling' && this.length == 1) {
            return methods.isWiggling(this[0]);
        }
        this.each(function() {
            if ((method == 'start' || method === undefined) && !this.timeout) {
                methods.wiggle(this);
                options.onWiggleStart(this);
            }
            else if (method == 'stop') {
                methods.stop(this);
            }
        });
        return this;
    }
})(jQuery);

/* JPEGCam v1.0.9 */
/* Webcam library for capturing JPEG images and submitting to a server */
/* Copyright (c) 2008 - 2009 Joseph Huckaby <jhuckaby@goldcartridge.com> */
/* Licensed under the GNU Lesser Public License */
/* http://www.gnu.org/licenses/lgpl.html */

/* Usage:
	<script language="JavaScript">
		document.write( webcam.get_html(320, 240) );
		webcam.set_api_url( 'test.php' );
		webcam.set_hook( 'onComplete', 'my_callback_function' );
		function my_callback_function(response) {
			alert("Success! PHP returned: " + response);
		}
	</script>
	<a href="javascript:void(webcam.snap())">Take Snapshot</a>
*/

// Everything is under a 'webcam' Namespace
window.webcam = {
	version: '1.0.9',
	
	// globals
	ie: !!navigator.userAgent.match(/MSIE/),
	protocol: location.protocol.match(/https/i) ? 'https' : 'http',
	callback: null, // user callback for completed uploads
	swf_url: 'webcam.swf', // URI to webcam.swf movie (defaults to cwd)
	shutter_url: 'shutter.mp3', // URI to shutter.mp3 sound
	api_url: '', // URL to upload script
	loaded: false, // true when webcam movie finishes loading
	quality: 90, // JPEG quality (1 - 100)
	shutter_sound: true, // shutter sound effect on/off
	stealth: false, // stealth mode (do not freeze image upon capture)
	hooks: {
		onLoad: null,
		onComplete: null,
		onError: null
	}, // callback hook functions
	
	set_hook: function(name, callback) {
		// set callback hook
		// supported hooks: onLoad, onComplete, onError
		if (typeof(this.hooks[name]) == 'undefined')
			return alert("Hook type not supported: " + name);
		
		this.hooks[name] = callback;
	},
	
	fire_hook: function(name, value) {
		// fire hook callback, passing optional value to it
		if (this.hooks[name]) {
			if (typeof(this.hooks[name]) == 'function') {
				// callback is function reference, call directly
				this.hooks[name](value);
			}
			else if (typeof(this.hooks[name]) == 'array') {
				// callback is PHP-style object instance method
				this.hooks[name][0][this.hooks[name][1]](value);
			}
			else if (window[this.hooks[name]]) {
				// callback is global function name
				window[ this.hooks[name] ](value);
			}
			return true;
		}
		return false; // no hook defined
	},
	
	set_api_url: function(url) {
		// set location of upload API script
		this.api_url = url;
	},
	
	set_swf_url: function(url) {
		// set location of SWF movie (defaults to webcam.swf in cwd)
		this.swf_url = url;
	},
	
	get_html: function(width, height, server_width, server_height) {
		// Return HTML for embedding webcam capture movie
		// Specify pixel width and height (640x480, 320x240, etc.)
		// Server width and height are optional, and default to movie width/height
		if (!server_width) server_width = width;
		if (!server_height) server_height = height;
		
		var html = '';
		var flashvars = 'shutter_enabled=' + (this.shutter_sound ? 1 : 0) + 
			'&shutter_url=' + escape(this.shutter_url) + 
			'&width=' + width + 
			'&height=' + height + 
			'&server_width=' + server_width + 
			'&server_height=' + server_height;
		
		if (this.ie) {
			html += '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="'+this.protocol+'://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="'+width+'" height="'+height+'" id="webcam_movie" align="middle"><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="false" /><param name="movie" value="'+this.swf_url+'" /><param name="loop" value="false" /><param name="menu" value="false" /><param name="quality" value="best" /><param name="bgcolor" value="#ffffff" /><param name="flashvars" value="'+flashvars+'"/></object>';
		}
		else {
			html += '<embed id="webcam_movie" src="'+this.swf_url+'" loop="false" menu="false" quality="best" bgcolor="#ffffff" width="'+width+'" height="'+height+'" name="webcam_movie" align="middle" allowScriptAccess="always" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="'+flashvars+'" />';
		}
		
		this.loaded = false;
		return html;
	},
	
	get_movie: function() {
		// get reference to movie object/embed in DOM
		if (!this.loaded) return alert("ERROR: Movie is not loaded yet");
		var movie = document.getElementById('webcam_movie');
		if (!movie) alert("ERROR: Cannot locate movie 'webcam_movie' in DOM");
		return movie;
	},
	
	set_stealth: function(stealth) {
		// set or disable stealth mode
		this.stealth = stealth;
	},
	
	snap: function(url, callback, stealth) {
		// take snapshot and send to server
		// specify fully-qualified URL to server API script
		// and callback function (string or function object)
		if (callback) this.set_hook('onComplete', callback);
		if (url) this.set_api_url(url);
		if (typeof(stealth) != 'undefined') this.set_stealth( stealth );
		
		this.get_movie()._snap( this.api_url, this.quality, this.shutter_sound ? 1 : 0, this.stealth ? 1 : 0 );
	},
	
	freeze: function() {
		// freeze webcam image (capture but do not upload)
		this.get_movie()._snap('', this.quality, this.shutter_sound ? 1 : 0, 0 );
	},
	
	upload: function(url, callback) {
		// upload image to server after taking snapshot
		// specify fully-qualified URL to server API script
		// and callback function (string or function object)
		if (callback) this.set_hook('onComplete', callback);
		if (url) this.set_api_url(url);
		
		this.get_movie()._upload( this.api_url );
	},
	
	reset: function() {
		// reset movie after taking snapshot
		this.get_movie()._reset();
	},
	
	configure: function(panel) {
		// open flash configuration panel -- specify tab name:
		// "camera", "privacy", "default", "localStorage", "microphone", "settingsManager"
		if (!panel) panel = "camera";
		this.get_movie()._configure(panel);
	},
	
	set_quality: function(new_quality) {
		// set the JPEG quality (1 - 100)
		// default is 90
		this.quality = new_quality;
	},
	
	set_shutter_sound: function(enabled, url) {
		// enable or disable the shutter sound effect
		// defaults to enabled
		this.shutter_sound = enabled;
		this.shutter_url = url ? url : 'shutter.mp3';
	},
	
	flash_notify: function(type, msg) {
		// receive notification from flash about event
		switch (type) {
			case 'flashLoadComplete':
				// movie loaded successfully
				this.loaded = true;
				this.fire_hook('onLoad');
				break;

			case 'error':
				// HTTP POST error most likely
				if (!this.fire_hook('onError', msg)) {
					alert("JPEGCam Flash Error: " + msg);
				}
				break;

			case 'success':
				// upload complete, execute user callback function
				// and pass raw API script results to function
				this.fire_hook('onComplete', msg.toString());
				break;

			default:
				// catch-all, just in case
				alert("jpegcam flash_notify: " + type + ": " + msg);
				break;
		}
	}
};

var MIN_CAM_SCORE = 100
var Webcam =
	{
	width: 320,
	height: 240,
	quality: 90,
	loaded: false,
	step: 3,
	countdown: function ()
		{
		/*
		if (Webcam.step > 0)
			{
			$("#webcam-error").show().html(Webcam.step + " ...")
			Webcam.step -= 1
			setTimeout(Webcam.countdown, 900)
			}
		else
			{
		*/
			$("#webcam-error").show().html("SAY CHEESE!")
			webcam.snap ()
			setTimeout(Webcam.unload, 900)
		//	}
		},
	go: function ()
		{
		$("#webcam-go").hide()
		Game.webcams -= 1;
		Webcam.step = 3;
		Webcam.countdown()
		},
	receive: function (url)
		{
		filename = url.replace(SERVER + "img/webcam/", "")
		Game.camCard(filename)
		},
	reset: function () 
		{
		Game.webcams = 3
		},
	load: function ()
		{
		$("#webcam-curtain,#webcam-container").fadeIn(300)
		if (Game.webcams < 1)
			{
			$("#webcam-embed").hide()
			$("#webcam-go").hide()
			$("#webcam-error").html("You can only webcam 3 times per game.").show()
			}
		else if (Game.is_judge)
			{
			$("#webcam-embed").hide()
			$("#webcam-go").hide()
			$("#webcam-error").html("You can't cam if you're the judge").show()
			}
		else if (Game.score < MIN_CAM_SCORE)
			{
			$("#webcam-embed").hide()
			$("#webcam-go").hide()
			$("#webcam-error").html("You need " + MIN_CAM_SCORE + " points to use the webcam.").show()
			}
		else
			{
			if (Game.webcams === 1)
				$("#webcam-error").html("1 cam left").show()
			else
				$("#webcam-error").html(Game.webcams + " cams left").show()
			$("#webcam-go").show()
			$("#webcam-embed").show().html( webcam.get_html(Webcam.width, Webcam.height) )
			}
		},
	unload: function ()
		{
		$("#webcam-embed").html("")
		$("#webcam-curtain,#webcam-container").fadeOut(200)
		},
	init: function ()
		{
		$("#webcam-go").bind("click", Webcam.go)
		webcam.set_api_url( '/cgi-bin/webcam.cgi?username=' + Auth.username )
		webcam.set_swf_url( '/swf/webcam.swf' )
		webcam.set_quality( Webcam.quality )
		webcam.set_shutter_sound( false )
		webcam.set_hook( 'onComplete', Webcam.receive )
		webcam.set_stealth( true )
		Webcam.loaded = true
		$("#webcam-close,#webcam-curtain").bind("click", Webcam.unload)
		}
	}

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
		document.cookie = "session="+Auth.session+";path=/;domain=." + SERVER + ";max-age=1086400"
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
		document.cookie = "session=false;path=/;domain=." + SERVER + ";max-age=0"
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

var Share = {
	"msg": "play Pomme with me",
	"loaded": false,
	"already": false,
	"openLink": function (url) {
		window.open(url, "_blank");
	},
	"facebook": function () {
		var url = "http://www.facebook.com/share.php?u=" + encodeURIComponent(document.location.href) + "&t=" + Share.msg;
		Share.openLink(url);
	},
	"twitter": function () {
		var url = "http://twitter.com/home?status=" + encodeURIComponent(Share.msg + " " + document.location.href);
		Share.openLink(url);
	},
	"test": function (count) {
		if (count < 2) {
			if (! Share.loaded && ! Share.already)
				Share.load()
		} else if (Share.loaded) {
			Share.unload()
		}
	},
	"unload": function () {
		Share.loaded = false;
		Share.already = true;
		$("#attract-curtain,#attract-container").fadeOut(200);
	},
	"load": function () {
		Share.loaded = true;
		Share.already = true;
		$("#attract-curtain,#attract-container").fadeIn(200);
	},
	"init": function () {
		$("#facebook-share").click(Share.facebook);
		$("#twitter-share").click(Share.twitter);
		$("#attract-curtain,#attract-close").click(Share.unload);
		$("#link-share").val(document.location.href);
		$("#link-share").click(function(){ $(this).select() });
	}
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

var Countdown =
	{
	time: 0,
	interval: false,
	ticking: false,
	start: function (time)
		{
		$("#countdown").removeClass("close")
		Countdown.stop()
		Countdown.ticking = false
		Countdown.time = parseInt(time)
		Countdown.interval = setInterval(Countdown.advance, 1000)
		},
	stop: function ()
		{
		clearInterval(Countdown.interval)
		Countdown.interval = false
		},
	advance: function ()
		{
		if (Countdown.time > 9)
			{
			$("#countdown").html("0:"+Countdown.time)
			Countdown.time -= 1
			}
		else if (Countdown.time > 5)
			{
			if (! Countdown.ticking)
				{
				if ((! Game.picked && ! Game.is_judge && Game.state === STATE_PICKED)
					|| (! Game.judged && Game.is_judge && Game.state === STATE_JUDGE)
					|| (! Game.judged && Game.state === STATE_VOTE))
					{
					Sound.ticking.play ()
					Countdown.ticking = true
					}
				}
			$("#countdown").html("0:0"+Countdown.time)
			Countdown.time -= 1
			}
		else if (Countdown.time > -1)
			{
			$("#countdown").html("0:0"+Countdown.time).addClass("close")
			Countdown.time -= 1
			}
		else
			{
			Countdown.stop ()
			}
		},
	}

var MIN_DISCARD_SCORE = 250
var Discard = {
	saving: false,
	loaded: false,
	wiggleOptions: {
		"degrees": ['1','2','1','0','-1','-2','-1','0'],
		"delay": 35
	},
	save: function () {
		if (Discard.saving)
			return;
		Discard.saving = true;
		var imgs = [];
		$(".discarding").each(function(){
			imgs.push($(this).data('file'));
		});
		var params = {
			game: Game.name,
			session: Auth.session,
			cards: imgs.join(",")
		};
		$.post(API.URL.discard, params, Discard.saveCallback, "json");
	},
	saveCallback: function (data) {
		Discard.saving = false;
		if (data['discards'] < 0) {
			alert("No discards left!");
			return;
		}
		Game.discards = data['discards'];
		Game.cards = data['cards'];
		if (Game.state < STATE_JUDGE)
			Game.dealCallback(data);
		Discard.unload();
	},
	pick: function () {
		if ($(this).hasClass("discarding")) {
			$(this).removeClass("discarding").wiggle('stop');
		} else {
			$(this).addClass("discarding").wiggle('start', Discard.wiggleOptions);
		}
	},

	discardCard: function (set, card) {
		var newdiv = document.createElement("div")
		newdiv.style.opacity = 0.1
		newdiv.style.position = "relative"
		newdiv.style.top = Game.handHeight + "px"

		var newimg = document.createElement("img")
		newimg.onload = function () {
			var divheight = $(this).height()
			var offset = (Game.handHeight - divheight) / 2
			$(this).parent().animate({ "opacity": 1, "top": offset })
			var par = $("#discard-cards");
			par.css({ "margin-left": -1 * par.width() / 2 })
		}
		newimg.setAttribute("src", "/img/"+set+"/"+card)
		newimg.style.maxWidth = Game.cardWidth + "px"
		newimg.style.maxHeight = Game.cardHeight + "px"

		var mask = document.createElement("span")
		mask.className = "mask"

		newdiv.appendChild(newimg)
		newdiv.appendChild(mask)
		newdiv.setAttribute("data-file", card)
		return newdiv
	},

	load: function () {
		if (Game.discards < 1) {
			alert("No discards left!");
			return;
		} else if (Game.score < MIN_DISCARD_SCORE) {
			alert("You need " + MIN_DISCARD_SCORE + " points before you can discard.");
			return;
		}
		Discard.loaded = true;
		$("#discard-count").html(Game.discards);
		var cards = Game.cards;
		$("#discard-cards").html("");
		for (var i in cards) {
			$("#discard-cards").append(Discard.discardCard("player", cards[i]))
		}
		$("#discard-curtain").fadeIn(100);
		$("#hand").css({ "opacity": 0 });
		Discard.loadAnimation();
	},
	loadAnimation: function () {
		$("#discard-cards").show().animate({ "top": Game.handTop });
		$("#discard-container").show().animate({ "bottom": Chat.bottom });
	},
	unload: function () {
		Discard.loaded = false;
		$("#discard-curtain").fadeOut(200);
		$("#discard-cards").animate({ "top": 2 * $(window).height() });
		$("#discard-container").animate({ "bottom": 2 * $(window).height() });
		$("#hand").css({ "opacity": 1 });
	},
	init: function () {
		$("#discard-close,#discard-curtain").click(Discard.unload);
		$("#discard-ok").click(Discard.save);
		$("#discard").click(Discard.load);
		$("#discard-cards div").live("click", Discard.pick);
	}
};

$(function($){
    
  var tooltip = document.createElement("div");
  tooltip.id = "tooltip";
  tooltip.style.display = "none";
  tooltip.style.zIndex = 6969;

  var tooltip_arrow = document.createElement("div");
  tooltip_arrow.id = "tooltip_arrow";
  tooltip_arrow.style.display = "none";
  tooltip_arrow.style.zIndex = 6969;
  document.body.appendChild(tooltip);
  document.body.appendChild(tooltip_arrow);

  $.tooltip = function(el, options){
    var base = this;
    base.$el = $(el);
    base.el = el;        
    base.$el.data("tooltip", base);
    
    base.init = function(){            
      // base.options = $.extend({}, $.tooltip.options, options);
      base.el.onmouseover = base.mouseover;
      base.el.onmouseout = base.mouseout;
    };

    base.mouseover = function(){
      tooltip.style.top = "0";
      tooltip.style.left = "-999px";
      tooltip.style.display = "block";
      tooltip_arrow.style.display = "block";
      tooltip.innerHTML = base.el.innerHTML;
      var offset = base.$el.offset();
      var el_width = base.$el.width();
      var width = $(tooltip).width();
      tooltip.style.top = offset.top + 32 + "px";
      tooltip.style.left = offset.left + el_width/2 - width / 2 + "px";
      tooltip_arrow.style.top = offset.top + 28 + "px";
      tooltip_arrow.style.left = offset.left + 6 + "px";
    };

    base.mouseout = function(){
      tooltip.style.display = "none";
      tooltip_arrow.style.display = "none";
    };

    base.init();
  };

  $.fn.tooltip = function(options){
    return this.each(function(){
      (new $.tooltip(this, options));            
    });
  };

  $(".icon").tooltip();
});


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
var Lorgnette =
	{
	current: false,
	fadeOut: function ()
		{
		$(".lorgnette").hide();
		},
	hide: function ()
		{
		$(".lorgnette").hide();
		},
	show: function (img)
		{
		Lorgnette.current = ! Lorgnette.current;
		var div_on = Lorgnette.current ? "#lorgnette0" : "#lorgnette1";
		var div_off = Lorgnette.current ? "#lorgnette1" : "#lorgnette0";
		$(div_off).stop().hide().attr("src", "");
		$(div_on).stop().hide().attr("src", img.src);
		function clamp (x, min, max) { return Math.max(Math.min(max, x), min) };
		var maxwidth = 450;
		var maxheight = 450;
		var offset = $(img).offset();
		// var boxwidth = clamp(img.naturalWidth, img.clientWidth + 20, img.clientWidth * 2);
		// var boxheight = clamp(img.naturalHeight, img.clientHeight + 20, img.clientHeight * 2);
		// if (boxheight > (Game.cardHeight + 20)) {
			boxheight = (Game.cardHeight + 20);
			boxwidth = (Game.cardHeight + 20) * img.naturalWidth / img.naturalHeight;
		// } else 
		if (boxwidth > (Game.cardWidth + 20)) {
		 	boxwidth = (Game.cardWidth + 20);
		 	boxheight = (Game.cardWidth + 20) * img.naturalHeight / img.naturalWidth;
		}
		if (boxwidth < img.clientWidth) // + 10)
			return;
		var newleft = offset.left - ((boxwidth - img.clientWidth) / 2) + 1;
		var newtop = offset.top - ((boxheight - img.clientHeight) / 2) + 1;
		if (newtop + boxheight + 10 > $(window).height())
			newtop = $(window).height() - boxheight - 10;
		$(div_on).stop().css
			({
			'left': offset.left,
			'top': offset.top,
			'width': img.clientWidth,
			'height': img.clientHeight
			});
		$(div_on).delay(90).stop().show().animate
			({
			'left': newleft,
			'top': newtop,
			'width': boxwidth,
			'height': boxheight
			}, 200);
/*
		$("#lorgnette").css
			({
			'left': newleft,
			'top': newtop
			});
		$("#lorgnette img").css
			({
			'width': boxwidth,
			'height': boxheight
			});
*/
//		$("#lorgnette").stop().show();
		}
	}
var Room =
	{
	setupAvatar: function ()
		{
		if (Game.avatar && Game.avatar.length > 4 && Game.avatar.indexOf("http") === 0)
			{
			$("#room-avatar").attr("src", Game.avatar)
			$("#room-avatar-wrapper").show()
			$("#room-buttons").css({ "padding-left": 10 })
			}
		else
			{
			$("#room-avatar-wrapper").hide()
			$("#room-buttons").css({ "padding-left": 10 })
			}
		},
	setupBackground: function ()
		{
		if (Game.bg && Game.bg.length > 4 && Game.bg.indexOf("http") === 0)
			{
			$("#bg").css({"background-image": "url("+Game.bg+")"})
			$("#room-avatar-wrapper").show()
			$("#hide-bg").show()
			$("#show-bg").hide()
			}
		else
			{
			$("#room-avatar-wrapper").hide()
			$("#show-bg").hide()
			$("#hide-bg").hide()
			}
		},
	setup: function ()
		{
		// $("#title").html(Game.title)
		$("#title").html("Pomme")
		Room.setupAvatar ()
		Room.setupBackground ()
		},
	edit: function ()
		{
		$("#room-edit-title").val(Game.title)
		$("#room-edit-avatar").val(Game.avatar)
		$("#room-edit-bg").val(Game.bg)
		Room.updateSelector("#room-edit-capacity", Game.capacity)
		Room.updateSelector("#room-edit-timer", Game.timer)
		Room.updateSelector("#room-edit-goal", Game.goal)
		Room.updateCheckbox("#room-edit-private", Game.isPrivate === 1)
		},
	updateCheckbox: function (div, val)
		{
		if ( val )
			$(div).attr("checked", "checked")
		else
			$(div).removeAttr("selected")
		},
	updateSelector: function (div, val)
		{
		$("#div option").each(function ()
			{
			if ( $(this).val() === val )
				$(this).attr("selected", "selected")
			else
				$(this).removeAttr("selected")
			})
		},
	save: function ()
		{
		var params =
			{
			name: Game.name,
			title: $('#room-edit-title').val() || Game.name,
			capacity: $('#room-edit-capacity :selected').val(),
			goal: $('#room-edit-goal :selected').val(),
			timer: $('#room-edit-timer :selected').val(),
			private: $('#room-edit-private:checked').val() !== undefined ? "1" : "0",
			// password: $("#room-edit-password").val(),
			avatar: $('#room-edit-avatar').val() || " ",
			bg: $('#room-edit-bg').val() || " ",
			session: Auth.session,
			}
		$.post(API.URL.edit, params, Room.saveCallback, "json")
		Room.unload ()
		},
	saveCallback: function (data)
		{
		if ("error" in data)
			return
		Game.view ()
		},
	load: function ()
		{
		Room.edit ()
		$("#room-edit,#room-edit-curtain").fadeIn(500)
		},
	unload: function ()
		{
		$("#room-edit,#room-edit-curtain").fadeOut(500)
		},
	init: function ()
		{
		if (Auth.username !== "jules" && Auth.username !== "frederick")
			$("#room-edit-open").hide()
		$("#room-edit-open").bind("click", Room.load)
		$("#room-edit-save").bind("click", Room.save)
		$("#room-edit-close,#room-edit-curtain").bind("click", Room.unload)
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
	score: 0,
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
		if ("redirect" in data)
			return Game.redirect_to (data['redirect'])
		if ("error" in data)
			return Game.fatalError(data['error'])
		if (data['players'].length < 1 && ('lastdate' in data) && data['lastdate'] < 3600)
			return Game.redirect_to_lobby ()
		Share.test(data['players'].length);
		if (Auth.username === false)
			Auth.username = data['username']
		document.cookie = "session="+Auth.session+";path=/;domain=." + SERVER + ";max-age=1086400"
		Game.last = data['last']
		Room.init ()
		Game.viewCallback (data)

		Game.score = data['score']
		Game.discards = data['discards']
		Game.webcams = data['webcams']

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
		if (! Webcam.loaded)
			{
			Webcam.init()
			}
		},
	view: function ()
		{
		var params = { name: Game.name, session: Auth.session }
		$.post(API.URL.view, params, Room.viewCallback, json)
		},
	viewCallback: function (data)
		{
		Game.goal = data['goal']
		Game.capacity = data['capacity']
		Game.timer = data['timer']
		Game.isPrivate = data['private']
		Game.bg = data['bg']
		Game.avatar = data['avatar']
		Game.title = data['name']
		Game.settingsUpdated = data['settingsUpdated']
		Game.settingsUpdatedBy = data['settingsUpdatedBy']
		Room.setup ()
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
	redirect_to: function (redirect)
		{ document.location = BROWSER + redirect },
	redirect_to_lobby: function ()
		{ document.location = BROWSER },
	fatalError: function (error)
		{
		$("#game").hide ()
		var verbose_error = "An unspecified error has occured!"
		if (error === "notloggedin")
			return Auth.logout ()
		if (error === "capacity")
			verbose_error = "<p>Sorry, this room is full!</p><p>Pick another room from <a href='/'>the lobby</a></p>"
		if (error === "inactive")
			return Game.redirect_to_lobby ()
		if (error.indexOf ("game does not exist") !== -1)
			return Game.redirect_to_lobby ()
			// verbose_error = "<p>This room has not been created yet.</p><p>Please go to <a href='/'>the lobby</a> to set it up.</p>"
		$("body").css({"background-color": "#888"})
		$("#loading,#curtain").fadeOut(1000)
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
		Share.test(data['players'].length);
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
		if (data['settingsUpdated'] !== Game.settingsUpdated)
			Game.view ()
		if (data['round'] < 2)
			Webcam.reset()
		},
	setupCards: function (data)
		{
		Game.cards = data['cards']
		$("#win, #champion").hide()
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
				s += "<p class='idle'"
			else if (player.name === Auth.username)
				s += "<p class='you'"
			else
				s += "<p"
			s += " data-username='" + player.name + "'>"

			if (player.name === data['judge'])
				s += "<span class='state judge'>JUDGE</span>"
			else if (player.name in betters)
				s += "<span class='state picked'>&#10003;</span>"
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
					s += "<span class='skip' data-name='"+player.name+"'>skip</span>"
					}
				if (Game.ignoreList[player.name])
					s += "<span class='ignore' data-name='"+player.name+"'>ignored</span>"
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
				var num = wait_count > NUMBERS.length - 1 ? "many" : NUMBERS[wait_count];
				p = num + " to go"
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
			$("#orders").html("The judge waited too long -- Vote for the best match!")
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
		Lorgnette.fadeOut();
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
				return ["Nobody here -- Send the link to your friends!<br/><input type='text' id='copy_url' readonly value='" + SERVER + Game.name+"'/>", " "]
			else
				return ["Nobody here -- Send the link to your friends!<br/><input type='text' id='copy_url' readonly value='" + SERVER + Game.name+"'/>", " "]
				// return ["Nobody here -- Send the link to your friends!<br/></"+Game.name+"'>http://pomme.us/"+Game.name+"</a>", " "]
				// return ["Nobody here -- Send the link to your friends!", " "]
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
			Webcam.snaps = 0
			var player_card = Game.winCard ("player", data['win_image'])
			player_card.style.paddingRight = "10px"
			var match_card = Game.winCard ("main", data['image'])
			$("#win").html("")
			$("#win").append (player_card)
			$("#win").append (match_card)
			$("#win").data("comboid", data['comboid'])
			var mask = document.createElement("span")
			mask.className = "mask"
			$(mask).data("comboid", data['comboid'])
			$("#win").append (mask)

			if (data['winner'] === Auth.username)
				{
				Main.title_msg = "YOU WON"
				Game.score += 1
				Sound.wonround.play()
				return [" ", "you won!"]
				return ["<b>You won!</b>", "you won!"]
				}
			else
				{
				$("#orders").html("Click the pair if you like it! &uarr;")
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
			// $("#champion-waiting").hide()
			// $("#champion-restart").show()
			Sound.wongame.play()
			$("#champion").fadeIn(500)
			// $("#champion-restart").bind("click", Game.restart)
			setTimeout(Game.restart, 10000)
			$.post(API.URL.deal, params, Game.dealCallback, "json")
			return ["",""]
			// return ["The judge has abandoned the game! Starting over...", "game reset"]
			}
		},
	restart: function ()
		{
		// $("#champion-restart").hide()
		// $("#champion-waiting").fadeIn(500)
		var params =
			{
			"session": Auth.session,
			"game": Game.name,
			}
		$.post(API.URL.restart, params)
		},
	dealCallback: function (data)
		{
		Game.cards = data.cards
		$("#hand").html("")
		for (var i = 0; i < Game.cards.length; i++)
			$("#hand").append( Game.handCard ("player", Game.cards[i]) )
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
		Lorgnette.fadeOut(); var filename = $(this).data("file")
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
			"deck": "player",
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
	camCard: function (filename)
		{
		Sound.click.play ()
		Sound.ticking.stop ()
		Game.pickedImage = filename
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
			"deck": "webcam",
			}
		$.post(API.URL.bet, params)
		},
	winCard: function (set, card)
		{
		if (card.indexOf("pommecam") !== -1)
			set = "webcam"
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
		var mask = document.createElement("span")
		mask.className = "mask"
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
		newdiv.appendChild(mask)
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

		var mask = document.createElement("span")
		mask.className = "mask"

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
		newdiv.onmouseover = function ()
			{
			Lorgnette.show(newimg);
			}
		newdiv.onmouseout = function ()
			{
			Lorgnette.hide()
			}
		if (card.indexOf("pommecam") !== -1)
			set = "webcam"
		newimg.setAttribute("src", "/img/"+set+"/"+card)
		newimg.setAttribute("data-file", card)
		
		var mask = document.createElement("span")
		mask.className = "mask"
		mask.setAttribute ("data-file", card)

		newimg.style.maxWidth = Game.voteWidth + "px"
		newimg.style.maxHeight = Game.cardHeight + "px"

		newdiv.appendChild(newimg)
		newdiv.appendChild(mask)
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
		if (Game.state > STATE_PICKED)
			{
			newdiv.onmouseover = function ()
				{
				Lorgnette.show(newimg);
				}
			newdiv.onmouseout = function ()
				{
				Lorgnette.hide()
				}
			}
		newimg.setAttribute("src", "/img/"+set+"/"+card)
		newimg.setAttribute("data-file", card)
		
		newimg.style.maxWidth = Game.cardWidth + "px"
		newimg.style.maxHeight = Game.cardHeight + "px"

		var mask = document.createElement("span")
		mask.className = "mask"
		mask.setAttribute ("data-file", card)

		newdiv.appendChild(newimg)
		newdiv.appendChild(mask)
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
		Lorgnette.fadeOut();
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
	likes: {},
	likeWin: function ()
		{
		var comboid = $(this).data("comboid")
		if (! comboid)
			return
		if (comboid in Game.likes)
			return
		Game.likes[comboid] = true
		var params =
			{
			'comboid': comboid,
			'session': Auth.session,
			}
		$.post(API.URL.like_add, params)
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
	autojoin: function ()
		{
		clearTimeout (Game.timeout)
		$("#loading").show()
		$("#game").fadeOut(200)
		$.post( API.URL.active, { "session": Auth.session, "skip": Game.name, }, Game.autojoinCallback, "json" )
		},
	autojoinCallback: function (data)
		{
		document.location = BROWSER + data['path']
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
		$("#hand .mask").live("click", Game.pick)
		$("#votes .mask").live("click", Game.judge)
		$("#win .mask").live("click", Game.likeWin)
		$("#hand .mask").live("mouseover", Game.pickMouseover)
		$("#votes .mask").live("mouseover", Game.judgeMouseover)
		$("#rejoin").bind("click", Game.rejoin)
		$("#pass").bind("click", Game.pass)
		$(".skip").live("click", Game.skip)
		$(".ignore").live("click", Game.ignore)
		Game.ignoreList[name] = true
		$("#logout").bind("click", Auth.logout)
		$("#webcam").bind("click", Webcam.load)
		$("#rejoin").hide()
		$("#pass").show()
		$("#copy_url").live("click", function(){$("#copy_url").select()})
		$("#room-autojoin").bind("click", Game.autojoin)
		Game.setupStates ()
		// Userlist.init ()
		Profile.init ()
		Discard.init ()
		Share.init ()
		}
	}
var Userlist =
	{
	isOpen: false,
	rowOver: function ()
		{
		var offset = $(this).offset()
		$("#scores-menu").css({"top": offset.top})
		},
	rowOut: function ()
		{
		},
	menuOver: function ()
		{
		},
	menuOut: function ()
		{
		},
	init: function ()
		{
		$("#scores p").live("mouseover", Userlist.rowOver)
		$("#scores p").live("mouseout", Userlist.rowOut)
		$("#scores-menu").live("mouseover", Userlist.menuOver)
		$("#scores-menu").live("mouseout", Userlist.menuOut)
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
			{
			$("#win").hide()
			// console.log("HID WIN ON FOCUS "+Game.state)
			}
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

		var status_width = 320

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
		Chat.bottom = cbot

		if (Discard.loaded) {
			Discard.loadAnimation();
		} else {
			$("#discard-container").css({ "bottom": h*2 })
			$("#discard-cards").css({ "top": h*2, "left": "50%", "height": hh, })
		}

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
		// $("#status").css({ "top": 70, "right": p, "width": actual_status_width-2*p, })
		$("#buttons").css({ "top": p, "right": 0, })
		$("#room-buttons").css({ "top": p+43+p, "width": status_width-5, "right": 0 }) // "left": w-status_width-p })
		$("#status").css({ "top": p+43+p+43+p, "right": p, "width": status_width-2*p, "max-height": h - cbot - 106  })

		$("#howto").css({"left": 10 + ($(window).width() - $("#howto").width() - $("#buttons").width() - $("#chat_bg").width() - 10) / 2 });

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

