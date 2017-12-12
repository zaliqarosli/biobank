<?php

/* Specimen Value Object (VO) Class
 * This class contains an instance of a database handling that is needed to
 * permanently store and retrieve Specimen Value Object instances
 *
 *
 * PHP Version 5
 *
 * @category Loris
 * @package  Biobank
 * @author   Alex Ilea <ailea.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/CCNA/
 */

namespace LORIS\biobank;

/**
 * Creates the form for NDB_Form_biobank
 *
 * @category Loris
 * @package  Biobank
 * @author   Alex Ilea <ailea.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/CCNA/
 */

class SpecimenVO 
    {
    /**
     * Persistent Instance variables. This data is directly mapped to the 
     * columns of the database table.
     */
    protected $id;
    protected $containerId;
    protected $typeId;
    protected $quantity;
    protected $parentSpecimenId;
    protected $candidateId;
    protected $sessionid;
    protected $timeUpdate;
    protected $timeCollect;
    protected $notes;
    protected $data;
    
    /**
     * Constructors
     */
    function __construct() 
    {
    }
    
    /**
     * setAll allows to set all persistent variables in one method call.
     */
    function setAll(
	$containerId, 
	$typeId, 
	$quantity, 
	$parentSpecimenId, 
	$candidateId, 
	$sessionid, 
	$timeUpdate, 
	$timeCollect, 
	$notes,
	$data
    ) {
    	//$this->id = $id;
    	$this->containerId      = $containerId;
    	$this->typeId             = $typeId;
    	$this->quantity         = $quantity;
    	$this->parentSpecimenId = $parentSpecimenId;
    	$this->candidateId      = $candidateId;
    	$this->sessionid        = $sessionid;
    	$this->timeUpdate       = $timeUpdate;
    	$this->timeCollect      = $timeCollect;
    	$this->notes            = $notes;
	$this->data             = $data;
    }
    
    /*
     * Get- and Set-methods for persistent variables.
     */
    public function setId(int $id) 
    {
    	$this->id = $id;
    }
    
    public function getId()
    {
	return $this->id;
    }
    
    public function setContainerId(int $containerId) 
    {
    	$this->containerId = $containerId;
    }
    
    public function getContainerId() 
    {
    	return $this->containerId;
    }
    
    public function setTypeId(int $typeId) 
    {
    	$this->typeId = $typeId;
    }
    
    public function getTypeId() 
    {
    	return $this->typeId;
    }
    
    public function setQuantity(double $quantity) 
    {
    	$this->quantity = $quantity;
    }
    
    public function getQuantity() 
    {
    	return $this->quantity;
    }
    
    public function setParentSpecimenId(int $parentSpecimenId) 
    {
    	$this->parentSpecimenId = $parentSpecimenId;
    }
    
    public function getParentSpecimenId() 
    {
    	return $this->parentSpecimenId;
    }
    
    public function setCandidateId(int $candidateId) 
    {
    	$this->candidateId = $candidateId;
    }
    
    public function getCandidateId() 
    {
    	return $this->candidateId;
    }
    
    public function setSessionid(int $sessionid) 
    {
    	$this->sessionid = $sessionid;
    }
    
    public function getSessionid() 
    {
    	return $this->sessionid;
    }
    
    public function setTimeUpdate(string $timeUpdate) 
    {
    	$this->timeUpdate = $timeUpdate;
    }
    
    public function getTimeUpdate() 
    {
    	return $this->timeUpdate;
    }
    
    public function setTimeCreate(string $timeCollect) 
    {
    	$this->timeCollect = $timeCollect;
    }
    
    public function getTimeCreate() 
    {
    	return $this->timeCollect;
    }
    
    public function setNotes(string $notes) 
    {
    	$this->notes = $notes;
    }
    
    public function getNotes() 
    {
    	return $this->notes;
    }

	public function setData($data) 
	{
		$this->data = $data;
	}

    public function getData()
    {
	return $this->data;
    }
    
    
    /**
     * hasEqualMapping-method will compare two Specimen instances and return true
     * if they contain same values in all persistent instance variables.
     */
    function hasEqualMapping($specimenVO) 
	{
    	if ($specimenVO->getId() 		!= $this->id) {
    	    return(false);
    	}
    	if ($specimenVO->getContainerId() 	!= $this->containerId) {
    	    return(false);
    	}
    	if ($specimenVO->getType() 		!= $this->typeId) {
    	    return(false);
    	}
    	if ($specimenVO->getQuantity() 		!= $this->quantity) {
    	    return(false);
    	}
    	if ($specimenVO->getParentSpecimenId() 	!= $this->parentSpecimenId) {
    	    return(false);
    	}
    	if ($specimenVO->getCandidateId() 	!= $this->candidateId) {
            return(false);
    	}
    	if ($specimenVO->getSessionid() 	!= $this->sessionid) {
    	    return(false);
    	}
    	if ($specimenVO->getTimeUpdate() 	!= $this->timeUpdate) {
    	    return(false);
    	}
    	if ($specimenVO->getTimeCreate() 	!= $this->timeCollect) {
    	    return(false);
    	}
    	if ($specimenVO->getNotes() 		!= $this->notes) {
    	    return(false);
    	}
  	    if ($specimenVO->getData()		!= $this->data) {
	    return(false);
        }
    
    	return true;
    }		

    /*
     * toArray will return an Array representing the statof the Specimen VO.
     * This is useful
     */
    function toArray() 
	{
    	$specimenData = array();
    	if (isset($this->id)) {
    	    $specimenData['id'] 		= $this->id;
    	}
    	if (isset($this->containerId)) {
    	    $specimenData['container_id'] 	= $this->containerId;
    	}
    	if (isset($this->typeId)) {
    	    $specimenData['type_id'] 		= $this->typeId;
    	}
    	if (isset($this->quantity)) {
    	    $specimenData['quantity'] 		= $this->quantity;
    	}
    	if (isset($this->parentSpecimenId)) {
    	    $specimenData['parent_specimen_id'] = $this->parentSpecimenId;
    	}
    	if (isset($this->candidateId)) {
    	    $specimenData['candidate_id'] 	= $this->candidateId;
    	}
    	if (isset($this->sessionid)) {
    	    $specimenData['session_id'] 	= $this->sessionid;
    	}
    	if (isset($this->timeUpdate)) {
    	    $specimenData['time_update'] 	= $this->timeUpdate;
    	}
    	if (isset($this->timeCollect)) {
    	    $specimenData['time_collect'] 	= $this->timeCollect;
    	}
    	if (isset($this->notes)) {
    	    $specimenData['notes'] 		= $this->notes;
    	}
	if (isset($this->data)) {
	    //converts json object into array
	    $jsonData = $this->data;
	    $jsonData = json_decode($jsonData, TRUE);

	    $specimenData['data']		= $jsonData;
	}
    	
    	return $specimenData;
    }
    
    /*
     * toArray will return an Array representing the statof the Specimen VO.
     * This is useful
     */
    function toSQL() 
	{
    	$specimenData = array();
    	if (isset($this->id)) {
    	    $specimenData['id'] 		= $this->id;
    	}
    	if (isset($this->containerId)) {
    	    $specimenData['container_id'] 	= $this->containerId;
    	}
    	if (isset($this->typeId)) {
    	    $specimenData['type_id'] 		= $this->typeId;
    	}
    	if (isset($this->quantity)) {
    	    $specimenData['quantity'] 		= $this->quantity;
    	}
    	if (isset($this->parentSpecimenId)) {
    	    $specimenData['parent_specimen_id'] = $this->parentSpecimenId;
    	}
    	if (isset($this->candidateId)) {
    	    $specimenData['candidate_id'] 	= $this->candidateId;
    	}
    	if (isset($this->sessionid)) {
    	    $specimenData['session_id'] 	= $this->sessionid;
    	}
    	if (isset($this->timeUpdate)) {
    	    $specimenData['time_update'] 	= $this->timeUpdate;
    	}
    	if (isset($this->timeCollect)) {
    	    $specimenData['time_collect'] 	= $this->timeCollect;
    	}
    	if (isset($this->notes)) {
    	    $specimenData['notes'] 		= $this->notes;
    	}
	if (isset($this->data)) {
	    //converts json object into array
	    $jsonData = $this->data;
	    $jsonData = json_decode($jsonData, TRUE);

	    $specimenData['data']		= $jsonData;
	}
    	
    	return $specimenData;
    }
    
    //DECidE HOW 
    function fromArray($specimenData) 
	{
    	$this->id 		    = $specimenData['id']; 
    	$this->containerId 	= $specimenData['container_id']; 
    	$this->typeId 		= $specimenData['type_id']; 
    	$this->quantity 	= $specimenData['quantity']; 
    	$this->parentSpecimenId	= $specimenData['parent_specimen_id']; 
    	$this->candidateId 	= $specimenData['candidate_id']; 
    	$this->sessionid 	= $specimenData['session_id']; 
    	$this->timeUpdate 	= $specimenData['time_update']; 
    	$this->timeCollect 	= $specimenData['time_collect']; 
    	$this->notes 		= $specimenData['notes']; 
	    $this->data		    = $specimenData['data'];
    }
    
    /*
     * Clone will return an identical deep copy of this valueObject
     */
    function clone() {
    	$cloned = new SpecimenVO();
    
    	$cloned->setId($this->id); 
    	$cloned->setContainerId($this->containerId); 
    	$cloned->setType($this->typeId); 
    	$cloned->setQuantity($this->quantity); 
    	$cloned->setParentSpecimenId($this->parentSpecimenId); 
    	$cloned->setCandidateId($this->candidateId); 
    	$cloned->setSessionid($this->sessionid); 
    	$cloned->setTimeUpdate($this->timeUpdate); 
    	$cloned->setTimeUpdate($this->timeUpdate); 
    	$cloned->setNotes($this->notes); 
	$cloned->setData($this->data);
    
    	return $cloned;
     }
    
    /*
     * toString will return String object representing the state of this specimenVO.
     * This is useful during application development, and possibly when application
     * is writing object states in textlog.
     */
    function toString() {
    	$out  = "";
    	$out .= "\nclass Specimen, mapping to table biobank_specimen_entity\n";
    	$out .= "Persistent attributes: \n"; 
    	$out .= "id = ".$this->id."\n"; 
    	$out .= "containerId = ".$this->containerId."\n";
    	$out .= "type = ".$this->typeId."\n"; 
    	$out .= "quantity = ".$this->quantity."\n"; 
    	$out .= "parentSpecimenId = ".$this->parentSpecimenId."\n"; 
    	$out .= "parentSpecimenObject = ".$parentSpecimenVO."\n";
    	$out .= "candidateId = ".$this->candidateId."\n"; 
    	$out .= "sessionid = ".$this->sessionid."\n"; 
    	$out .= "timeUpdate = ".$this->timeUpdate."\n"; 
    	$out .= "timeCollect = ".$this->timeCollect."\n"; 
    	$out .= "notes = ".$this->notes."\n"; 
    	
    	return $out;
    }
}
?>
