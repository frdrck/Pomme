from util import now
HAND_SIZE = 5

class Player:
  def __init__(self, game, args):
    self.game = game
    self.username = args['username']
    self.avatar = args['user'].avatar
    self.lastseen = now()
    self.cards = game.player_deck.hand(HAND_SIZE)
    self.reset()

  def update(self):
    self.lastseen = now()

  def reset(self):
    self.score = 0
    self.webcams = 3
    self.discards = 3

  def report(self):
    rec = {'username': self.username, 'score': self.score, 'avatar': self.avatar, }
    return rec

