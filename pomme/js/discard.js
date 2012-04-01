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

