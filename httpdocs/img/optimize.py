#!/usr/bin/python

import os
from time import sleep

for filename in os.listdir("player"):
  if "gif" not in filename:
    continue
  print filename
  os.system("/usr/bin/convert 'player/%s' -coalesce -resize '400x400>' 'player2/%s'" % (filename,filename))
  os.system("/usr/bin/convert 'player2/%s' -layers Optimize +map 'player2/%s'" % (filename,filename))
  os.system("/bin/ls -l 'player/%s' 'player2/%s'" % (filename,filename))

