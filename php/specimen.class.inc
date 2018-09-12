<?php
/**
 * Specimen Object Class
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
use \LORIS\Data\DataInstance;

class Specimen implements \JsonSerializable, DataInstance
{
    /**
     * Persistent Instance variables. 
     *
     * These variables are directly mapped to the fields of the database schema
     * that describe a specimen entity.
     *
     * @access private
     */
    private $id;                //int    
    private $containerId;       //int
    private $typeId;            //int
    private $quantity;          //float
    private $unitId;            //int
    private $fTCycle;           //int
    private $parentSpecimenIds; //array
    private $candidateId;       //int
    private $sessionId;         //int
    private $poolId;            //int
    private $collection;        //array
    private $preparation;       //array
    private $analysis;          //array
    
    /**
     * Initiliazes a new instance of the Specimen Class
     */
    function __construct() 
    {
    }
    
    /**
     * Sets the specimen's ID
     *
     * @param int $id the specimen's ID
     *
     * @return none
     */
    public function setId(int $id) 
    {
    	$this->id = $id;
    }
    
    /**
     * Gets the specimen's ID
     *
     * @return int
     */
    public function getId()
    {
	    return $this->id;
    }
    
    /**
     * Sets the ID of the specimen's container
     *
     * @param int $containerId the ID of the specimen's container
     *
     * @return none
     */
    public function setContainerId(int $containerId) 
    {
    	$this->containerId = $containerId;
    }
    
    /**
     * Gets the ID of the specimen's container
     *
     * @return int
     */
    public function getContainerId() 
    {
    	return $this->containerId;
    }
    
    /**
     * Sets the ID of the specimen type
     *
     * @param int $typeId ID of the specimen type
     *
     * @return none
     */
    public function setTypeId(int $typeId) 
    {
    	$this->typeId = $typeId;
    }
    
    /**
     * Gets the ID of the specimen type
     *
     * @return int
     */
    public function getTypeId() 
    {
    	return $this->typeId;
    }
    
    /**
     * Sets the current amount of specimen available
     *
     * @param float $quantity the current amount of specimen available
     *
     * @return none
     */
    public function setQuantity(float $quantity) 
    {
    	$this->quantity = $quantity;
    }
    
    /**
     * Gets the current amount of specimen available
     *
     * @return float
     */
    public function getQuantity() 
    {
    	return $this->quantity;
    }
    
    /**
     * Sets the ID of the specimen's unit of quantity
     *
     * @param int $unitId the ID of the quantity's unit
     *
     * @return none
     */
    public function setUnitId(int $unitId) 
    {
    	$this->unitId = $unitId;
    }
    
    /**
     * Gets the ID of the specimen's unit of quantity
     *
     * @return int
     */
    public function getUnitId() 
    {
    	return $this->unitId;
    }

    /**
     * Sets the specimen's current Freeze-Thaw cycle
     *
     * @param int $fTCycle the specimen's current F-T cycle
     *
     * @return none
     */
    public function setFTCycle(int $fTCycle = null) 
    {
    	$this->fTCycle = $fTCycle;
    }
    
    /**
     * Gets the specimen's current Freeze-Thaw cycle
     *
     * @return int
     */
    public function getFTCycle() 
    {
    	return $this->fTCycle;
    }

    /**
     * Sets the parent specimen's ID
     *
     * @param array $parentSpecimenIds the parent specimen's IDs
     *
     * @return none
     */
    public function setParentSpecimenIds(array $parentSpecimenIds = null) 
    {
    	$this->parentSpecimenIds = $parentSpecimenIds;
    }
    
    /**
     * Gets the parent specimen's ID
     *
     * @return int
     */
    public function getParentSpecimenIds() 
    {
    	return $this->parentSpecimenIds;
    }
    
    /**
     * Sets the ID of the candidate to which the specimen belongs
     *
     * @param int $candidateId ID of the specimen's donor
     *
     * @return none
     */
    public function setCandidateId(string $candidateId) 
    {
    	$this->candidateId = $candidateId;
    }
    
    /**
     * Gets the ID of the candidate to which the specimen belongs
     *
     * @return int
     */
    public function getCandidateId() 
    {
    	return $this->candidateId;
    }
    
    /**
     * Sets the ID of the candidate's session/timepoint in which the specimen was collected
     *
     * @param int $sessionId the ID of the specimen's session of collection
     *
     * @return none
     */
    public function setSessionId(int $sessionId) 
    {
    	$this->sessionId = $sessionId;
    }
    
    /**
     * Gets the ID of the candidate's session/timepoint in which the specimen was collected
     *
     * @return int
     */
    public function getSessionId() 
    {
    	return $this->sessionId;
    }
    
    /**
     * Sets the ID of the specimen's pool group, if it exists.
     *
     * @param int $poolId the ID of the specimen's pool group
     *
     * @return none
     */
    public function setPoolId(int $poolId) 
    {
    	$this->poolId = $poolId;
    }
    
    /**
     * Gets the ID of the specimen's pool group.
     *
     * @return int
     */
    public function getPoolId() 
    {
    	return $this->poolId;
    }

    /**
     * Sets an associative array of data stored for the specimen's collection stage
     *
     * @param array $collection key-value pair data for the specimen's collection stage
     *
     * @return none
     */
	  public function setCollection(array $collection = null) 
    {
        $this->collection = $collection;
    }

    /**
     * Gets an associative array of data stored for the specimen's collection stage
     *
     * @return array
     */
    public function getCollection()
    {
        return $this->collection;
    }
    
    /**
     * Sets an associative array of data stored for the specimen's preparation stage
     *
     * @param array $preparation key-value pair data for the specimen's preparation stage
     *
     * @return none
     */
    public function setPreparation(array $preparation = null) 
    {
        $this->preparation = $preparation;
    }

    /**
     * Gets an associative array of data stored for the specimen's preparation stage
     *
     * @return array
     */
    public function getPreparation()
    {
        return $this->preparation;
    }
    
    /**
     * Sets an associative array of data stored for the specimen's analysis stage
     *
     * @param array $analysis key-value pair data for the specimen's analysis stage
     *
     * @return none
     */
	public function setAnalysis(array $analysis = null) 
	{
		$this->analysis = $analysis;
	}

    /**
     * Gets an associative array of data stored for the specimen's analysis stage
     *
     * @return array
     */
    public function getAnalysis()
    {
        return $this->analysis;
    }

    /*
     * Returns an array representing the state of the Specimen.
     *
     * @return array specimenData
     */
    function jsonSerialize() 
    {
       $specimenData = array();
       if (isset($this->id)) {
           $specimenData['id']                = $this->id;
       }
       if (isset($this->containerId)) {
           $specimenData['containerId']       = $this->containerId;
       }
       if (isset($this->typeId)) {
           $specimenData['typeId']            = $this->typeId;
       }
       if (isset($this->quantity)) {
           $specimenData['quantity'] 		      = $this->quantity;
       }
       if (isset($this->unitId)) {
           $specimenData['unitId']            = $this->unitId;
       }
       if (isset($this->fTCycle)) {
           $specimenData['fTCycle']           = $this->fTCycle;
       }
       if (isset($this->parentSpecimenIds)) {
           $specimenData['parentSpecimenIds'] = $this->parentSpecimenIds;
       }
       if (isset($this->candidateId)) {
           $specimenData['candidateId'] 	    = $this->candidateId;
       }
       if (isset($this->sessionId)) {
           $specimenData['sessionId']         = $this->sessionId;
       }
       if (isset($this->sessionId)) {
           $specimenData['poolId']            = $this->sessionId;
       }
       if (isset($this->collection)) {
         	$specimenData['collection']         = $this->collection;
       }
       if (isset($this->preparation)) {
         	$specimenData['preparation']        = $this->preparation;
       }
       if (isset($this->analysis)) {
         	$specimenData['analysis']           = $this->analysis;
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
    	if ($specimen->getSessionId() 	    != $this->sessionId) {
    	    return(false);
    	}
    
    	return true;
    }		
    
    /**
     * Depricated - Not currently in use.
     *
     * Returns an identical deep copy of this Specimen
     */
    function cloneSpecimen()
	{
    	$clone = new Specimen();
    	$clone->setId($this->id); 
    	$clone->setContainerId($this->containerId); 
    	$clone->setType($this->typeId); 
    	$clone->setQuantity($this->quantity); 
    	$clone->setUnitId($this->unitId); 
    	$clone->setParentSpecimenId($this->parentSpecimenId); 
    	$clone->setCandidateId($this->candidateId); 
    	$clone->setSessionId($this->sessionId); 
    
    	return $clone;
     }
    
    /** 
     * Depricated - Not currently in use.
     *
     * Returns String object representing the state of this Specimen.
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
  	    $out .= "sessionId = ".$this->sessionId."\n"; 
  	    
  	    return $out;
    }

    //TODO: This was necessary for implementation with the dataframework
    // Find out if it's actually necessary
    function toJSON() : string
    {
        return json_encode($this);
    }
}
?>
