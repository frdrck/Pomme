#!/bin/sh
cd ~pomme/pomme/js/
# REMNANTS
# cat jquery.js jquery.md5.js soundmanager2.js api.js preload.js audio.js auth.js chat.js countdown.js game.js > ~pomme/docs/js/pomme2.js
# cat api.js preload.js audio.js auth.js chat.js countdown.js game.js > ~pomme/docs/js/pomme2.js

# PRODUCTION
# cat jpegcam.js webcam.js api.js preload.js audio.js auth.js profile.js chat.js countdown.js game2.js > ~pomme/docs/js/pomme3.js
cat jquery.wiggle.js jpegcam.js webcam.js api_game.js preload.js audio.js auth.js share.js profile.js chat.js countdown.js discard.js tooltip.js game_live.js > ~pomme/docs/js/pomme_game.js
cat api.js preload.js audio.js auth.js chat.js lobby.js > ~pomme/docs/js/lobby2.js

# DEVELOPMENT
cat jquery.wiggle.js jpegcam.js webcam.js api_sandbox.js preload.js audio.js auth.js share.js profile.js chat.js countdown.js discard.js tooltip.js game_sandbox.js > ~pomme/docs/js/pomme_sandbox.js
cat api.js preload.js audio.js auth.js chat.js lobby2.js > ~pomme/docs/js/lobby3.js
cat api.js preload.js audio.js auth.js chat.js profile.js profile_main.js > ~pomme/docs/js/profile2.js

cd ..
