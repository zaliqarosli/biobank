-- INSERTS --

/*Global*/

/* Ref table values have not been determined for CRU */
/*INSERT INTO biobank_reference_table (`TableName`, `ColumnName`)
VALUES 	('users', 'First_name'),
        ('colours', 'name')
;*/

/*Container*/
INSERT INTO biobank_unit (Unit)
VALUES 	('µL'), 
        ('10⁶/mL'), 
        ('mL')
;

INSERT INTO biobank_container_capacity (Quantity, UnitId)
VALUES 	(10, (select ID from biobank_unit where Unit='mL'))
;

INSERT INTO biobank_container_dimension (X, Y, Z)
VALUES 	(1, 5, 1),
        (6, 1, 1),
        (4, 4, 1),
        (1, 3, 1),
        (4, 1, 1),
        (6, 4, 1),
        (10, 10, 1)
;

INSERT INTO biobank_container_type (Type, Descriptor, Label, `Primary`, CapacityID, DimensionID)
VALUES 	('Freezer', '5 Shelf', 'Freezer - 5 Shelf', 0, NULL,
          (select ID from biobank_container_dimension where X=1 and Y=5 and Z=1)),
        ('Shelf', '6 Rack', 'Shelf - 6 Rack', 0, NULL,
          (select ID from biobank_container_dimension where X=6 and Y=1 and Z=1)),
        ('Rack', '16 Box', 'Rack - 16 Box', 0, NULL,
          (select ID from biobank_container_dimension where X=4 and Y=4 and Z=1)),
        ('Freezer', '3 Shelf', 'Freezer - 3 Shelf', 0, NULL,
          (select ID from biobank_container_dimension where X=1 and Y=3 and Z=1)),
        ('Shelf', '4 Rack', 'Shelf - 4 Rack', 0, NULL,
          (select ID from biobank_container_dimension where X=4 and Y=1 and Z=1)),
        ('Rack', '28 Box', 'Rack - 28 Box', 0, NULL,
          (select ID from biobank_container_dimension where X=6 and Y=4 and Z=1)),
        ('Matrix Box', '10x10', 'Matrix Box - 10x10', 0, NULL, 
          (select ID from biobank_container_dimension where X=10 and Y=10 and Z=1)),
        ('Tube', 'Red Top Tube', 'Red Top Tube (RTT)', 1,	
          (select ID from biobank_container_capacity where Quantity=10 
          and UnitId=(select ID from biobank_unit where Unit='mL')), 
          NULL),
        ('Tube', 'Green Top Tube', 'Green Top Tube (GTT)', 1,
          (select ID from biobank_container_capacity where Quantity=10 
          and UnitId=(select ID from biobank_unit where Unit='mL')), 
          NULL),
        ('Tube', 'Purple Top Tube', 'Purple Top Tube (PTT)', 	1,
          (select ID from biobank_container_capacity where Quantity=10 
          and UnitId=(select ID from biobank_unit where Unit='mL')), 
          NULL)
;

/*Specimen*/
INSERT INTO biobank_specimen_type (Type, ParentTypeID)
VALUES 	('Blood', NULL),
        ('Urine', NULL),
        ('Serum', (select ID from (select * from biobank_specimen_type) as bst where Type='Blood')),
        ('Plasma', (select ID from (select * from biobank_specimen_type) as bst where Type='Blood')),
        ('DNA', (select ID from (select * from biobank_specimen_type) as bst where Type='Blood')),
        ('PBMC', (select ID from (select * from biobank_specimen_type) as bst where Type='Blood')),
        ('RNA', (select ID from (select * from biobank_specimen_type) as bst where Type='PBMC')),
        ('CSF', NULL),
        ('Muscle Biopsy', NULL),
        ('Skin Biopsy', NULL)
;

INSERT INTO biobank_specimen_protocol (Protocol, TypeID)
VALUES ('BLD_001', (SELECT ID FROM biobank_specimen_type WHERE type='Blood')),
       ('BLD_002', (SELECT ID FROM biobank_specimen_type WHERE type='Blood')),
       ('URI_001', (SELECT ID FROM biobank_specimen_type WHERE type='Urine')),
       ('DNA_001', (SELECT ID FROM biobank_specimen_type WHERE type='DNA')),
       ('PBM_001', (SELECT ID FROM biobank_specimen_type WHERE type='PBMC')),
       ('CSF_001', (SELECT ID FROM biobank_specimen_type WHERE type='CSF'))
;

