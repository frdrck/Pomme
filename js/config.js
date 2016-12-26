var BASE_URL = "http://pomme.us:32123";
//var BASE_URL = "http://pomme.us:5000";
var COOKIE_DOMAIN = ".pomme.us";
var SITE_URL = "http://pomme.us/";

function logoutCookie() {
	var cookie = "session=false;path=/;max-age=0;domain=" + COOKIE_DOMAIN;
  return cookie;
}

function loginCookie(session) {
	var cookie = "session="+session+";path=/;max-age=1086400;domain=" + COOKIE_DOMAIN;
  return cookie;
}

