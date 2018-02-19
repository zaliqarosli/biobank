

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
VALUES 	('matrix box', '5x5', '5x5 Matrix Box', 0, NULL, 5),
        ('tube', 'red top', '10mL RedTop Tube', 1,	2, NULL),
        ('tube', 'blue top', '5mL BlueTop Tube', 1,	3, NULL),
        ('vial', 'purple top', 'PURPLE VIAL', 1, 1, NULL),
        ('shelf', '5 levels', '5-level Shelf', 	0, NULL, 5)
;

INSERT INTO biobank_container_status (Status)
VALUES  ('Available'),
        ('Reserved'),
        ('Dispensed')
;

INSERT INTO biobank_container (Barcode, TypeId, StatusID, ParentContainerID, OriginID, LocationID, Notes)
VALUES	('MAT001',  (SELECT ID from biobank_container_type WHERE Label='5x5 Matrix Box'), 
          1, NULL, 1, 1, ''),
        ('shelf101',  4, 1, NULL, 1, 1, ''),
        ('BLD002', 2, 1, 1, 1, 1, 'not sure if contaminated'),
        ('URI001', 3, 2, NULL, 1, 1, ''),
        ('SNF001', 2, 1, 1, 2, 2, ''),
        ('BCS001', 3, 3, NULL, 2, 2, ''),
        ('BLD001', 3, 1, 1,	2, 2, ''),
        ('MAT002',  (SELECT ID from biobank_container_type WHERE Label='5x5 Matrix Box'), 1, NULL, 1, 1, '')
;

/*Specimen*/
INSERT INTO biobank_specimen_type (Type, ParentTypeID)
VALUES 	('Blood', NULL),
        ('Serum', 1),
        ('Plasma', 1),
        ('Urine', NULL),
        ('DNA', 3),
        ('Bone Marrow', NULL),
        ('Buccal Swab', NULL),
        ('PBMC', NULL)
;

INSERT INTO biobank_specimen_protocol (Protocol, TypeID)
VALUES ('BLD_001', (SELECT ID FROM biobank_specimen_type WHERE type='Blood')),
       ('BLD_002', (SELECT ID FROM biobank_specimen_type WHERE type='Blood')),
       ('URI_001', (SELECT ID FROM biobank_specimen_type WHERE type='Urine')),
       ('DNA_001', (SELECT ID FROM biobank_specimen_type WHERE type='DNA')),
       ('PBM_001', (SELECT ID FROM biobank_specimen_type WHERE type='PBMC')),
       ('BCS_001', (SELECT ID FROM biobank_specimen_type WHERE type='Buccal Swab'))
;

INSERT INTO biobank_specimen_attribute (Name, DatatypeID, ReferenceTableID)
VALUES 	('Research Assistant', (SELECT ID FROM biobank_datatype WHERE Datatype='text'), NULL),
        ('Colour', (SELECT ID FROM biobank_datatype WHERE Datatype='text'), NULL),
        ('Smell', (SELECT ID FROM biobank_datatype WHERE Datatype='boolean'), NULL),
        ('Density', (SELECT ID FROM biobank_datatype WHERE Datatype='number'), NULL),
        ('Expected Processing Date', (SELECT ID FROM biobank_datatype WHERE Datatype='datetime'), NULL)
;

INSERT INTO biobank_specimen_type_attribute_rel (TypeID, AttributeID, Required)
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

INSERT INTO biobank_specimen_protocol_attribute_rel (ProtocolID, AttributeID, Required)
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

INSERT INTO biobank_specimen_type_unit_rel (TypeID, UnitID)
VALUES (1, 1),
       (1, 2),
       (2, 2),
       (2, 3),
       (3, 5),
       (4, 4),
       (4, 1)
;
