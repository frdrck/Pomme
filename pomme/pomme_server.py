#!/opt/python2.6/bin/python

from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
from SocketServer import ThreadingMixIn
import os
import _mysql_exceptions
import cgi
import random
import operator
import simplejson as json
from collections import deque
from fruits import FRUITS

import db, config
from util import *

from cards import Cards
from deck import Deck
from game import Game
# TODO(geluso): find out if lobby is being used
#from lobby import Lobby
from user import User

LIST_UPDATE_TIME = 10
COMBO_LOG_SIZE = 20

FORM_FIELDS = {
  "/user/login":   ("name","password",),
  "/user/logout":   ("game","name",),
  "/user/view":   ("name",),
  "/user/edit":   ("name","email","password","avatar","bio","facebook","twitter","tumblr",),
  "/game/new":   ("name","capacity","goal","private","password","timer",),
  "/game/edit":   ("name","capacity","goal","private","password","bg","timer","avatar","title",),
  "/game/list":   (),
  "/game/view":   ("game",),
  "/game/join":   ("game","last",),
  "/game/poll":   ("game","last",),
  "/game/send":   ("game","last","msg",),
  "/game/bet":   ("game","card","deck",),
  "/game/judge":   ("game","card","deck",),
  "/game/vote":   ("game","card","deck",),
  "/game/skip":   ("game","skip",),
  "/game/rejoin":   ("game",),
  "/game/pass":   ("game",),
  "/game/restart": ("game",),
  "/game/deal":   ("game",),
  "/game/discard": ("game","cards"),
  "/combo/user":   ("name","start",),
  "/combo/judge":  ("name","start",),
  "/combo/game":    ("name","start",),
  "/like/add":     ("comboid",),
  "/like/remove":  ("comboid",),
  "/pomme/count":  (),
  "/game/newgame": (),
  "/game/active" : ("skip",),
  }

ILLEGAL_ROOMS = "undefined null true false none css game img js lobby mp3 report plesk-stat static swf admin".split(" ")
ILLEGAL_WORDS = "fuck shit cunt nigg fag cocksuck".split(" ")
ILLEGAL_USERS = "undefined null true false none admin administrator sysadmin sysop".split(" ")

START_TIME = now()

