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

