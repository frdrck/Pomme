var mysql = require('mysql');
var async = require('async');
var express = require('./express-ws');
var fs = require('fs');
var path = require('path');

var jsdir = __dirname + '/../js/';

// process.on('uncaughtException',function(e) {
// 	console.error('UNCAUGHT:',e.trace);
// });

var app = express();

app.use(express.bodyParser());
app.use(express.cookieParser());

// function concatFiles(filesStr) {
// 	return function(req,res) {
// 		console.log('Request for',req.url);
// 		var files = filesStr.split(' ');
// 		res.setHeader('Content-Type', 'text/javascript');
// 		async.eachSeries(files, function(file,cb) {
// 			res.write('// ' + file + '\n');
// 			fs.createReadStream(path.join(jsdir, file))
// 				.on('end',cb)
// 				.pipe(res,{ end: false });
// 		}, function() {
// 			res.end();
// 		});
// 	};
// }
// app.get('/js/pomme_game.js',concatFiles('jquery.wiggle.js jpegcam.js webcam.js api_game.js preload.js audio.js auth.js share.js profile.js chat.js countdown.js discard.js tooltip.js game_live.js'));
// app.get('/js/lobby3.js',concatFiles('api.js preload.js audio.js auth.js chat.js lobby2.js'));
// app.get('/js/profile2.js',concatFiles('api.js preload.js audio.js auth.js chat.js profile.js profile_main.js'));
// app.get('/js/lobby2.js',concatFiles('api.js preload.js audio.js auth.js chat.js lobby.js'));

var sessions = {
	'FrozenCow': {
		id: 'FrozenCow',
		name: 'FrozenCow'
	}
};
var games = {
	'default': {
		name: 'default',
		players: [],
		betters: [],
		judge: undefined,
		skipped: []
	}
};
app.post('/user/login', function(req,res) {
	console.log('Login attempt with name',req.body.name);
	var sessionid = req.body.name; // Temporary shortcut
	sessions[sessionid] = {
		name: req.body.name,
		session: sessionid
	};
	res.cookie('session',sessionid);
	res.json({session:sessionid});
});

app.post('/game/join', function(req,res) {
	res.json({});
});

Array.prototype.remove = function(item) {
	var index = this.indexOf(item);
	return this.splice(index,1);
};

Array.prototype.contains = function(item) {
	return this.indexOf(item) >= 0;
}

function getSessionId(req) {
	return req.cookies
		.filter(function(cookie) { return cookie.name === 'session'; })
		.map(function(cookie) { return cookie.value; })
		[0];
}
function getSession(req) {
	return sessions[getSessionId(req)];
}

app.ws.use(function(req,next) {
	express.cookieParser()(req,{},next);
});
app.ws.usepath('/game/join/',function(req,next) {
	var gameid = req.query.name;
	var game = games[gameid];
	var session = getSession(req);

	if (!game) { return req.reject(); }
	console.log('connected');
	var ws = req.accept('game',req.origin);
	ws.sendMessage = function(msg) {
		this.send(JSON.stringify(msg));
	};
	var player = {
		socket: ws,
		session: session,
		cards: ['example.png'],
		score: 0
	};
	game.players.push(player);
	console.log('Player',player.session.name,'joined',game.name);
	ws.sendMessage({
		type: 'join',
		username: player.session.name,
		players: game.players.map(function(player) {
			return {
				name: player.session.name,
				score: player.score
			};
		}),
		judge: 'FrozenCow',
		betters: game.betters.map(function(player) {
			return player.session.name;
		}),
		cards: player.cards
	});

	ws.on('message',function(e) {
		var msg = JSON.parse(e.data);
		function unknownMessage(msg) {
			console.error('Unknown message:',msg.type);
		}
		(callbacks[msg.type] || unknownMessage)(msg);
	});
	ws.on('error',function() {

	});
	ws.on('close',function() {
		console.log('Player',player.session.name,'left',game.name);
		game.players.remove(player);
	});
	var messageHandlers = {
		'bet': function(msg) {

		}
	};
});

app.get('/js/*',express.static(__dirname + '/..'));

app.use(express.static(__dirname + '/../../httpdocs/game2'));
app.use(express.static(__dirname + '/../../httpdocs'));
app.use(express.static(__dirname + '/../../'));

app.use(function(req,res) {
	res.setHeader('Content-Type', 'text/html');
	fs.createReadStream(__dirname + '/../../httpdocs/game2/index.html').pipe(res);
});

app.listen(8080);
console.log('listening on 8080');
