<?php

/* Specimen Value Object (VO) Class
 * This class contains an instance of a database handling that is needed to
 * permanently store and retrieve Specimen Value Object instances
 */ 


class SpecimenVO {
	
	// Persistent Instance variables. This data is directly mapped to the 
	// columns of the database table.
	protected $id;
	protected $containerId;
	protected $containerVO;
	protected $type;
	protected $quantity;
	protected $parentSpecimenId;
	protected $parentSpecimenVO;
	protected $candidateId;
	protected $sessionid;
	protected $timeUpdate;
	protected $timeCollect;
	protected $notes;

	//Constructors --Not sure what to do with these yet
	function __construct() {
	}
	
	//setAll allows to set all persistent variables in one method call.
	function setAll($containerId, $type, $quantity, $parentSpecimenId, $candidateId, 
				$sessionid, $timeUpdate, $timeCollect, $notes) {
		//$this->id = $id;
		$this->containerId = $containerId;
		$this->type = $type;
		$this->quantity = $quantity;
		$this->parentSpecimenId = $parentSpecimenId;
		$this->candidateId = $candidateId;
		$this->sessionid = $sessionid;
		$this->timeUpdate = $timeUpdate;
		$this->timeCollect = $timeCollect;
		$this->notes = $notes;
	}

	//SHOULD RETURN AN ARRAY?
	//function getAll(){
	//	return $this->id;
	//	return $this->containerId;
	//}
	
	// Get- and Set-methods for persistent variables. The default behaviour 
	// does not make any checks against malformed data, so these might required 
	// some manual additions.
	public function setId($id) {
		$this->id = $id;
	}

	public function getId() {
		return $this->id;
	}

	public function setContainerId($containerId) {
		$this->containerId = $containerId;
	}

	public function getContainerId() {
		return $this->containerId;
	}

	public function setContainerVO($containerVO) {
		$this->containerVO = $containerVO;
	}

	public function getContainerVO() {
		return $this->containerVO;
	}

	public function setType($type) {
		$this->type = $type;
	}

	public function getType() {
		return $this->type;
	}

	public function setQuantity($quantity) {
		$this->quantity = $quantity;
	}

	public function getQuantity() {
		return $this->quantity;
	}

	public function setParentSpecimenId($parentSpecimenId) {
		$this->parentSpecimenId = $parentSpecimenId;
	}

	public function getParentSpecimenId() {
		return $this->parentSpecimenId;
	}

	public function setParentSpecimenVO($parentSpecimenVO) {
		$this->parentSpecimenVO = $parentSpecimenVO;
	}

	public function getParentSpecimenVO() {
		return $this->parentSpecimenVO;
	}

	public function setCandidateId($candidateId) {
		$this->candidateId = $candidateId;
	}

	public function getCandidateId() {
		return $this->candidateId;
	}

	public function setSessionid($sessionid) {
		$this->sessionid = $sessionid;
	}

	public function getSessionid() {
		return $this->sessionid;
	}

	public function setTimeUpdate($timeUpdate) {
		$this->timeUpdate = $timeUpdate;
	}

	public function getTimeUpdate() {
		return $this->timeUpdate;
	}

	public function setTimeCreate($timeCollect) {
		$this->timeCollect = $timeCollect;
	}

	public function getTimeCreate() {
		return $this->timeCollect;
	}

	public function setNotes($notes) {
		$this->notes = $notes;
	}
	
	public function getNotes() {
		return $this->notes;
	}


	/**
	 * hasEqualMapping-method will compare two Specimen instances and return true
	 * if they contain same values in all persistent instance variables.
	 */
	function hasEqualMapping($specimenVO) {
		if ($specimenVO->getId() != $this->id) {
			return(false);
		}
		if ($specimenVO->getContainerId() != $this->containerId) {
			return(false);
		}
		if ($specimenVO->getType() != $this->type) {
			return(false);
		}
		if ($specimenVO->getQuantity() != $this->quantity) {
			return(false);
		}
		if ($specimenVO->getParentSpecimenId() != $this->parentSpecimenId) {
			return(false);
		}
		if ($specimenVO->getCandidateId() != $this->candidateId) {
			return(false);
		}
		if ($specimenVO->getSessionid() != $this->sessionid) {
			return(false);
		}
		if ($specimenVO->getTimeUpdate() != $this->timeUpdate) {
			return(false);
		}
		if ($specimenVO->getTimeCreate() != $this->timeCollect) {
			return(false);
		}
		if ($specimenVO->getNotes() != $this->notes) {
			return(false);
		}
	
		return true;
	}		

/**
		 * Implodes a hash including the keys (unlike php's implode)
		 *
		 * Sets each hash element into the format key='value', and then
		 * implodes the resultant array with the specified glue
		 *
		 * @param string $glue      The glue to pass to php's implode function
		 * @param array  $dataArray The array with keys to implode
		 *
		 * @return string the string containing the imploded array
		 * @access private
		 */
		
