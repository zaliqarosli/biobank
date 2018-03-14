-- DROPS --

/*Relational*/
DROP TABLE IF EXISTS `biobank_container_coordinate_rel`;
DROP TABLE IF EXISTS `biobank_container_psc_rel`;
DROP TABLE IF EXISTS `biobank_specimen_type_unit_rel`;
DROP TABLE IF EXISTS `biobank_specimen_type_container_type_rel`;
DROP TABLE IF EXISTS `biobank_specimen_protocol_attribute_rel`;
DROP TABLE IF EXISTS `biobank_specimen_type_attribute_rel`;

/*Specimen*/
DROP TABLE IF EXISTS `biobank_specimen_attribute`;
DROP TABLE IF EXISTS `biobank_specimen_analysis`;
DROP TABLE IF EXISTS `biobank_specimen_preparation`;
DROP TABLE IF EXISTS `biobank_specimen_collection`;
DROP TABLE IF EXISTS `biobank_specimen`;
DROP TABLE IF EXISTS `biobank_specimen_protocol`;
DROP TABLE IF EXISTS `biobank_specimen_type`;

/*Container*/
DROP TABLE IF EXISTS `biobank_container`;
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
  CONSTRAINT `PK_biobank_unit` PRIMARY KEY (`ID`)
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
  `Label` varchar(40) NOT NULL,
  `Primary` BIT(1) NOT NULL,
  `CapacityID` INT(3),
  `DimensionID` INT(3),
  CONSTRAINT `PK_biobank_container_type` PRIMARY KEY (`ID`),
  CONSTRAINT `FK_biobank_container_type_CapacityID` FOREIGN KEY (`CapacityID`) REFERENCES `biobank_container_capacity`(`ID`),
  CONSTRAINT `FK_biobank_container_type_DimensionID` FOREIGN KEY (`DimensionID`) REFERENCES `biobank_container_dimension`(`ID`),
  CONSTRAINT `UK_biobank_container_type_Type_Descriptor` UNIQUE(`Type`, `Descriptor`),
  CONSTRAINT `UK_biobank_container_type_Label` UNIQUE (`Label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_container_status` (
  `ID` INT(2) NOT NULL AUTO_INCREMENT,
  `Status` varchar(40) NOT NULL,
  CONSTRAINT `PK_biobank_container_status` PRIMARY KEY (`ID`),
  CONSTRAINT `UK_biobank_container_status_Status` UNIQUE (`Status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_container` (
  `ID` INT(10) NOT NULL AUTO_INCREMENT,
  `Barcode` varchar(40) NOT NULL, /*index by barcode*/
  `TypeID` INT(3) NOT NULL,
  `StatusID` INT(2) NOT NULL,
  `OriginID` integer unsigned NOT NULL,
  `LocationID` integer unsigned NOT NULL,
  `DateTimeCreate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `DateTimeUpdate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `Comments` varchar(255),
  CONSTRAINT `PK_biobank_container` PRIMARY KEY (`ID`),
  CONSTRAINT `FK_biobank_container_TypeID` FOREIGN KEY (`TypeID`) REFERENCES `biobank_container_type`(`ID`),  
  CONSTRAINT `FK_biobank_container_StatusID` FOREIGN KEY (`StatusID`) REFERENCES `biobank_container_status`(`ID`),  
  CONSTRAINT `FK_biobank_container_OriginID` FOREIGN KEY (`OriginID`) REFERENCES `psc`(`CenterID`),  
  CONSTRAINT `FK_biobank_container_LocationID` FOREIGN KEY (`LocationID`) REFERENCES `psc`(`CenterID`),  
  CONSTRAINT `UK_biobank_container_Barcode` UNIQUE (`Barcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/*Specimen*/
CREATE TABLE `biobank_specimen_type` (
  `ID` INT(3) NOT NULL AUTO_INCREMENT,
  `Type` varchar(50) NOT NULL,
  `ParentTypeID` INT(3),
  CONSTRAINT `PK_biobank_specimen_type` PRIMARY KEY (`ID`),
  CONSTRAINT `FK_biobank_specimen_type_ParentTypeID` FOREIGN KEY (`ParentTypeID`) REFERENCES `biobank_specimen_type`(`ID`),
  CONSTRAINT `UK_biobank_specimen_type_Type` UNIQUE (`Type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_specimen_protocol` (
  `ID` INT(2) NOT NULL AUTO_INCREMENT,
  `Protocol` varchar(50) NOT NULL,
  `TypeID` INT(3) NOT NULL,
  CONSTRAINT `PK_biobank_specimen_protocol` PRIMARY KEY (`ID`),
  CONSTRAINT `UK_biobank_specimen_protocol_Protocol` UNIQUE (`Protocol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8; 

CREATE TABLE `biobank_specimen` (
  `ID` INT(10) NOT NULL AUTO_INCREMENT,
  `ContainerID` INT(10) NOT NULL, /*Index by ContainerID*/
  `TypeID` INT(3) NOT NULL,
  `Quantity` DECIMAL(10, 5) NOT NULL,
  `UnitID` INT(2) NOT NULL,
  `ParentSpecimenID` INT(10),
  `CandidateID` INT(6) NOT NULL,
  `SessionID` INT(10) UNSIGNED NOT NULL,
  `DateTimeUpdate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `PK_biobank_specimen` PRIMARY KEY (`ID`),
  CONSTRAINT `FK_biobank_specimen_ContainerID` FOREIGN KEY (`ContainerID`) REFERENCES `biobank_container`(`ID`),
  CONSTRAINT `FK_biobank_specimen_TypeID` FOREIGN KEY (`TypeID`) REFERENCES `biobank_specimen_type`(`ID`),
  CONSTRAINT `FK_biobank_specimen_UnitID` FOREIGN KEY (`UnitID`) REFERENCES `biobank_unit` (`ID`),
  CONSTRAINT `FK_biobank_specimen_ParentSpecimenID` FOREIGN KEY (`ParentSpecimenID`) REFERENCES `biobank_specimen`(`ID`),
  CONSTRAINT `FK_biobank_specimen_CandidateID` FOREIGN KEY (`CandidateID`) REFERENCES `candidate`(`CandID`),
  CONSTRAINT `FK_biobank_specimen_SessionID` FOREIGN KEY (`SessionID`) REFERENCES `session`(`ID`),
  CONSTRAINT `UK_biobank_specimen_ContainerID` UNIQUE (`ContainerID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_specimen_collection` (
  `SpecimenID` INT(10) NOT NULL,
  `Quantity` DECIMAL(10, 5) NOT NULL,
  `UnitID` INT(2) NOT NULL,
  `LocationID` integer unsigned NOT NULL,
  `Date` DATE NOT NULL,
  `Time` TIME NOT NULL,
  `Comments` varchar(255),
  `Data` json DEFAULT NULL,
  CONSTRAINT `PK_biobank_specimen_collection` PRIMARY KEY (`SpecimenID`),
  CONSTRAINT `FK_biobank_specimen_collection SpecimenID` FOREIGN KEY (`SpecimenID`) REFERENCES `biobank_specimen`(`ID`),
  CONSTRAINT `FK_biobank_specimen_collection_UnitID` FOREIGN KEY (`UnitID`) REFERENCES `biobank_unit`(`ID`),
  CONSTRAINT `FK_biobank_specimen_collection_LocationID` FOREIGN KEY (`LocationID`) REFERENCES `psc`(`CenterID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_specimen_preparation` (
  `SpecimenID` INT(10) NOT NULL,
  `ProtocolID` INT(2) NOT NULL,
  `LocationID` integer unsigned NOT NULL,
  `Date` DATE NOT NULL,
  `Time` TIME NOT NULL,
  `Comments` varchar(255),
  `Data` json DEFAULT NULL,
  CONSTRAINT `PK_biobank_specimen_preparation` PRIMARY KEY (`SpecimenID`),
  CONSTRAINT `FK_biobank_specimen_preparation_SpecimenID` FOREIGN KEY (`SpecimenID`) REFERENCES `biobank_specimen`(`ID`),
  CONSTRAINT `FK_biobank_specimen_preparation_ProtocolID` FOREIGN KEY (`ProtocolID`) REFERENCES `biobank_specimen_protocol`(`ID`),
  CONSTRAINT `FK_biobank_specimen_preparation_LocationID` FOREIGN KEY (`LocationID`) REFERENCES `psc`(`CenterID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_specimen_analysis` (
  `SpecimenID` INT(10) NOT NULL,
  `LocationID` integer unsigned NOT NULL,
  `Date` DATE NOT NULL,
  `Time` TIME NOT NULL,
  `Comments` varchar(255),
  `Data` json DEFAULT NULL,
  CONSTRAINT `PK_biobank_specimen` PRIMARY KEY (`SpecimenID`),
  CONSTRAINT `FK_biobank_specimen_SpecimenID` FOREIGN KEY (`SpecimenID`) REFERENCES `biobank_specimen`(`ID`),
  CONSTRAINT `FK_biobank_specimen_analysis_LocationID` FOREIGN KEY (`LocationID`) REFERENCES `psc`(`CenterID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_specimen_attribute` (
  `ID` INT(3) NOT NULL AUTO_INCREMENT,
  `Name` varchar(40) NOT NULL,
  `DatatypeID` INT(3) NOT NULL,
  `ReferenceTableID` INT(3),
  CONSTRAINT `PK_biobank_specimen_attribute` PRIMARY KEY (`ID`),
  CONSTRAINT `FK_biobank_specimen_attribute_DatatypeID` FOREIGN KEY (`DatatypeID`) REFERENCES `biobank_datatype`(`ID`),
  CONSTRAINT `FK_biobank_specimen_attribute_ReferenceTableID` 
    FOREIGN KEY (`ReferenceTableID`) REFERENCES `biobank_reference_table`(`ID`),
  CONSTRAINT `UK_biobank_specimen_attribute_Name` UNIQUE (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Relational Tables*/
CREATE TABLE `biobank_specimen_type_attribute_rel` (
  `TypeID` INT(3) NOT NULL,
  `AttributeID` INT(3) NOT NULL,
  `Required` BIT NOT NULL, 
  CONSTRAINT `FK_biobank_specimen_type_attribute__rel_TypeID` FOREIGN KEY (`TypeID`) REFERENCES `biobank_specimen_type`(`ID`), 
  CONSTRAINT `FK_biobank_specimen_type_attribute_rel_AttributeID` 
    FOREIGN KEY (`AttributeID`) REFERENCES `biobank_specimen_attribute`(`ID`),
  CONSTRAINT `UK_biobank_specimen_type_attribute_rel` UNIQUE (`TypeID`, `AttributeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_specimen_protocol_attribute_rel` (
  `ProtocolID` INT(3) NOT NULL,
  `AttributeID` INT(3) NOT NULL,
  `Required` BIT NOT NULL, 
  CONSTRAINT `FK_biobank_specimen_protocol_attribute__rel_TypeID` 
    FOREIGN KEY (`ProtocolID`) REFERENCES `biobank_specimen_protocol`(`ID`), 
  CONSTRAINT `FK_biobank_specimen_protocol_attribute_rel_AttributeID` 
    FOREIGN KEY (`AttributeID`) REFERENCES `biobank_specimen_attribute`(`ID`),
  CONSTRAINT `UK_biobank_specimen_protocol_attribute_rel` UNIQUE (`ProtocolID`, `AttributeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_specimen_type_container_type_rel` (
  `SpecimenTypeID` INT(3) NOT NULL,
  `ContainerTypeID` INT(3) NOT NULL,
  `Regex` varchar(255) NOT NULL,
  CONSTRAINT `PK_biobank_validate_identifer` PRIMARY KEY (SpecimenTypeID, ContainerTypeID),
  CONSTRAINT `FK_biobank_validate_identifier_SpecimenTypeID` 
    FOREIGN KEY (`SpecimenTypeID`) REFERENCES `biobank_specimen_type`(`ID`),
  CONSTRAINT `FK_biobank_validate_identifier_ContainerTypeID` 
    FOREIGN KEY (`ContainerTypeID`) REFERENCES `biobank_container_type`(`ID`),
  CONSTRAINT `UK_biobank_validate_identifier` UNIQUE (`SpecimenTypeID`, `ContainerTypeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_specimen_type_unit_rel` (
  `TypeID` INT(3) NOT NULL, 
  `UnitID` INT(2)  NOT NULL,
  CONSTRAINT `FK_biobank_specimen_type_unit_rel_TypeID` FOREIGN KEY (`TypeID`) REFERENCES `biobank_specimen_type` (`ID`),
  CONSTRAINT `FK_biobank_specimen_type_unit_rel_SourceID` FOREIGN KEY (`UnitID`) REFERENCES `biobank_unit` (`ID`),
  CONSTRAINT `UK_biobank_container_psc_rel` UNIQUE (`TypeID`, `UnitID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_container_psc_rel` (
  `ContainerID` INT(10) NOT NULL, 
  `SourceID` integer unsigned NOT NULL,
  `DestinationID` integer unsigned NOT NULL,
  CONSTRAINT `FK_biobank_container_psc_rel_ContainerID` FOREIGN KEY (`ContainerID`) REFERENCES `biobank_container` (`ID`),
  CONSTRAINT `FK_biobank_container_psc_rel_SourceID` FOREIGN KEY (`SourceID`) REFERENCES `psc` (`CenterID`),
  CONSTRAINT `FK_biobank_container_psc_rel_DestinationID` FOREIGN KEY (`DestinationID`) REFERENCES `psc` (`CenterID`),
  CONSTRAINT `UK_biobank_container_psc_rel_ContainerID` UNIQUE (`ContainerID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_container_coordinate_rel` (
  `ParentContainerID` INT(10) NOT NULL,
  `Coordinate` INT(10),
  `ChildContainerID` INT(10) NOT NULL,
  CONSTRAINT `FK_biobank_container_coordinate_rel_ParentContainerID`
    FOREIGN KEY (`ParentContainerID`) REFERENCES `biobank_container` (`ID`),
  CONSTRAINT `FK_biobank_container_coordinate_rel_ChildContainerID`
    FOREIGN KEY (`ChildContainerID`) REFERENCES `biobank_container` (`ID`),
  CONSTRAINT `UK_biobank_container_coordinate_rel_ParentContainerID_Coordinate` UNIQUE (`ParentContainerID`, `Coordinate`),
  CONSTRAINT `UK_biobank_container_coordinate_rel_ChildContainerID` UNIQUE (`ChildContainerID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/*INDEXES*/

/* Future indexes need to go here*/


/*INSERTS*/

/*Global*/
INSERT INTO biobank_datatype (Datatype)
VALUES  ('boolean'),
        ('number'),
        ('text'),
        ('datetime')
;

/*Container*/
INSERT INTO biobank_container_status (Status)
VALUES  ('Available'),
        ('Reserved'),
        ('Dispensed')
;

