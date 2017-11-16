<?php


/**
 * Specimen Data Acces Object (DAO).
 * This class contains all database handling that is needed to 
 * permanently store and retrieve Specimen object instances.
 */
	set_include_path(
	get_include_path().":".
	__DIR__."/../../../project/libraries:".
	__DIR__."/../../../php/libraries:"
	);

	require_once __DIR__."/../../../vendor/autoload.php";
	require_once __DIR__."/../../../project/config.xml";
	require_once __DIR__."/../../../php/libraries/NDB_Client.class.inc";

  	$configFile = __DIR__."/../../../project/config.xml";
	$client     = new NDB_Client();
	$client->makeCommandLine();
	$client->initialize($configFile);
	$Db = Database::singleton();
	
	//allow instruments to find libraries
	require_once __DIR__."/../../../php/libraries/Utility.class.inc";
	
	// require all relevant OO class libraries
	require_once __DIR__."/../../../php/libraries/Database.class.inc";
	require_once __DIR__."/../../../php/libraries/NDB_Config.class.inc";
	require_once __DIR__."/../../../php/libraries/NDB_BVL_Instrument.class.inc";
	require_once __DIR__."/../../../php/libraries/Candidate.class.inc";

	include 'specimenVO.php';	



	/* SPECIMENDAO CLASS*/
	class SpecimenDAO {

		//var $db;
		
		//function __contruct() {
		//	$this->db = Database::singleton();
		//}
		
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

		function createSpecimenSetType(int $type) {
			$specimenObject = $this->createSPecimen();
			$specimenObject->setType($type);
			return $specimenObject;
		}
		
		// Do we really need this function??
		function createSpecimenSetAll(int $id, object $container, $type, int $quantity, object $parent, $candidate, $session, $updatetime, $creationtime, $notes) {
		 	$specimenObject = $this->createSpecimen();
		 	$specimenObject->setAll($id, $container, $type, $quantity, $parent, $candidate, $session, $updatetime, $creationtime, $notes);
		 	return $specimenObject;
		}
		
		function createSpecimenFromArray(array $specimenData) {
			$specimenObject = $this->createSpecimen();
			$specimenObject->fromArray($specimenData);
			
			return $specimenObject;
		}

		function displaySpecimenAsString(Specimen $specimenObject) {
			$specimenObjects = $this->loadSpecimen($specimenObject);
			foreach ($specimenObjects as $specimenObject )
				$specimenStrings[] = $specimenObject->toString();
			return $specimenStrings;
		}

		/**
		 * loadSpecimen-method. This will load specimenObject contents from database
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
		 private function loadSpecimen(Specimen $specimenObject) {
			$db = Database::singleton();

			$specimenData = $specimenObject->toArray();
			
			$conditions = $db->_implodeWithKeys(' AND ', $specimenData);
			$query  = "SELECT * FROM biobank_specimen ";
			$query .= "WHERE ".$conditions;
		 	$result = $db->pselect($query, array());

			$specimenObjects = array();
			if(!empty($result)) {
				foreach ($result as $row) {
					$specimenObjects[] = $this->createSpecimenFromArray($row);
				}
			}

			return $specimenObjects;
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
		private function insertSpecimen(Specimen $specimenObject) {

			$specimenData = $specimenObject->toArray();
			$this->db->insert('biobanking_specimen_entity', $specimenData);

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
		function updateSpecimen($specimenObject) {

			//$specimenData = $specimenObject->toArray();
			//$this->db->update('biobanking_specimen_entity', $specimenData, 
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
