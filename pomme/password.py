#!/usr/bin/python
import db
import sha

USERS = ['joel']
PASSWORD = "b6aaf140827e13a9dd83173a85f57f4b"

print PASSWORD
DB = db.db ()

for user in USERS:
	sql = "UPDATE pomme_user SET password=%s WHERE username=%s"
	args = (PASSWORD, user)
	DB.execute(sql, args)

