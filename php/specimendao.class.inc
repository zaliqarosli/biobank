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
include 'specimenvo.class.inc';

/**
 * Creates the form for NDB_Form_biobank
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/CCNA/
 */

/* Specimen Data Acces Object (DAO) Class
 * This class containers all database handling that is needed to
 * permanently store and retrieve Specimen Value Object instances
 */
class SpecimenDAO {

    /**
     * createSpecimenObject-method. This method is used when the Dao class needs 
     * to create new value specimen instance. The reason why this method exists
     * is that sometimes the programmer may want to extend also the specimenVO
     * and then this method can be overrided to return extended specimenVO.
     * NOTE: If you extend the specimenVO class, make sure to override the
     * clone() method in it!
     */
    private function createSpecimenVO()
    {
        return new SpecimenVO();
    }
    
    private function createSpecimenVOFromId(int $id) {
        $specimenVO = $this->createSpecimenVO();
        $specimenVO->setId($id);
        return $specimenVO;
    }
    
    private function createSpecimenVOFromArray(array $specimenData) {
        $specimenVO = SpecimenDAO::createSpecimenVO();
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
    public static function getSpecimenVOFromId(int $id) {
        $db = \Database::singleton();
    
        $query  = "SELECT * FROM biobank_specimen ";
        $query .= "WHERE id=".$id;
        $result = $db->pselectRow($query, array());
    
        $specimenVO = SpecimenDAO::createSpecimenVOFromArray($result);
        
        return $specimenVO;
    }
    
    public static function getSpecimenVOFromBarcode(string $barcode) 
    {
        $id         = SpecimenDAO::getSpecimenIdFromBarcode($barcode);
        $specimenVO = SpecimenDAO::getSpecimenVOFromId($id);
    
        return $specimenVO;
    }	
    
    //we may still need to load a specimen from specimenVO - keep this in mind.
    private function selectSpecimenVOs(array $specimenDataArray) {
        $db = \Database::singleton();
        $conditions = $db->_implodeWithKeys(' AND ', $specimenDataArray);
    
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
    
    public static function getContainerVO(SpecimenVO $specimenVO) {
    	$containerId = $specimenVO->getContainerId();
    
    	if (isset($containerId)) {
    		$containerDAO 	= new ContainerDAO();
    		$containerVO = $containerDAO->getContainerVOFromId($containerId);
    		return $containerVO;
    	}
    }
    
    public static function getParentSpecimenVO(SpecimenVO $specimenVO) {
        $db = \Database::singleton();
        $parentSpecimenId = $specimenVO->getParentSpecimenId();
    	
        if (isset($parentSpecimenId)) {			
    	$query 	= "SELECT * FROM biobank_specimen ";
    	$query .= "WHERE id=".$parentSpecimenId;
    	$result = $db->pselectrow($query, array());
    
    	$parentSpecimenVO = SpecimenDAO::createSpecimenVOFromArray($result);		
    
    	return $parentSpecimenVO;
    	}
    }
    
    public function getSpecimenTypes() {
            $query = "SELECT id, label FROM biobank_specimen_type";
            $specimenTypes = SpecimenDAO::queryToArray($query);
    
            return $specimenTypes;
    }
    
    public function getSpecimenTypeAttributes(int $typeId) {
        $db = \Database::singleton();
    
        $query  = "SELECT name, required FROM biobank_specimen_attribute bsa ";
        $query .= "JOIN biobank_specimen_type_attribute bsta ";
        $query .= "ON bsa.id=bsta.attribute_id WHERE bsta.type_id=".$typeId;
    
        $result = $db->pselect($query, array());
        foreach($result as $row) {
            $array['name'] = $row['required'];
        }
    
        return $array;
    }
    
    private function queryToArray(string $query) {
        $db = \Database::singleton();
            $result = $db->pselect($query, array());
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
        $db = \Database::singleton();
    	$specimenData = $specimenVO->toSQL();
    	//handle json data object here
    	$db->insert('biobank_specimen', $specimenData);
    
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
        $db = \Database::singleton();
    	$specimenData = $specimenVO->toSQL();
    	$db->update(
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
    
    public static function getSpecimenIdFromBarcode(string $barcode)
    {
        if (!isset($barcode) || empty($barcode)) {
    	return false;
        }     
        $db = \Database::singleton();
    
        $ContainerDAO = new ContainerDAO();	    	
        $containerId  = $ContainerDAO->getContainerIdFromBarcode($barcode);
    
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
    
        $containerDAO = new ContainerDAO();
        $barcode      = $containerDAO->getBarcodeFromContainerId($containerId); 
    
        return $barcode;
    }
}