		function implodeWithKeys($glue, $dataArray) {
		    $output = array();
		    if (!is_array($dataArray) || count($dataArray)==0) {
		        return '';
		    }
		
		    foreach ($dataArray as $key => $item ) {
		        if ($item===null || $item==='') {
		            $output[] = "`$key`=NULL";
		        } else {
		            //$item     = $this->quote($item);
		            $output[] = "`$key` = $item";
		        }
		    }
			print_r($output);	
		    return implode($glue, $output);
		}

	// toString will return String object representing the state of this specimenVO.
	// This is useful during application development, and possibly when application
	// is writing object states in textlog.
    	function toString() {
		$containerVO 		= $this->implodeWithKeys(", ", $this->containerVO);
		$parentSpecimenVO 	= $this->implodeWithKeys(", ", $this->parentSpecimenVO);

		$out  = "";
		$out .= "\nclass Specimen, mapping to table biobank_specimen_entity\n";
      		$out .= "Persistent attributes: \n"; 
        	$out .= "id = ".$this->id."\n"; 
        	$out .= "containerId = ".$this->containerId."\n";
		$out .= "containerObject = ".$containerVO."\n";
        	$out .= "type = ".$this->type."\n"; 
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

	// toArray will return an Array representing the statof the Specimen VO.
	// This is usefule
	function toArray() {
		$specimenData = array();
		if (isset($this->id)) {
			$specimenData['id'] = $this->id;
		}
		if (isset($this->containerId)) {
			$specimenData['container_id'] = $this->containerId;
		}
		if (isset($this->type)) {
			$specimenData['type_id'] = $this->type;
		}
		if (isset($this->quantity)) {
			$specimenData['quantity'] = $this->quantity;
		}
		if (isset($this->parentSpecimenId)) {
			$specimenData['parent_specimen_id'] = $this->parentSpecimenId;
		}
		if (isset($this->candidateId)) {
			$specimenData['candidate_id'] = $this->candidateId;
		}
		if (isset($this->sessionid)) {
			$specimenData['session_id'] = $this->sessionid;
		}
		if (isset($this->timeUpdate)) {
			$specimenData['time_update'] = $this->timeUpdate;
		}
		if (isset($this->timeCollect)) {
			$specimenData['time_collect'] = $this->timeCollect;
		}
		if (isset($this->notes)) {
			$specimenData['notes'] = $this->notes;
		}
		
		return $specimenData;
	}

	//DECidE HOW 
	function fromArray($specimenData) {
 		$this->id = $specimenData['id']; 
 		$this->containerId = $specimenData['container_id']; 
 		$this->type = $specimenData['type_id']; 
 		$this->quantity = $specimenData['quantity']; 
 		$this->parentSpecimenId = $specimenData['parent_specimen_id']; 
 		$this->candidateId = $specimenData['candidate_id']; 
 		$this->sessionid = $specimenData['session_id']; 
 		$this->timeUpdate = $specimenData['time_update']; 
 		$this->timeCollect = $specimenData['time_collect']; 
 		$this->notes = $specimenData['notes']; 
	}

	// Clone will return an identical deep copy of this valueObject
    	function clone() {
        	$cloned = new SpecimenVO();

        	$cloned->setId($this->id); 
        	$cloned->setContainerId($this->containerId); 
        	$cloned->setType($this->type); 
       		$cloned->setQuantity($this->quantity); 
        	$cloned->setParentSpecimenId($this->parentSpecimenId); 
        	$cloned->setCandidateId($this->candidateId); 
        	$cloned->setSessionid($this->sessionid); 
        	$cloned->setTimeUpdate($this->timeUpdate); 
        	$cloned->setTimeUpdate($this->timeUpdate); 
        	$cloned->setNotes($this->notes); 

        	return $cloned;
   	 }
}
?>
