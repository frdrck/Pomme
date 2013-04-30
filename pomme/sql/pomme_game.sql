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
) ENGINE=MyISAM AUTO_INCREMENT=2152 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pomme_game`
--

LOCK TABLES `pomme_game` WRITE;
/*!40000 ALTER TABLE `pomme_game` DISABLE KEYS */;
INSERT INTO `pomme_game` VALUES (2151,'meowmix','meowmix',10,8,NULL,1359760014,1359760014,67404,'BrockObama',NULL,0,NULL,20,''),(2150,'sexytime','sexytime',10,8,NULL,1333752225,1333752225,48368,'nyxxe',NULL,0,NULL,20,''),(2149,'sandbox','sandbox',10,8,NULL,1326590172,1326590172,1,'jules',NULL,1,NULL,20,''),(2148,'The Big Apple','bigapple',10,100,NULL,1325995001,1325995001,1,'jules',NULL,0,NULL,20,''),(2147,'letsplay','letsplay',10,10,NULL,1325994785,1325994785,1,'jules',NULL,1,NULL,20,''),(2146,'lime','lime',10,10,NULL,1324330372,1324330372,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/lime.png'),(2145,'blueberry','blueberry',10,10,NULL,1324302088,1324302088,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/blueberry.png'),(2144,'apricot','apricot',10,10,NULL,1324294554,1324294554,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/apricot.png'),(2143,'nectarine','nectarine',10,10,NULL,1324278999,1324278999,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/nectarine.png'),(2142,'currants','currants',10,10,NULL,1324277571,1324277571,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/currants.png'),(2141,'apple','apple',10,10,NULL,1324276734,1324276734,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/apple.png'),(2140,'tamarind','tamarind',10,10,NULL,1324274900,1324274900,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/tamarind.png'),(2139,'peach','peach',10,10,NULL,1324272879,1324272879,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/peach.png'),(2138,'plum','plum',10,10,NULL,1324272343,1324272343,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/plum.png'),(2137,'coconut','coconut',10,10,NULL,1324271985,1324271985,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/coconut.png'),(2136,'raisin','raisin',10,10,NULL,1324269838,1324269838,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/raisin.png'),(2135,'lobbychat','lobbychat',10,100,NULL,123456789,123456789,1,'jules',NULL,1,NULL,30,''),(2134,'passionfruit','passionfruit',10,10,NULL,1324268976,1324268976,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/passionfruit.png'),(2133,'pear','pear',10,10,NULL,1324268696,1324268696,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/pear.png'),(2132,'kumquat','kumquat',10,10,NULL,1324268135,1324268135,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/kumquat.png'),(2131,'quince','quince',10,10,NULL,1324267643,1324267643,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/quince.png'),(2130,'mango','mango',10,10,NULL,1324267465,1324267465,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/mango.png'),(2129,'cantaloupe','cantaloupe',10,10,NULL,1324266983,1324266983,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/cantaloupe.png'),(2128,'mulberry','mulberry',10,10,NULL,1324266874,1324266874,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/mulberry.png'),(2127,'plantain','plantain',10,10,NULL,1324266743,1324266743,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/plantain.png'),(2126,'persimmon','persimmon',10,10,NULL,1324266529,1324266529,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/persimmon.png'),(2125,'kiwi','kiwi',10,10,NULL,1324266122,1324266122,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/kiwi.png'),(2124,'lemon','lemon',10,10,NULL,1324265988,1324265988,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/lemon.png'),(2123,'banana','banana',10,10,NULL,1324265597,1324265597,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/banana.png'),(2122,'watermelon','watermelon',10,10,NULL,1324265429,1324265429,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/watermelon.png'),(2121,'jackfruit','jackfruit',10,10,NULL,1324265403,1324265403,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/jackfruit.png'),(2120,'grape','grape',10,10,NULL,1324265265,1324265265,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/grape.png'),(2119,'blackberry','blackberry',10,10,NULL,1324265195,1324265195,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/blackberry.png'),(2118,'tangerine','tangerine',10,10,NULL,1324265007,1324265007,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/tangerine.png'),(2117,'juniper','juniper',10,10,NULL,1324264927,1324264927,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/juniper.png'),(2116,'grapefruit','grapefruit',10,10,NULL,1324264826,1324264826,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/grapefruit.png'),(2115,'orange','orange',10,10,NULL,1324264759,1324264759,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/orange.png'),(2114,'prune','prune',10,10,NULL,1324264666,1324264666,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/prune.png'),(2113,'tomato','tomato',10,10,NULL,1324264577,1324264577,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/tomato.png'),(2112,'cherry','cherry',10,10,NULL,1324264444,1324264444,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/cherry.png'),(2111,'avocado','avocado',10,10,NULL,1324264397,1324264397,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/avocado.png'),(2110,'strawberry','strawberry',10,10,NULL,1324264330,1324264330,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/strawberry.png'),(2109,'honeydew','honeydew',10,10,NULL,1324264289,1324264289,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/honeydew.png'),(2108,'pineapple','pineapple',10,10,NULL,1324264282,1324264282,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/pineapple.png'),(2107,'lychee','lychee',10,10,NULL,1324264093,1324264093,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/lychee.png'),(2106,'papaya','papaya',10,10,NULL,1324264032,1324264032,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/papaya.png'),(2105,'raspberry','raspberry',10,10,NULL,1324264007,1324264007,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/raspberry.png'),(2104,'starfruit','starfruit',10,10,NULL,1324263954,1324263954,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/starfruit.png'),(2103,'guava','guava',10,10,NULL,1324263932,1324263932,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/guava.png'),(2102,'fig','fig',10,10,NULL,1324263859,1324263859,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/fig.png'),(2101,'cranberry','cranberry',10,10,NULL,1324263849,1324263849,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/cranberry.png'),(2100,'date','date',10,10,NULL,1324263843,1324263843,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/date.png'),(2099,'pomegranate','pomegranate',10,10,NULL,1324263842,1324263842,0,'',NULL,0,NULL,20,'http://pomme.us/img/fruit/pomegranate.png');
/*!40000 ALTER TABLE `pomme_game` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-04-30  3:18:51
