import time
import sha
import re

CLEAN_URL_RE = re.compile('[^-A-Za-z0-9!]')

def now():
  return int(time.mktime(time.localtime()))

def is_image(url):
  return url[-3:].lower() in ("gif","jpg","png") or url[-4:].lower == "jpeg"

def is_number(i):
  try:
    int(i)
    return True
  except:
    return False

def sanitize_url(s):
  s = CLEAN_URL_RE.sub("", s)
  return s.lower()

def sanitize_html(s):
  return s.replace("&","&amp;").replace(">", "&gt;").replace("<", "&lt;").replace("\"", "&quot;")

def generate_hash(s):
  if not s:
    s = "POMME"
  return sha.new(str(time.time())+s).hexdigest()

