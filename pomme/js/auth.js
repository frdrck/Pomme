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
		document.cookie = "session="+Auth.session+";path=/;domain=.pomme.us;max-age=1086400"
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
		document.cookie = "session=false;path=/;domain=.pomme.us;max-age=0"
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

