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
) ENGINE=MyISAM AUTO_INCREMENT=1179846 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pomme_combo`
--
-- WHERE:  id > 5000 AND id < 5010

LOCK TABLES `pomme_combo` WRITE;
/*!40000 ALTER TABLE `pomme_combo` DISABLE KEYS */;
INSERT INTO `pomme_combo` VALUES (5001,1313448112,100,'prettyroom',0,244,'karine',891,'wowowow','player','purp.jpg','main','tt6972249fltt.gif',0,''),(5002,1313448166,100,'prettyroom',0,839,'Char',244,'karine','player','quit_your_job_and_become.png','main','zedd2.jpg',0,''),(5003,1313448166,105,'secrets',0,780,'Ballen',813,'haley','player','tumblr_kqht8aM0kU1qziykqo1_400.jpg','main','cool-website-design.gif',0,''),(5004,1313448205,105,'secrets',0,843,'lindsay',780,'Ballen','player','41bCKjVMuxL._SL500_AA280_.jpg','main','Gucci.gif',0,''),(5005,1313448215,100,'prettyroom',0,839,'Char',796,'aga','player','tumblr_l2aq20FEoO1qzxuoxo1_400.gif','main','tumblr_lpmue4IsUO1r0sm24o1_500.jpg',0,''),(5006,1313448253,105,'secrets',0,780,'Ballen',843,'lindsay','player','1312697372006-dumpfm-frakbuddy-Screen-shot-2011-08-06-at-3.54.54-PM.png','main','tt6245103fltt.gif',0,''),(5007,1313448271,100,'prettyroom',0,891,'wowowow',896,'steve','player','anim_loup12.gif','main','1285436051408.jpg',0,''),(5008,1313448306,105,'secrets',0,780,'Ballen',393,'crow','player','DNA_orbit_animated_small.gif','main','1290314871985-dumpfm-nekochuu-tommy_cat_hanging_on_fan_lg_clr.gif',0,''),(5009,1313448321,100,'prettyroom',0,824,'Women',837,'dv','player','1276918779088.jpg','main','1312775723318dumpfmFAUXrealtumblr_lgblz34hmf1qgy0w4o1_500_1312825699.gif',0,'');
/*!40000 ALTER TABLE `pomme_combo` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-04-30  3:17:03
