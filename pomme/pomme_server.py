#!/opt/python2.6/bin/python

from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
import threading
import os
import sys
import time
import re
import cgi
import copy
import time
import random
import operator
import hashlib
import simplejson as json
from collections import deque
from fruits import FRUITS

print("db")

import db
import config

print("db done")

DB = db.db ()

print("new db")

BAN_TIME = 5 * 60
GAME_IDLE_TIME = 10
LOBBY_IDLE_TIME = 5
LIST_UPDATE_TIME = 10
CHAT_LOG_SIZE = 50
COMBO_LOG_SIZE = 20
HAND_SIZE = 5
IDLE_THRESHOLD = 3

ROOM_CAPACITY = 6
POINTS_TO_WIN = 5

FORM_FIELDS = {
	"/user/login":	 ("name","password",),
	"/user/logout":	 ("game","name",),
	"/user/view":	 ("name",),
	"/user/edit":	 ("name","email","password","avatar","bio","facebook","twitter","tumblr",),
	"/game/new":	 ("name","capacity","goal","private","password","timer",),
	"/game/edit":	 ("name","capacity","goal","private","password","bg","timer","avatar","title",),
	"/game/list":	 (),
	"/game/view":	 ("game",),
	"/game/join":	 ("game","last",),
	"/game/poll":	 ("game","last",),
	"/game/send":	 ("game","last","msg",),
	"/game/bet":	 ("game","card","deck",),
	"/game/judge":	 ("game","card","deck",),
	"/game/vote":	 ("game","card","deck",),
	"/game/skip":	 ("game","skip",),
	"/game/rejoin":	 ("game",),
	"/game/pass":	 ("game",),
	"/game/restart": ("game",),
	"/game/deal":	 ("game",),
	"/game/discard": ("game","cards"),
	"/combo/user":   ("name","start",),
	"/combo/judge":  ("name","start",),
	"/combo/game": 	 ("name","start",),
	"/like/add":     ("comboid",),
	"/like/remove":  ("comboid",),
	"/pomme/count":  (),
	"/game/newgame": (),
	"/game/active" : ("skip",),
	}
STATE_IDLE	= 0
STATE_SETUP	= 1
STATE_BET	= 2
STATE_PICKED	= 3
STATE_JUDGE	= 4
STATE_VOTE	= 5
STATE_WIN	= 6
STATE_GAMEOVER  = 7

CLEAN_URL_RE = re.compile ('[^-A-Za-z0-9!]')
DASHES_RE = re.compile ('-+')

ILLEGAL_ROOMS = "undefined null true false none css game img js lobby mp3 report plesk-stat static swf admin".split(" ")
ILLEGAL_WORDS = "fuck shit cunt nigg fag cocksuck".split(" ")
ILLEGAL_USERS = "undefined null true false none admin administrator sysadmin sysop".split(" ")

def now ():
	return int(time.mktime(time.localtime()))
def is_image (url):
	return url[-3:].lower() in ("gif","jpg","png") or url[-4:].lower == "jpeg"
def is_number (i):
	try:
		int (i)
		return True
	except:
		return False
def sanitize_url (s):
	s = CLEAN_URL_RE.sub ("", s)
	return s.lower()
def sanitize_html (s):
	return s.replace("&","&amp;").replace(">", "&gt;").replace("<", "&lt;").replace("\"", "&quot;")
def generate_hash (s):
	if not s:
		s = "POMME"
	return hashlib.sha256(str(time.time()).encode() + s.encode()).hexdigest()

START_TIME = now ()

class Cards:
	def __init__ (self):
		self.load ()
	def load (self):
		print("card dirs:", config.PLAYER_CARDS, config.MAIN_CARDS)
		self.player = self.load_dir (config.PLAYER_CARDS)
		self.main = self.load_dir (config.MAIN_CARDS)
	def load_dir (self, path):
		files = os.listdir (config.BASE_PATH+path)
		cards = []
		for file in files:
			if is_image (file):
				cards.append (file)
		return cards
master_cards = Cards ()

class Deck:
	def __init__ (self, source):
		self.cards = copy.copy (source)
		random.shuffle (self.cards)
		self.index = -1
	def reset (self):
		random.shuffle (self.cards)
		self.index = -1
	def card (self):
		self.index += 1
		if self.index >= len(self.cards):
			random.shuffle (self.cards)
			self.index = 0
		return self.cards[self.index]
	def hand (self, count):
		hand = []
		for i in range(count):
			hand.append (self.card ())
		return hand

class Player:
	def __init__ (self, game, args):
		self.game = game
		self.name = args['username']
		self.avatar = args['user'].avatar
		self.lastseen = now ()
		self.cards = game.player_deck.hand (HAND_SIZE)
		self.reset()
	def update (self):
		self.lastseen = now ()
	def reset (self):
		self.score = 0
		self.discards = 3
	def report (self):
		rec = {'name': self.name, 'score': self.score, 'avatar': self.avatar, 'discards': self.discards}
		return rec

