
INSERT INTO permissions (`code`, `description`, `categoryID`) 
       VALUES ('upload_biobanking', 'Upload biospecimen files in the biobanking module', 2);
       
DROP TABLE IF EXISTS `biobanking_uploads`;
CREATE TABLE `biobanking_uploads` (
`id` int(10) unsigned NOT NULL auto_increment,
`user_id` int(10) unsigned NOT NULL,
`upload_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `biobanking_uploads_biospecimen_rel`;
CREATE TABLE `biobanking_uploads_biospecimen_rel` (
`upload_id` int(10) unsigned NOT NULL,
`biospecimen_id` varchar(255) NOT NULL,
PRIMARY KEY (`upload_id`, `biospecimen_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `biobanking_uploads_media_rel`;
CREATE TABLE `biobanking_uploads_media_rel` (
`upload_id` int(10) unsigned NOT NULL,
`media_id` int(11) NOT NULL,
PRIMARY KEY (`upload_id`, `media_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `biospecimen_extractions`;
CREATE TABLE `biospecimen_extractions` (
   `id`               varchar(255) NOT NULL,
   `parent_id`        varchar(255) NOT NULL,
   `type_id`          tinyint NOT NULL,
   `status_id`        tinyint NOT NULL,
   `a260_a280`        float DEFAULT NULL,
   `a260_a230`        float DEFAULT NULL,
   `concentration`    float NOT NULL,
   `volume`           float NOT NULL,
   `volume_extracted` float DEFAULT NULL,
   `volume_collected` float DEFAULT NULL,
   `date_extracted`   timestamp NOT NULL,
   `extraction_ra_id` tinyint DEFAULT NULL,
   `freezer_id`       tinyint NOT NULL,
   `box_id`           varchar(255) NOT NULL,
   `box_coordinates`  varchar(20) NOT NULL,
   `comments`         varchar(255) DEFAULT NULL
PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `biospecimen_dilutions`;
CREATE TABLE `biospecimen_dilutions` (
   `id`               varchar(255) NOT NULL,
   `parent_id`        varchar(255) NOT NULL,
   `type_id`          tinyint NOT NULL,
   `status_id`        tinyint NOT NULL,
   `a260_a280`        float DEFAULT NULL,
   `a260_a230`        float DEFAULT NULL,
   `concentration`    float NOT NULL,
   `volume`           float NOT NULL,
   `volume_extracted` float DEFAULT NULL,
   `volume_collected` float DEFAULT NULL,
   `date_extracted`   timestamp NOT NULL,
   `extraction_ra_id` 
   `freezer_id`       tinyint NOT NULL,
   `box_id`           varchar(255) NOT NULL,
   `box_coordinates`  varchar(20) NOT NULL,
   `comments`         varchar(255) DEFAULT NULL
PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
