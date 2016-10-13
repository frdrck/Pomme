# Server settings.
SERVER_HOST = "0.0.0.0"
SERVER_PORT = 32123
FRUIT_URI_BASE	= "%s/img/fruit/" % (SERVER_HOST)

# Database settings
MYSQL_HOST = "mysql.pomme.us"
MYSQL_USER = "pommeus"
MYSQL_PASSWORD = "frederick"
MYSQL_DATABASE = "qwertus"

# Image path settings
BASE_PATH	= "/home/pomme_admin/pomme.us/"
PLAYER_CARDS	= "img/player/"
MAIN_CARDS = "img/main/"

DEV = True
if (DEV):
  BASE_PATH = "/Users/moonmayor/Code/Pomme/"
  PLAYER_CARDS = "img/dev/player/"
  MAIN_CARDS = "img/dev/main/"