class Game:
	def __init__ (self, row):
		# 0 id  1 name  2 path  3 goal  4 capacity  5 free  6 startdate  7 lastdate
		# 8 userid  9 username  10 bg  11 private  12 password  13 timer  14 avatar
		self.id = row[0]
		self.name = row[1]
		self.path = row[2]
		self.goal = row[3]
		self.capacity = row[4]
		self.free = row[5]
		self.startdate = row[6]
		self.lastdate = row[7]
		if self.lastdate is None:
			self.lastdate = now()
		self.userid = row[8]
		self.username = row[9]
		self.bg = row[10]
		self.private = row[11]
		self.password = row[12]
		self.timer = row[13]
		self.avatar = row[14]

		self.active_count = 0
		self.chatid = 0
		self.chat = deque ()
		self.player_deck = Deck (master_cards.player)
		self.main_deck = Deck (master_cards.main)
		self.players = {}
		self.active = []
		self.idlers = {}
		self.skipped = {}
		self.skipvotes = {}
		self.skipcount = {}
		self.kicked = {}
		self.betters = []
		self.bets = {}
		self.votes = {}
		self.settingsUpdated = now ()
		self.settingsUpdatedBy = "no one"
		self.matches = []
		self.winner = ""
		self.win_image = ""
		self.win_combo = 0
		self.judge = ""
		self.image = ""
		self.next_image = self.main_deck.card ()
		self.round = 0
		self.nextgame = 0
		self.countdown = 0
		self.rounds = []
		self.state = STATE_IDLE
		self.setup = False
		self.restarting = False
	def restart (self):
		# self.player_deck.reset ()
		# self.main_deck.reset ()
		for player in self.players.values ():
			player.reset ()
		self.restarting = True
		self.round = 0
	def api_restart (self, args):
		## DEPRECATED
		if args['username'] not in self.votes:
			self.votes[args['username']] = True
		if len(self.votes) > len(self.active) / 2:
			self.restart ()
		return {}
	def api_deal (self, args):
		if self.state == STATE_GAMEOVER:
			player = self.players[args['username']]
			player.cards = self.player_deck.hand (HAND_SIZE)
			return { "cards": player.cards }
		return {}
	def api_discard (self, args):
		player = self.players[args['username']]
		cards = args['cards'].split(",")

		if player.discards == 0:
			return { "discards": -1 }
		player.discards -= 1
	
		for card in cards:
			new_card = self.player_deck.card ()
			if card in player.cards:
				del player.cards[player.cards.index(card)]
				player.cards.append(new_card)
		return {
			"cards": player.cards,
			"discards": player.discards,
		}
	def report (self, curtime=now()):
		i = 0
		players = []
		timed_out = []
		for name in self.active:
			player = self.players[name]
			if player.lastseen < curtime - GAME_IDLE_TIME:
				continue 
			rec = player.report ()
			players.append (rec)
			i += 1
		for i in reversed(timed_out):
			del self.active[i]
		data = {
			'name': self.name,
			'path': self.path,
			'active': self.active,
			'capacity': self.capacity,
			'avatar': self.avatar,
			'free': self.free,
			'private': self.private,
			'players': players,
			}
		return data
	def new_round (self):
		print("___________")
		print("NEW ROUND")
		if len(self.active) - len(self.skipped) < 2:
			self.state = STATE_IDLE
			self.judge = ""
			return
		self.bets = {}
		self.betters = []
		self.round += 1
		self.image = self.next_image
		self.next_image = self.main_deck.card ()
		self.win_image = ""
		self.win_combo = 0
		self.winner = ""
		self.countdown = now() + self.timer
		self.state = STATE_BET
		self.pick_judge ()
	def pick_judge (self):
		i = 0
		try:
			if self.judge in self.active:
				i = self.active.index(self.judge)
			looped = False
			while True:
				i += 1
				if i >= len(self.active):
					if looped:
						self.judge = ""
						self.state = STATE_IDLE
						return
					else:
						looped = True
					i = 0
				if self.active[i] in self.skipped:
					continue
				else:
					break
		except (ValueError):
			i = 0
		self.judge = self.active[i]
	def update (self, args):
		active_count = len(self.active) - len(self.skipped)
		self.active_count = active_count
		if active_count < 2:
			self.state = STATE_IDLE
		if self.state == STATE_IDLE:
			if active_count > 1:
				self.restart ()
				self.state = STATE_SETUP
				self.setup = False
		elif self.state == STATE_SETUP:
			if not self.setup:
				self.setup = True
				self.new_round ()
		elif self.state == STATE_BET:
			advancing = self.countdown < now ()
			if len(self.betters) == active_count - 1 or (advancing and len(self.betters) > 0):
				if self.judge not in self.active or self.judge in self.skipped:
					self.countdown = now() + self.timer
					self.state = STATE_VOTE
				else:
					self.countdown = now() + self.timer
					self.state = STATE_JUDGE
				if advancing:
					for name in self.active:
						if name not in self.bets:
							if name in self.idlers:
								self.idlers[name] += 1
							else:
								self.idlers[name] = 1
							if self.idlers[name] > IDLE_THRESHOLD:
								print("IDLE SKIPPING PLAYER", name)
								self.skip(name)
				#	self.state = STATE_IDLE
			#if self.judge not in self.active or self.judge in self.skipped:
			#	self.pick_judge ()
			if args['username'] == self.judge:
				return STATE_PICKED
			elif args['username'] in self.betters:
				return STATE_PICKED
		elif self.state == STATE_JUDGE:
			advancing = self.countdown < now ()
			if advancing or self.judge in self.skipped or self.judge not in self.active:
				self.state = STATE_VOTE
				self.countdown = now () + self.timer
				self.votes = {}
				print("SWITCHING TO STATE_VOTE")
				if self.judge in self.idlers:
					self.idlers[self.judge] += 1
				if self.idlers[self.judge] > IDLE_THRESHOLD:
					self.skip (self.judge)
					print("IDLE SKIPPING JUDGE", self.judge)
		elif self.state == STATE_VOTE:
			advancing = self.countdown < now ()
			if advancing:
				self.tally ()
		elif self.state == STATE_WIN:
			self.betters = []
			self.bets = {}
			if now () > self.nextgame:
				self.setup = False
				self.state = STATE_SETUP
		elif self.state == STATE_GAMEOVER:
			if now () > self.countdown:
				self.restart ()
				self.setup = False
				self.state = STATE_SETUP
				self.countdown = now () + 3
		return self.state
	def flush (self):
		curtime = now ()
		players = []
		timed_out = []
		i = -1
		for name in self.active:
			i += 1
			player = self.players[name]
			if player.lastseen < curtime - GAME_IDLE_TIME:
				if name in self.skipped:
					del self.skipped[name]
				if name in self.skipvotes:
					del self.skipvotes[name]
				timed_out.append(i)
				continue 
		for i in reversed(timed_out):
			del self.active[i]

	def report_players (self, args):
		curtime = now ()
		players = []
		timed_out = []
		if args['username'] not in self.players:
			self.players[args['username']] = Player (self, args)
		if args['username'] not in self.active:
			if args['username'] not in self.skipped:
				self.active.append(args['username'])
		i = 0
		for name in self.active:
			player = self.players[name]
			if player.lastseen < curtime - GAME_IDLE_TIME:
				if name in self.skipped:
					del self.skipped[name]
				if name in self.skipvotes:
					del self.skipvotes[name]
				timed_out.append(i)
				continue 
			rec = player.report ()
			rec['skipped'] = name in self.skipped
			players.append (rec)
			i += 1
		for i in reversed(timed_out):
			del self.active[i]
		return players
	def api_view (self, args, resp={}):
		resp['name'] = self.name
		resp['path'] = self.path
		resp['goal'] = self.goal
		resp['capacity'] = self.capacity
		resp['free'] = self.free
		resp['bg'] = self.bg
		resp['avatar'] = self.avatar
		resp['timer'] = self.timer
		resp['settingsUpdated'] = self.settingsUpdated
		resp['settingsUpdatedBy'] = self.settingsUpdatedBy
		resp['private'] = self.private
		resp['lastdate'] = now() - self.lastdate
		return resp
	def check_if_room_is_inactive (self):
		return False
		curtime = now()
		# if room is less than 5 minutes old..
		if self.startdate != None and self.startdate > curtime - 60 * 5:
			if len(self.active) == 0:
				return True
			return False
		if self.path == "bigapple":
			return False
		return False
	def api_join (self, args):
		if len(self.active) >= self.capacity and args['username'] not in self.active:
			return {"error": "capacity"}
		if self.check_if_room_is_inactive():
			active_game = Pomme.find_an_active_game()
			return {"error": "inactive", "redirect": "/" + active_game}

		self.rejoin(args['username'])
		DB.user_seen (args['userid'])
		args['joined'] = True
		resp = self.api_poll(args)
		self.api_view(args, resp)

		player = self.players[args['username']]
		resp['cards'] = player.cards
		resp['discards'] = player.discards
		resp['username'] = args['username']
		resp['score'] = args['user'].score
		resp['lastdate'] = now() - self.lastdate
		return resp
	def api_rejoin (self, args):
		self.rejoin(args['username'])
		return {}
	def rejoin (self, name):
		if name in self.skipvotes:
			del self.skipvotes[name]
		if name in self.skipped:
			del self.skipped[name]
		self.idlers[name] = 0

	def api_poll (self, args):
		last = 0
		if args['last'] is not None:
			last = int(args['last']) - 2
		if args['username'] is not None:
			if args['username'] in self.players:
				self.players[args['username']].update()
			elif 'joined' not in args:
				self.api_join (args)
		resp = {}
		resp['players'] = self.report_players (args)
		resp['state'] = self.update (args)
		resp['round'] = self.round
		resp['judge'] = self.judge
		resp['image'] = self.image
		resp['skipped'] = self.skipped.keys ()
		resp['idle'] = args['username'] in self.skipped
		resp['last'] = now () - 1
		resp['chat'] = []
		resp['betters'] = self.betters
		resp['bets'] = self.bets.values()
		resp['winner'] = self.winner
		resp['win_image'] = self.win_image
		resp['win_combo'] = self.win_combo
		resp['next_image'] = self.next_image
		resp['countdown'] = self.countdown - now ()
		resp['settingsUpdated'] = self.settingsUpdated
		for elem in self.chat:
			if last <= elem[1]:
				resp['chat'].append(elem)
		return resp

	def api_send (self, args):
		# self.rejoin(args['username'])
		if len(args['msg']) == 0:
			return self.api_poll (args)
		self.chatid += 1
		msg = (self.chatid, now(), args['username'], args['msg'])
		self.chat.append (msg)
		if len(self.chat) > CHAT_LOG_SIZE:
			self.chat.popleft ()
		return self.api_poll (args)

	def api_bet (self, args):
		self.rejoin(args['username'])
		player = self.players[args['username']]
		if self.judge == args['username']:
			return {}
		if args['username'] not in self.active:
			return {}
		#if args['card'] not in player.cards:
		#	return {}

		self.betters.append(args['username'])
		self.bets[args['username']] = args['card']
		
		new_card = self.player_deck.card ()

		if args['card'] in player.cards:
			del player.cards[player.cards.index(args['card'])]
			player.cards.append(new_card)

		return { "card": new_card }

	def api_judge (self, args):
		print("JUDGING ", args['card'])
		if self.judge != args['username']:
			return { "error": "you aren't the judge" }
		if args['card'] not in self.bets.values ():
			return { "error": "card not in bets" }
		print("ATTEMPTING TO WIN")
		self.win (args['card'])
		return {}
	def win (self, win_card):
		if self.win_image == win_card:
			return
		print("WINNING:", win_card)
		for user, card in self.bets.iteritems ():
			if card == win_card:
				self.state = STATE_WIN
				self.winner = user
				self.win_image = card
				self.players[user].score += 1
				self.nextgame = now() + 10
				if self.players[user].score >= self.goal and self.goal != 0:
					print(">>>>>", user, "won the game in", self.name, "!")
					self.state = STATE_GAMEOVER
					self.countdown = now() + self.timer
					self.votes = {}
					Pomme.win_game (self, user)
				self.win_combo = Pomme.win_round (self, user, self.judge, card, self.image)
				print(self.players[user].score, "__", self.goal)
				return
		self.state = STATE_WIN
		self.winner = "someone"
		self.nextgame = now() + 10
		print("_____________________")
		print("judge leaving bug?")
		print(self.name)
		print(self.judge)
		print(card)
		print(repr(self.bets))
		print()
		print("_____________________")
	def api_vote (self, args):
		if args['card'] not in self.bets.values ():
			return { "error": "card not in bets" }
		self.votes[args['username']] = args['card']
		active_count = len(self.active) - len(self.skipped)
		if self.judge not in self.votes:
			active_count -= 1
		if len(self.votes) == active_count:
			self.tally ()
	def tally (self):
		scores = {}
		for card in self.votes.values ():
			if card in scores:
				scores[card] += 1
			else:
				scores[card] = 1
		sorted_scores = sorted(scores.iteritems(), key=operator.itemgetter(1), reverse=True)
		if len(sorted_scores):
			print("TALLIED ENOUGH CARDS")
			self.win (sorted_scores[0][0])

	# skip requires simple majority
	def api_skip (self, args):
		if args['username'] in self.players and args['skip'] in self.players:
			if args['skip'] not in self.skipvotes:
				self.skipvotes[args['skip']] = {}
			self.skipvotes[args['skip']][args['username']] = True
			if len(self.skipvotes[args['skip']]) > ((len(self.active) - 1) / 2):
				self.skip (args['skip'])
		return {}
	def skip (self, name):
		if name not in self.skipped:
			if name in self.skipvotes:
				del self.skipvotes[name]
			self.skipped[name] = True

	# pass
	def api_pass (self, args):
		if args['username'] in self.players:
			self.skip (args['username'])
		return {}