class PommeDatabase:
  def __init__(self, db):
    self.db = db
    self.master_cards = Cards()
    self.users = {}
    self.usernames = {}
    self.sessions = {}
    self.games = {}
    self.active_games = {}
    self.last_update = 0
    self.load()
    self.combos = deque()
    self.last_active_count = 0
    self.last_got_active = 0
    pass

  def load(self):
    user_rows = self.db.user_list_all()
    for row in user_rows:
      self.users[row[0]] = User(row)
      if row[1].lower() not in self.usernames:
        self.usernames[row[1].lower()] = row[0]
    session_rows = self.db.session_list_all()
    for row in session_rows:
      self.sessions[row[0]] = row[1]
    game_rows = self.db.game_list_all()
    for row in game_rows:
      if row[2] == None:
        continue
      self.games[row[2].lower()] = Game(row, self.db, self.master_cards)

  def reload_decks(self):
    self.master_cards.load()
    for game in self.games.values():
      game.player_deck = Deck(self.master_cards.player)
      game.main_deck = Deck(self.master_cards.main)

  def user_new(self, args):
    params = {
      'username': args['name'],
      'joindate': now(),
      'seendate': now(),
      }
    rec = self.db.user_new(params)
    if rec is not None:
      self.users[rec[0]] = User(rec)
      self.usernames[rec[1].lower()] = rec[0]
      return self.users[rec[0]]
    return None

  def session_new(self, user):
    if user is None:
      return False
    sessionid = generate_hash(user.username)
    self.db.session_new(sessionid, user.id)
    self.sessions[sessionid] = user.id
    return sessionid

  def user_from_username(self, username):
    try:
      return self.users[self.usernames[username.lower()]]
    except:
      return None

  def user_from_session(self, sessionid, client_address):
    try:
      user = self.users[self.sessions[sessionid]]
      #if not user.check_ip(client_address):
      #  return None
      return user
    except:
      return None

  def game_from_name(self, name):
    try:
      return self.games[name.lower()]
    except:
      return None

  def api_user_view(self, args):
    user = self.user_from_username(args['name'])
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

  def api_user_edit(self, args):
    user = self.user_from_username(args['name'])
    if user is None:
      return { "error": "no user" }
    if user.id != args['user'].id and not args['user'].is_admin():
      return { "error": "forbidden" }
    fields = "email avatar bio facebook twitter tumblr".split(" ")
    data = {}
    for field in fields:
      if args[field] is not None:
        data[field] = args[field]
    if args['password'] is not None and len(args['password']):
      data['password'] = args['password']
      user.password = args['password']
    self.db.user_edit(data, user.id)
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

  def win_round(self, game, username, judgename, playercard, matchcard):
    user = self.user_from_username(username)
    judge = self.user_from_username(judgename)
    userid = 0
    judgeid = 0
    if user is not None:
      userid = user.id
    if judge is not None:
      judgeid = judge.id
    params = {
      'date': now(),
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
    comboid = self.db.combo_new(params)
    if judge is not None:
      self.db.like_add(judgeid, comboid, userid)
    if user is not None:
      user.score += 1
    # if game.free != 1:
    self.combos.append((playercard, matchcard, comboid))
    if len(self.combos) > COMBO_LOG_SIZE:
      self.combos.popleft()
    return comboid

  def win_game(self, game, username):
    if game.goal == 0:
      return
    if len(game.active) < 3:
      return
    user = self.user_from_username(username)
    if game.goal == 10:
      user.wins_10 += 1
      self.db.user_win_game(user.id, game.goal)
    elif game.goal == 20:
      user.wins_20 += 1
      self.db.user_win_game(user.id, game.goal)
    elif game.goal == 30:
      user.wins_30 += 1
      self.db.user_win_game(user.id, game.goal)

  def api_login(self, args, client_address):
    if args['name'] is None or args['name'] == "" or args['name'] == " ":
      return { "error": "empty" }
    user = self.user_from_username(args['name'])

    if user is not None:
      print "login attempt:", args['name']
      if len(user.password):
        if args['password'] is None:
          return { "error": "password" }
        elif user.password != args['password']:
          return { "error": "bad_password" }
      if not user.check_ip(client_address):
        return { "error": "ip" }
    else:
      print "new user:", args['name']
      for cuss in ILLEGAL_WORDS:
        if cuss in args['name'].lower():
          return None
      if args['name'].lower() in ILLEGAL_USERS:
        return { "error": "illegal" }
      else:
        user = self.user_new(args)
    sessionid = self.session_new(user)
    print "created sessionid:", sessionid
    return { "session": sessionid }

  def api_game_new(self, args):
    # ("name","capacity","rounds","private","password",),
    game = self.game_from_name(args['name'])
    if args['name'] is None:
      return { "error": "empty" }
    elif game is not None:
      game.flush()
      if len(game.active) != 0:
        return { "error": "dupe" }
      else:
        game.restart()
        args['startdate'] = now()
        game.startdate = now()
        args['lastdate'] = now()
        game.lastdate = now()
        return self.api_game_edit(args)
    path = sanitize_url(args['name'])
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
      args['capacity'] = 10
    if args['goal'] is None:
      args['goal'] = 10
    if args['timer'] is None:
      args['timer'] = 30
    if args['private'] is None:
      args['private'] = 0
    if args['password'] is None:
      del args['password']
    args['startdate'] = now()
    args['lastdate'] = now()
    row = self.db.game_new(args)
    self.games[row[2].lower()] = Game(row, self.db, self.master_cards)
    return { 'path': path }

  def api_game_newgame(self, args={}):
    fruit = ""
    while True:
      fruit = random.choice(FRUITS)
      if fruit in self.games:
        game = self.games[fruit]
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
      'capacity': 10,
      'goal': 20,
      'timer': 20,
      'private': 0,
      'startdate': now(),
      'lastdate': now(),
      }
    row = self.db.game_new(argz)
    game = Game(row, self.db, self.master_cards)
    self.games[path] = game
    return { 'path': path }

  def api_game_edit(self, args):
    game = self.game_from_name(args['name'])
    if game is None:
      return { "error": "empty" }

    # TODO: add ops here
    if len(game.active) > 0 and (game.userid != args['user'].id and not args['user'].is_admin()):
      return { "error": "forbidden" }

    if args['capacity'] is None:
      args['capacity'] = 10
    if args['goal'] is None:
      args['goal'] = 10
    if args['timer'] is None:
      args['timer'] = 30
    if args['private'] is None:
      args['private'] = 0
    if args['password'] is None or len(args['password']) == 0:
      args['password'] = None

