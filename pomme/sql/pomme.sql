FDJLSFKJDSKLFJDS;

DROP TABLE IF EXISTS `pomme_user`;
CREATE TABLE `pomme_user` (
  `id` int(11) NOT NULL auto_increment,
  `username` varchar(16) NOT NULL default '',
  `password` varchar(32) default '',
  `score` int(11) default '0',
  `wins_10` int(11) default '0',
  `wins_20` int(11) default '0',
  `wins_30` int(11) default '0',
  `joindate` int(11) default '0',
  `seendate` int(11) default '0',
  `fbid` varchar(16) default "",
  `email` varchar(64) default "",
  `avatar` varchar(256) default "",
  `bio` blob,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `pomme_game`;
CREATE TABLE `pomme_game` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(32) default NULL,
  `path` varchar(32) default NULL,
  `goal` int(11) default NULL,
  `capacity` int(11) default NULL,
  `free` int(11) default NULL,
  `startdate` int(11) default NULL,
  `lastdate` int(11) default NULL,
  `userid` int(11) default '0',
  `username` varchar(16) default "",
  `bg` varchar(256) default NULL,
  `private` int(11) default NULL,
  `password` varchar(32) default NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `pomme_combo`;
CREATE TABLE `pomme_combo` (
  `id` int(11) NOT NULL auto_increment,
  `date` int(11) default '0',
  `gameid` int(11) default '0',
  `gamename` varchar(16) default NULL,
  `free` int(11) default '0',
  `userid` int(11) default '0',
  `username` varchar(16) default NULL,
  `judgeid` int(11) default '0',
  `judgename` varchar(16) default NULL,
  `pairtype` varchar(16) default NULL,
  `pair` varchar(256) default NULL,
  `imagetype` varchar(16) default NULL,
  `image` varchar(256) default NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `pomme_session`;
CREATE TABLE `pomme_session` (
  `sessionid` varchar(40) NOT NULL,
  `userid` int(11) default NULL,
  `date` int(11) default NULL,
  PRIMARY KEY (`sessionid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

