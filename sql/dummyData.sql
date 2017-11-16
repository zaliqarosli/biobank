

-- INSERTS --

/*Global*/
INSERT INTO biobank_reference_table (table_name, column_name)
VALUES 	('candidate', 'PSCID'),
	('session', 'Visit_label'),
	('biobank_specimen_type', 'label')
;

INSERT INTO biobank_datatype (datatype)
VALUES 	('bit'),
  	('int'),
	('float'),
	('varchar'),
	('text'),
	('datetime'),
	('date'),
	('time')
;

/*Container
INSERT INTO biobank_container_status (status, label)
VALUES ('stored', 'Stored'),
  ('transit', 'Transit'),
  ('discarded', 'Discarded')
;

INSERT INTO biobank_container (*/

/*Specimen*/
INSERT INTO biobank_specimen_type (type, label)
VALUES ('blood', 'Blood'),
	('saliva', 'Saliva'),
	('urine', 'Urine'),
	('chocolate', 'CHOCO-LOCO')
;

INSERT INTO biobank_specimen (container_id, type_id, quantity, parent_specimen_id, candidate_id, session_id, time_update, time_create, notes)
VALUES 	(NULL, (SELECT id FROM biobank_specimen_type WHERE type='blood'), 1, NULL, (SELECT ID FROM candidate WHERE CandID=100668), 
		2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'notes1'),
	(NULL, (SELECT id FROM biobank_specimen_type WHERE type='saliva'), 2, NULL, (SELECT ID FROM candidate WHERE CandID=100792), 
		3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'notes2'),
	(NULL, (SELECT id FROM biobank_specimen_type WHERE type='chocolate'), 24, NULL, (SELECT ID FROM candidate WHERE CandID=101072), 
		4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'notes3'),
	(NULL, (SELECT id FROM biobank_specimen_type WHERE type='urine'), 32, NULL, (SELECT ID FROM candidate WHERE CandID=101369), 
		5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'notes4'),
	(NULL, (SELECT id FROM biobank_specimen_type WHERE type='blood'), 75, NULL, (SELECT ID FROM candidate WHERE CandID=101742), 
		6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'notes5')
;

INSERT INTO biobank_specimen_attribute (name, label, datatype_id, required, reference_table_id)
VALUES ('session', 'Visit Label', (SELECT id FROM biobank_datatype WHERE datatype='varchar'), 1,
        (SELECT id FROM biobank_reference_table WHERE table_name= 'session')),
  ('type', 'Specimen Type', (SELECT id FROM biobank_datatype WHERE datatype='varchar'), 1,
   (SELECT id FROM biobank_reference_table WHERE table_name= 'biobank_specimen_type')),
  ('availability', 'Specimen Availability', (SELECT id FROM biobank_datatype WHERE datatype='varchar'), 1,
   (SELECT id FROM biobank_reference_table WHERE table_name= 'biobank_specimen_availability')),
  ('availability_quantity', 'Quantity', (SELECT id FROM biobank_datatype WHERE datatype='float'), 1,
   null),
  ('parent_id', 'Parent Specimen ID', (SELECT id FROM biobank_datatype WHERE datatype='varchar'), 0,
   (SELECT id FROM biobank_reference_table WHERE table_name= 'biobank_specimen')),
  ('container_id', 'Specimen Container ID', (SELECT id FROM biobank_datatype WHERE datatype='varchar'), 1,
   (SELECT id FROM biobank_reference_table WHERE table_name= 'biobank_container')),
  ('update_time', 'Update Time', (SELECT id FROM biobank_datatype WHERE datatype='datetime'), 1,
   null),
  ('notes', 'Notes', (SELECT id FROM biobank_datatype WHERE datatype='varchar'), 0,
   null)
;

/*Validate
--INSERT INTO biobank_validate_identifier*/
 
