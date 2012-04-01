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

