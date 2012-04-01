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

