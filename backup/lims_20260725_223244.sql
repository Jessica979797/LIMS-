-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: lims
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_methodequipment`
--

DROP TABLE IF EXISTS `_methodequipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_methodequipment` (
  `A` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `B` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `_methodEquipment_AB_unique` (`A`,`B`),
  KEY `_methodEquipment_B_index` (`B`),
  CONSTRAINT `_methodEquipment_A_fkey` FOREIGN KEY (`A`) REFERENCES `equipment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_methodEquipment_B_fkey` FOREIGN KEY (`B`) REFERENCES `testmethod` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_methodequipment`
--

LOCK TABLES `_methodequipment` WRITE;
/*!40000 ALTER TABLE `_methodequipment` DISABLE KEYS */;
/*!40000 ALTER TABLE `_methodequipment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('d836990b-969f-4cdc-8e3b-874fd9837f8e','685451ba8a1f12bf3b0ee132aac2a8fb4477ef10f02cb010390d192e9d9b6091','2026-07-25 12:31:40.429','20260725123135_init',NULL,NULL,'2026-07-25 12:31:35.695',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application`
--

DROP TABLE IF EXISTS `application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicationNo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contactId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('DRAFT','QUOTED','CONTRACTED','RECEIVED','TESTING','REPORTING','ISSUED','DELIVERED','ARCHIVED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `category` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quotationId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contractNo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expectedDate` datetime(3) DEFAULT NULL,
  `reportCopies` int NOT NULL DEFAULT '1',
  `reportForm` enum('PDF','WORD','BOTH') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PDF',
  `remark` text COLLATE utf8mb4_unicode_ci,
  `receivedById` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receivedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Application_applicationNo_key` (`applicationNo`),
  UNIQUE KEY `Application_quotationId_key` (`quotationId`),
  KEY `Application_customerId_idx` (`customerId`),
  KEY `Application_status_idx` (`status`),
  KEY `Application_receivedById_fkey` (`receivedById`),
  CONSTRAINT `Application_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Application_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `quotation` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Application_receivedById_fkey` FOREIGN KEY (`receivedById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application`
--

LOCK TABLES `application` WRITE;
/*!40000 ALTER TABLE `application` DISABLE KEYS */;
INSERT INTO `application` VALUES ('cms0du8kj0006ekmszo0jx1n0','WT20260001','cms0dl8c50001ekss2o0mem2u',NULL,'QUOTED','chemical',NULL,NULL,NULL,2,'PDF','rush order',NULL,NULL,'2026-07-25 13:06:01.315','2026-07-25 13:35:55.933');
/*!40000 ALTER TABLE `application` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `applicationitem`
--

DROP TABLE IF EXISTS `applicationitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applicationitem` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `testItemId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remark` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ApplicationItem_applicationId_idx` (`applicationId`),
  KEY `ApplicationItem_testItemId_fkey` (`testItemId`),
  CONSTRAINT `ApplicationItem_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `application` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ApplicationItem_testItemId_fkey` FOREIGN KEY (`testItemId`) REFERENCES `testitem` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applicationitem`
--

LOCK TABLES `applicationitem` WRITE;
/*!40000 ALTER TABLE `applicationitem` DISABLE KEYS */;
INSERT INTO `applicationitem` VALUES ('cms0du8kj0008ekms9gtc65t1','cms0du8kj0006ekmszo0jx1n0','cms0dtcxx0001ekmsa9nbr5wp','item1','2026-07-25 13:06:01.315'),('cms0du8kj0009ekmsk88gkxhh','cms0du8kj0006ekmszo0jx1n0','cms0dtcxx0001ekmsa9nbr5wp','item2','2026-07-25 13:06:01.315');
/*!40000 ALTER TABLE `applicationitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditlog`
--

DROP TABLE IF EXISTS `auditlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditlog` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entityId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `before` json DEFAULT NULL,
  `after` json DEFAULT NULL,
  `ip` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `AuditLog_userId_idx` (`userId`),
  KEY `AuditLog_entity_entityId_idx` (`entity`,`entityId`),
  KEY `AuditLog_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditlog`
--

LOCK TABLES `auditlog` WRITE;
/*!40000 ALTER TABLE `auditlog` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditlog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact`
--

DROP TABLE IF EXISTS `contact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isPrimary` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Contact_customerId_idx` (`customerId`),
  CONSTRAINT `Contact_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact`
--

LOCK TABLES `contact` WRITE;
/*!40000 ALTER TABLE `contact` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerNo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('ENTERPRISE','PERSONAL','GOVERNMENT','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `industry` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creditCode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Customer_customerNo_key` (`customerNo`),
  KEY `Customer_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES ('cms0dl8c50001ekss2o0mem2u','C20260001','TestCorp','ENTERPRISE','IT',NULL,'13800000000',NULL,NULL,'ACTIVE','2026-07-25 12:59:01.110','2026-07-25 12:59:01.110');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Department_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipment`
--

DROP TABLE IF EXISTS `equipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serialNo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manufacturer` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('NORMAL','MAINTENANCE','CALIBRATING','OUTOFSERVICE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NORMAL',
  `calibrateDate` datetime(3) DEFAULT NULL,
  `calibrateDue` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Equipment_code_key` (`code`),
  KEY `Equipment_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipment`
--

LOCK TABLES `equipment` WRITE;
/*!40000 ALTER TABLE `equipment` DISABLE KEYS */;
INSERT INTO `equipment` VALUES ('cms0f4sw10002ek6s0bw3x2o7','EQ001','ICP-MS','7700x','SN001','Agilent','NORMAL',NULL,NULL,'2026-07-25 13:42:13.826','2026-07-25 13:42:13.826');
/*!40000 ALTER TABLE `equipment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotation`
--

DROP TABLE IF EXISTS `quotation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quotation` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quotationNo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('DRAFT','SENT','ACCEPTED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `totalAmount` decimal(12,2) NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CNY',
  `validUntil` datetime(3) DEFAULT NULL,
  `items` json DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Quotation_quotationNo_key` (`quotationNo`),
  KEY `Quotation_customerId_idx` (`customerId`),
  CONSTRAINT `Quotation_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quotation`
--

LOCK TABLES `quotation` WRITE;
/*!40000 ALTER TABLE `quotation` DISABLE KEYS */;
INSERT INTO `quotation` VALUES ('cms0fn0mh0001ek1o0ckt56jb','Q20260001','cms0dl8c50001ekss2o0mem2u','DRAFT',1500.00,'CNY',NULL,'[{\"name\": \"test\", \"price\": 1500}]','2026-07-25 13:56:23.657','2026-07-25 13:56:23.657');
/*!40000 ALTER TABLE `quotation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report`
--

DROP TABLE IF EXISTS `report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reportNo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `templateId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('DRAFT','REVIEW','APPROVED','ISSUED','VOID','REVISED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `type` enum('NORMAL','REVISED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NORMAL',
  `version` int NOT NULL DEFAULT '1',
  `preparedById` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewedById` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approvedById` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preparedAt` datetime(3) DEFAULT NULL,
  `reviewedAt` datetime(3) DEFAULT NULL,
  `approvedAt` datetime(3) DEFAULT NULL,
  `issuedAt` datetime(3) DEFAULT NULL,
  `conclusion` text COLLATE utf8mb4_unicode_ci,
  `fileUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Report_reportNo_key` (`reportNo`),
  KEY `Report_applicationId_idx` (`applicationId`),
  KEY `Report_status_idx` (`status`),
  KEY `Report_templateId_fkey` (`templateId`),
  KEY `Report_preparedById_fkey` (`preparedById`),
  KEY `Report_reviewedById_fkey` (`reviewedById`),
  KEY `Report_approvedById_fkey` (`approvedById`),
  CONSTRAINT `Report_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `application` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Report_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Report_preparedById_fkey` FOREIGN KEY (`preparedById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Report_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Report_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `reporttemplate` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report`
--

LOCK TABLES `report` WRITE;
/*!40000 ALTER TABLE `report` DISABLE KEYS */;
INSERT INTO `report` VALUES ('cms0emvk20001ek9g0euai23h','R20260001','cms0du8kj0006ekmszo0jx1n0',NULL,'ISSUED','NORMAL',1,'cms0d7x5e0001eklg1h7waw4h','cms0d7x5e0001eklg1h7waw4h','cms0d7x5e0001eklg1h7waw4h','2026-07-25 13:28:18.302','2026-07-25 13:28:18.426','2026-07-25 13:28:18.550','2026-07-25 13:28:18.550','All tests passed',NULL,'2026-07-25 13:28:17.474','2026-07-25 13:28:18.551');
/*!40000 ALTER TABLE `report` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reportsignoff`
--

DROP TABLE IF EXISTS `reportsignoff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reportsignoff` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reportId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `step` enum('PREPARE','REVIEW','APPROVE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `signed` tinyint(1) NOT NULL DEFAULT '0',
  `comment` text COLLATE utf8mb4_unicode_ci,
  `signedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ReportSignoff_reportId_idx` (`reportId`),
  KEY `ReportSignoff_userId_fkey` (`userId`),
  CONSTRAINT `ReportSignoff_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `report` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ReportSignoff_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reportsignoff`
--

LOCK TABLES `reportsignoff` WRITE;
/*!40000 ALTER TABLE `reportsignoff` DISABLE KEYS */;
INSERT INTO `reportsignoff` VALUES ('cms0emw730003ek9ggrg591ab','cms0emvk20001ek9g0euai23h','PREPARE','cms0d7x5e0001eklg1h7waw4h',1,'draft done','2026-07-25 13:28:18.302','2026-07-25 13:28:18.303'),('cms0emwak0005ek9gd37ujs37','cms0emvk20001ek9g0euai23h','REVIEW','cms0d7x5e0001eklg1h7waw4h',1,'reviewed ok','2026-07-25 13:28:18.426','2026-07-25 13:28:18.428'),('cms0emwdz0007ek9gqgj54u2d','cms0emvk20001ek9g0euai23h','APPROVE','cms0d7x5e0001eklg1h7waw4h',1,'approved','2026-07-25 13:28:18.550','2026-07-25 13:28:18.551');
/*!40000 ALTER TABLE `reportsignoff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reporttemplate`
--

DROP TABLE IF EXISTS `reporttemplate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reporttemplate` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fileUrl` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fields` json DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reporttemplate`
--

LOCK TABLES `reporttemplate` WRITE;
/*!40000 ALTER TABLE `reporttemplate` DISABLE KEYS */;
/*!40000 ALTER TABLE `reporttemplate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reportversion`
--

DROP TABLE IF EXISTS `reportversion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reportversion` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reportId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` int NOT NULL,
  `content` json DEFAULT NULL,
  `fileUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `changeLog` text COLLATE utf8mb4_unicode_ci,
  `createdBy` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ReportVersion_reportId_idx` (`reportId`),
  CONSTRAINT `ReportVersion_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `report` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reportversion`
--

LOCK TABLES `reportversion` WRITE;
/*!40000 ALTER TABLE `reportversion` DISABLE KEYS */;
/*!40000 ALTER TABLE `reportversion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` enum('CS','OP','LAB','REPORTING','SYSTEM') COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Role_name_key` (`name`),
  UNIQUE KEY `Role_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES ('cms0d7wyv0000eklg3u6zfbsi','系统管理员','system_admin','SYSTEM','2026-07-25 12:48:39.847','2026-07-25 12:48:39.847'),('cms0fef3e0000ekow8cfpni7q','CS Staff','cs_staff','CS','2026-07-25 13:49:42.506','2026-07-25 13:49:42.506');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sample`
--

DROP TABLE IF EXISTS `sample`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sample` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sampleNo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `model` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `batchNo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manufacturer` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('RECEIVED','TESTING','COMPLETED','RETAINED','RETURNED','DISPOSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RECEIVED',
  `receivedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `receivedById` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `storageLocation` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `retainQty` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Sample_sampleNo_key` (`sampleNo`),
  KEY `Sample_applicationId_idx` (`applicationId`),
  KEY `Sample_status_idx` (`status`),
  CONSTRAINT `Sample_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `application` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sample`
--

LOCK TABLES `sample` WRITE;
/*!40000 ALTER TABLE `sample` DISABLE KEYS */;
INSERT INTO `sample` VALUES ('cms0e4br90003ek60y1xuahxo','S20260001','cms0du8kj0006ekmszo0jx1n0','TestSample1',NULL,'M100','B001','FactoryA',2,'pcs','RECEIVED','2026-07-25 13:13:52.006',NULL,'A-1',0,'2026-07-25 13:13:52.006','2026-07-25 13:13:52.006');
/*!40000 ALTER TABLE `sample` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testitem`
--

DROP TABLE IF EXISTS `testitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testitem` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TestItem_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testitem`
--

LOCK TABLES `testitem` WRITE;
/*!40000 ALTER TABLE `testitem` DISABLE KEYS */;
INSERT INTO `testitem` VALUES ('cms0dtcxx0000ekmsg2d6w5rp','PB','铅(Pb)含量','化学','mg/kg','2026-07-25 13:05:20.325','2026-07-25 13:05:20.325'),('cms0dtcxx0001ekmsa9nbr5wp','CD','镉(Cd)含量','化学','mg/kg','2026-07-25 13:05:20.325','2026-07-25 13:05:20.325'),('cms0dtcxx0002ekmsqzf0phda','HG','汞(Hg)含量','化学','mg/kg','2026-07-25 13:05:20.325','2026-07-25 13:05:20.325'),('cms0dtcxx0003ekmslp2ei3rc','CR','铬(Cr)含量','化学','mg/kg','2026-07-25 13:05:20.325','2026-07-25 13:05:20.325'),('cms0dtcxx0004ekmsyvma0qbx','PH','pH值','化学','','2026-07-25 13:05:20.325','2026-07-25 13:05:20.325');
/*!40000 ALTER TABLE `testitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testmethod`
--

DROP TABLE IF EXISTS `testmethod`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testmethod` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `standard` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scope` text COLLATE utf8mb4_unicode_ci,
  `testItemId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TestMethod_code_key` (`code`),
  KEY `TestMethod_testItemId_idx` (`testItemId`),
  CONSTRAINT `TestMethod_testItemId_fkey` FOREIGN KEY (`testItemId`) REFERENCES `testitem` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testmethod`
--

LOCK TABLES `testmethod` WRITE;
/*!40000 ALTER TABLE `testmethod` DISABLE KEYS */;
INSERT INTO `testmethod` VALUES ('cms0f4s5z0001ek6sz10d51d4','GB5009.12','Lead Method','GB 5009.12',NULL,'cms0dtcxx0004ekmsyvma0qbx','2026-07-25 13:42:12.887','2026-07-25 13:42:12.887');
/*!40000 ALTER TABLE `testmethod` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testresult`
--

DROP TABLE IF EXISTS `testresult`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testresult` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `taskId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `limit` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conclusion` enum('PENDING','PASS','FAIL','NA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `rawData` json DEFAULT NULL,
  `attachments` json DEFAULT NULL,
  `remark` text COLLATE utf8mb4_unicode_ci,
  `enteredById` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enteredAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `TestResult_taskId_idx` (`taskId`),
  CONSTRAINT `TestResult_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `testtask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testresult`
--

LOCK TABLES `testresult` WRITE;
/*!40000 ALTER TABLE `testresult` DISABLE KEYS */;
INSERT INTO `testresult` VALUES ('cms0ehck90001ek80q1mec4fs','cms0ecqwr0003ek1cxyrbmsj0','0.85','mg/kg','<=1.0','PASS','{\"measurements\": [0.84, 0.85, 0.86]}',NULL,'avg of 3 measurements','cms0d7x5e0001eklg1h7waw4h','2026-07-25 13:23:59.575','2026-07-25 13:23:59.577','2026-07-25 13:23:59.577');
/*!40000 ALTER TABLE `testresult` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testtask`
--

DROP TABLE IF EXISTS `testtask`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testtask` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `taskNo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sampleId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `testItemId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `methodId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `equipmentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','ASSIGNED','TESTING','REVIEW','COMPLETED','JUDGED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `assignedToId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assignedAt` datetime(3) DEFAULT NULL,
  `startedAt` datetime(3) DEFAULT NULL,
  `completedAt` datetime(3) DEFAULT NULL,
  `reviewedById` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TestTask_taskNo_key` (`taskNo`),
  KEY `TestTask_sampleId_idx` (`sampleId`),
  KEY `TestTask_applicationId_idx` (`applicationId`),
  KEY `TestTask_status_idx` (`status`),
  KEY `TestTask_assignedToId_idx` (`assignedToId`),
  KEY `TestTask_testItemId_fkey` (`testItemId`),
  KEY `TestTask_methodId_fkey` (`methodId`),
  KEY `TestTask_equipmentId_fkey` (`equipmentId`),
  CONSTRAINT `TestTask_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `application` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `TestTask_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `TestTask_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `equipment` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `TestTask_methodId_fkey` FOREIGN KEY (`methodId`) REFERENCES `testmethod` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `TestTask_sampleId_fkey` FOREIGN KEY (`sampleId`) REFERENCES `sample` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `TestTask_testItemId_fkey` FOREIGN KEY (`testItemId`) REFERENCES `testitem` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testtask`
--

LOCK TABLES `testtask` WRITE;
/*!40000 ALTER TABLE `testtask` DISABLE KEYS */;
INSERT INTO `testtask` VALUES ('cms0ecqwr0003ek1cxyrbmsj0','T20260001','cms0e4br90003ek60y1xuahxo','cms0du8kj0006ekmszo0jx1n0','cms0dtcxx0004ekmsyvma0qbx',NULL,NULL,'TESTING','cms0d7x5e0001eklg1h7waw4h','2026-07-25 13:20:24.890','2026-07-25 13:35:56.638',NULL,NULL,NULL,'2026-07-25 13:20:24.892','2026-07-25 13:35:56.639');
/*!40000 ALTER TABLE `testtask` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `departmentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_username_key` (`username`),
  KEY `User_departmentId_idx` (`departmentId`),
  CONSTRAINT `User_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `department` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('cms0d7x5e0001eklg1h7waw4h','admin','$2b$10$zsqX.d36hF8dPZsCRktwYeBV/EdVFdC.XzvCYHrApylZrUYo1ub7e','系统管理员',NULL,NULL,'ACTIVE',NULL,'2026-07-25 12:48:40.083','2026-07-25 12:48:40.083'),('cms0f9mnl0000ekboa01xco6c','tester1','$2b$10$IEhNKwNQ9AjYBJ5RQAboj.sj9tZEzRGdyWnbn2uXQ2wjTeBgi2dqW','TestUser1','t@t.com',NULL,'ACTIVE',NULL,'2026-07-25 13:45:59.025','2026-07-25 13:45:59.025');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userrole`
--

DROP TABLE IF EXISTS `userrole`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userrole` (
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roleId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`userId`,`roleId`),
  KEY `UserRole_roleId_fkey` (`roleId`),
  CONSTRAINT `UserRole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userrole`
--

LOCK TABLES `userrole` WRITE;
/*!40000 ALTER TABLE `userrole` DISABLE KEYS */;
INSERT INTO `userrole` VALUES ('cms0d7x5e0001eklg1h7waw4h','cms0d7wyv0000eklg3u6zfbsi');
/*!40000 ALTER TABLE `userrole` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-25 22:32:44
