<?php

	require_once __DIR__."/../../../vendor/autoload.php";

  	$configFile = __DIR__."/../../../project/config.xml";
	$client     = new NDB_Client();
	$client->initialize($configFile);

	include 'containerVO.php';	

	/* Container Data Acces Object (DAO) Class
	 * This class containers all database handling that is needed to
	 * permanently store and retrieve Container Value Object instances
	 */
	class ContainerDAO {

		var $db;
		
		function __construct() {
			$this->db = Database::singleton();
		}
		
		/**
 		 * createContainerObject-method. This method is used when the Dao class needs 
		 * to create new value container instance. The reason why this method exists
		 * is that sometimes the programmer may want to extend also the containerVO
		 * and then this method can be overrided to return extended containerVO.
		 * NOTE: If you extend the containerVO class, make sure to override the
		 * clone() method in it!
		 */
		function createContainerVO() {
			
			return new ContainerVO();
		}

		function createContainerVOSetId(int $id) {
			$containerVO = $this->createContainerVO();
			$containerVO->setId($id);
			
			return $containerVO;
		}

		function createContainerVOSetType(int $type) {
			$containerVO = $this->createContainerVO();
			$containerVO->setType($type);
			
			return $containerVO;
		}
		
		// Do we really need this function??
		//function createContainerVOSetAll($id, $barcode, $type, $status, $locus, $parent, $updatetime, $creationtime, $notes) {
		// 	$containerVO = $this->createContainerVO();
		// 	$containerVO->setAll($id, $barcode, $type, $status, $locus, $parent, $updatetime, $creationtime, $notes);
		// 	return $containerVO;
		//}
		
		function createContainerVOFromArray(array $containerData) {
			$containerVO = $this->createContainerVO();
			$containerVO->fromArray($containerData);
			
			return $containerVO;
		}

		/**
		 * loadContainer-method. This will load containerVO contents from database
		 * Upper layer should use this so that containerVO
		 * instance is created and only primary-key should be specified. Then call
		 * this method to complete other persistent information. This method will
		 * overwrite all other fields except primary-key and possible runtime variables.
		 * If load can not find matching row, NotFoundException will be thrown.
		 *
		 * @param conn		This method requires working database connection.
		 * @param valueObject	This paramter contains the class instance to be loaded.
		 *			Primary-key field must be set for this to work properly.
		 */

		function loadContainerVOFromId(ContainerVO $containerVO) {
			$containerId = $containerVO->getId();
			
			$query 	= "SELECT * FROM biobank_container ";
			$query .= "WHERE id=".$containerId;
			$result = $this->db->pselectrow($query, array());
		
			$containerVO = $this->createContainerVOFromArray($result);
			return $containerVO;
		}

		private function loadContainerVOs(ContainerVO $containerVO) {
			$containerData 	= $containerVO->toArray();
			$conditions 	= $this->db->_implodeWithKeys(' AND ', $containerData);
			
			$query  = "SELECT * FROM biobank_container ";
			$query .= "WHERE ".$conditions;
		 	$result = $this->db->pselect($query, array());

			$containerVOs = array();
			if(!empty($result)) {
				foreach ($result as $row) {
					$containerVOs[] = $this->createContainerVOFromArray($row);
				}
			}

			return $containerVOs;
		 }	

		private function loadParentContainerVO(ContainerVO $containerVO) {
			$parentContainerId = $containerVO->getParentContainerId();
			
			if (isset($parentContainerId)) {
			        $query  = "SELECT * FROM biobank_container ";
			        $query .= "WHERE id=".$parentContainerId;
			        $result = $this->db->pselectrow($query, array());
				
				$parentContainerVO = $this->createContainerVOFromArray($result);	
			        $containerVO->setParentContainerVO($parentContainerVO);
			}
		}

		public function getContainerTypes() {
			$query  = "SELECT * FROM biobank_container_type";
			$containerTypes = $this->queryToArray($query);
			
			return $containerTypes;
		}

		public function getContainerCapacities() {
			$query  = "SELECT * FROM biobank_container_capacity";
			$containerTypes = $this->queryToArray($query);

			return $containerTypes;
		}

		public function getContainerDimensions() {
			$query = "SELECT * FROM biobank_container_dimension";
			$containerDimensions = $this->queryToArray($query);

			return $containerDimensions;
		}

		public function getContainerStati() {
			$query = "SELECT * FROM biobank_container_status";
			$containerStati = $this->queryToArray($query);
			
			return $containerStati;
		}

		public function getContainerLoci() {
			$query = "SELECT * FROM biobank_container_locus";
			$containerLoci = $this->queryToArray($query);
			
			return $containerLoci;
		}

		private function queryToArray(string $query) {
			$result = $this->db->pselect($query, array());
			foreach($result as $row) {
				foreach($row as $key=>$value) {
			        	if ($key!='id') {
						$array[$row['id']][$key] = $value;
					}
				}
			}
			
			return $array;
		}		

		/**
		 * create-method. This will create new row in database according to supplied
		 * containerVO contents. Make sure that values for all NOT NULL columns are
		 * correctly specified. Also, if this table does not use automatic surrage-keys
		 * the primary-key must be specified. After INSERT command this method will
		 * read the generated primary-key back to containerVO if automatic surrage-keys
		 * were used.
		 *
		 * @param containerVO 	This parameter containes the class instance to be create.
		 *				If automatic surrogate-keys are not used the Primary-key
		 *				field must be set for this to work properly.
		 */
		private function insertContainer(ContainerVO $containerVO) {
			$containerData = $containerVO->toArray();
			$this->db->insert('biobank_container', $containerData);

		        return true;
		}

		/**
		 * save-method. This method will save the current state of containerVO to database.
		 * Save can not be used to create new instances in database, so upper layer must
		 * make sure that the primary-key is correctly specified. Primary-key will indicate
		 * which instance is going to be updated in database. If save can not find matching
		 * row, NotFoundException will be thrown.
		 *
		 * @param containerVO	This parameter contains the class instance to be saved.
		 *		Primary-key field must be set to work properly.
		 */
		private function updateContainer(ContainerVO $containerVO) {
			$containerData = $containerVO->toArray();
			$this->db->update('biobank_container', 
				$containerData,
                                array(
                                        'id' => $containerVO->getId(),
				)
			);

			//should return false if did not work
			return true;
		}


		function displayContainerVO(ContainerVO $containerVO) {
			$containerVO = $this->loadContainerVOFromId($containerVO);
			$this->loadParentContainerVO($containerVO);
		
			return $containerVO;
		}

	}