class Lobby:
	def __init__ (self):
		self.players = {}
		self.chatid = 0
		self.chat = deque ()
		self.last_report = now ()
	def report_players (self, args):
		curtime = now ()
		self.players[args['username']] = curtime
		if self.last_report > curtime - LOBBY_IDLE_TIME:
			self.last_report = curtime
			timed_out = []
			for name in self.players.keys():
				if self.players[name] < curtime - GAME_IDLE_TIME:
					timed_out.append(name)
					continue 
			for name in timed_out:
				del self.players[name]
		return players.keys ()
	def api_join (self):
		pass
		#api = Pomme.api_game_list
		#for name in api.games:
		#	if len(api.games[name]['players']) < 
	def api_poll (self, args):
		resp['players'] = self.report_players ()
		resp['chat'] = []
		for elem in self.chat:
			if last <= elem[1]:
				resp['chat'].append(elem)
	def api_send (self, args):
		# self.rejoin(args['username'])
		if len(args['msg']) == 0:
			return self.api_poll (args)
		self.chatid += 1
		msg = (self.chatid, now(), args['username'], args['msg'])
		self.chat.append (msg)
		if len(self.chat) > CHAT_LOG_SIZE:
			self.chat.popleft ()
		return self.api_poll (args)
	def game_new (self):
		# check current size of the feeding room
 		# if it's > 6, make/lookup a new room
		# return the NAME of the room we want to feed into
		fruit = random.choice(FRUITS)
		if fruit in Pomme.games:
			return { 'path': path }
		game = {
			'name': fruit,
			'path': fruit,
			'avatar': config.FRUIT_URI_BASE + fruit + ".png",
			'capacity': ROOM_CAPACITY,
			'goal': POINTS_TO_WIN,
			'timer': 20,
			'private': 0,
			'startdate': now(),
			'lastdate': now(),
			}
		row = DB.game_new(args)
		return { 'path': path }

