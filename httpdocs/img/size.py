#!/usr/bin/python

import os
from operator import itemgetter

def file_size (filename):
  return float(os.stat(filename).st_size)

sizes = []

up = 0
down = 0

for filename in os.listdir("player2"):
  if "gif" not in filename:
    continue
  old = file_size("player/"+filename)
  new = file_size("player2/"+filename)
  percent = (new - old) / old
  if percent > 0:
    up += 1
    continue
  down += 1
  q = (round(percent * 100, 1), int(new - old), filename,)
  sizes.append(q)

print "TOTAL MEGABYTES SAVINGS: ", str(round(reduce(lambda x, y: x+y, map(lambda x: x[1], sizes), 0) / 1000000, 2))
print "TOTAL IMAGES GOT SMALLER:", str(down)
print "TOTAL IMAGES GOT BIGGER: ", str(up)
print

print "BY PERCENTAGE:"
for f in sorted(sizes, key=itemgetter(0), reverse=True):
  print "\t".join([str(x) for x in f])
print

print "BY SIZE:"
for f in sorted(sizes, key=itemgetter(1), reverse=True):
  print "\t".join([str(x) for x in f])
print

