var BASE_URL = "http://159.203.84.158:32123";
var COOKIE_DOMAIN = ".159.203.84.158";
var SITE_URL = "http://159.203.84.158/";

function logoutCookie() {
	var cookie = "session=false;path=/;max-age=0;domain=" + COOKIE_DOMAIN;
  return cookie;
}

function loginCookie(session) {
	var cookie = "session="+session+";path=/;max-age=1086400;domain=" + COOKIE_DOMAIN;
  return cookie;
}

