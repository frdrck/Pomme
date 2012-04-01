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

