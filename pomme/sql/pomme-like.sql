DROP TABLE IF EXISTS `pomme_like`;
CREATE TABLE `pomme_like` (
  `userid` int(11) NOT NULL,
  `comboid` int(11) NOT NULL,
  `date` int(11) NOT NULL,
  PRIMARY KEY(userid, comboid)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

