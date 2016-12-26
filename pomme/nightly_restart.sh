pid=`ps -ef | grep -v grep | grep pomme_server.py | awk -F ' ' '{print $2}'`
kill $pid
date >> /home/pomme_admin/pomme.us/pomme/last_restart.log
nohup python /home/pomme_admin/pomme.us/pomme/pomme_server.py
