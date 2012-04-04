import jon.dbpool as dbpool
import MySQLdb, MySQLdb.cursors
import time

import config

dbpool.set_database(MySQLdb, 5)

COMBO_LIMIT = 30

SESSION_FIELDS = "sessionid userid date"
USER_FIELDS = "username password score wins_10 wins_20 wins_30 joindate seendate fbid email avatar bio admin remote_addr facebook twitter tumblr".split(" ")
GAME_FIELDS = "name path goal capacity free startdate lastdate userid username bg private password timer avatar".split(" ")
COMBO_FIELDS = "date gameid gamename free userid username judgeid judgename pairtype pair imagetype image score likers".split(" ")
LIKE_FIELDS = "userid comboid date".split(" ")

def now ():
        return int(time.mktime(time.localtime()))
def is_number (i):
	try:
		int (i)
		return True
	except:
		return False
class db:
        def __init__ (self):
                self.conn = None
                self.connect()

        def connect (self):
          self.conn = dbpool.connect (
              host = config.MYSQL_HOST,
					    user = config.MYSQL_USER,
					    passwd = config.MYSQL_PASSWORD,
              db = config.MYSQL_DATABASE)

        def execute (self,sql,args=()):
                try:
                	cursor = self.conn.cursor ()
                        cursor.execute(sql,args)
			return cursor
                except OperationalError, e:
                        print "Error %d: %s" % (e.args[0], e.args[1])
                        # sys.exit (1)
                        self.connect()
                	cursor = self.conn.cursor ()
                        cursor.execute(sql,args)
			return cursor
        def dict_execute (self,sql,args=()):
                try:
                	dict_cursor = self.conn.cursor (MySQLdb.cursors.DictCursor)
                        dict_cursor.execute(sql,args)
			return dict_cursor
                except OperationalError, e:
                        print "Error %d: %s" % (e.args[0], e.args[1])
                        # sys.exit (1)
                        self.connect()
                	dict_cursor = self.conn.cursor (MySQLdb.cursors.DictCursor)
                        dict_cursor.execute(sql,args)
			return dict_cursor

        def lastinsertid (self):
                return self.conn.insert_id ()
	def insert (self, table, expected, data):
		sql = "INSERT INTO " + table + " "
		fields = []
		values = []
		for field in expected:
			if field in data:
				fields.append(field)
				values.append(data[field])
		sql += "(" + ",".join(fields) + ") "
		sql += "VALUES(" + ",".join(["%s" for x in values]) + ")"
		self.execute (sql, values)
	def update (self, table, expected, data, id):
		sql = "UPDATE " + table + " SET "
		fields = []
		values = []
		for field in expected:
			if field in data and data[field] is not None:
				fields.append(field+"=%s")
				values.append(data[field])
		sql += ",".join(fields)
		sql += " WHERE id=%s"
		values.append(id)
		self.execute (sql, values)

	### USERS

	def user_new (self, data):
		self.insert("pomme_user", USER_FIELDS, data)
		id = self.lastinsertid ()
		sql = "SELECT * FROM pomme_user WHERE id=%s"
		args = (id)
		cursor = self.execute (sql, args)
		try:
			return cursor.fetchall()[0]
		except:
			return None

	def user_edit (self, data, id):
		self.update("pomme_user", USER_FIELDS, data, id)

	def user_list_all (self):
		sql = "SELECT * FROM pomme_user ORDER BY id"
		cursor = self.execute (sql, ())
		return cursor.fetchall ()

	def user_seen (self, userid):
		sql = "UPDATE pomme_user SET seendate=%s WHERE id=%s"
		args = (now(), userid)
		self.execute (sql, args)

	def user_gain_point (self, userid):
		sql = "UPDATE pomme_user SET score = score + 1 WHERE id=%s"
		args = (userid)
		self.execute (sql, args)

	def user_lose_point (self, userid):
		sql = "UPDATE pomme_user SET score = score - 1 WHERE id=%s"
		args = (userid)
		self.execute (sql, args)

	def user_win_game (self, userid, goal):
		sql = "UPDATE pomme_user SET wins_" + str(goal) + " = wins_" + str(goal) + " + 1 WHERE id=%s"
		args = (userid)
		self.execute (sql, args)


	### GAMES

	def game_new (self, data):
		self.insert("pomme_game", GAME_FIELDS, data)
		id = self.lastinsertid ()
		sql = "SELECT * FROM pomme_game WHERE id=%s"
		args = (id)
		cursor = self.execute (sql, args)
		try:
			return cursor.fetchall()[0]
		except:
			return None

	def game_edit (self, data, id):
		self.update("pomme_game", GAME_FIELDS, data, id)

	def game_list_all (self):
		sql = "SELECT * FROM pomme_game"
		cursor = self.execute(sql)
		return cursor.fetchall ()


	### COMBOS

	def combo_new (self, data):
		self.insert("pomme_combo", COMBO_FIELDS, data)
		comboid = self.lastinsertid ()
		return comboid

	def combo_get_userid (self, comboid):
		sql = "SELECT userid FROM pomme_combo WHERE id=%s"
		args = (comboid)
		cursor = self.execute (sql, args)
		try:
			return cursor.fetchall()[0][0]
		except:
			return 0

	def combo_list_latest (self):
		sql = "SELECT * FROM pomme_combo ORDER BY id DESC LIMIT %s"
		args = (COMBO_LIMIT)
		self.dict_execute (sql, args)
		return self.dict_cursor.fetchall ()

	def combo_list_top (self, userid, start=None, limit=None):
		sql = "SELECT * FROM pomme_combo WHERE userid=%s "
		args = [userid]
		#if start is not None and is_number(start):
		#	sql += "AND id < %s "
		#	args.append(start)
		if limit is None or not is_number(limit):
			limit = COMBO_LIMIT
		sql += "ORDER BY likes DESC LIMIT %s"
		args.append(limit)
		self.dict_execute(sql, args)
		return self.dict_cursor.fetchall ()

	def combo_list_user (self, userid, start=None, limit=None):
		sql = "SELECT * FROM pomme_combo WHERE userid=%s "
		args = [userid]
		if start is not None and is_number(start):
			sql += "AND id < %s "
			args.append(start)
		if limit is None or not is_number(limit):
			limit = COMBO_LIMIT
		sql += "ORDER BY id DESC LIMIT %s"
		args.append(limit)
		self.dict_execute(sql, args)
		return self.dict_cursor.fetchall ()

	def combo_list_judge (self, userid, start=None, limit=None):
		sql = "SELECT * FROM pomme_combo WHERE judgeid=%s "
		args = [userid]
		if start is not None and is_number(start):
			sql += "AND id < %s "
			args.append(start)
		if limit is None or not is_number(limit):
			limit = COMBO_LIMIT
		sql += "ORDER BY id DESC LIMIT %s"
		args.append(limit)
		self.dict_execute(sql, args)
		return self.dict_cursor.fetchall ()

	def combo_list_likes (self, userid, start=None, limit=None):
		sql = "SELECT comboid FROM pomme_like WHERE likerid=%s "
		sql += "ORDER BY date DESC LIMIT %s"
		args = [userid]
		if limit is None or not is_number(limit):
			limit = COMBO_LIMIT
		args.append(limit)
		cursor = self.execute(sql, args)
		comboids = cursor.fetchall ()

		sql = "SELECT * FROM pomme_combo WHERE id IN ("
		sql += ",".join([str(x[0]) for x in comboids])
		sql += ")"
		args = ()
		self.dict_execute (sql, args)
		# TODO: resort by the order in comboids
		return self.dict_cursor.fetchall ()

	def combo_list_game (self, gameid, start=None, limit=None):
		sql = "SELECT * FROM pomme_combo WHERE gameid=%s "
		args = [gameid]
		if start is not None and is_number(start):
			sql += "AND id < %s "
			args.append(start)
		if limit is None or not is_number(limit):
			limit = COMBO_LIMIT
		sql += "ORDER BY id DESC LIMIT %s"
		args.append(limit)
		self.dict_execute(sql, args)
		return self.dict_cursor.fetchall ()

	def combo_gain_point (self, comboid):
		sql = "UPDATE pomme_combo SET score = score + 1 WHERE id=%s"
		args = (comboid)
		self.execute (sql, args)

	def combo_lose_point (self, comboid):
		sql = "UPDATE pomme_combo SET score = score - 1 WHERE id=%s"
		args = (comboid)
		self.execute (sql, args)


	### LIKES

	def like_add (self, likerid, comboid, userid=None):
		sql = "INSERT INTO pomme_like (userid,comboid,date) VALUES(%s,%s,%s)"
		args = (likerid, comboid, now())
                try:
                        self.execute (sql, args)
			if userid is None:
				userid = self.combo_get_userid (comboid)
			if userid != 0:
				self.user_gain_point (userid)
				self.combo_gain_point (comboid)
				return True
                except:
			pass
		return False

	def like_remove (self, likerid, comboid):
		sql = "DELETE FROM pomme_like WHERE userid=%s AND comboid=%s"
		args = (likerid, comboid)
		try:
			cursor = self.execute (sql, args)
			if cursor.rowcount > 0:
				userid = self.combo_get_userid (comboid)
				if userid != 0:
					self.user_lose_point (userid)
					self.combo_lose_point (comboid)
					return True
		except:
			pass
		return False

	### SESSIONS

	def session_new (self, sessionid, userid):
		sql = "INSERT INTO pomme_session (sessionid, userid, date) VALUES(%s,%s,%s)"
		args = (sessionid,userid,now ())
		self.execute(sql, args)

	def session_list_all (self):
		sql = "SELECT sessionid,userid FROM pomme_session"
		cursor = self.execute(sql, ())
		return cursor.fetchall ()

	### STATS
	def count (self, sql, args=()):
		cursor = self.execute(sql, args)
		try:
			return cursor.fetchall()[0][0]
		except:
			return 0
	def game_count (self):
		return self.count ("SELECT count(*) FROM pomme_game")
	def combo_count (self):
		return self.count ("SELECT count(*) FROM pomme_combo")
	def combos_today (self):
		return self.count ("SELECT count(*) FROM pomme_combo WHERE date > %s", (now()-86400))
	def user_count (self):
		return self.count ("SELECT count(*) FROM pomme_user")
	def users_today (self):
		return self.count ("SELECT count(*) FROM pomme_user WHERE seendate > %s", (now()-86400))
	def users_new_today_count (self):
		return self.count ("SELECT count(*) FROM pomme_user WHERE joindate > %s", (now()-86400))
	def users_new_today (self):
		sql = "SELECT DISTINCT username FROM pomme_user WHERE joindate > %s"
		args = (now()-86400)
		cursor = self.execute(sql, args)
		rows = cursor.fetchall ()
		users = []
		for row in rows:
			users.append(str(row[0]))
		return users

