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
