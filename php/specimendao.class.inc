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
include 'containerdao.class.inc';
include 'specimento.class.inc';

/**
 * Specimen Data Access Object (DAO) Class
 * This class contains all database handling that is needed to
 * permanently store and retrieve Specimen Transfer Object instances
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/CCNA/
 */

class SpecimenDAO {

    /**
     * Function createSpecimen 
     * This method is used when the DAO class needs to create new Specimen 
	 * instance.
     * 
     * @return object SpecimenTO
     */
    private function createSpecimen()
    {
        return new SpecimenTO();
    }
   
    /** CURRENTLY NOT IN USE MAY BE DEPRECATED
	 * Function createSpecimenFromId
	 * This method is used to create a Specimen instance with a given $id
	 *
	 * @param int $id
	 * @return object $specimen
	 */ 
    private function createSpecimenFromId(int $id) {
        $specimen = ContainerDAO::createSpecimen();
        $specimen->setId($id);

        return $specimen;
    }
    
	/**
	 * Function createSpecimenFromQuery
	 * This method creates a Specimen instance from the result of a database 
	 * query of the biobank_specimen table
	 *
	 * @param array $specimenData
	 * @return object $specimen
	 */
    private function createSpecimenFromQuery(array $specimenData) {
        $specimen = SpecimenDAO::createSpecimen();
        SpecimenDAO::fromSQL($specimen, $specimenData);
    	
        return $specimen;
    }
    
    /**
     * Function getSpecimenFromId
	 * This will load all specimen contents from database for a given $id
     *
     * @param int $id
     * @return object $specimen
     */
    public static function getSpecimenFromId(int $id) {
        $db = \Database::singleton();
    
        $query  = "SELECT * FROM biobank_specimen ";
        $query .= "WHERE id=".$id;
        $result = $db->pselectRow($query, array());
    
        $specimen = SpecimenDAO::createSpecimenFromQuery($result);
        
        return $specimen;
    }
   
	/**
	 * Function getSpecimenFromBarcode
	 * This will load all specimen contents from database for a given $barcode
	 *
	 * @param string $barcode
	 * @return object $specimen
	 */ 
    public static function getSpecimenFromBarcode(string $barcode) 
    {
        $id       = SpecimenDAO::getSpecimenIdFromBarcode($barcode);
        $specimen = SpecimenDAO::getSpecimenFromId($id);
    
        return $specimen;
    }	

	/** NOT CURRENTLY IN USE
	 * Function selectSpecimens
	 * This will select all specimens from the database that match the 
	 * attribute values passed through $specimenData and will return an array
	 * of specimen objects
	 * 
	 * @param array $specimenData
	 * @return array $specimens
	 */
    public static function selectSpecimens(array $specimenData) {
        $db = \Database::singleton();
        $conditions = $db->_implodeWithKeys(' AND ', $specimenData);
    
        $query  = "SELECT * FROM biobank_specimen ";
        $query .= "WHERE ".$conditions;
        $result = $db->pselect($query, array());
    
		$specimens = array();
        if(!empty($result)) {
        	foreach ($result as $row) {
        		$specimens[] = $this->createSpecimenFromQuery($row);
        	}
        }
        
        return $specimens;
    }	

	/**
	 * Function getParentSpecimen
	 * This function creates an instance of the parent specimen object of the
	 * specimen that is passed, if it exists.
	 *
	 * @param object $specimen
	 * @return object $parentSpecimen
	 */
    public static function getParentSpecimen(SpecimenTO $specimen) {
        $db = \Database::singleton();
        $parentSpecimenId = $specimen->getParentSpecimenId();
    	
        if (isset($parentSpecimenId)) {			
    	    $query 	= "SELECT * FROM biobank_specimen ";
    	    $query .= "WHERE id=".$parentSpecimenId;
    	    $result = $db->pselectrow($query, array());
    
    	    $parentSpecimen = SpecimenDAO::createSpecimenFromQuery($result);		
    
    	    return $parentSpecimen;
    	}
    }
    
