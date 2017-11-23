

-- INSERTS --

/*Global*/
INSERT INTO biobank_reference_table (`table_name`, `column_name`)
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

/*Container*/
INSERT INTO biobank_container_unit (unit)
VALUES 	('mL'), 
	('g'), 
	('mL/g'), 
	('L'), 
	('cm^2')
;

INSERT INTO biobank_container_capacity (quantity, unit_id)
VALUES 	(100, 2),
	(10, 1),
	(5, 1),
	(250, 4),
	(20, 5)
;

INSERT INTO biobank_container_dimension (x, y, z)
VALUES 	(1, 1, 2),
	(2, 3, 2),
	(2, 1, 4),
	(5, 4, 3),
	(5, 5, 1)
;

INSERT INTO biobank_container_type (type, descriptor, label, `primary`, capacity_id, dimension_id)
VALUES 	('matrix box', 	'5x5', 		'5x5 Matrix Box', 	0,	NULL, 	5),
	('tube', 	'red top', 	'10mL RedTop Tube', 	1,	2, 	NULL),
	('tube', 	'blue top', 	'5mL BlueTop Tube', 	1,	3, 	NULL),
	('shelf', 	'5 levels', 	'5-level Shelf', 	0,	NULL, 	5)
;

INSERT INTO biobank_container_status (status, label)
VALUES 	('available', 'Available'),
	('unavailable', 'Unavailable'),
  	('discarded', 'Discarded')
;

INSERT INTO biobank_container_locus (destination, location, status)
VALUES 	(NULL, 'montreal', 'stored'),
	('toronto', NULL, 'transit')
;

INSERT INTO biobank_container (barcode, type_id, status_id, locus_id, parent_container_id, time_collect, notes)
VALUES	('matrix101', 	1, 1, 1, NULL,	CURRENT_TIMESTAMP, 	'note6'),
	('shelf101', 	4, 1, 1, NULL, 	CURRENT_TIMESTAMP,	'note7'),
	('specimen101', 2, 1, 1, 1, 	CURRENT_TIMESTAMP,	'note1'),
	('specimen102', 3, 2, 1, NULL, 	CURRENT_TIMESTAMP,	'note2'),
	('specimen103', 2, 1, 2, 1, 	CURRENT_TIMESTAMP,	'note3'),
	('specimen104', 3, 3, 2, NULL, 	CURRENT_TIMESTAMP,	'note4'),
	('specimen105', 3, 1, 2, 1,	CURRENT_TIMESTAMP,	'note5')
;

/*Specimen*/
INSERT INTO biobank_specimen_type (type, label)
VALUES 	('blood', 'Blood'),
	('saliva', 'Saliva'),
	('urine', 'Urine'),
	('chocolate', 'CHOCO-LOCO')
;

INSERT INTO biobank_specimen (container_id, type_id, quantity, parent_specimen_id, candidate_id, session_id, time_collect, notes, data)
VALUES 	(1, (SELECT id FROM biobank_specimen_type WHERE type='blood'), 1, NULL, (SELECT ID FROM candidate WHERE CandID=300001), 
		2, CURRENT_TIMESTAMP,	'notes1', '{ "Research Assistant":"John", "Colour": "Blue", "Smell":"Bad" }'),
	(2, (SELECT id FROM biobank_specimen_type WHERE type='saliva'), 2, NULL, (SELECT ID FROM candidate WHERE CandID=300002), 
		3, CURRENT_TIMESTAMP,	'notes2', '{ "Research Assistant":"Marie", "Colour": "Red", "Smell":"Great" }'),
	(3, (SELECT id FROM biobank_specimen_type WHERE type='chocolate'), 24, 1, (SELECT ID FROM candidate WHERE CandID=300003), 
		4, CURRENT_TIMESTAMP,	'notes3', '{ "Research Assistant":"John", "Colour": "Green", "Density":"10g/mL" }'),
	(4, (SELECT id FROM biobank_specimen_type WHERE type='urine'), 32, NULL, (SELECT ID FROM candidate WHERE CandID=300004), 
		5, CURRENT_TIMESTAMP,	'notes4', '{ "Research Assistant":"Frank", "Colour": "Blue", "Size":"Big" }'),
	(5, (SELECT id FROM biobank_specimen_type WHERE type='blood'), 75, 1, (SELECT ID FROM candidate WHERE CandID=300005), 
		6, CURRENT_TIMESTAMP,	'notes5', '{ "Research Assistant":"Alice", "Colour": "Yellow", "Smell":"Awful" }')
;

INSERT INTO biobank_specimen_attribute (name, label, datatype_id, required, reference_table_id)
VALUES 	('session', 'Visit Label', (SELECT id FROM biobank_datatype WHERE datatype='varchar'), 1,
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
 