lobby = Lobby ()

class User:
	def __init__ (self, row):
		# 0 id  1 username  2 password  3 score  4 wins_10  5 wins_20  6 wins_30
		# 7 joindate  8 seendate  9 fbid  10 email  11 avatar  12 bio  13 admin  14 remote_addr
		# 15 facebook  16 twitter  17 tumblr
		self.id = row[0]
		self.username = row[1]
		self.password = row[2]
		self.score = row[3]
		self.wins_10 = row[4]
		self.wins_20 = row[5]
		self.wins_30 = row[6]
		self.joindate = row[7]
		self.seendate = row[8]
		self.fbid = row[9]
		self.email = row[10]
		self.avatar = row[11]
		self.bio = row[12]
		self.admin = row[13]
		self.remote_addr = row[14]
		self.facebook = row[15]
		self.twitter = row[16]
		self.tumblr = row[17]
		self.last_ip = None
	def is_confirmed (self):
		try:
			return len(self.password) > 0 and len(self.email) > 0
		except:
			return False
	def is_admin (self):
		try:
			return self.admin == 1
		except:
			return False
	def check_ip (self, client_address):
		curtime = now ()
		if int(self.seendate) > curtime - 1200:
			if self.last_ip is not None and self.last_ip[0] != client_address[0]:
				return False
		self.seendate = curtime
		self.last_ip = client_address
		return True

