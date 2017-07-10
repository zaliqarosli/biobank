

CREATE TABLE `specimen_types` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `specimen` varchar(30) NOT NULL,
  `label` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `specimen` (`specimen`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

INSERT INTO specimen_types (specimen,label) VALUES ('iswab','iSwab'),('paxgene','Paxgene'),('oragene','Oragene'),('edta','EDTA');

ALTER TABLE biospecimen ADD CONSTRAINT fk_biospecimen_1 FOREIGN KEY (`specimen_type`) REFERENCES `specimen_types` (`specimen`);

ALTER TABLE `consent_info_history`
ADD COLUMN `study_consent_biosamples` enum('yes','no','not_answered') DEFAULT NULL,
ADD COLUMN `study_consent_biosamples_date` date DEFAULT NULL,
ADD COLUMN `study_consent_biosamples_withdrawal` date DEFAULT NULL;


ALTER TABLE `participant_status`
ADD COLUMN `study_consent_biosamples` enum('yes','no','not_answered') DEFAULT NULL,
ADD COLUMN `study_consent_biosamples_date` date DEFAULT NULL,
ADD COLUMN `study_consent_biosamples_withdrawal` date DEFAULT NULL;
Add Comment