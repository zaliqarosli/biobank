-- DROPS --

/*ValIDate*/
DROP TABLE IF EXISTS `biobank_validate_identifier`;

/*Specimen*/
DROP TABLE IF EXISTS `biobank_specimen_type_attribute`;
DROP TABLE IF EXISTS `biobank_specimen_attribute`;
DROP TABLE IF EXISTS `biobank_specimen`;
DROP TABLE IF EXISTS `biobank_specimen_type`;

/*Container*/
DROP TABLE IF EXISTS `biobank_container`;
DROP TABLE IF EXISTS `biobank_container_locus`;
DROP TABLE IF EXISTS `biobank_container_status`;
DROP TABLE IF EXISTS `biobank_container_type`;
DROP TABLE IF EXISTS `biobank_container_dimension`;
DROP TABLE IF EXISTS `biobank_container_capacity`;

/*Global*/
DROP TABLE IF EXISTS `biobank_unit`;
DROP TABLE IF EXISTS `biobank_datatype`;
DROP TABLE IF EXISTS `biobank_reference_table`;


-- CREATES --

/*Global*/
CREATE TABLE `biobank_reference_table` (
  `ID` INT(3) NOT NULL AUTO_INCREMENT,
  `TableName` varchar(50) NOT NULL,
  `ColumnName` varchar(50) NOT NULL,
  CONSTRAINT `PK_biobank_reference_table` PRIMARY KEY (`ID`),
  CONSTRAINT `UK_biobank_reference_table` UNIQUE(`TableName`, `ColumnName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_datatype` (
  `ID` INT(3) NOT NULL AUTO_INCREMENT,
  `Datatype` varchar(20) NOT NULL UNIQUE,
  CONSTRAINT `PK_biobank_datatype` PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_unit` (
  `ID` INT(2) NOT NULL AUTO_INCREMENT,
  `Unit` varchar(20) NOT NULL UNIQUE,
  CONSTRAINT `PK_biobank_container_unit` PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Container*/
CREATE TABLE `biobank_container_capacity` (
  `ID` INT(3) NOT NULL AUTO_INCREMENT,
  `Quantity` FLOAT NOT NULL,
  `UnitID` INT(2) NOT NULL,
  CONSTRAINT `PK_biobank_container_capacity` PRIMARY KEY (`ID`),
  CONSTRAINT `FK_biobank_container_capacity_UnitID` FOREIGN KEY (`UnitID`) REFERENCES `biobank_unit`(`ID`),
  CONSTRAINT `UK_biobank_container_capacity` UNIQUE(`Quantity`, `UnitID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_container_dimension` (
  `ID` INT(3) NOT NULL AUTO_INCREMENT,
  `X` INT(6) NOT NULL,
  `Y` INT(6) NOT NULL,
  `Z` INT(6) NOT NULL,
  CONSTRAINT `PK_biobank_container_dimensino` PRIMARY KEY (`ID`),
  CONSTRAINT `UK_biobank_container_dimension` UNIQUE(`X`, `Y`, `Z`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_container_type` (
  `ID` INT(3) NOT NULL AUTO_INCREMENT,
  `Type` varchar(20) NOT NULL,
  `Descriptor` varchar(20) NOT NULL,
  `Label` varchar(40) NOT NULL UNIQUE,
  `Primary` BIT(1) NOT NULL,
  `CapacityID` INT(3),
  `DimensionID` INT(3),
  CONSTRAINT `PK_biobank_container_type` PRIMARY KEY (`ID`),
  CONSTRAINT `FK_biobank_container_type_CapacityID` FOREIGN KEY (`CapacityID`) REFERENCES `biobank_container_capacity`(`ID`),
  CONSTRAINT `FK_biobank_container_type_DimensionID` FOREIGN KEY (`DimensionID`) REFERENCES `biobank_container_dimension`(`ID`),
  CONSTRAINT `UK_biobank_container_type` UNIQUE(`Type`, `Descriptor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_container_status` (
  `ID` INT(2) NOT NULL AUTO_INCREMENT,
  `Status` varchar(40) NOT NULL UNIQUE,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_container_locus` (
  `ID` INT(10) NOT NULL AUTO_INCREMENT,
  `LocationID` tinyint(2) unsigned,
  `DestinationID` tinyint(2) unsigned,
  `OriginID` tinyint(2) unsigned,
  `Status` varchar(40),
  CONSTRAINT `PK_biobank_container_locus` PRIMARY KEY (`ID`),
  CONSTRAINT `FK_biobank_container_locus_LocationID` FOREIGN KEY (`LocationID`) REFERENCES `psc` (`CenterID`),
  CONSTRAINT `FK_biobank_container_locus_DestinationID` FOREIGN KEY (`DestinationID`) REFERENCES `psc` (`CenterID`),
  CONSTRAINT `FK_biobank_container_locus_OriginID` FOREIGN KEY (`OriginID`) REFERENCES `psc` (`CenterID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_container` (
  `ID` INT(10) NOT NULL AUTO_INCREMENT,
  `Barcode` varchar(40) NOT NULL UNIQUE, /*index by barcode*/
  `TypeID` INT(3) NOT NULL,
  `StatusID` INT(2) NOT NULL,
  `LocusID` INT(10) NOT NULL,
  `ParentContainerID` INT(10),
  `DateTimeUpdate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CreateDate` DATE NOT NULL,
  `CreateTime` TIME NOT NULL,
  `Notes` varchar(255),
  CONSTRAINT `PK_biobank_container` PRIMARY KEY (`ID`),
  CONSTRAINT `FK_biobank_container_TypeID` FOREIGN KEY (`TypeID`) REFERENCES `biobank_container_type`(`ID`),  
  CONSTRAINT `FK_biobank_container_StatusID` FOREIGN KEY (`StatusID`) REFERENCES `biobank_container_status`(`ID`),  
  CONSTRAINT `FK_biobank_container_LocusID` FOREIGN KEY (`LocusID`) REFERENCES `biobank_container_locus`(`ID`),  
  CONSTRAINT `FK_biobank_container_ParentContainerID` FOREIGN KEY (`ParentContainerID`) REFERENCES `biobank_container`(`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Specimen*/
CREATE TABLE `biobank_specimen_type` (
  `ID` INT(5) NOT NULL AUTO_INCREMENT,
  `Type` varchar(40) NOT NULL UNIQUE,
  CONSTRAINT `PK_biobank_specimen_type` PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_specimen` (
  `ID` INT(10) NOT NULL AUTO_INCREMENT,
  `ContainerID` INT(10) NOT NULL UNIQUE, /*INDEXT BY CONTAINER_ID*/
  `TypeID` INT(5) NOT NULL,
  `Quantity` DECIMAL(10, 5) NOT NULL,
  `UnitID` INT(2) NOT NULL,
  `ParentSpecimenID` INT(10),
  `CandidateID` INT(6) NOT NULL,
  `SessionID` INT(10) UNSIGNED NOT NULL,
  `DateTimeUpdate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CollectDate` DATE NOT NULL,
  `CollectTime` TIME NOT NULL,
  `Notes` varchar(255),
  `Data` json DEFAULT NULL,
  CONSTRAINT `PK_biobank_specimen` PRIMARY KEY (`ID`),
  CONSTRAINT `FK_biobank_specimen_ContainerID` FOREIGN KEY (`ContainerID`) REFERENCES `biobank_container`(`ID`),
  CONSTRAINT `FK_biobank_specimen_TypeID` FOREIGN KEY (`TypeID`) REFERENCES `biobank_specimen_type`(`ID`),
  CONSTRAINT `FK_biobank_specimen_UnitID` FOREIGN KEY (`UnitID`) REFERENCES `biobank_unit` (`ID`),
  CONSTRAINT `FK_biobank_specimen_ParentSpecimenID` FOREIGN KEY (`ParentSpecimenID`) REFERENCES `biobank_specimen`(`ID`),
  CONSTRAINT `FK_biobank_specimen_CandidateID` FOREIGN KEY (`CandidateID`) REFERENCES `candidate`(`CandID`),
  CONSTRAINT `FK_biobank_specimen_SessionID` FOREIGN KEY (`SessionID`) REFERENCES `session`(`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_specimen_attribute` (
  `ID` INT(3) NOT NULL AUTO_INCREMENT,
  `Name` varchar(40) NOT NULL UNIQUE,
  `DatatypeID` INT(3) NOT NULL,
  `ReferenceTableID` INT(3),
  CONSTRAINT `PK_biobank_specimen_attribute` PRIMARY KEY (`ID`),
  CONSTRAINT `FK_biobank_specimen_attribute_DatatypeID` FOREIGN KEY (`DatatypeID`) REFERENCES `biobank_datatype`(`ID`),
  CONSTRAINT `FK_biobank_specimen_attribute_ReferenceTableID` FOREIGN KEY (`ReferenceTableID`) REFERENCES `biobank_reference_table`(`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_specimen_type_attribute` (
  `TypeID` INT(3) NOT NULL,
  `AttributeID` INT(3) NOT NULL,
  `Required` BIT NOT NULL, 
  CONSTRAINT `FK_biobank_specimen_type_attribute_TypeID` FOREIGN KEY (`TypeID`) REFERENCES `biobank_specimen_type`(`ID`), 
  CONSTRAINT `FK_biobank_specimen_type_attribute_AttributeID` FOREIGN KEY (`AttributeID`) REFERENCES `biobank_specimen_attribute`(`ID`),
  CONSTRAINT `UK_biobank_specimen_type_attribute` UNIQUE(`TypeID`, `AttributeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Validate*/
CREATE TABLE `biobank_validate_identifier` (
  `specimenTypeID` INT(3) NOT NULL,
  `ContainerTypeID` INT(3) NOT NULL,
  `Regex` varchar(255) NOT NULL,
  CONSTRAINT `PK_biobank_validate_identifer` PRIMARY KEY (SpecimenTypeID, ContainerTypeID),
  CONSTRAINT `FK_biobank_validate_identifier_SpecimenTypeID` FOREIGN KEY (`SpecimenTypeID`) REFERENCES `biobank_specimen_type`(`ID`),
  CONSTRAINT `FK_biobank_validate_identifier_ContainerTypeID` FOREIGN KEY (`ContainerTypeID`) REFERENCES `biobank_container_type`(`ID`),
  CONSTRAINT `UK_biobank_validate_identifier` UNIQUE(`SpecimenTypeID`, `ContainerTypeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


