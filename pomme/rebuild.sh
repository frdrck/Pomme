#!/bin/sh
cd /Library/WebServer/Documents/git/Pomme/pomme/js/
# REMNANTS
# cat jquery.js jquery.md5.js soundmanager2.js api.js preload.js audio.js auth.js chat.js countdown.js game.js > ~pomme/docs/js/pomme.js
# cat api.js preload.js audio.js auth.js chat.js countdown.js game.js > ~pomme/docs/js/pomme.js


# PRODUCTION
# cat jpegcam.js webcam.js api.js preload.js audio.js auth.js profile.js chat.js countdown.js game.js > ~pomme/docs/js/pomme3.js
cat jquery.wiggle.js jpegcam.js webcam.js api_game.js preload.js audio.js auth.js share.js profile.js chat.js countdown.js discard.js tooltip.js game_live.js > /Library/WebServer/Documents/git/Pomme/httpdocs/js/pomme_game.js
cat api.js preload.js audio.js auth.js chat.js lobby.js > /Library/WebServer/Documents/git/Pomme/httpdocs/js/lobby.js

# DEVELOPMENT
cat jquery.wiggle.js jpegcam.js webcam.js api_sandbox.js preload.js audio.js auth.js share.js profile.js chat.js countdown.js discard.js tooltip.js game_sandbox.js > /Library/WebServer/Documents/git/Pomme/httpdocs/js/pomme_sandbox.js
cat api.js preload.js audio.js auth.js chat.js lobby.js > /Library/WebServer/Documents/git/Pomme/httpdocs/js/lobby3.js
cat api.js preload.js audio.js auth.js chat.js profile.js profile_main.js > /Library/WebServer/Documents/git/Pomme/httpdocs/js/profile.js

cd ..
