<?php

	require_once __DIR__."/../../../vendor/autoload.php";
  	$configFile = __DIR__."/../../../project/config.xml";
	$client     = new NDB_Client();
	$client->initialize($configFile);

	include 'specimenVO.php';
	include 'containerDAO.php';	

	/* Specimen Data Acces Object (DAO) Class
	 * This class containers all database handling that is needed to
	 * permanently store and retrieve Specimen Value Object instances
	 */
	class SpecimenDAO {

		//var $db;
		
		//function __contruct() {
		//	$this->db = Database::singleton();
		//}
		
		/**
 		 * createSpecimenObject-method. This method is used when the Dao class needs 
		 * to create new value specimen instance. The reason why this method exists
		 * is that sometimes the programmer may want to extend also the specimenVO
		 * and then this method can be overrided to return extended specimenVO.
		 * NOTE: If you extend the specimenVO class, make sure to override the
		 * clone() method in it!
		 */
		function createSpecimenVO() {
			return new SpecimenVO();
		}

		function createSpecimenVOSetId(int $id) {
			$specimenVO = $this->createSpecimenVO();
			$specimenVO->setId($id);
			return $specimenVO;
		}

		function createSpecimenVOSetContainerId(int $containerId) {
			$specimenVO = $this->createSpecimenVO();
			$specimenVO->setContainerId($containerId);
			return $specimenVO;
		}

		function createSpecimenVOSetType(int $type) {
			$specimenVO = $this->createSpecimenVO();
			$specimenVO->setType($type);
			return $specimenVO;
		}

		function createSpecimenVOSetParentSpecimenId(int $parentSpecimenId) {
			$specimenVO = $this->createSpecimenVO();
			$specimenVO->setParentSpecimenId($parentSpecimenId);
			return $specimenVO;
		}
		
		// Do we really need this function??
		//function createSpecimenSetAll($container, $type, $quantity, $parent, $candidate, $session, $updatetime, $creationtime, $notes) {
		// 	$specimenVO = $this->createSpecimen();
		// 	$specimenVO->setAll($container, $type, $quantity, $parent, $candidate, $session, $updatetime, $creationtime, $notes);
		// 	return $specimenVO;
		//}
		
		function createSpecimenVOFromArray(array $specimenData) {
			$specimenVO = $this->createSpecimenVO();
			$specimenVO->fromArray($specimenData);
			
			return $specimenVO;
		}

		function displaySpecimenVO(SpecimenVO $specimenVO) {
			$specimenVO = $this->loadSpecimenVOFromId($specimenVO);
			$this->loadParentSpecimenVO($specimenVO);
			$this->loadContainerVO($specimenVO);
			
			return $specimenVO;
		}

		/**
		 * loadSpecimen-method. This will load specimenVO contents from database
		 * Upper layer should use this so that specimenVO
		 * instance is created and only primary-key should be specified. Then call
		 * this method to complete other persistent information. This method will
		 * overwrite all other fields except primary-key and possible runtime variables.
		 * If load can not find matching row, NotFoundException will be thrown.
		 *
		 * @param conn		This method requires working database connection.
		 * @param valueObject	This parameter contains the class instance to be loaded.
		 *			Primary-key field must be set for this to work properly.
		 */
		private function loadSpecimenVOFromId(SpecimenVO $specimenVO) {
			$db = Database::singleton();

			$specimenId = $specimenVO->getId();
			$specimenData = $specimenVO->toArray();

			$query  = "SELECT * FROM biobank_specimen ";
			$query .= "WHERE id=".$specimenId;
			$result = $db->pselectrow($query, array());

			$specimenVO = $this->createSpecimenVOFromArray($result);
			
			return $specimenVO;
		}

		private function loadSpecimenVOs(SpecimenVO $specimenVO) {
			$db = Database::singleton();
			
			$specimenData = $specimenVO->toArray();
			
			$conditions = $db->_implodeWithKeys(' AND ', $specimenData);
			$query  = "SELECT * FROM biobank_specimen ";
			$query .= "WHERE ".$conditions;
		 	$result = $db->pselect($query, array());

			if(!empty($result)) {
				foreach ($result as $row) {
					$specimenVOs[] = $this->createSpecimenVOFromArray($row);
				}
			}
		
			return $specimenVOs;
		}	

		private function loadContainerVO(SpecimenVO $specimenVO) {
			$db = Database::singleton();
			
			$containerId = $specimenVO->getContainerId();

			if (isset($containerId)) {
				$containerDAO = new ContainerDAO();
				$containerVO = $containerDAO->createContainerVOSetId($containerId);
				$containerVO = $containerDAO->loadContainerVOFromId($containerVO);
				
				$specimenVO->setContainerVO($containerVO);
			}
		}

		private function loadParentSpecimenVO(SpecimenVO $specimenVO) {
			$db = Database::singleton();
			
			$parentSpecimenId = $specimenVO->getParentSpecimenId();
			
			if (isset($parentSpecimenId)) {			
				$query 	= "SELECT * FROM biobank_specimen ";
				$query .= "WHERE id=".$parentSpecimenId;
				$result = $db->pselectrow($query, array());
				$parentSpecimenVO = $this->createSpecimenVOFromArray($result);
		
				$specimenVO->setParentSpecimenVO($parentSpecimenVO);
			}
		}

		public function getSpecimenTypes() {
			$db = Database::singleton();
			
			$query 	= "SELECT id, label ";
			$query .= "FROM biobank_specimen_type ";
			$result = $db->pselect($query, array());
			
			foreach($result as $row) {
				$specimenTypes[$row['id']] = $row['label'];
			}
		}

		/**
		 * create-method. This will create new row in database according to supplied
		 * specimenVO contents. Make sure that values for all NOT NULL columns are
		 * correctly specified. Also, if this table does not use automatic surrage-keys
		 * the primary-key must be specified. After INSERT command this method will
		 * read the generated primary-key back to specimenVO if automatic surrage-keys
		 * were used.
		 *
		 * @param specimenVO 	This parameter containes the class instance to be create.
		 *				If automatic surrogate-keys are not used the Primary-key
		 *				field must be set for this to work properly.
		 */
		private function insertSpecimen(SpecimenVO $specimenVO) {
			$db = Database::singleton();

			$specimenData = $specimenVO->toArray();
			$db->insert('biobank_specimen', $specimenData);

		        return true;
		}

		/**
		 * save-method. This method will save the current state of specimenVO to database.
		 * Save can not be used to create new instances in database, so upper layer must
		 * make sure that the primary-key is correctly specified. Primary-key will indicate
		 * which instance is going to be updated in database. If save can not find matching
		 * row, NotFoundException will be thrown.
		 *
		 * @param specimenVO	This parameter contains the class instance to be saved.
		 *		Primary-key field must be set to work properly.
		 */
		private function updateSpecimen(SpecimenVO $specimenVO) {
			$db = Database::singleton();

			$specimenData = $specimenVO->toArray();
			$db->update('biobank_specimen', 
				$specimenData,
                                array(
                                        'id' => $specimenVO->getId(),
				)
			);

			//should return false if did not work
			return true;
		}
	}