class PommeDatabase:
	def __init__ (self):
		self.users = {}
		self.usernames = {}
		self.sessions = {}
		self.games = {}
		self.active_games = {}
		self.last_update = 0
		self.load ()
		self.combos = deque ()
		self.last_active_count = 0
		self.last_got_active = 0
		pass
	def load (self):
		user_rows = DB.user_list_all ()
		for row in user_rows:
			self.users[row[0]] = User (row)
			if row[1].lower() not in self.usernames:
				self.usernames[row[1].lower()] = row[0]
		session_rows = DB.session_list_all ()
		for row in session_rows:
			self.sessions[row[0]] = row[1]
		game_rows = DB.game_list_all ()
		for row in game_rows:
			if row[2] == None:
				continue
			self.games[row[2].lower()] = Game (row)
	def reload_decks (self):
		master_cards.load()
		for game in self.games.values ():
			game.player_deck = Deck (master_cards.player)
			game.main_deck = Deck (master_cards.main)
	def user_new (self, args):
                
		params = {
			'username': args['name'],
			'joindate': now(),
			'seendate': now(),
			}
		rec = DB.user_new (params)
		if rec is not None:
			self.users[rec[0]] = User (rec)
			self.usernames[rec[1].lower()] = rec[0]
			return self.users[rec[0]]
		return None
	def session_new (self, user):
		if user is None:
			return False
		sessionid = generate_hash (user.username)
		DB.session_new(sessionid, user.id)
		self.sessions[sessionid] = user.id
		return sessionid
	def user_from_username (self, username):
		try:
			return self.users[self.usernames[username.lower()]]
		except:
			return None
	def user_from_session (self, sessionid, client_address):
		try:
			user = self.users[self.sessions[sessionid]]
			#if not user.check_ip(client_address):
			#	return None
			return user
		except:
			return None
	def game_from_name (self, name):
		try:
			return self.games[name.lower()]
		except:
			return None
	def api_user_view (self, args):
		user = self.user_from_username (args['name'])
		if user is None:
			return { "error": "no user" }
		data = {
			'username': user.username,
			'score': user.score,
			'wins_10': user.wins_10,
			'wins_20': user.wins_20,
			'wins_30': user.wins_30,
			'joindate': user.joindate,
			'seendate': user.seendate,
			'avatar': user.avatar,
			'bio': user.bio,
			'facebook': user.facebook,
			'twitter': user.twitter,
			'tumblr': user.tumblr,
			}
		if user.id == args['userid']:
			data['id'] = user.id
			data['email'] = user.email
		return data
	def api_user_edit (self, args):
		user = self.user_from_username (args['username'])
		if user is None:
			return { "error": "no user" }
		if user.id != args['user'].id and not args['user'].is_admin ():
			return { "error": "forbidden" }
		fields = "email avatar bio facebook twitter tumblr".split(" ")
		data = {}
		for field in fields:
			if args[field] is not None:
				data[field] = args[field]
		if args['password'] is not None and len(args['password']):
			data['password'] = args['password']
			user.password = args['password']
		DB.user_edit (data, user.id)
		if args['avatar'] is not None:
			user.avatar = args['avatar']
		if args['bio'] is not None:
			user.bio = args['bio']
		if args['facebook'] is not None:
			user.facebook = args['facebook']
		if args['twitter'] is not None:
			user.twitter = args['twitter']
		if args['tumblr'] is not None:
			user.tumblr = args['tumblr']
		self.settingsUpdated = now()
		self.settingsUpdatedBy = user.username
		return {"edited": "ok"}
	def win_round (self, game, username, judgename, playercard, matchcard):
		user = self.user_from_username (username)
		judge = self.user_from_username (judgename)
		userid = 0
		judgeid = 0
		if user is not None:
			userid = user.id
		if judge is not None:
			judgeid = judge.id
		params = {
			'date': now (),
			'gameid': game.id,
			'gamename': game.path,
			# 'free': game.free,
			'userid': userid,
			'username': username,
			'judgeid': judgeid,
			'judgename': judgename,
			'pair': playercard,
			'pairtype': 'player',
			'image': matchcard,
			'imagetype': 'main',
			}
		comboid = DB.combo_new (params)
		if judge is not None:
			DB.like_add (judgeid, comboid, userid)
		if user is not None:
			user.score += 1
		# if game.free != 1:
		self.combos.append ((playercard, matchcard, comboid))
		if len(self.combos) > COMBO_LOG_SIZE:
			self.combos.popleft ()
		return comboid
	def win_game (self, game, username):
		if game.goal == 0:
			return
		if len(game.active) < 3:
			return
		user = self.user_from_username (username)
		if game.goal == POINTS_TO_WIN:
			user.wins_10 += 1
			DB.user_win_game(user.id, game.goal)
		elif game.goal == 20:
			user.wins_20 += 1
			DB.user_win_game(user.id, game.goal)
		elif game.goal == 30:
			user.wins_30 += 1
			DB.user_win_game(user.id, game.goal)

	def api_login (self, args, client_address):
		print(args)
		if args['name'] is None or args['name'] == "" or args['name'] == " ":
			return { "error": "empty" }
		user = self.user_from_username(args['name'])

		if user is not None:
			print("login attempt:", args['name'])
			if len(user.password):
				if args['password'] is None:
					return { "error": "password" }
				elif user.password != args['password']:
					return { "error": "bad_password" }
			if not user.check_ip(client_address):
				return { "error": "ip" }
		else:
			print("new user:", args['name'])
			for cuss in ILLEGAL_WORDS:
				if cuss in args['name'].lower():
					return None
			if args['name'].lower() in ILLEGAL_USERS:
				return { "error": "illegal" }
			else:
				user = self.user_new (args)
		sessionid = self.session_new (user)
		print("created sessionid:", sessionid)
		return { "session": sessionid }

	def api_game_new (self, args):
		# ("name","capacity","rounds","private","password",),
		game = self.game_from_name (args['username'])
		if args['username'] is None:
			return { "error": "empty" }
		elif game is not None:
			game.flush()
			if len(game.active) != 0:
				return { "error": "dupe" }
			else:
				game.restart ()
				args['startdate'] = now ()
				game.startdate = now ()
				args['lastdate'] = now ()
				game.lastdate = now ()
				return self.api_game_edit (args)
		path = sanitize_url(args['username'])
		if len(path) == 0:
			return { "error": "url" }
		elif path in ILLEGAL_ROOMS:
			return { "error": "illegal" }
		else:
			for cuss in ILLEGAL_WORDS:
				if cuss in path:
					return { "error": "illegal" }
			args['path'] = path
		if args['capacity'] is None:
			args['capacity'] = ROOM_CAPACITY
		if args['goal'] is None:
			args['goal'] = POINTS_TO_WIN
		if args['timer'] is None:
			args['timer'] = 30
		if args['private'] is None:
			args['private'] = 0
		if args['password'] is None:
			del args['password']
		args['startdate'] = now()
		args['lastdate'] = now()
		row = DB.game_new(args)
		self.games[row[2].lower()] = Game (row)
		return { 'path': path }

	def api_game_newgame (self, args={}):
		fruit = ""
		while True:
			fruit = random.choice(FRUITS)
			if fruit in Pomme.games:
				game = Pomme.games[fruit]
				game.flush()
				if len(game.active) == 0:
					return { 'path': game.path }
			else:
				break
		path = sanitize_url(fruit)
		argz = {
			'name': fruit,
			'path': path,
			'avatar': config.FRUIT_URI_BASE + fruit + ".png",
			'capacity': ROOM_CAPACITY,
			'goal': POINTS_TO_WIN,
			'timer': 20,
			'private': 0,
			'startdate': now(),
			'lastdate': now(),
			}
		row = DB.game_new(argz)
		game = Game (row)
		self.games[path] = game
		return { 'path': path }

	def api_game_edit (self, args):
		game = self.game_from_name (args['username'])
		if game is None:
			return { "error": "empty" }

		# TODO: add ops here
		if len(game.active) > 0 and (game.userid != args['user'].id and not args['user'].is_admin ()):
			return { "error": "forbidden" }

		if args['capacity'] is None:
			args['capacity'] = ROOM_CAPACITY
		if args['goal'] is None:
			args['goal'] = POINTS_TO_WIN
		if args['timer'] is None:
			args['timer'] = 30
		if args['private'] is None:
			args['private'] = 0
		if args['password'] is None or len(args['password']) == 0:
			args['password'] = None

