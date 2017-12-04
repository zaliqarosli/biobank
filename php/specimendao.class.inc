<?php

/**
 *
 * PHP Version 5
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/CCNA/
 */

namespace LORIS\biobank;

/**
 * Creates the form for NDB_Form_biobank
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/CCNA/
 */

//require_once __DIR__."/../../../vendor/autoload.php";
//$configFile = __DIR__."/../../../project/config.xml";
//$client     = new \NDB_Client();
//$client->initialize($configFile);
//
//include 'specimenVO.php';
//include 'containerDAO.php';	

/* Specimen Data Acces Object (DAO) Class
 * This class containers all database handling that is needed to
 * permanently store and retrieve Specimen Value Object instances
 */
class SpecimenDAO {

	var $db;
	
	function __construct() {
	    $this->db = \Database::singleton();
	}
	
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

	function createSpecimenVOFromId(int $id) {
		$specimenVO = $this->createSpecimenVO();
		$specimenVO->setId($id);
		return $specimenVO;
	}

	//function createSpecimenVOSetContainerId(int $containerId) {
	//	$specimenVO = $this->createSpecimenVO();
	//	$specimenVO->setContainerId($containerId);
	//	return $specimenVO;
	//}

	//function createSpecimenVOSetTypeID(int $type) {
	//	$specimenVO = $this->createSpecimenVO();
	//	$specimenVO->setType($type);
	//	return $specimenVO;
	//}

	//function createSpecimenVOSetParentSpecimenId(int $parentSpecimenId) {
	//	$specimenVO = $this->createSpecimenVO();
	//	$specimenVO->setParentSpecimenId($parentSpecimenId);
	//	return $specimenVO;
	//}
	//
	// Do we really need this function??
	//function createSpecimenSetAll($container, $type, $quantity, $parent, $candidate, $session, $updatetime, $creationtime, $notes) {
	// 	$specimenVO = $this->createSpecimen();
	// 	$specimenVO->setAll($container, $type, $quantity, $parent, $candidate, $session, $updatetime, $creationtime, $notes);
	// 	return $specimenVO;
	//} 
	