INSERT INTO biobank_specimen_attribute (Name, DatatypeID, ReferenceTableID)
VALUES 	('Quality', (SELECT ID FROM biobank_datatype WHERE Datatype='text'), NULL),
        ('Processed By', (SELECT ID FROM biobank_datatype WHERE Datatype='text'), NULL),
        ('Hemodialysis Index', (SELECT ID FROM biobank_datatype WHERE Datatype='number'), NULL),
        ('Concentration', (SELECT ID FROM biobank_datatype WHERE Datatype='number'), NULL),
        ('260/280 Ratio', (SELECT ID FROM biobank_datatype WHERE Datatype='number'), NULL),
        ('FT Cycle', (SELECT ID FROM biobank_datatype WHERE Datatype='number'), NULL)
;

INSERT INTO biobank_specimen_type_attribute_rel (TypeID, AttributeID, Required)
VALUES 	((select ID from biobank_specimen_type where Type='Blood'), 
           (select ID from biobank_specimen_attribute where Name='Quality'), 0),
        ((select ID from biobank_specimen_type where Type='Urine'),
           (select ID from biobank_specimen_attribute where Name='Quality'), 0),
        ((select ID from biobank_specimen_type where Type='Serum'),
           (select ID from biobank_specimen_attribute where Name='Quality'), 0),
        ((select ID from biobank_specimen_type where Type='Serum'),
           (select ID from biobank_specimen_attribute where Name='Processed By'), 0),
        ((select ID from biobank_specimen_type where Type='Serum'),
           (select ID from biobank_specimen_attribute where Name='Hemodialysis Index'), 0),
        ((select ID from biobank_specimen_type where Type='Serum'),
           (select ID from biobank_specimen_attribute where Name='FT Cycle'), 0),
        ((select ID from biobank_specimen_type where Type='Plasma'),
           (select ID from biobank_specimen_attribute where Name='Quality'), 0),
        ((select ID from biobank_specimen_type where Type='Plasma'),
           (select ID from biobank_specimen_attribute where Name='Processed By'), 0),
        ((select ID from biobank_specimen_type where Type='Plasma'),
           (select ID from biobank_specimen_attribute where Name='Hemodialysis Index'), 0),
        ((select ID from biobank_specimen_type where Type='Plasma'),
           (select ID from biobank_specimen_attribute where Name='FT Cycle'), 0),
        ((select ID from biobank_specimen_type where Type='DNA'),
           (select ID from biobank_specimen_attribute where Name='Quality'), 0),
        ((select ID from biobank_specimen_type where Type='DNA'),
           (select ID from biobank_specimen_attribute where Name='Processed By'), 0),
        ((select ID from biobank_specimen_type where Type='DNA'),
           (select ID from biobank_specimen_attribute where Name='Concentration'), 0),
        ((select ID from biobank_specimen_type where Type='DNA'),
           (select ID from biobank_specimen_attribute where Name='260/280 Ratio'), 0),
        ((select ID from biobank_specimen_type where Type='DNA'),
           (select ID from biobank_specimen_attribute where Name='FT Cycle'), 0),
        ((select ID from biobank_specimen_type where Type='PBMC'),
           (select ID from biobank_specimen_attribute where Name='Quality'), 0),
        ((select ID from biobank_specimen_type where Type='PBMC'),
           (select ID from biobank_specimen_attribute where Name='Processed By'), 0),
        ((select ID from biobank_specimen_type where Type='CSF'),
           (select ID from biobank_specimen_attribute where Name='Quality'), 0),
        ((select ID from biobank_specimen_type where Type='CSF'),
           (select ID from biobank_specimen_attribute where Name='Processed By'), 0),
        ((select ID from biobank_specimen_type where Type='CSF'),
           (select ID from biobank_specimen_attribute where Name='FT Cycle'), 0),
        ((select ID from biobank_specimen_type where Type='Muscle Biopsy'),
           (select ID from biobank_specimen_attribute where Name='Quality'), 0),
        ((select ID from biobank_specimen_type where Type='Skin Biopsy'),
           (select ID from biobank_specimen_attribute where Name='Quality'), 0)
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
VALUES ((select ID from biobank_specimen_type where Type='Blood'), (select ID from biobank_unit where Unit='mL')),
       ((select ID from biobank_specimen_type where Type='Urine'), (select ID from biobank_unit where Unit='mL')),
       ((select ID from biobank_specimen_type where Type='Serum'), (select ID from biobank_unit where Unit='µL')),
       ((select ID from biobank_specimen_type where Type='Plasma'), (select ID from biobank_unit where Unit='µL')),
       ((select ID from biobank_specimen_type where Type='DNA'), (select ID from biobank_unit where Unit='µL')),
       ((select ID from biobank_specimen_type where Type='PBMC'), (select ID from biobank_unit where Unit='10⁶/mL')),
       ((select ID from biobank_specimen_type where Type='RNA'), (select ID from biobank_unit where Unit='µL')),
       ((select ID from biobank_specimen_type where Type='CSF'), (select ID from biobank_unit where Unit='µL'))
;