#		if args['bg'] is None or args['bg'][:4] != "http":
#			args['bg'] = ""
#		else:
#			args['bg'] = sanitize_html (args['bg'])
#			game.bg = args['bg']

#		if args['avatar'] is None or args['avatar'][:4] != "http":
#			args['avatar'] = ""
#		else:
#			args['avatar'] = sanitize_html (args['avatar'])
#			game.avatar= args['avatar']

#		if args['title'] is not None:
#			game.name = sanitize_html (args['title'])

#		del args['username']
#		args['username'] = sanitize_html(args['title'])

		path = sanitize_url(args['username'])

		game.goal = args['goal']
		game.private = args['private']
		game.capacity = args['capacity']
		game.password = args['password']
#		DB.game_edit (args, game.id)

		return { 'path': path }

	def find_an_active_game (self, skip):
		if skip is None:
			skip = ""
		for name,game in self.games.iteritems():
			if name != "bigapple" and name != skip and not game.private:
				game.flush()
				if len(game.active) > 0 and len(game.active) < 8:
					return game.path
		newgame = self.api_game_newgame()
		return newgame['path']
	def api_game_active (self, args):
		path = self.find_an_active_game(args['skip'])
		return { 'path': path }
	def api_game_list (self, args):
		curtime = now ()
		if curtime < self.last_update + LIST_UPDATE_TIME:
			return { 'games': self.active_games, 'username': args['username'], 'score': args['user'].score, 'combos': [x for x in self.combos], }
		self.last_update = curtime
		updated_games = {}
		for name,game in self.games.iteritems():
			if len(game.active) < 1 and game.id != 1:
				continue
			updated_games[name] = game.report (curtime)
		self.active_games = updated_games
		return { 'games': self.active_games, 'username': args['username'], 'score': args['user'].score, 'combos': [x for x in self.combos], }

	def api_combo_game (self, args):
		game = self.game_from_name(args['username'])
		if game is None:
			return []
		return DB.combo_list_game (game.id, args['start'])
	def api_combo_user (self, args):
		if args['username'] is None:
			return []
		user = self.user_from_username (args['username'])
		if user is None:
			return []
		return DB.combo_list_user (user.id, args['start'])
	def api_combo_judge (self, args):
		if args['username'] is None:
			return []
		user = self.user_from_username (args['username'])
		if user is None:
			return []
		return DB.combo_list_judge (user.id, args['start'])
	def api_like_add (self, args):
		if is_number(args['comboid']):
			DB.like_add(args['userid'], args['comboid'])
			return { "status": "ok" }
		return { "status": "error" }
	def api_like_remove (self, args):
		if is_number(args['comboid']):
			DB.like_remove(args['userid'], args['comboid'])
			return { "status": "ok" }
		return { "status": "error" }
	def api_user_count (self, args):
		if self.last_got_active < now() - 10:
			self.last_active_count = self.get_active_user_count()
			self.last_got_active = now()
		return { "count": self.last_active_count }
	def get_active_user_count (self):
		users = {}
		for name,game in Pomme.games.iteritems():
			if len(game.active) < 1 and game.id != 1:
				continue
			game.flush()
			for user in game.active:
				users[user] = True
		return len(users)