	private function createSpecimenVOFromArray(array $specimenData) {
	    $specimenVO = $this->createSpecimenVO();
	    $specimenVO->fromArray($specimenData);
		
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
	 * @param valueObject	This parameter contains the class instance to be loaded.
	 *			Primary-key field must be set for this to work properly.
	 */
	private function loadSpecimenVOFromId(SpecimenVO $specimenVO) {
	    $specimenId = $specimenVO->getId();

	    $query  = "SELECT * FROM biobank_specimen ";
	    $query .= "WHERE id=".$specimenId;
	    $result = $this->db->pselectRow($query, array());

	    $specimenVO = $this->createSpecimenVOFromArray($result);
		
	    return $specimenVO;
	}

	//we may still need to load a specimen from specimenVO - keep this in mind.
	private function loadSpecimenVOs(array $specimenDataArray) {
	    $conditions = $db->_implodeWithKeys(' AND ', $specimenDataArray);

	    $query  = "SELECT * FROM biobank_specimen ";
	    $query .= "WHERE ".$conditions;
	    $result = $this->$db->pselect($query, array());

	    if(!empty($result)) {
	    	foreach ($result as $row) {
	    		$specimenVOs[] = $this->createSpecimenVOFromArray($row);
	    	}
	    }
	    
	    return $specimenVOs;
	}	

	private function loadContainerVO(SpecimenVO $specimenVO) {
		$containerId = $specimenVO->getContainerId();

		if (isset($containerId)) {
			$containerDAO 	= new ContainerDAO();
			$containerVO 	= $containerDAO->createContainerVOSetId($containerId);
			$containerVO 	= $containerDAO->loadContainerVOFromId($containerVO);
			
			$specimenVO->setContainerVO($containerVO);
		}
	}

	private function loadParentSpecimenVO(SpecimenVO $specimenVO) {
		$parentSpecimenId = $specimenVO->getParentSpecimenId();
		
		if (isset($parentSpecimenId)) {			
			$query 	= "SELECT * FROM biobank_specimen ";
			$query .= "WHERE id=".$parentSpecimenId;
			$result = $this->db->pselectrow($query, array());

			$parentSpecimenVO = $this->createSpecimenVOFromArray($result);		
			$specimenVO->setParentSpecimenVO($parentSpecimenVO);
		}
	}

	public function getSpecimenTypes() {
	        $query = "SELECT id, label FROM biobank_specimen_type";
	        $specimenTypes = $this->queryToArray($query);
	
	        return $specimenTypes;
	}
	
	public function getSpecimenTypeAttributes(int $typeId) {
	    $query  = "SELECT name, required FROM biobank_specimen_attribute bsa ";
	    $query .= "JOIN biobank_specimen_type_attribute bsta ";
	    $query .= "ON bsa.id=bsta.attribute_id WHERE bsta.type_id=".$typeId;

        $result = $this->db->pselect($query, array());
        foreach($result as $row) {
    	$array['name'] = $row['required'];
        }
        
	    return $array;
	}

	private function queryToArray(string $query) {
	        $result = $this->db->pselect($query, array());
	        foreach($result as $row) {
	                //foreach($row as $key=>$value) {
	                //        if ($key!='id') {
			//		$array[$row['id']][$key] = $value;
	                                $array[$row['id']] = $row['label'];
	                //        }
	                //}
	        }
	
	        return $array;
	}

	/**
	 * insertSpecimen-method. This will create new row in database according to supplied
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
		$specimenData = $specimenVO->toArray();
		//handle json data object here
		$this->db->insert('biobank_specimen', $specimenData);

		//should return false if insert is not succesful
	        return true;
	}

	/**
	 * updateSpecimen-method. This method will save the current state of specimenVO to database.
	 * Save can not be used to create new instances in database, so upper layer must
	 * make sure that the primary-key is correctly specified. Primary-key will indicate
	 * which instance is going to be updated in database. If save can not find matching
	 * row, NotFoundException will be thrown.
	 *
	 * @param specimenVO	This parameter contains the class instance to be saved.
	 *		Primary-key field must be set to work properly.
	 */
	private function updateSpecimen(SpecimenVO $specimenVO) {
		$specimenData = $specimenVO->toArray();
		$this->db->update(
			'biobank_specimen', 
			$specimenData,
                        array(
                        	'id' => $specimenVO->getId()
			)
		);

		//should return false if did not work
		return true;
	}

	//create public save function {but $specimenVO->toArray(); here}

	public function getSpecimenIdFromBarcode(string $barcode)
	{
	    //$query  = "SELECT id FROM biobank_container ";
	    //$query .= "WHERE barcode=:bc";
	    //$result = $this->db->pselectOne($query, array('bc'=>$barcode));	    

	    //if (empty($result)) {
	    //    return false;
  	    //}
	   
	    //return $result;
	    
	    if (!isset($barcode) || empty($barcode)) {
		return false;
	    }     

	    $ContainerDAO = new ContainerDAO();	    	
	    $id     	  = $ContainerDAO->getContainerIdFromBarcode($barcode);

	    $query  = "SELECT id FROM biobank_specimen bs ";
	    $query .= "WHERE container_id=:cid";
	    $result = $this->db->pselectOne($query, array('cid'=>$id));
	    
	    if (empty($result)) {
	    	return false;
	    } else {
	         return $result;
	    } 
	}

	public function displaySpecimenVO(array $specimenDataArray) {
    	$specimenVO = $this->createSpecimenVOFromArray($specimenDataArray);
		$specimenVO = $this->loadSpecimenVOFromId($specimenVO);
		$this->loadParentSpecimenVO($specimenVO);
		$this->loadContainerVO($specimenVO);
		
		return $specimenVO;
	}

}
