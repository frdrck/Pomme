-- MySQL dump 10.13  Distrib 5.5.21, for Linux (x86_64)
--
-- Host: pomme.us    Database: asdfus
-- ------------------------------------------------------
-- Server version	5.5.21-cll

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

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
) ENGINE=MyISAM AUTO_INCREMENT=78655 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pomme_user`
--
-- WHERE:  id > 5000 AND id < 5010

LOCK TABLES `pomme_user` WRITE;
/*!40000 ALTER TABLE `pomme_user` DISABLE KEYS */;
INSERT INTO `pomme_user` VALUES (5001,'lvh','',3,0,0,0,1317951931,1317952189,'','','',NULL,0,'','','',''),(5002,'Kripa','',0,0,0,0,1317951985,1317952095,'','','',NULL,0,'','','',''),(5003,'Melissa','bde65cd4869a63811e589c885c021a5e',634,10,1,0,1317952060,1366325951,'','','',NULL,0,'','','',''),(5004,'dsamz','',14,0,0,0,1317953796,1322887593,'','','',NULL,0,'','','',''),(5005,'gorbe','',21,0,0,0,1317954432,1317977354,'','','',NULL,0,'','','',''),(5006,'Caram','',1,0,0,0,1317958674,1317958674,'','','',NULL,0,'','','',''),(5007,'DrPotatopickles','',0,0,0,0,1317958716,1317958716,'','','',NULL,0,'','','',''),(5008,'RollingTsundere','',230,3,0,0,1317958722,1362192484,'','','',NULL,0,'','','',''),(5009,'GeoMitch','',28,0,0,0,1317958734,1319779647,'','','',NULL,0,'','','','');
/*!40000 ALTER TABLE `pomme_user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-04-30  3:16:59