Pomme = PommeDatabase ()

class PommeHandler (BaseHTTPRequestHandler):
	def __init__ (self, request, client_address, server):
		self._client_address = client_address
		BaseHTTPRequestHandler.__init__(self, request, client_address, server)

	def log_request (a=None, b=None):
		return
	def send_cors_headers (self):
		self.send_header ('Access-Control-Allow-Origin', '*')
		self.send_header ('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
		self.send_header ('Access-Control-Allow-Headers', 'x-requested-with')
		self.send_header ('Access-Control-Max-Age', '3628800')

	def do_OPTIONS (self):
		self.send_response(200)
		self.send_cors_headers ()
		self.send_header ('Content-type', 'text/plain; charset=utf-8')
		self.end_headers()

	def do_POST (self):
		if "poll" not in self.path:
			print('path: ' + self.path)
		#	print('client: ' + repr (self.client_address))

		self.send_response(200)
		self.send_cors_headers ()
		self.send_header ('Content-type', 'text/plain; charset=utf-8')
		self.end_headers()

		args = {}
		if self.path not in FORM_FIELDS:
			self.api_error ("no such form API")
		form = {}
		try:
			form = cgi.FieldStorage(
				fp=self.rfile,
				headers=self.headers,
				environ={'REQUEST_METHOD': 'POST',
					'CONTENT_TYPE': self.headers['Content-Type'],
					})
		except:
			pass
		for field in FORM_FIELDS[self.path]:
			try:
				args[field] = form[field].value
			except:
				args[field] = None

		if 'session' in form:
			user = Pomme.user_from_session(form['session'].value, self._client_address)
			if user is not None:
				args['user'] = user
				args['username'] = user.username
				args['userid'] = user.id
			else:
				args['user'] = None
				args['username'] = ""
				args['userid'] = 0
		else:
			args['user'] = None
			args['username'] = ""
			args['userid'] = 0
		if 'game' in args:
			# if args['game'] == "lobby":
			# 	return self.lobby_api (args)
			game = Pomme.game_from_name(args['game'])
			if args['user'] is None:
				self.api_error ("notloggedin")
			elif game is not None:
				self.game_api (game, args)
			else:
				self.api_error ("game does not exist "+str(args['game']))
		else:
			self.bureau_api (args)

	def bureau_api (self, args):
		PRIVATE_API = {
			"/game/newgame": Pomme.api_game_newgame,
			"/game/active": Pomme.api_game_active,
			"/game/new": Pomme.api_game_new,
			"/game/list": Pomme.api_game_list,
			"/game/edit": Pomme.api_game_edit,
			"/user/edit": Pomme.api_user_edit,
			"/like/add": Pomme.api_like_add,
			"/like/remove": Pomme.api_like_remove,
			}
		PUBLIC_API = {
			# "/user/login": Pomme.api_login,
			"/user/view": Pomme.api_user_view,
			"/combo/user": Pomme.api_combo_user,
			"/combo/judge": Pomme.api_combo_judge,
			"/combo/game": Pomme.api_combo_game,
			"/pomme/count": Pomme.api_user_count,
			}
		print(self.path)
		print(args)
		if self.path == "/user/login":
			self.json ( Pomme.api_login(args, self._client_address) )
		elif self.path in PRIVATE_API:
			if args['user'] is not None:
				self.json ( PRIVATE_API.get(self.path)(args) )
			else:
				self.api_error ("private api, not logged in")
		elif self.path in PUBLIC_API:
			self.json ( PUBLIC_API.get(self.path)(args) )
		else:
			self.api_error ("no such bureau API")

	def lobby_api (self, args):
		LOBBY_API = {
			"/lobby/poll": lobby.api_poll,
			"/lobby/send": lobby.api_send,
			}
		if self.path in LOBBY_API:
			self.json ( LOBBY_API.get(self.path)(args) )
		else:
			self.api_error ("no such game API")
		
	def game_api (self, game, args):
		GAME_API = {
			"/game/view": game.api_view,
			"/game/join": game.api_join,
			"/game/poll": game.api_poll,
			"/game/send": game.api_send,
			"/game/bet": game.api_bet,
			"/game/judge": game.api_judge,
			"/game/rejoin": game.api_rejoin,
			"/game/skip": game.api_skip,
			"/game/pass": game.api_pass,
			"/game/vote": game.api_vote,
			"/game/restart": game.api_restart,
			"/game/deal": game.api_deal,
			"/game/discard": game.api_discard,
			}
		if self.path in GAME_API:
			self.json ( GAME_API.get(self.path)(args) )
		else:
			self.api_error ("no such game API")

	def do_GET (self):
		if self.path == "/reload":
			self.reload ()
		elif self.path == "/stats":
			self.stats ()
		else:
			return self.do_OPTIONS ()
	def reload (self):
		self.send_response(200)
		self.send_cors_headers ()
		self.send_header ('Content-type', 'text/html; charset=utf-8')
		self.end_headers()
		self.wfile.write("RELOADING DECKS")
		Pomme.reload_decks ()

	def stats (self):
		self.send_response(200)
		self.send_cors_headers ()
		self.send_header ('Content-type', 'text/html; charset=utf-8')
		self.end_headers()
		self.wfile.write('<meta name="viewport" content = "width=device-width">')
		self.wfile.write("<div style='white-space: pre-line; font-family: Lucida Sans Unicode, Lucida Grande, sans-serif; font-size: 13px'>")
		
		tt = time.gmtime( now() - int(START_TIME) )
		ts = ""
		if tt[0] > 1970:
			ts += "%dy " % (tt[0] - 1970)
		if ts or int(tt[7]) - 1 > 0:
			ts += "%dd " % (tt[7] - 1)
		if ts or tt[3] > 0:
			ts += "%dh" % tt[3]
		if ts or tt[4] > 0:
			ts += "%dm" % tt[4]
		if ts or tt[5] > 0:
			ts += "%ds" % tt[5]

		self.wfile.write("<b>uptime</b> %s\n\n" % ts)

		pommeCount = DB.combo_count ()
		pommesToday = DB.combos_today ()
		userCount = DB.user_count ()
		usersToday = DB.users_today ()
		newUsersTodayCount = DB.users_new_today_count ()
		#newUsersToday = DB.users_new_today ()
		gameCount = DB.game_count ()

		self.wfile.write ("<b>pommes</b> %d (%d today)\n" % (pommeCount, pommesToday))
		#self.wfile.write ("<b>users</b> %d (%d today, %d new)\n" % (userCount, usersToday, len(newUsersToday)))
		self.wfile.write ("<b>users</b> %d (%d today, %d new)\n" % (userCount, usersToday, newUsersTodayCount))
		self.wfile.write ("<b>games</b> %d\n" % (gameCount))
		self.wfile.write ("\n")

		users = {}
		games = []
		self.wfile.write ("<b>active games</b>\n")
		for name,game in Pomme.games.iteritems():
			if len(game.active) < 2:
				continue
			games.append(name)
			self.wfile.write('<a href="http://pomme.us/%s">%s</a> ' % (name, name))
			if game.private:
				self.wfile.write('(%d, private) ' % len(game.active))
			else:
				self.wfile.write('(%d) ' % len(game.active))
			for user in game.active:
				users[user] = True
		self.wfile.write ("\n\n")

		self.wfile.write ("<b>online now</b> (" + str(len(users)) + " users)\n")
		self.wfile.write (" ".join(['<a href="http://pomme.us/profile/%s">%s</a>' % (x,x) for x in sorted(users.keys(), key=str.lower)]))
		self.wfile.write ("\n\n")

		#if newUsersToday:
		#	self.wfile.write ("<b>new today</b>\n")
		#	self.wfile.write (" ".join(['<a href="http://pomme.us/profile/%s">%s</a>' % (x,x) for x in sorted(newUsersToday, key=str.lower)]))
		#	self.wfile.write ("\n\n")

		#for key in sorted(game.__dict__.keys()):
		#	if key == 'players':
		#		self.wfile.write("players =>\n")
		#		for player in sorted(game.players.values(), key=lambda x: x.score, reverse=True):
		#			self.wfile.write("            " +repr(player.report()) + "\n")
		#	elif key == 'countdown':
		#		self.wfile.write("countdown => %d\n" % (game.countdown - now()) )
		#	else:
		#		self.wfile.write("%s => %s\n" % (str(key), repr(game.__dict__[key])))

	def json (self, data):
		self.wfile.write (json.dumps(data))
	def api_error (self, error):
		print("***", self.path)
		print("error:", error)
		self.json ({ 'error': error })


f = open ('pid_' + str(config.SERVER_PORT), 'w')
f.write(str(os.getpid()))
f.close()

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
	pass

if __name__ == '__main__':
	while True:
		try:
			print("starting server", config.SERVER_HOST, config.SERVER_PORT)
			server = ThreadedHTTPServer((config.SERVER_HOST, config.SERVER_PORT), PommeHandler)
			print('Listening on', config.SERVER_HOST, config.SERVER_PORT, '...')
			print('PID', os.getpid())
			server.serve_forever()
		except KeyboardInterrupt:
			# seep for two seconds to allow program to really quit.
			time.sleep(2)
			print('^C')
			server.socket.close()
		except:
			print("Unexpected error:", sys.exc_info()[0])
			raise

