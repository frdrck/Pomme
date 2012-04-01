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
		filename = url.replace("http://pomme.us/img/webcam/", "")
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

