ALTER TABLE biospecimen
  MODIFY COLUMN `nb_samples` smallint(4) NOT NULL;

INSERT INTO permissions (`code`, `description`, `categoryID`)
VALUES ('create_biobanking', 'Add biospecimen values to the biobanking module', 2);