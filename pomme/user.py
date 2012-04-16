from util import now

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
    if len(row) > 13:
      self.admin = row[13]
      self.remote_addr = row[14]
      self.facebook = row[15]
      self.twitter = row[16]
      self.tumblr = row[17]
      self.last_ip = None

  def is_confirmed(self):
    try:
      return len(self.password) > 0 and len(self.email) > 0
    except:
      return False

  def is_admin(self):
    try:
      return self.admin == 1
    except:
      return False

  def check_ip(self, client_address):
    try:
      curtime = now ()
      if int(self.seendate) > curtime - 1200:
        if self.last_ip is not None and self.last_ip[0] != client_address[0]:
          return False
      self.seendate = curtime
      self.last_ip = client_address
      return True
    except:
      return False

