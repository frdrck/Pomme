from collections import deque
from deck import Deck
from player import Player
from util import now
import operator

STATE_IDLE = 0
STATE_SETUP = 1
STATE_BET = 2
STATE_PICKED = 3
STATE_JUDGE = 4
STATE_VOTE = 5
STATE_WIN = 6
STATE_GAMEOVER = 7

HAND_SIZE = 5
IDLE_THRESHOLD = 3
CHAT_LOG_SIZE = 50
GAME_IDLE_TIME = 10

class Game:
  def __init__(self, row, db, master_cards):
    # 0 id  1 name  2 path  3 goal  4 capacity  5 free  6 startdate  7 lastdate
    # 8 userid  9 username  10 bg  11 private  12 password  13 timer  14 avatar
    self.db = db
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
    self.chat = deque()
    self.player_deck = Deck(master_cards.player)
    self.main_deck = Deck(master_cards.main)
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
    self.settingsUpdated = now()
    self.settingsUpdatedBy = "no one"
    self.matches = []
    self.winner = ""
    self.win_image = ""
    self.win_combo = 0
    self.judge = ""
    self.image = ""
    self.next_image = self.main_deck.card()
    self.round = 0
    self.nextgame = 0
    self.countdown = 0
    self.rounds = []
    self.state = STATE_IDLE
    self.setup = False
    self.restarting = False

  def restart(self):
    # self.player_deck.reset()
    # self.main_deck.reset()
    for player in self.players.values():
      player.reset()
    self.restarting = True
    self.round = 0

  def api_restart(self, args):
    ## DEPRECATED
    if args['username'] not in self.votes:
      self.votes[args['username']] = True
    if len(self.votes) > len(self.active) / 2:
      self.restart()
    return {}

  def api_deal(self, args):
    if self.state == STATE_GAMEOVER:
      player = self.players[args['username']]
      player.cards = self.player_deck.hand(HAND_SIZE)
      return { "cards": player.cards }
    return {}

  def api_discard(self, args):
    player = self.players[args['username']]
    cards = args['cards'].split(",")

    if player.discards == 0:
      return { "discards": -1 }
    player.discards -= 1
  
    for card in cards:
      new_card = self.player_deck.card()
      if card in player.cards:
        del player.cards[player.cards.index(card)]
        player.cards.append(new_card)
    return {
      "cards": player.cards,
      "discards": player.discards,
    }

  def report(self, curtime=now()):
    i = 0
    players = []
    timed_out = []
    for name in self.active:
      player = self.players[name]
      if player.lastseen < curtime - GAME_IDLE_TIME:
        continue 
      rec = player.report()
      players.append(rec)
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

  def new_round(self):
    print "___________"
    print "NEW ROUND"
    if len(self.active) - len(self.skipped) < 2:
      self.state = STATE_IDLE
      self.judge = ""
      return
    self.bets = {}
    self.betters = []
    self.round += 1
    self.image = self.next_image
    self.next_image = self.main_deck.card()
    self.win_image = ""
    self.win_combo = 0
    self.winner = ""
    self.countdown = now() + self.timer
    self.state = STATE_BET
    self.pick_judge()

  def pick_judge(self):
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

  def update(self, args):
    active_count = len(self.active) - len(self.skipped)
    self.active_count = active_count
    if active_count < 2:
      self.state = STATE_IDLE
    if self.state == STATE_IDLE:
      if active_count > 1:
        self.restart()
        self.state = STATE_SETUP
        self.setup = False
    elif self.state == STATE_SETUP:
      if not self.setup:
        self.setup = True
        self.new_round()
    elif self.state == STATE_BET:
      timed_out = self.countdown < now()
      everyone_voted = len(self.betters) == active_count - 1 
      if everyone_voted or timed_out:
        if self.judge not in self.active or self.judge in self.skipped:
          self.countdown = now() + self.timer
          self.state = STATE_VOTE
        else:
          self.countdown = now() + self.timer
          self.state = STATE_JUDGE
        if timed_out:
          for name in self.active:
            if name not in self.bets:
              if name in self.idlers:
                self.idlers[name] += 1
              else:
                self.idlers[name] = 1
              if self.idlers[name] > IDLE_THRESHOLD:
                print "IDLE SKIPPING PLAYER", name
                self.skip(name)
        #  self.state = STATE_IDLE
      #if self.judge not in self.active or self.judge in self.skipped:
      #  self.pick_judge()
      if args['username'] == self.judge:
        return STATE_PICKED
      elif args['username'] in self.betters:
        return STATE_PICKED
    elif self.state == STATE_JUDGE:
      advancing = self.countdown < now()
      if advancing or self.judge in self.skipped or self.judge not in self.active:
        self.state = STATE_VOTE
        self.countdown = now() + self.timer
        self.votes = {}
        print "SWITCHING TO STATE_VOTE"
        if self.judge in self.idlers:
          self.idlers[self.judge] += 1
        if self.idlers[self.judge] > IDLE_THRESHOLD:
          self.skip(self.judge)
          print "IDLE SKIPPING JUDGE", self.judge
    elif self.state == STATE_VOTE:
      advancing = self.countdown < now()
      if advancing:
        self.tally()
    elif self.state == STATE_WIN:
      self.betters = []
      self.bets = {}
      if now() > self.nextgame:
        self.setup = False
        self.state = STATE_SETUP
    elif self.state == STATE_GAMEOVER:
      if now() > self.countdown:
        self.restart()
        self.setup = False
        self.state = STATE_SETUP
        self.countdown = now() + 3
    return self.state

  def flush(self):
    curtime = now()
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

  def report_players(self, args):
    curtime = now()
    players = []
    timed_out = []
    if args['username'] not in self.players:
      self.players[args['username']] = Player(self, args)
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
      rec = player.report()
      rec['skipped'] = name in self.skipped
      players.append(rec)
      i += 1
    for i in reversed(timed_out):
      del self.active[i]
    return players

  def api_view(self, args, resp={}):
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

  def check_if_room_is_inactive(self):
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

  def api_join(self, args):
    if len(self.active) >= self.capacity and args['username'] not in self.active:
      return {"error": "capacity"}
    if self.check_if_room_is_inactive():
      active_game = self.db.find_an_active_game()
      return {"error": "inactive", "redirect": "/" + active_game}

    self.rejoin(args['username'])
    self.db.user_seen(args['userid'])
    args['joined'] = True
    resp = self.api_poll(args)
    self.api_view(args, resp)

    player = self.players[args['username']]
    resp['cards'] = player.cards
    resp['webcams'] = player.webcams
    resp['discards'] = player.discards
    resp['username'] = args['username']
    resp['score'] = args['user'].score
    resp['lastdate'] = now() - self.lastdate
    return resp

  def api_rejoin(self, args):
    self.rejoin(args['username'])
    return {}

  def rejoin(self, name):
    if name in self.skipvotes:
      del self.skipvotes[name]
    if name in self.skipped:
      del self.skipped[name]
    self.idlers[name] = 0

  def api_poll(self, args):
    last = 0
    if args['last'] is not None:
      last = int(args['last']) - 2
    if args['username'] is not None:
      if args['username'] in self.players:
        self.players[args['username']].update()
      elif 'joined' not in args:
        self.api_join(args)
    resp = {}
    resp['players'] = self.report_players(args)
    resp['state'] = self.update(args)
    resp['round'] = self.round
    resp['judge'] = self.judge
    resp['image'] = self.image
    resp['skipped'] = self.skipped.keys()
    resp['idle'] = args['username'] in self.skipped
    resp['last'] = now() - 1
    resp['chat'] = []
    resp['betters'] = self.betters
    resp['bets'] = self.bets.values()
    resp['winner'] = self.winner
    resp['win_image'] = self.win_image
    resp['win_combo'] = self.win_combo
    resp['next_image'] = self.next_image
    resp['countdown'] = self.countdown - now()
    resp['settingsUpdated'] = self.settingsUpdated
    for elem in self.chat:
      if last <= elem[1]:
        resp['chat'].append(elem)
    return resp

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

  def api_bet(self, args):
    self.rejoin(args['username'])
    player = self.players[args['username']]
    if self.judge == args['username']:
      return {}
    if args['username'] not in self.active:
      return {}
    #if args['card'] not in player.cards:
    #  return {}

    self.betters.append(args['username'])
    self.bets[args['username']] = args['card']
    
    new_card = self.player_deck.card()

    if args['card'] in player.cards:
      del player.cards[player.cards.index(args['card'])]
      player.cards.append(new_card)

    if args['deck'] == "webcam":
      player.webcams -= 1

    return { "card": new_card }

  def api_judge(self, args):
    print "JUDGING ", args['card']
    if self.judge != args['username']:
      return { "error": "you aren't the judge" }
    if args['card'] not in self.bets.values():
      return { "error": "card not in bets" }
    print "ATTEMPTING TO WIN"
    self.win(args['card'])
    return {}

  def win(self, win_card):
    if win_card is None:
      self.state = STATE_WIN
      self.winner = "no votes. no one"
      self.nextgame = now() + 10
      return
    if self.win_image == win_card:
      return
    print "WINNING:", win_card
    for user, card in self.bets.iteritems():
      if card == win_card:
        self.state = STATE_WIN
        self.winner = user
        self.win_image = card
        self.players[user].score += 1
        self.nextgame = now() + 10
        if self.players[user].score >= self.goal and self.goal != 0:
          print ">>>>>", user, "won the game in", self.name, "!"
          self.state = STATE_GAMEOVER
          self.countdown = now() + self.timer
          self.votes = {}
          self.db.win_game(self, user)
        self.win_combo = self.db.win_round(self, user, self.judge, card, self.image)
        print self.players[user].score, "__", self.goal
        return
    self.state = STATE_WIN
    self.winner = "someone"
    self.nextgame = now() + 10
    print "_____________________"
    print "judge leaving bug?"
    print self.name
    print self.judge
    print card
    print repr(self.bets)
    print 
    print "_____________________"

  def api_vote(self, args):
    if args['card'] not in self.bets.values():
      return { "error": "card not in bets" }
    self.votes[args['username']] = args['card']
    active_count = len(self.active) - len(self.skipped)
    if self.judge not in self.votes:
      active_count -= 1
    if len(self.votes) == active_count:
      self.tally()

  def tally(self):
    scores = {}
    for card in self.votes.values():
      if card in scores:
        scores[card] += 1
      else:
        scores[card] = 1
    sorted_scores = sorted(scores.iteritems(), key=operator.itemgetter(1), reverse=True)
    if len(sorted_scores):
      print "TALLIED ENOUGH CARDS"
      self.win(sorted_scores[0][0])
    else:
      print "No votes."
      self.win(None)

  # skip requires simple majority
  def api_skip(self, args):
    if args['username'] in self.players and args['skip'] in self.players:
      if args['skip'] not in self.skipvotes:
        self.skipvotes[args['skip']] = {}
      self.skipvotes[args['skip']][args['username']] = True
      if len(self.skipvotes[args['skip']]) > ((len(self.active) - 1) / 2):
        self.skip(args['skip'])
    return {}

  def skip(self, name):
    if name not in self.skipped:
      if name in self.skipvotes:
        del self.skipvotes[name]
      self.skipped[name] = True

  # pass
  def api_pass(self, args):
    if args['username'] in self.players:
      self.skip(args['username'])
    return {}

