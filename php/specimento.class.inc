<?php

/* Specimen Transfer Object (TO) Class
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

class SpecimenTO 
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
    
    public function setQuantity(string $quantity) 
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
    
    public function setTimeCollect(string $timeCollect) 
    {
    	$this->timeCollect = $timeCollect;
    }
    
    public function getTimeCollect() 
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
    function hasEqualMapping($specimen) 
	{
    	if ($specimen->getId() 		        != $this->id) {
    	    return(false);
    	}
    	if ($specimen->getContainerId() 	!= $this->containerId) {
    	    return(false);
    	}
    	if ($specimen->getType() 		    != $this->typeId) {
    	    return(false);
    	}
    	if ($specimen->getQuantity() 		!= $this->quantity) {
    	    return(false);
    	}
    	if ($specimen->getParentSpecimenId()!= $this->parentSpecimenId) {
    	    return(false);
    	}
    	if ($specimen->getCandidateId() 	!= $this->candidateId) {
            return(false);
    	}
    	if ($specimen->getSessionid() 	    != $this->sessionid) {
    	    return(false);
    	}
    	if ($specimen->getTimeUpdate() 	    != $this->timeUpdate) {
    	    return(false);
    	}
    	if ($specimen->getTimeCollect()     != $this->timeCollect) {
    	    return(false);
    	}
    	if ($specimen->getNotes() 		    != $this->notes) {
    	    return(false);
    	}
  	    if ($specimen->getData()		    != $this->data) {
	    	return(false);
        }
    
    	return true;
    }		

    /*
     * toArray will return an Array representing the statof the Specimen TO.
     */
    function toArray() 
	{
    	$specimenData = array();
    	if (isset($this->id)) {
    	    $specimenData['id'] 		      = $this->id;
    	}
    	if (isset($this->containerId)) {
    	    $specimenData['containerId'] 	  = $this->containerId;
    	}
    	if (isset($this->typeId)) {
    	    $specimenData['typeId'] 		  = $this->typeId;
    	}
    	if (isset($this->quantity)) {
    	    $specimenData['quantity'] 		  = $this->quantity;
    	}
    	if (isset($this->parentSpecimenId)) {
    	    $specimenData['parentSpecimenId'] = $this->parentSpecimenId;
    	}
    	if (isset($this->candidateId)) {
    	    $specimenData['candidateId'] 	  = $this->candidateId;
    	}
    	if (isset($this->sessionid)) {
    	    $specimenData['sessionId'] 	      = $this->sessionid;
    	}
    	if (isset($this->timeUpdate)) {
    	    $specimenData['timeUpdate'] 	  = $this->timeUpdate;
    	}
    	if (isset($this->timeCollect)) {
    	    $specimenData['timeCollect'] 	  = $this->timeCollect;
    	}
    	if (isset($this->notes)) {
    	    $specimenData['notes'] 		      = $this->notes;
    	}
		if (isset($this->data)) {
	    	//converts json object into array
	    	$jsonData = $this->data;
	    	$jsonData = json_decode($jsonData, TRUE);

	    	$specimenData['data']		      = $jsonData;
		}
    	
    	return $specimenData;
    }
    
    /*
     * Clone will return an identical deep copy of this valueObject
     */
    function clone()
	{
    	$clone = new SpecimenTO();
    	$clone->setId($this->id); 
    	$clone->setContainerId($this->containerId); 
    	$clone->setType($this->typeId); 
    	$clone->setQuantity($this->quantity); 
    	$clone->setParentSpecimenId($this->parentSpecimenId); 
    	$clone->setCandidateId($this->candidateId); 
    	$clone->setSessionid($this->sessionid); 
    	$clone->setTimeUpdate($this->timeUpdate); 
    	$clone->setTimeCollect($this->timeCollect); 
    	$clone->setNotes($this->notes); 
		$clone->setData($this->data);
    
    	return $clone;
     }
    
    /*
     * toString will return String object representing the state of this specimenTO.
     * This is useful during application development, and possibly when application
     * is writing object states in textlog.
     */
    function toString() 
	{
    	$out  = "";
    	$out .= "\nclass Specimen, mapping to table biobank_specimen_entity\n";
    	$out .= "Persistent attributes: \n"; 
    	$out .= "id = ".$this->id."\n"; 
    	$out .= "containerId = ".$this->containerId."\n";
    	$out .= "type = ".$this->typeId."\n"; 
    	$out .= "quantity = ".$this->quantity."\n"; 
    	$out .= "parentSpecimenId = ".$this->parentSpecimenId."\n"; 
    	$out .= "candidateId = ".$this->candidateId."\n"; 
    	$out .= "sessionid = ".$this->sessionid."\n"; 
    	$out .= "timeUpdate = ".$this->timeUpdate."\n"; 
    	$out .= "timeCollect = ".$this->timeCollect."\n"; 
    	$out .= "notes = ".$this->notes."\n"; 
    	
    	return $out;
    }
}
?>
