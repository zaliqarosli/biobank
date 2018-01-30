

-- INSERTS --

/*Global*/
INSERT INTO biobank_reference_table (`TableName`, `ColumnName`)
VALUES 	('users', 'First_name'),
	('colours', 'name')
;

INSERT INTO biobank_datatype (Datatype)
VALUES 	('boolean'),
  	('number'),
	('text'),
	('datetime')
;

/*Container*/
INSERT INTO biobank_unit (Unit)
VALUES 	('mL'), 
	('g'), 
	('mL/g'), 
	('L'), 
	('cm^2')
;

INSERT INTO biobank_container_capacity (Quantity, UnitId)
VALUES 	(100, 2),
	(10, 1),
	(5, 1),
	(250, 4),
	(20, 5)
;

INSERT INTO biobank_container_dimension (X, Y, Z)
VALUES 	(1, 1, 2),
	(2, 3, 2),
	(2, 1, 4),
	(5, 4, 3),
	(5, 5, 1)
;

INSERT INTO biobank_container_type (Type, Descriptor, Label, `Primary`, CapacityID, DimensionID)
VALUES 	('matrix box', 	'5x5', 		'5x5 Matrix Box', 	0,	NULL, 	5),
	('tube', 	'red top', 	'10mL RedTop Tube', 	1,	2, 	NULL),
	('tube', 	'blue top', 	'5mL BlueTop Tube', 	1,	3, 	NULL),
    ('vial', 'purple top', 'PURPLE VIAL', 1, 1, NULL),
	('shelf', 	'5 levels', 	'5-level Shelf', 	0,	NULL, 	5)
;

INSERT INTO biobank_container_status (Status)
VALUES 	('Available'),
	('Reserved'),
  	('Dispensed')
;

INSERT INTO biobank_container_locus (LocationID, DestinationID, OriginID)
VALUES 	(NULL, 2, 2),
	(3, NULL, 2)
;

INSERT INTO biobank_container (Barcode, TypeId, StatusID, LocusID, ParentContainerID, CreateDate, CreateTime, Notes)
VALUES	('MAT001',  (SELECT ID from biobank_container_type WHERE Label='5x5 Matrix Box'), 1, 1, NULL,	CURRENT_DATE, CURRENT_TIME, ''),
	('shelf101',   4, 1, 1, NULL, 	CURRENT_DATE, CURRENT_TIME, ''),
	('BLD002', 2, 1, 1, 1, 	CURRENT_DATE, CURRENT_TIME, ''),
	('URI001', 3, 2, 1, NULL, 	CURRENT_DATE, CURRENT_TIME, ''),
	('SNF001', 2, 1, 2, 1, 	CURRENT_DATE, CURRENT_TIME, ''),
	('BCS001', 3, 3, 2, NULL, 	CURRENT_DATE, CURRENT_TIME, ''),
	('BLD001', 3, 1, 2, 1,	CURRENT_DATE, CURRENT_TIME,	''),
    ('MAT002',  (SELECT ID from biobank_container_type WHERE Label='5x5 Matrix Box'), 1, 1, NULL,	CURRENT_DATE, CURRENT_TIME, '')
;

/*Specimen*/
INSERT INTO biobank_specimen_type (Type)
VALUES 	('Blood'),
	('Serum'),
	('Plasma'),
	('Urine'),
	('Synovial Fluid'),
	('Bone Marrow'),
	('Buccal Swab'),
	('PBMC')
;

INSERT INTO biobank_specimen (ContainerID, TypeID, Quantity, UnitID, ParentSpecimenID, CandidateID, SessionID, CollectDate, CollectTime, Notes, Data)
VALUES 	(7, (SELECT ID FROM biobank_specimen_type WHERE type='Blood'), 1, 1, NULL, 300001, 
		1, CURRENT_DATE, CURRENT_TIME,	'lid fell off when taking sample', '{ "1":"John", "2": "Blue", "3":"Bad" }'),
	(6, (SELECT ID FROM biobank_specimen_type WHERE type='Buccal Swab'), 2, 2, NULL, 300002, 
		2, CURRENT_DATE, CURRENT_TIME,	'full sample could not be taken due to patient discomfort', '{ "1":"Marie", "2": "Red", "3":"Great" }'),
	(5, (SELECT ID FROM biobank_specimen_type WHERE type='Synovial Fluid'), 24, 3, 1, 300003, 
		3, CURRENT_DATE, CURRENT_TIME,	'no notes necessary', '{ "1":"John", "3": "8", "4":"10g/mL" }'),
	(4, (SELECT ID FROM biobank_specimen_type WHERE type='Urine'), 32, 4, NULL, 300004, 
		4, CURRENT_DATE, CURRENT_TIME,	NULL, '{ "1":"Frank", "2": "Blue", "4":"Big" }'),
	(3, (SELECT ID FROM biobank_specimen_type WHERE type='Blood'), 75, 5, 1, 300005, 
		5, CURRENT_DATE, CURRENT_TIME,	'Unsure if specimen was contaminated', '{ "1":"Alice", "4": "20", "2":"Awful"}')
;

INSERT INTO biobank_specimen_attribute (Name, DatatypeID, ReferenceTableID)
VALUES 	('Research Assistant', (SELECT ID FROM biobank_datatype WHERE Datatype='text'), NULL),
	('Colour', (SELECT ID FROM biobank_datatype WHERE Datatype='text'), NULL),
	('Smell', (SELECT ID FROM biobank_datatype WHERE Datatype='boolean'), NULL),
	('Density', (SELECT ID FROM biobank_datatype WHERE Datatype='number'), NULL),
	('Expected Processing Date', (SELECT ID FROM biobank_datatype WHERE Datatype='datetime'), NULL)
;

INSERT INTO biobank_specimen_type_attribute (TypeID, AttributeID, Required)
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
 
