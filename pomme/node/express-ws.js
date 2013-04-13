var express = require('express');
var WebSocketServer = require('websocket').server;

exports = module.exports = function(/*...*/) {
	var app = express.apply(null,arguments);
	app.ws = {};
	app.ws.handlers = [];
	app.ws.use = function(handler) {
		app.ws.handlers.push(handler);
	};
	app.ws.usepath = function(path,handler) {
		app.ws.use(function(req,next) {
			console.log(req.path);
			if (req.path === path) {
				return handler(req,next);
			} else {
				return next();
			}
		});
	};

	var _app_listen = app.listen;
	app.listen = function(/*...*/) {
		var server = app.server = _app_listen.apply(app,arguments);
		var wsserver = app.ws.server = new WebSocketServer({httpServer: server});
		wsserver.on('request',onWebsocketRequest);
	};

	function onWebsocketRequest(request) {
		var url = request.resourceURL;
		request.url = request.resourceURL.toString();
		request.path = request.resourceURL.pathname;
		request.query = {};
		for(var k in request.resourceURL.query) {
			request.query[k] = decodeURI(request.resourceURL.query[k]);
		}

		var handlerIndex=0;

		handle();

		function handle() {
			var handler = app.ws.handlers[handlerIndex];
			handlerIndex++;
			if (handler) {
				return handler(request,next);
			} else {
				return reject();
			}
			function next() {
				if (!handler) {
					console.error("Next was called multiple times");
					return;
				}
				handler = null;
				handle();
			}
		}
		function reject() {
			request.reject();
		}
	}
	return app;
};

for(var k in express) {
	exports[k] = express[k];
}