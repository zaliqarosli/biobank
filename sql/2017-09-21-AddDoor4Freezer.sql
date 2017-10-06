--
-- Adds 'door4' to the list of freezers, right after door3
-- Recompute the freezer_ids in biospecimen to take this new freezer into account
-- since the addition of door4 changes some of the ids in freezer
--
-- Note: Make sure that this patch is run at a time when there are no data entries performed
-- as the temporary disabling of the foreign key checks could lead to inconsistent data
--

SET FOREIGN_KEY_CHECKS=0;

UPDATE freezer SET id=4 WHERE id=3;
UPDATE freezer SET id=3 WHERE id=2;

INSERT INTO freezer VALUES(2, 'door4', 'Cupboard in room E-3304.10, door #4');

UPDATE biospecimen SET freezer_id=freezer_id+1 WHERE freezer_id != 1;

SET FOREIGN_KEY_CHECKS=1;



