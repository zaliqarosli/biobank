-- DROPS --

/*Validate*/
DROP TABLE IF EXISTS `biobank_validate_identifier`;

/*Specimen*/
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
DROP TABLE IF EXISTS `biobank_container_unit`;

/*Global*/
DROP TABLE IF EXISTS `biobank_datatype`;
DROP TABLE IF EXISTS `biobank_reference_table`;


-- CREATES --

/*Global*/
CREATE TABLE `biobank_reference_table` (
  `id` INT(3) NOT NULL AUTO_INCREMENT,
  `table_name` varchar(50) NOT NULL,
  `column_name` INT(3) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `biobank_reference_table_uq0` UNIQUE(`table_name`, `column_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_datatype` (
  `id` INT(3) NOT NULL AUTO_INCREMENT,
  `datatype` varchar(20) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Container*/
CREATE TABLE `biobank_container_unit` (
  `id` INT(3) NOT NULL AUTO_INCREMENT,
  `unit` varchar(20) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_container_capacity` (
  `id` INT(3) NOT NULL AUTO_INCREMENT,
  `quantity` FLOAT NOT NULL,
  `unit_id` INT(3) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `biobank_container_capacity_fk0` FOREIGN KEY (`unit_id`) REFERENCES `biobank_container_unit`(`id`),
  CONSTRAINT `biobank_container_capacity_uq0` UNIQUE(`quantity`, `unit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_container_dimension` (
  `id` INT(3) NOT NULL AUTO_INCREMENT,
  `x` INT(6) NOT NULL,
  `y` INT(6) NOT NULL,
  `z` INT(6) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `biobank_container_dimension_uq0` UNIQUE(`x`, `y`, `z`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_container_type` (
  `id` INT(3) NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL,
  `descriptor` varchar(20) NOT NULL,
  `label` varchar(40) NOT NULL UNIQUE,
  `primary` BIT NOT NULL,
  `capacity_id` INT(3),
  `dimension_id` INT(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `biobank_container_type_fk0` FOREIGN KEY (`capacity_id`) REFERENCES `biobank_container_capacity`(`id`),
  CONSTRAINT `biobank_container_type_fk1` FOREIGN KEY (`dimension_id`) REFERENCES `biobank_container_dimension`(`id`),
  CONSTRAINT `biobank_container_type_uq0` UNIQUE(`type`, `descriptor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_container_status` (
  `id` INT(2) NOT NULL AUTO_INCREMENT,
  `status` varchar(40) NOT NULL UNIQUE,
  `label` varchar(40) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_container_locus` (
  `id` INT(10) NOT NULL AUTO_INCREMENT,
  `destination` varchar(40),
  `location` varchar(40),
  `status` varchar(40),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_container` (
  `id` INT(10) NOT NULL AUTO_INCREMENT,
  `container` varchar(40) NOT NULL UNIQUE,
  `type_id` INT(3) NOT NULL,
  `status_id` INT(2) NOT NULL,
  `locus_id` INT(10) NOT NULL,
  `parent_container_id` INT(10),
  `time_update` DATETIME NOT NULL,
  `time_create` DATETIME NOT NULL,
  `notes` varchar(255),
  PRIMARY KEY (`id`),
  CONSTRAINT `biobank_container_fk0` FOREIGN KEY (`type_id`) REFERENCES `biobank_container_type`(`id`),  
  CONSTRAINT `biobank_container_fk1` FOREIGN KEY (`status_id`) REFERENCES `biobank_container_status`(`id`),  
  CONSTRAINT `biobank_container_fk2` FOREIGN KEY (`locus_id`) REFERENCES `biobank_container_locus`(`id`),  
  CONSTRAINT `biobank_container_fk3` FOREIGN KEY (`parent_container_id`) REFERENCES `biobank_container_type`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Specimen*/
CREATE TABLE `biobank_specimen_type` (
  `id` INT(5) NOT NULL AUTO_INCREMENT,
  `type` varchar(40) NOT NULL UNIQUE,
  `label` varchar(40) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_specimen` (
  `id` INT(10) NOT NULL AUTO_INCREMENT,
  `container_id` INT(10), /*RETURN TO NOT NULL UNIQUE WHEN FINISHED TESTING*/
  `type_id` INT(5) NOT NULL,
  `quantity` DECIMAL(10, 5) NOT NULL,
  `parent_specimen_id` INT(10),
  `candidate_id` INT(10) UNSIGNED NOT NULL,
  `session_id` INT(10) UNSIGNED NOT NULL,
  `time_update` DATETIME NOT NULL,
  `time_create` DATETIME NOT NULL,
  `notes` varchar(255),
  /*`data` JSON,*/ 
  PRIMARY KEY (`id`),
  CONSTRAINT `biobank_specimen_fk0` FOREIGN KEY (`container_id`) REFERENCES `biobank_container`(`id`),
  CONSTRAINT `biobank_specimen_fk1` FOREIGN KEY (`type_id`) REFERENCES `biobank_specimen_type`(`id`),
  CONSTRAINT `biobank_specimen_fk3` FOREIGN KEY (`parent_specimen_id`) REFERENCES `biobank_specimen`(`id`),
  CONSTRAINT `biobank_specimen_fk4` FOREIGN KEY (`candidate_id`) REFERENCES `candidate`(`ID`),
  CONSTRAINT `biobank_specimen_fk5` FOREIGN KEY (`session_id`) REFERENCES `session`(`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `biobank_specimen_attribute` (
  `id` INT(3) NOT NULL AUTO_INCREMENT,
  `name` varchar(40) NOT NULL UNIQUE,
  `label` varchar(40) NOT NULL UNIQUE,
  `datatype_id` INT(3) NOT NULL,
  `required` BIT NOT NULL,
  `reference_table_id` INT(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `biobank_specimen_attribute_fk0` FOREIGN KEY (`datatype_id`) REFERENCES `biobank_datatype`(`id`),
  CONSTRAINT `biobank_specimen_attribute_fk1` FOREIGN KEY (`reference_table_id`) REFERENCES `biobank_reference_table`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Validate*/
CREATE TABLE `biobank_validate_identifier` (
  `specimen_type_id` INT(3) NOT NULL,
  `container_type_id` INT(3) NOT NULL,
  `regex` varchar(255) NOT NULL,
  PRIMARY KEY (specimen_type_id, container_type_id),
  CONSTRAINT `biobank_validate_identifier_fk0` FOREIGN KEY (`specimen_type_id`) REFERENCES `biobank_specimen_type`(`id`),
  CONSTRAINT `biobank_validate_identifier_fk1` FOREIGN KEY (`container_type_id`) REFERENCES `biobank_container_type`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- INSERTS --

/*Global
INSERT INTO biobank_datatype (datatype)
VALUES ('bit'),
  ('int'),
  ('float'),
  ('varchar'),
  ('text'),
  ('datetime'),
  ('date'),
  ('time')
;*/

/*Container
INSERT INTO biobank_container_status (status, label)
VALUES ('stored', 'Stored'),
  ('transit', 'Transit'),
  ('discarded', 'Discarded')
;*/

/*Specimen
INSERT INTO biobank_specimen_attribute (name, label, datatype_id, required, ref_table_id)
VALUES ('session', 'Visit Label', (SELECT id FROM biobank_datatype WHERE datatype='varchar'), 1,
        (SELECT id FROM biobank_ref_table WHERE table_name= 'session')),
  ('type', 'Specimen Type', (SELECT id FROM biobank_datatype WHERE datatype='varchar'), 1,
   (SELECT id FROM biobank_ref_table WHERE table_name= 'biobank_specimen_type')),
  ('availability', 'Specimen Availability', (SELECT id FROM biobank_datatype WHERE datatype='varchar'), 1,
   (SELECT id FROM biobank_ref_table WHERE table_name= 'biobank_specimen_availability')),
  ('availability_quantity', 'Quantity', (SELECT id FROM biobank_datatype WHERE datatype='float'), 1,
   null),
  ('parent_id', 'Parent Specimen ID', (SELECT id FROM biobank_datatype WHERE datatype='varchar'), 0,
   (SELECT id FROM biobank_ref_table WHERE table_name= 'biobank_specimen')),
  ('container_id', 'Specimen Container ID', (SELECT id FROM biobank_datatype WHERE datatype='varchar'), 1,
   (SELECT id FROM biobank_ref_table WHERE table_name= 'biobank_container')),
  ('update_time', 'Update Time', (SELECT id FROM biobank_datatype WHERE datatype='datetime'), 1,
   null),
  ('notes', 'Notes', (SELECT id FROM biobank_datatype WHERE datatype='varchar'), 0,
   null)
;*/
