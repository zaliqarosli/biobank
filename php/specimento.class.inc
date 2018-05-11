<?php

/* Specimen Transfer Object (TO) Class
 * This class contains an instance of a database handling that is needed to
 * permanently store and retrieve Specimen Transfer Object instances.
 *
 *
 * PHP Version 7.0.25
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */

namespace LORIS\biobank;

class SpecimenTO implements \JsonSerializable
{

    /**
     * Persistent Instance variables. 
     *
     * These variables are directly mapped to the fields of the database schema
     * that describe a specimen entity.
     */
    private $id;
    private $containerId;
    private $typeId;
    private $quantity;
    private $unitId;
    private $parentSpecimenId;
    private $candidateId;
    private $sessionid;
    private $dateTimeUpdate;
    private $collection;
    private $preparation;
    private $analysis;
    
    /**
     * Initiliazes a new instance of the SpecimenTO Class
     */
    function __construct() 
    {
    }
    
    /**
     * Assigns value to SpecimenTO persistent variable $id
     *
     * @param int $id Value to be set as SpecimenTO $id
     */
    public function setId(int $id) 
    {
    	$this->id = $id;
    }
    
    /**
     * Returns value of SpecimenTO persistent variable $id
     *
     * @return int $id
     */
    public function getId()
    {
	    return $this->id;
    }
    
    /**
     * Assigns value to SpecimenTO persistent variable $containerId
     *
     * @param int $containerId Value to be set as SpecimenTO $containerId
     */
    public function setContainerId(int $containerId) 
    {
    	$this->containerId = $containerId;
    }
    
    /**
     * Returns value of SpecimenTO persistent variable $containerId
     *
     * @return int $containerId
     */
    public function getContainerId() 
    {
    	return $this->containerId;
    }
    
    /**
     * Assigns value to SpecimenTO persistent variable $typeId
     *
     * @param int $typeId Value to be set as SpecimenTO $typeId
     */
    public function setTypeId(int $typeId) 
    {
    	$this->typeId = $typeId;
    }
    
    /**
     * Returns value of SpecimenTO persistent variable $typeId
     *
     * @return int $typeId
     */
    public function getTypeId() 
    {
    	return $this->typeId;
    }
    
    /**
     * Assigns value to SpecimenTO persistent variable $quantity
     *
     * @param float $quantity Value to be set as SpecimenTO $quantity
     */
    public function setQuantity(float $quantity) 
    {
    	$this->quantity = $quantity;
    }
    
    /**
     * Returns value of SpecimenTO persistent variable $quantity
     *
     * @return float $quantity
     */
    public function getQuantity() 
    {
    	return $this->quantity;
    }
    
    /**
     * Assigns value to SpecimenTO persistent variable $unitId
     *
     * @param int $unitId Value to be set as SpecimenTO $unitId
     */
    public function setUnitId(int $unitId) 
    {
    	$this->unitId = $unitId;
    }
    
    /**
     * Returns value of SpecimenTO persistent variable $unitId
     *
     * @return int $unitId
     */
    public function getUnitId() 
    {
    	return $this->unitId;
    }

    /**
     * Assigns value to SpecimenTO persistent variable $parentSpecimenId
     *
     * @param int $parentSpecimenId Value to be set as SpecimenTO $parentSpecimenId
     */
    public function setParentSpecimenId(int $parentSpecimenId) 
    {
    	$this->parentSpecimenId = $parentSpecimenId;
    }
    
    /**
     * Returns value of SpecimenTO persistent variable $parentSpecimenId
     *
     * @return int $parentSpecimenId
     */
    public function getParentSpecimenId() 
    {
    	return $this->parentSpecimenId;
    }
    
    /**
     * Assigns value to SpecimenTO persistent variable $candidateId
     *
     * @param int $candidateId Value to be set as SpecimenTO $candidateId
     */
    public function setCandidateId(int $candidateId) 
    {
    	$this->candidateId = $candidateId;
    }
    
    /**
     * Returns value of SpecimenTO persistent variable $candidateId
     *
     * @return int $candidateId
     */
    public function getCandidateId() 
    {
    	return $this->candidateId;
    }
    
