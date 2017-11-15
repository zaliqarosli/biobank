<?php


/**
 * Specimen Data Acces Object (DAO).
 * This class contains all database handling that is needed to 
 * permanently store and retrieve Specimen object instances.
 */

namespace LORIS\biobank

	class specimenDao {

		$db = Database::singleton();

		/**
 		 * createSpecimenObject-method. This method is used when the Dao class needs 
		 * to create new value specimen instance. The reason why this method exists
		 * is that sometimes the programmer may want to extend also the specimenObject
		 * and then this method can be overrided to return extended specimenObject.
		 * NOTE: If you extend the specimenObject class, make sure to override the
		 * clone() method in it!
		 */
		function createSpecimen() {
			return new Specimen();
		}

		function createSpecimenSetId(int $id) {
			$specimenObject = $this->createSpecimen();
			$specimenObject->setId($id);
			return $specimenObject;
		}
		
		function createSpecimenSetAll(int $id, $container, $type, $quantity, $parent, $candidate, $session, $updatetime, $creationtime, $notes) {
		 	$specimenObject = $this->createSpecimen();
		 	$specimenObject->setId($id);
		 	$specimenObject->setContainer($container);
		 	$specimenObject->setType($type);
		 	$specimenObject->setQuantity($quantity);
		 	$specimenObject->setParent($parent);
		 	$specimenObject->setCandidate($candidate);
		 	$specimenObject->setSession($session);
		 	$specimenObject->setUpdateTime($updatetime);
		 	$specimenObject->setCreationTime($creationtime);
		 	$specimenObject->setNotes($notes);
		 	return $specimenObject;
		}
		
		function createSpecimenFromArray($) {
		}


		/**
		 * load-method. This will load specimenObject contents from database
		 * Upper layer should use this so that specimenObject
		 * instance is created and only primary-key should be specified. Then call
		 * this method to complete other persistent information. This method will
		 * overwrite all other fields except primary-key and possible runtime variables.
		 * If load can not find matching row, NotFoundException will be thrown.
		 *
		 * @param conn		This method requires working database connection.
		 * @param valueObject	This paramter contains the class instance to be loaded.
		 *			Primary-key field must be set for this to work properly.
		 */
		 private function load($specimenObject) {
			$specimenAttributes = $specimenObject->toArray();
			
			foreach($specimenAttributes as $attribute=>$value) {
				$condition = $condition.$attribute."=".$value.", ";
			} 

			$query = "SELECT * 
				 FROM biobank_specimen_entity
				 WHERE ".$condition;
			//$index = ('i' => $specimenObject->getId());					//this will be necessary later

		 	$db->pselect(
				$query,
			//	$index
			);
			
			return //array of objects
		 }	

		/**
		 * create-method. This will create new row in database according to supplied
		 * specimenObject contents. Make sure that values for all NOT NULL columns are
		 * correctly specified. Also, if this table does not use automatic surrage-keys
		 * the primary-key must be specified. After INSERT command this method will
		 * read the generated primary-key back to specimenObject if automatic surrage-keys
		 * were used.
		 *
		 * @param specimenObject 	This parameter containes the class instance to be create.
		 *				If automatic surrogate-keys are not used the Primary-key
		 *				field must be set for this to work properly.
		 */
		function create($specimenObject) {

			$db->insert(
				'biobank_specimen_entity', 
				array(
					'container_id'		=> $specimenObject->getContainer(),
					'type_id'		=> $specimenObject->getType(),
					'quantity'		=> $specimenObject->getQuantity(),
					'parent_specimen_id'	=> $specimenObject->getParent(),
					'candidate_id'		=> $specimenObject->getCandidate(),
					'session_id'		=> $specimenObject->getSession(),
					'update_time'		=> $specimenObject->getUpdateTime(),
					'creation_time'		=> $specimenObject->getCreationTime(),
					'notes'			=> $specimenObject->getNotes()
				)
			);

		        return true;
		}

		/**
		 * save-method. This method will save the current state of specimenObject to database.
		 * Save can not be used to create new instances in database, so upper layer must
		 * make sure that the primary-key is correctly specified. Primary-key will indicate
		 * which instance is going to be updated in database. If save can not find matching
		 * row, NotFoundException will be thrown.
		 *
		 * @param specimenObject	This parameter contains the class instance to be saved.
		 *		Primary-key field must be set to work properly.
		 */
		function save($specimenObject) {

			$db->update(
				'biobank_specimen_entity', 
				array(
					'container_id'		=> $specimenObject->getContainer(),
					'type_id'		=> $specimenObject->getType(),
					'quantity'		=> $specimenObject->getQuantity(),
					'parent_specimen_id'	=> $specimenObject->getParent(),
					'candidate_id'		=> $specimenObject->getCandidate(),
					'session_id'		=> $specimenObject->getSession(),
					'update_time'		=> $specimenObject->getUpdateTime(),
					'creation_time'		=> $specimenObject->getCreationTime(),
					'notes'			=> $specimenObject->getNotes()
				),
                                array(
                                        'id'                    => $specimenObject->getId(),
				)
			);

			$sql = "UPDATE biobank_specimen_entity SET container_id = ".$valueObject->getContainer().", ";
			$sql = $sql."type_id = ".$valueObject->getType().", ";
			$sql = $sql."quantity = '".$valueObject->getQuantity()."', ";
			$sql = $sql."parent_specimen_id = ".$valueObject->getParent().", ";
			$sql = $sql."candidate_id = ".$valueObject->getCandidate().", ";
			$sql = $sql."session_id = ".$valueObject->getSession().", ";
			$sql = $sql."update_time = '".$valueObject->getUpdatetime()."', ";
			$sql = $sql."creation_time = '".$valueObject->getCreationtime()."', ";
			$sql = $sql."notes = '".$valueObject->getNotes()."'";
			$sql = $sql." WHERE (id = ".$valueObject->getId().") ";
			$result = $this->databaseUpdate($sql);

			if ($result != 1) {
			     //print "PrimaryKey Error when updating DB!";
			     return false;
			}

			return true;
		}
	}
