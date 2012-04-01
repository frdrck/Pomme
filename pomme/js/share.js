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

