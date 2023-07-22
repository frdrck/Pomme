#!/usr/bin/python

import os
from subprocess import Popen, PIPE

def is_number(x):
	try:
		int(x)
		return True
	except:
		return False
def identify (dir, filename):
	ident = Popen(["/usr/bin/identify", dir+filename], stdout=PIPE).communicate()[0]
	first = ident.split("\n", 1)[0]
	partz = first.split(" ")
	for part in partz:
		if "x" not in part:
			continue
		width,height = part.split("x", 1)
		if is_number(width) and is_number(height):
			return (int(width), int(height))
	return (0,0)

KEYS = ["player", "main", "player2", "main2"]
BASE_DIR = "docs"

def generate (KEY):
	IMG_DIR = "/img/" + KEY + "/"
	LOCAL_DIR = BASE_DIR + IMG_DIR
	if not os.path.exists(LOCAL_DIR):
		print(IMG_DIR, "doesn't exist")
		return
	out = open (BASE_DIR+"/report/" + KEY + ".html", "w")
	out.write("""
<style type='text/css'>
div
	{
	width: 200px;
	display: inline-block;
	}
img { max-width: 198px; min-width: 20px; min-height: 20px; border: 1px solid #ccc;}
</style>
	""")
	files = os.listdir(LOCAL_DIR)
	count = 0
	for file in files:
		ext = file[-3:]
		if ext in ["jpg","peg","gif","png"]:
			count += 1
			# dim = identify (LOCAL_DIR, file)
			# if dim[1] * 1.2 > dim[0]:
			# 	continue
			out.write("<div><img src='%s'></div>" % (IMG_DIR+file,))
	out.close ()
	print(KEY + "\t" + str(count))

for KEY in KEYS:
	generate (KEY)


