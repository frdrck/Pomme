from collections import deque
from util import now

LOBBY_IDLE_TIME = 5
GAME_IDLE_TIME = 10
CHAT_LOG_SIZE = 50

class Lobby:
  def __init__(self, pomme):
    self.pomme = pomme
    self.players = {}
    self.chatid = 0
    self.chat = deque()
    self.last_report = now()

  def report_players(self, args):
    curtime = now()
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
    return self.players.keys()

  def api_join(self):
    pass
    #api = Pomme.api_game_list
    #for name in api.games:
    #  if len(api.games[name]['players']) < 

  # TODO(geluso): Is any of this actually used?
  '''
  def api_poll(self, args, resp={}):
    resp['players'] = self.report_players(args)
    resp['chat'] = []
    for elem in self.chat:
      if last <= elem[1]:
        resp['chat'].append(elem)

  def api_send(self, args):
    # self.rejoin(args['username'])
    if len(args['msg']) == 0:
      return self.api_poll(args)
    self.chatid += 1
    msg = (self.chatid, now(), args['username'], args['msg'])
    self.chat.append(msg)
    if len(self.chat) > CHAT_LOG_SIZE:
      self.chat.popleft()
    return self.api_poll(args)

  def game_new(self):
    # check current size of the feeding room
     # if it's > 6, make/lookup a new room
    # return the NAME of the room we want to feed into
    fruit = random.choice(FRUITS)
    if fruit in self.pomme.games:
      return { 'path': path }
    game = {
      'name': fruit,
      'path': fruit,
      'avatar': config.FRUIT_URI_BASE + fruit + ".png",
      'capacity': 10,
      'goal': 10,
      'timer': 20,
      'private': 0,
      'startdate': now(),
      'lastdate': now(),
      }
    row = self.pomme.db.game_new(args)
    return { 'path': path }
  '''