	/**
	 * Function getSpecimenTypes
	 * Queries all rows of the biobank_specimen_type table and returns a nested
	 * array with the id column as the index
	 *
	 * @return array $specimenTypes 
	 */
    public function getSpecimenTypes() {
        $query = "SELECT * FROM biobank_specimen_type";
        $specimenTypes = SpecimenDAO::queryToArray($query);
    
        return $specimenTypes;
    }
  
    /** THIS FUNCTION SHOULD BE MOVED TO A CandidateDAO
     * Function getCandidateInfo
     * Queries a single row of the candidate table and returns a nested array
	 * with all the information concerning that candidate
	 *
	 * @param int $id
	 * @return array $candidateInfo
	 */
	public function getCandidateInfo(int $id) {
        $query  = "SELECT * FROM candidate ";
        $query .= "WHERE ID=".$id;
        $candidateInfo = SpecimenDAO::queryToArray($query);

        return $candidateInfo;
    }

    /** THIS FUNCTION SHOULD BE MOVED TO A SessionDAO
     * Function getSessionInfo
     * Queries a single row of the session table and returns a nested array
	 * with all the information concerning that session
	 *
	 * @param int $id
	 * @return array $sessionInfo
	 */
	public function getSessionInfo(int $id) {
        $query  = "SELECT * FROM session ";
        $query .= "WHERE ID=".$id;
        $sessionInfo = SpecimenDAO::queryToArray($query);

        return $sessionInfo;
    }
 
	/** CURRENTLY NOT IN USE
	 * FUNCTION getSpecimenTypeAttributes
	 * Queries all rows from the biobank_specimen_attribute table and returns
	 * an array stating whether an attribute is required or not
	 * 
	 * @param int $typeId
	 * @return array $array
	 */
    public function getSpecimenTypeAttributes(int $typeId) {
        $db = \Database::singleton();
    
        $query  = "SELECT name, required FROM biobank_specimen_attribute bsa ";
        $query .= "JOIN biobank_specimen_type_attribute bsta ";
        $query .= "ON bsa.id=bsta.attribute_id WHERE bsta.type_id=".$typeId;
    
        $result = $db->pselect($query, array());
        $array  = array();
        foreach($result as $row) {
            $array['name'] = $row['required'];
        }
    
        return $array;
    }
    
	/**
	 * Function queryToArray
	 * Queries each row of a table specified by the $query and a returns a
	 * nested array with the id column of the table as index for each row
	 *
	 * @param string $query
	 * @return array $info
	 */
    private function queryToArray(string $query) {
        $db = \Database::singleton();
        $result = $db->pselect($query, array());

        $info = array();
        foreach($result as $row) {
            foreach($row as $key=>$value) {
                if ($key!='id') {
    	   	        $info[$row['id']][$key] = $value;
                }
            }
        }
    
        return $info;
    }
    
    /**
     * insertSpecimen-method. This will create new row in database according to supplied
     * specimen contents. Make sure that values for all NOT NULL columns are
     * correctly specified. Also, if this table does not use automatic surrage-keys
     * the primary-key must be specified. After INSERT command this method will
     * read the generated primary-key back to specimen if automatic surrage-keys
     * were used.
     *
     * @param specimen 	This parameter containes the class instance to be create.
     *				If automatic surrogate-keys are not used the Primary-key
     *				field must be set for this to work properly.
     */
    private function insertSpecimen(SpecimenTO $specimen) {
        $db = \Database::singleton();
    	$specimenData = SpecimenDAO::toSQL($specimen);
    	//handle json data object here
    	$db->insert('biobank_specimen', $specimenData);
    
    	//should return false if insert is not succesful
        return true;
    }
    
    /**
     * updateSpecimen-method. This method will save the current state of specimen to database.
     * Save can not be used to create new instances in database, so upper layer must
     * make sure that the primary-key is correctly specified. Primary-key will indicate
     * which instance is going to be updated in database. If save can not find matching
     * row, NotFoundException will be thrown.
     *
     * @param specimen This parameter contains the class instance to be saved.
     *		Primary-key field must be set to work properly.
     */
    private function updateSpecimen(SpecimenTO $specimen) {
        $db = \Database::singleton();
    	$specimenData = SpecimenDAO::toSQL($specimen);
    	$db->update('biobank_specimen', $specimenData, array('id' => $specimen->getId()));
    
    	//should return false if did not work
    	return true;
    }
    
