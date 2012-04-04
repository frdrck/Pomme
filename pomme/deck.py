import copy
import random

class Deck:
  def __init__(self, source):
    self.cards = copy.copy(source)
    random.shuffle(self.cards)
    self.index = -1

  def reset(self):
    random.shuffle(self.cards)
    self.index = -1

  def card(self):
    self.index += 1
    if self.index >= len(self.cards):
      random.shuffle(self.cards)
      self.index = 0
    return self.cards[self.index]

  def hand(self, count):
    hand = []
    for i in range(count):
      hand.append(self.card())
    return hand

