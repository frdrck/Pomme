import os

import config
from util import is_image

class Cards:
  def __init__ (self):
    self.load ()

  def load (self):
    self.player = self.load_dir (config.PLAYER_CARDS)
    self.main = self.load_dir (config.MAIN_CARDS)

  def load_dir (self, path):
    files = os.listdir (config.BASE_PATH+path)
    cards = []
    for file in files:
      if is_image (file):
        cards.append (file)
    return cards
  
