var BASE_URL = "https://pomme.us:32123";
var COOKIE_DOMAIN = ".pomme.us";
var SITE_URL = "https://pomme.us/";

var DEV = false;
if (DEV) {
  BASE_URL = "https://pommedev.us:32123";
  COOKIE_DOMAIN = ".pommedev.us";
  SITE_URL = "https://pommedev.us/";
}

function logoutCookie() {
	var cookie = "session=false;path=/;max-age=0;domain=" + COOKIE_DOMAIN;
  return cookie;
}

function loginCookie(session) {
	var cookie = "session="+session+";path=/;max-age=1086400;domain=" + COOKIE_DOMAIN;
  return cookie;
}

