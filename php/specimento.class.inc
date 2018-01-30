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
    protected $unitId;
    protected $parentSpecimenId;
    protected $candidateId;
    protected $sessionid;
    protected $dateTimeUpdate;
    protected $collectDate;
    protected $collectTime;
    protected $notes;
    protected $data;
    
    /**
     * Constructor
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
    
    public function setUnitId(int $unitId) 
    {
    	$this->unitId = $unitId;
    }
    
    public function getUnitId() 
    {
    	return $this->unitId;
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
    
    public function setDateTimeUpdate(string $dateTimeUpdate) 
    {
    	$this->dateTimeUpdate = $dateTimeUpdate;
    }
    
    public function getDateTimeUpdate() 
    {
    	return $this->dateTimeUpdate;
    }
    
    public function setCollectDate(string $collectDate) 
    {
    	$this->collectDate = $collectDate;
    }
    
    public function getCollectDate() 
    {
    	return $this->collectDate;
    }

    public function setCollectTime(string $collectTime) 
    {
    	$this->collectTime = $collectTime;
    }
    
    public function getCollectTime() 
    {
    	return $this->collectTime;
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
    	if ($specimen->getUnitId() 		    != $this->unitId) {
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
    	if ($specimen->getDateTimeUpdate() 	!= $this->dateTimeUpdate) {
    	    return(false);
    	}
    	if ($specimen->getCollectDate()     != $this->collectDate) {
    	    return(false);
    	}
    	if ($specimen->getCollectTime()     != $this->collectTime) {
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
    	if (isset($this->unitId)) {
    	    $specimenData['unitId']  		  = $this->unitId;
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
    	if (isset($this->dateTimeUpdate)) {
    	    $specimenData['dateTimeUpdate']   = $this->dateTimeUpdate;
    	}
    	if (isset($this->collectDate)) {
    	    $specimenData['collectDate'] 	  = $this->collectDate;
    	}
    	if (isset($this->collectTime)) {
    	    $specimenData['collectTime'] 	  = $this->collectTime;
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
    	$clone->setUnitId($this->unitId); 
    	$clone->setParentSpecimenId($this->parentSpecimenId); 
    	$clone->setCandidateId($this->candidateId); 
    	$clone->setSessionid($this->sessionid); 
    	$clone->setDateTimeUpdate($this->dateTimeUpdate); 
    	$clone->setCollectDate($this->collectDate); 
    	$clone->setCollectTime($this->collectTime); 
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
    	$out .= "unitId = ".$this->unitId."\n"; 
    	$out .= "parentSpecimenId = ".$this->parentSpecimenId."\n"; 
    	$out .= "candidateId = ".$this->candidateId."\n"; 
    	$out .= "sessionid = ".$this->sessionid."\n"; 
    	$out .= "dateTimeUpdate = ".$this->dateTimeUpdate."\n"; 
    	$out .= "collectDate = ".$this->collectDate."\n"; 
    	$out .= "collectTime = ".$this->collectTime."\n"; 
    	$out .= "notes = ".$this->notes."\n"; 
    	
    	return $out;
    }
}
?>