    /**
     * Assigns value to SpecimenTO persistent variable $sessionId
     *
     * @param int $sessionId Value to be set as SpecimenTO $sessionId
     */
    public function setSessionid(int $sessionid) 
    {
    	$this->sessionid = $sessionid;
    }
    
    /**
     * Returns value of SpecimenTO persistent variable $sessionId
     *
     * @return int $sessionId
     */
    public function getSessionid() 
    {
    	return $this->sessionid;
    }
    
    /**
     * Assigns value to SpecimenTO persistent variable $dateTimeUpdate
     *
     * @param string $dateTimeUpdate Value to be set as SpecimenTO $dateTimeUpdate
     */
    public function setDateTimeUpdate(string $dateTimeUpdate) 
    {
    	$this->dateTimeUpdate = $dateTimeUpdate;
    }
    
    /**
     * Returns value of SpecimenTO persistent variable $dateTimeUpdate
     *
     * @return string $dateTimeUpdate
     */
    public function getDateTimeUpdate() 
    {
    	return $this->dateTimeUpdate;
    }
    
    /**
     * Assigns value to SpecimenTO persistent variable $collection
     *
     * @param array $collection Value to be set as SpecimenTO $collection
     */
	public function setCollection(array $collection) 
	{
		$this->collection = $collection;
	}

    /**
     * Returns value of SpecimenTO persistent variable $collection
     *
     * @return array $collection
     */
    public function getCollection()
    {
	return $this->collection;
    }
    
    /**
     * Assigns value to SpecimenTO persistent variable $preparation
     *
     * @param array $preparation Value to be set as SpecimenTO $preparation
     */
	public function setPreparation(array $preparation) 
	{
		$this->preparation = $preparation;
	}

    /**
     * Returns value of SpecimenTO persistent variable $preparation
     *
     * @return array $preparation
     */
    public function gePreparation()
    {
	return $this->preparation;
    }
    
    /**
     * Assigns value to SpecimenTO persistent variable $analysis
     *
     * @param array $analysis Value to be set as SpecimenTO $analysis
     */
	public function setAnalysis(array $analysis) 
	{
		$this->analysis = $analysis;
	}

    /**
     * Returns value of SpecimenTO persistent variable $analysis
     *
     * @return array $analysis
     */
    public function getAnalysis()
    {
        return $this->analysis;
    }

    /*
     * Returns an array representing the state of the SpecimenTO.
     *
     * @return array specimenData
     */
    function jsonSerialize() 
    {
       $specimenData = array();
       if (isset($this->id)) {
           $specimenData['id']               = $this->id;
       }
       if (isset($this->containerId)) {
           $specimenData['containerId']      = $this->containerId;
       }
       if (isset($this->typeId)) {
           $specimenData['typeId']           = $this->typeId;
       }
       if (isset($this->quantity)) {
           $specimenData['quantity'] 		     = $this->quantity;
       }
       if (isset($this->unitId)) {
           $specimenData['unitId']           = $this->unitId;
       }
       if (isset($this->parentSpecimenId)) {
           $specimenData['parentSpecimenId'] = $this->parentSpecimenId;
       }
       if (isset($this->candidateId)) {
           $specimenData['candidateId'] 	   = $this->candidateId;
       }
       if (isset($this->sessionid)) {
           $specimenData['sessionId']        = $this->sessionid;
       }
       if (isset($this->dateTimeUpdate)) {
           $specimenData['dateTimeUpdate']   = $this->dateTimeUpdate;
       }
       if (isset($this->collection)) {
         	$specimenData['collection']        = $this->collection;
       }
       if (isset($this->preparation)) {
         	$specimenData['preparation']       = $this->preparation;
       }
       if (isset($this->analysis)) {
         	$specimenData['analysis']          = $this->analysis;
       }
    
        return $specimenData;
    }

    /**
     * Depricated - Not currently in use.
     *
     * Compares two Specimen instances and return true
     * if they contain same values in all persistent instance variables.
     *
     * @return boolean
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
    
    	return true;
    }		
    
    /**
     * Depricated - Not currently in use.
     *
     * Returns an identical deep copy of this SpecimenTO
     */
    function cloneSpecimen()
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
    
    	return $clone;
     }
    
    /** 
     * Depricated - Not currently in use.
     *
     * Returns String object representing the state of this SpecimenTO.
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
    	
    	return $out;
    }
}
?>
