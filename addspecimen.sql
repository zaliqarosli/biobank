-- RENAME TABLE biospecimen TO biospecimen_mavan;

-- not sure if type or name or unique id
CREATE TABLE freezer (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `type` varchar(20),
  `description` varchar(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO freezer (type, description)
VALUES ('MM13','4 degrees C fridge in room E-3304.10: XM-02'),
       ('MM14','-20 degrees C fridge in room E-3304.10: XM-01'),
       ('MM15', '-80 degrees C fridge in Lehman pavillion near room G-1116: MM15');

DELETE FROM biospecimen_status WHERE status!='Available';

DROP TABLE IF EXISTS `biospecimen`;
CREATE TABLE `biospecimen` (
`zepsom_id` varchar(255),
`specimen_type` varchar(255),
`nb_samples` smallint(4) DEFAULT NULL,
`biospecimen_id` varchar(255),
`status_id` tinyint(4),
`collection_date` date DEFAULT NULL,
`collection_ra_id` varchar(255),
`collection_time` time DEFAULT NULL,
`freezer_id` varchar(255),
`box_id` varchar(20) DEFAULT NULL,
`box_coordinates` varchar(20) DEFAULT NULL,
`collection_notes` varchar(255) DEFAULT NULL,

PRIMARY KEY (`biospecimen_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE biospecimen ADD CONSTRAINT fk_biospecimen_candidate_1 FOREIGN KEY (`zepsom_id`) REFERENCES `candidate` (`ExternalID`);
ALTER TABLE biospecimen ADD CONSTRAINT fk_biospecimen_biospecimen_type_1 FOREIGN KEY (`specimen_type`) REFERENCES `biospecimen_type` (`id`);
-- ALTER TABLE biospecimen ADD CONSTRAINT fk_biospecimen_biospecimen_status_1 FOREIGN KEY (`status_id`) REFERENCES `biospecimen_status` (`id`);
-- ALTER TABLE biospecimen ADD CONSTRAINT fk_biospcimen_biobanking_ra_id_1 FOREIGN KEY (`collection_ra_id`) REFERENCES `biobanking_ra` (`id`);
ALTER TABLE biospecimen ADD CONSTRAINT fk_biospecimen_freezer_id_1 FOREIGN KEY (`freezer_id`) REFERENCES `freezer` (`id`);

DROP TABLE `biospecimen_type`;
CREATE TABLE `biospecimen_type` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `specimen` varchar(30) NOT NULL,
  `label` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `specimen` (`specimen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO biospecimen_type (specimen,label) VALUES ('iswab','iSwab'),('oragene','Oragene'),('wb','Whole Blood'),('paxgene','Paxgene');

-- To be considered in new table
ALTER TABLE biospecimen ADD CONSTRAINT fk_biospecimen_1 FOREIGN KEY (`specimen_type`) REFERENCES `biospecimen_type` (`specimen`);
ALTER TABLE biospecimen ADD CONSTRAINT fk_biospecimen_2 FOREIGN KEY (`status_id`) REFERENCES `biospecimen_status` (`id`);

ALTER TABLE `consent_info_history`
ADD COLUMN `study_consent_biosamples` enum('yes','no','not_answered') DEFAULT NULL,
ADD COLUMN `study_consent_biosamples_date` date DEFAULT NULL,
ADD COLUMN `study_consent_biosamples_withdrawal` date DEFAULT NULL;
ADD COLUMN `study_consent_biosamples_sharing` enum('yes','no','not_answered') DEFAULT NULL,
ADD COLUMN `study_consent_biosamples_sharing_date` date DEFAULT NULL,
ADD COLUMN `study_consent_biosamples_sharing_withdrawal` date DEFAULT NULL;

ALTER TABLE `participant_status`
ADD COLUMN `study_consent_biosamples` enum('yes','no','not_answered') DEFAULT NULL,
ADD COLUMN `study_consent_biosamples_date` date DEFAULT NULL,
ADD COLUMN `study_consent_biosamples_withdrawal` date DEFAULT NULL;
ADD COLUMN `study_consent_biosamples_sharing` enum('yes','no','not_answered') DEFAULT NULL,
ADD COLUMN `study_consent_biosamples_sharing_date` date DEFAULT NULL,
ADD COLUMN `study_consent_biosamples_sharing_withdrawal` date DEFAULT NULL;
Add Comment