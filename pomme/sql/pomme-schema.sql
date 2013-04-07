--
-- Table structure for table `pomme_combo`
--

DROP TABLE IF EXISTS `pomme_combo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pomme_combo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` int(11) DEFAULT '0',
  `gameid` int(11) DEFAULT '0',
  `gamename` varchar(16) DEFAULT NULL,
  `free` int(11) DEFAULT '0',
  `userid` int(11) DEFAULT '0',
  `username` varchar(16) DEFAULT NULL,
  `judgeid` int(11) DEFAULT '0',
  `judgename` varchar(16) DEFAULT NULL,
  `pairtype` varchar(16) DEFAULT NULL,
  `pair` varchar(256) DEFAULT NULL,
  `imagetype` varchar(16) DEFAULT NULL,
  `image` varchar(256) DEFAULT NULL,
  `score` int(11) DEFAULT '0',
  `likers` varchar(256) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=738718 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pomme_game`
--

DROP TABLE IF EXISTS `pomme_game`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pomme_game` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) DEFAULT NULL,
  `path` varchar(32) DEFAULT NULL,
  `goal` int(11) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `free` int(11) DEFAULT NULL,
  `startdate` int(11) DEFAULT NULL,
  `lastdate` int(11) DEFAULT NULL,
  `userid` int(11) DEFAULT '0',
  `username` varchar(16) DEFAULT '',
  `bg` varchar(256) DEFAULT NULL,
  `private` int(11) DEFAULT NULL,
  `password` varchar(32) DEFAULT NULL,
  `timer` int(11) DEFAULT '30',
  `avatar` varchar(256) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2151 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pomme_like`
--

DROP TABLE IF EXISTS `pomme_like`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pomme_like` (
  `userid` int(11) NOT NULL,
  `comboid` int(11) NOT NULL,
  `date` int(11) NOT NULL,
  PRIMARY KEY (`userid`,`comboid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pomme_session`
--

DROP TABLE IF EXISTS `pomme_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pomme_session` (
  `sessionid` varchar(40) NOT NULL,
  `userid` int(11) DEFAULT NULL,
  `date` int(11) DEFAULT NULL,
  PRIMARY KEY (`sessionid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pomme_user`
--

DROP TABLE IF EXISTS `pomme_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pomme_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(16) NOT NULL DEFAULT '',
  `password` varchar(32) DEFAULT '',
  `score` int(11) DEFAULT '0',
  `wins_10` int(11) DEFAULT '0',
  `wins_20` int(11) DEFAULT '0',
  `wins_30` int(11) DEFAULT '0',
  `joindate` int(11) DEFAULT '0',
  `seendate` int(11) DEFAULT '0',
  `fbid` varchar(16) DEFAULT '',
  `email` varchar(64) DEFAULT '',
  `avatar` varchar(256) DEFAULT '',
  `bio` blob,
  `admin` int(11) DEFAULT '0',
  `remote_addr` varchar(16) DEFAULT '',
  `facebook` varchar(64) DEFAULT '',
  `twitter` varchar(64) DEFAULT '',
  `tumblr` varchar(64) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=49682 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;


