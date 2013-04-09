import requests
import json

POMME_URL = "http://pomme.us:32123"

def login(name, password):
  url = POMME_URL + "/user/login"
  data = {"name": name, "password": password}
  return requests.post(url, data=data)

def api_game_list():
  url = POMME_URL + "/game/list"
  data = {}
  return requests.post(url, data=data)

def poll(session):
  url = POMME_URL + "/game/poll"
  data = {"game": 'bigapple', "last": 0, "user": 'moon', 'session': session}
  return requests.post(url, data=data)


def exe(f, *args):
  response = f(*args)
  print response.status_code, response.url
  if not response.ok:
    print response.text
    print
  import pdb; pdb.set_trace()
  return json.loads(response.text)

user = 'moon'
password = 'd251d1462dea65efea8e0be5dc32b372'
session = exe(login, user, password)['session']
exe(api_game_list)
state = exe(poll, session)

