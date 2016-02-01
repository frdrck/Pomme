#!/bin/csh
while (1)
  date
#  /var/www/vhosts/pomme.us/pomme/scripts/heartbeat.csh >> /var/www/vhosts/pomme.us/pomme/scripts/uptime.log &
  python /var/www/vhosts/pomme.us/pomme/pomme_server.py
  sleep 1
end
