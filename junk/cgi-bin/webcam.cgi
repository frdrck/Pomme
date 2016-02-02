#!/usr/bin/python

import os
import re
import sys
import time

print "Content-type: text/plain"
print

pairs = os.environ['QUERY_STRING'].split("&")
pattern = re.compile('[\W_]+')
username = None
for pair in pairs:
	if pair[0:9] == "username=":
		thing = pair.split("=")
		username = pattern.sub('', thing[1])
		break
sys.stderr.write(os.environ['QUERY_STRING'])
if username is None or username == "":
	sys.exit ()

# params = {'username': 'ryz'}

BASE_PATH = "/var/www/vhosts/pomme.us/docs"
IMG_PATH = "/img/webcam/"
LOGO_FILE = BASE_PATH + "/img/pomme.us"

# username = params['username']
if username is None:
	username = "unknown"

now = time.localtime ()
when = time.mktime (now)

path = "%s%04d/%02d/%02d/" % (IMG_PATH, now[0], now[1], now[2])
file = "%d_%s_pommecam.jpg" % (when, username)

data = sys.stdin.read ()

if not os.path.exists (BASE_PATH+path):
	os.makedirs (BASE_PATH+path)

out = open (BASE_PATH+path+file, "w")
out.write(data)
out.close()

#cmd = [
#	"/usr/bin/composite", BASE_PATH+path+file, "null:", LOGO_FILE, "-matte", 
#	"-gravity SouthEast",
#	"-compose ATop",
#	# "-layers composite",
#	BASE_PATH+path+file
#	]
# os.system(" ".join(cmd))

print "http://pomme.us" + path + file

sys.stderr.write("http://pomme.us" + path + file)

# http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . '/' . $filename;