    //create public save function {but $specimen->toArray(); here}
    
    public static function getSpecimenIdFromBarcode(string $barcode)
    {
        if (!isset($barcode) || empty($barcode)) {
    		return false;
        }     
    
        $containerId  = ContainerDAO::getContainerIdFromBarcode($barcode);
    
        $db = \Database::singleton();
        $query  = "SELECT id FROM biobank_specimen bs ";
        $query .= "WHERE container_id=:cid";
        $specimenId = $db->pselectOne($query, array('cid'=>$containerId));
        
        if (empty($specimenId)) {
        	return false;
        }
             
        return $specimenId; 
    }
    
    public static function getBarcodeFromSpecimenId(int $id) 
    {
        if (!isset($id) || empty($id)) {
    		return false;
        }

        $db = \Database::singleton();
        $query  = "SELECT container_id FROM biobank_specimen bs ";
        $query .= "WHERE id=:i";
        $containerId = $db->pselectOne($query, array('i'=>$id));
    
        $barcode      = ContainerDAO::getBarcodeFromContainerId($containerId); 
    
        return $barcode;
    }
	
	/*
     * toArray will return an Array representing the statof the Specimen TO.
     * This is useful
     */
    private static function toSQL(SpecimenTO $specimen) 
    {
        $specimenData = array();
        if (isset($specimen->getId)) {
            $specimenData['id']                 = $specimen->getId;
        }
        if (isset($specimen->getContainerId)) {  
            $specimenData['container_id']       = $specimen->getContainerId;
        }
        if (isset($specimen->getTypeId)) {
            $specimenData['type_id']            = $specimen->getTypeId;
        }
        if (isset($specimen->getQuantity)) {
            $specimenData['quantity']           = $specimen->getQuantity;
        }
        if (isset($specimen->getParentSpecimenId)) {
            $specimenData['parent_specimen_id'] = $specimen->getParentSpecimenId;
        }
        if (isset($specimen->getCandidateId)) {   
            $specimenData['candidate_id']       = $specimen->getCandidateId;
        }
        if (isset($specimen->getSessionid)) {
            $specimenData['session_id']         = $specimen->getSessionid;
        }
        if (isset($specimen->getTimeUpdate)) {
            $specimenData['time_update']        = $specimen->getTimeUpdate;
        }
        if (isset($specimen->getTimeCollect)) {   
            $specimenData['time_collect']       = $specimen->getTimeCollect;
        }
        if (isset($specimen->getNotes)) {
            $specimenData['notes']              = $specimen->getNotes;
        }
         if (isset($this->data)) {
        	//converts json object into array
        	$jsonData = $specimen->getData;
            $jsonData = json_decode($jsonData, TRUE);
 
            $specimenData['data']               = $jsonData;
    }
        
        return $specimenData;
    }

	//may just need to put if statements for values that can be null
	private static function fromSQL(SpecimenTO $specimen, array $specimenData)
    {
		if (isset($specimenData['id'])) {
        	$specimen->setId($specimenData['id']);
		}
        if (isset($specimenData['container_id'])) {
			$specimen->setContainerId($specimenData['container_id']);
		}
        if (isset($specimenData['type_id'])) {
			$specimen->setTypeId($specimenData['type_id']);
		}
        if (isset($specimenData['quantity'])) {
			$specimen->setQuantity($specimenData['quantity']);
		}
        if (isset($specimenData['parent_specimen_id'])) {
			$specimen->setParentSpecimenId($specimenData['parent_specimen_id']);
		}
        if (isset($specimenData['candidate_id'])) {
			$specimen->setCandidateId($specimenData['candidate_id']);
		}
        if (isset($specimenData['session_id'])) {
			$specimen->setSessionId($specimenData['session_id']);
		}
        if (isset($specimenData['time_update'])) {
			$specimen->setTimeUpdate($specimenData['time_update']);
		}
        if (isset($specimenData['time_collect'])) {
			$specimen->setTimeCollect($specimenData['time_collect']);
		}
        if (isset($specimenData['notes'])) {
			$specimen->setNotes($specimenData['notes']);
		}
        if (isset($specimenData['data'])) {
			$specimen->setData($specimenData['data']);
		}
    }
 



}