#    if args['bg'] is None or args['bg'][:4] != "http":
#      args['bg'] = ""
#    else:
#      args['bg'] = sanitize_html(args['bg'])
#      game.bg = args['bg']

#    if args['avatar'] is None or args['avatar'][:4] != "http":
#      args['avatar'] = ""
#    else:
#      args['avatar'] = sanitize_html(args['avatar'])
#      game.avatar= args['avatar']

#    if args['title'] is not None:
#      game.name = sanitize_html(args['title'])

#    del args['name']
#    args['name'] = sanitize_html(args['title'])

    path = sanitize_url(args['name'])

    game.goal = args['goal']
    game.private = args['private']
    game.capacity = args['capacity']
    game.password = args['password']
#    self.db.game_edit(args, game.id)

    return { 'path': path }

  def find_an_active_game(self, skip):
    if skip is None:
      skip = ""
    for name,game in self.games.iteritems():
      if name != "bigapple" and name != skip and not game.private:
        game.flush()
        if len(game.active) > 0 and len(game.active) < 8:
          return game.path
    newgame = self.api_game_newgame()
    return newgame['path']

  def api_game_active(self, args):
    path = self.find_an_active_game(args['skip'])
    return { 'path': path }

  def api_game_list(self, args):
    curtime = now()
    if curtime < self.last_update + LIST_UPDATE_TIME:
      return { 'games': self.active_games, 'username': args['username'], 'score': args['user'].score, 'combos': [x for x in self.combos], }
    self.last_update = curtime
    updated_games = {}
    for name,game in self.games.iteritems():
      if len(game.active) < 1 and game.id != 1:
        continue
      updated_games[name] = game.report(curtime)
    self.active_games = updated_games
    return { 'games': self.active_games, 'username': args['username'], 'score': args['user'].score, 'combos': [x for x in self.combos], }

  def api_combo_game(self, args):
    game = self.game_from_name(args['name'])
    if game is None:
      return []
    return self.db.combo_list_game(game.id, args['start'])

  def api_combo_user(self, args):
    if args['name'] is None:
      return []
    user = self.user_from_username(args['name'])
    if user is None:
      return []
    return self.db.combo_list_user(user.id, args['start'])

  def api_combo_judge(self, args):
    if args['name'] is None:
      return []
    user = self.user_from_username(args['name'])
    if user is None:
      return []
    return self.db.combo_list_judge(user.id, args['start'])

  def api_like_add(self, args):
    if is_number(args['comboid']):
      self.db.like_add(args['userid'], args['comboid'])
      return { "status": "ok" }
    return { "status": "error" }

  def api_like_remove(self, args):
    if is_number(args['comboid']):
      self.db.like_remove(args['userid'], args['comboid'])
      return { "status": "ok" }
    return { "status": "error" }

  def api_user_count(self, args):
    if self.last_got_active < now() - 10:
      self.last_active_count = self.get_active_user_count()
      self.last_got_active = now()
    return { "count": self.last_active_count }

  def get_active_user_count(self):
    users = {}
    for name,game in self.games.iteritems():
      if len(game.active) < 1 and game.id != 1:
        continue
      game.flush()
      for user in game.active:
        users[user] = True
    return len(users)


