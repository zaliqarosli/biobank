

-- INSERTS --

/*Global*/
INSERT INTO biobank_reference_table (`table_name`, `column_name`)
VALUES 	('research_assistant', 'name'),
	('colours', 'name')
;

INSERT INTO biobank_datatype (datatype)
VALUES 	('bit'),
  	('number'),
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
    ('vial', 'purple top', 'PURPLE VIAL', 1, 1, NULL),
	('shelf', 	'5 levels', 	'5-level Shelf', 	0,	NULL, 	5)
;

INSERT INTO biobank_container_status (status, label)
VALUES 	('available', 'Available'),
	('unavailable', 'Unavailable'),
  	('discarded', 'Discarded')
;

INSERT INTO biobank_container_locus (location_id, destination_id, origin_id)
VALUES 	(NULL, 2, 2),
	(3, NULL, 2)
;

INSERT INTO biobank_container (barcode, type_id, status_id, locus_id, parent_container_id, time_create, notes)
VALUES	('matrix101',  1, 1, 1, NULL,	CURRENT_TIMESTAMP, 	'note6'),
	('shelf101',   4, 1, 1, NULL, 	CURRENT_TIMESTAMP,	'note7'),
	('mtlcode101', 2, 1, 1, 1, 	CURRENT_TIMESTAMP,	'note1'),
	('mtlcode102', 3, 2, 1, NULL, 	CURRENT_TIMESTAMP,	'note2'),
	('mtlcode103', 2, 1, 2, 1, 	CURRENT_TIMESTAMP,	'note3'),
	('mtlcode104', 3, 3, 2, NULL, 	CURRENT_TIMESTAMP,	'note4'),
	('mtlcode105', 3, 1, 2, 1,	CURRENT_TIMESTAMP,	'note5')
;

/*Specimen*/
INSERT INTO biobank_specimen_type (type, label)
VALUES 	('blood', 'Blood'),
	('saliva', 'Saliva'),
	('urine', 'Urine'),
	('chocolate', 'CHOCO-LOCO')
;

INSERT INTO biobank_specimen (container_id, type_id, quantity, parent_specimen_id, candidate_id, session_id, time_collect, notes, data)
VALUES 	(7, (SELECT id FROM biobank_specimen_type WHERE type='blood'), 1, NULL, 162, 
		2, CURRENT_TIMESTAMP,	'lid fell off when taking sample', '{ "Research Assistant":"John", "Colour": "Blue", "Quality":"Bad" }'),
	(6, (SELECT id FROM biobank_specimen_type WHERE type='saliva'), 2, NULL, 163, 
		3, CURRENT_TIMESTAMP,	'full sample could not be taken due to patient discomfort', '{ "Research Assistant":"Marie", "Colour": "Red", "Quality":"Great" }'),
	(5, (SELECT id FROM biobank_specimen_type WHERE type='chocolate'), 24, 1, 164, 
		4, CURRENT_TIMESTAMP,	'no notes necessary', '{ "Research Assistant":"John", "Freeze/Thaw Cycle": "8", "Density":"10g/mL" }'),
	(4, (SELECT id FROM biobank_specimen_type WHERE type='urine'), 32, NULL, 165, 
		5, CURRENT_TIMESTAMP,	NULL, '{ "Research Assistant":"Frank", "Colour": "Blue", "Size":"Big" }'),
	(3, (SELECT id FROM biobank_specimen_type WHERE type='blood'), 75, 1, 166, 
		6, CURRENT_TIMESTAMP,	'Unsure if specimen was contaminated', '{ "Research Assistant":"Alice", "Freeze/Thaw Cycle": "20", "Quality":"Awful", "Texture": "Soft", "Coolness": "100%" }')
;

INSERT INTO biobank_specimen_attribute (name, datatype_id, reference_table_id)
VALUES 	('Research Assistant', (SELECT id FROM biobank_datatype WHERE datatype='varchar'), NULL),
	('Colour', (SELECT id FROM biobank_datatype WHERE datatype='varchar'), NULL),
	('Smell', (SELECT id FROM biobank_datatype WHERE datatype='bit'), NULL),
	('Density', (SELECT id FROM biobank_datatype WHERE datatype='number'), NULL),
	('Expected Processing Date', (SELECT id FROM biobank_datatype WHERE datatype='datetime'), NULL)
;

INSERT INTO biobank_specimen_type_attribute (type_id, attribute_id, required)
VALUES 	(1, 1, 1),
	(2, 1, 1),
	(3, 1, 1),
	(4, 1, 1),
	(1, 2, 1),
	(3, 2, 1),
	(4, 2, 0),
	(3, 3, 0),
	(4, 3, 1),
	(1, 4, 0),
	(4, 5, 0)
;

/*Validate
INSERT INTO biobank_validate_identifier*/
 