class PommeHandler(BaseHTTPRequestHandler):
  def __init__(self, request, client_address, server):
    self._client_address = client_address
    BaseHTTPRequestHandler.__init__(self, request, client_address, server)

  def log_request(self, a=None, b=None):
    return

  def send_cors_headers(self):
    self.send_header('Access-Control-Allow-Origin', '*')
    self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    self.send_header('Access-Control-Allow-Headers', 'x-requested-with')
    self.send_header('Access-Control-Max-Age', '3628800')

  def do_OPTIONS(self):
    self.send_response(200)
    self.send_cors_headers()
    self.send_header('Content-type', 'text/plain; charset=utf-8')
    self.end_headers()

  def do_POST(self):
    if "poll" not in self.path:
      print 'path: ' + self.path
    #  print 'client: ' + repr(self.client_address)

    self.send_response(200)
    self.send_cors_headers()
    self.send_header('Content-type', 'text/plain; charset=utf-8')
    self.end_headers()

    args = {}
    if self.path not in FORM_FIELDS:
      self.api_error("no such form API")
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
      user = self.server.pomme.user_from_session(form['session'].value, self._client_address)
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
      #   return self.lobby_api(args)
      game = self.server.pomme.game_from_name(args['game'])
      if args['user'] is None:
        self.api_error("notloggedin")
      elif game is not None:
        self.game_api(game, args)
      else:
        self.api_error("game does not exist "+args['game'])
    else:
      self.bureau_api(args)

  def bureau_api(self, args):
    PRIVATE_API = {
      "/game/newgame": self.server.pomme.api_game_newgame,
      "/game/active": self.server.pomme.api_game_active,
      "/game/new": self.server.pomme.api_game_new,
      "/game/list": self.server.pomme.api_game_list,
      "/game/edit": self.server.pomme.api_game_edit,
      "/user/edit": self.server.pomme.api_user_edit,
      "/like/add": self.server.pomme.api_like_add,
      "/like/remove": self.server.pomme.api_like_remove,
      }
    PUBLIC_API = {
      # "/user/login": self.server.pomme.api_login,
      "/user/view": self.server.pomme.api_user_view,
      "/combo/user": self.server.pomme.api_combo_user,
      "/combo/judge": self.server.pomme.api_combo_judge,
      "/combo/game": self.server.pomme.api_combo_game,
      "/pomme/count": self.server.pomme.api_user_count,
      }
    print self.path
    print args
    if self.path == "/user/login":
      self.json( self.server.pomme.api_login(args, self._client_address) )
    elif self.path in PRIVATE_API:
      if args['user'] is not None:
        self.json( PRIVATE_API.get(self.path)(args) )
      else:
        self.api_error("private api, not logged in")
    elif self.path in PUBLIC_API:
      self.json( PUBLIC_API.get(self.path)(args) )
    else:
      self.api_error("no such bureau API")

  '''
  def lobby_api(self, args):
    LOBBY_API = {
      "/lobby/poll": lobby.api_poll,
      "/lobby/send": lobby.api_send,
      }
    if self.path in LOBBY_API:
      self.json( LOBBY_API.get(self.path)(args) )
    else:
      self.api_error("no such game API")
  '''
    
  def game_api(self, game, args):
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
      self.json( GAME_API.get(self.path)(args) )
    else:
      self.api_error("no such game API")

  def do_GET(self):
    if self.path == "/reload":
      self.reload()
    elif self.path == "/stats":
      self.stats()
    else:
      return self.do_OPTIONS()

  def reload(self):
    self.send_response(200)
    self.send_cors_headers()
    self.send_header('Content-type', 'text/html; charset=utf-8')
    self.end_headers()
    self.wfile.write("RELOADING DECKS")
    self.server.pomme.reload_decks()

  def stats(self):
    self.send_response(200)
    self.send_cors_headers()
    self.send_header('Content-type', 'text/html; charset=utf-8')
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

    pommeCount = self.server.pomme.db.combo_count()
    pommesToday = self.server.pomme.db.combos_today()
    userCount = self.server.pomme.db.user_count()
    usersToday = self.server.pomme.db.users_today()
    newUsersTodayCount = self.server.pomme.db.users_new_today_count()
    #newUsersToday = self.server.pomme.db.users_new_today()
    gameCount = self.server.pomme.db.game_count()

    self.wfile.write("<b>pommes</b> %d (%d today)\n" % (pommeCount, pommesToday))
    #self.wfile.write("<b>users</b> %d (%d today, %d new)\n" % (userCount, usersToday, len(newUsersToday)))
    self.wfile.write("<b>users</b> %d (%d today, %d new)\n" % (userCount, usersToday, newUsersTodayCount))
    self.wfile.write("<b>games</b> %d\n" % (gameCount))
    self.wfile.write("\n")

    users = {}
    games = []
    self.wfile.write("<b>active games</b>\n")
    for name,game in self.server.pomme.games.iteritems():
      if len(game.active) < 2:
        continue
      games.append(name)
      self.wfile.write('<a href="%s/%s">%s</a> ' % (config.SERVER_HOST, name, name))
      if game.private:
        self.wfile.write('(%d, private) ' % len(game.active))
      else:
        self.wfile.write('(%d) ' % len(game.active))
      for user in game.active:
        users[user] = True
    self.wfile.write("\n\n")

    self.wfile.write("<b>online now</b> (" + str(len(users)) + " users)\n")
    self.wfile.write(" ".join(['<a href="%s/profile/%s">%s</a>' % (config.SERVER_HOST, x, x) for x in sorted(users.keys(), key=str.lower)]))
    self.wfile.write("\n\n")

    #if newUsersToday:
    #  self.wfile.write("<b>new today</b>\n")
    #  self.wfile.write(" ".join(['<a href="http://pomme.us/profile/%s">%s</a>' % (x,x) for x in sorted(newUsersToday, key=str.lower)]))
    #  self.wfile.write("\n\n")

    #for key in sorted(game.__dict__.keys()):
    #  if key == 'players':
    #    self.wfile.write("players =>\n")
    #    for player in sorted(game.players.values(), key=lambda x: x.score, reverse=True):
    #      self.wfile.write("            " +repr(player.report()) + "\n")
    #  elif key == 'countdown':
    #    self.wfile.write("countdown => %d\n" % (game.countdown - now()) )
    #  else:
    #    self.wfile.write("%s => %s\n" % (str(key), repr(game.__dict__[key])))

  def json(self, data):
    self.wfile.write(json.dumps(data))

  def api_error(self, error):
    print "***", self.path
    print "error:", error
    self.json({ 'error': error })

class ThreadedHTTPServer(HTTPServer, ThreadingMixIn):
  def register_pomme(self, p):
    self.pomme = p

if __name__ == '__main__':
  try:
    print 'connecting to database %s@%s...' % (config.MYSQL_USER, config.MYSQL_HOST)
    database = db.db()
    pomme = PommeDatabase(database)
    #lobby = Lobby(pomme)

    #TODO(geluso): ask Jules why we are writing process IDs?
    f = open('pid_' + str(config.SERVER_PORT), 'w')
    f.write(str(os.getpid()))
    f.close()

    server = ThreadedHTTPServer((config.SERVER_HOST, config.SERVER_PORT), PommeHandler)
    server.register_pomme(pomme)
    print 'Listening on %s:%d...' % (config.SERVER_HOST, config.SERVER_PORT)
    print 'PID', os.getpid()
    server.serve_forever()
  except KeyboardInterrupt:
    print '^C'
    server.socket.close()

