<?php

class Specimen {
	
	// Persistent Instance variables. This data is directly mapped to the 
	// columns of the database table.
	protected $id;
	protected $container;
	protected $type;
	protected $quantity;
	protected $parent;
	protected $candidate;
	protected $session;
	protected $updatetime;
	protected $creationtime;
	protected $notes;

	//Constructors --Not sure what to do with these yet
	function __construct() {
	}
	
	//setAll allows to set all persistent variables in one method call.
	function setAll($id, $container, $type, $quantity, $parent, $candidate, 
				$session, $updatetime, $creationtime, $notes) {
		$this->id = $id;
		$this->container = $container;
		$this->type = $type;
		$this->quantity = $quantity;
		$this->parent = $parent;
		$this->candidate = $candidate;
		$this->session = $session;
		$this->updatetime = $updatetime;
		$this->creationtime = $creationtime;
		$this->notes = $notes;
	}


	function getAll(){
		
		return $this->id;
		return $this->container;
	
	// Get- and Set-methods for persistent variables. The default behaviour 
	// does not make any checks against malformed data, so these might required 
	// some manual additions.
	public function setId($id) {
		$this->id = $id;
	}

	public function getId() {
		return $this->id;
	}

	public function setContainer($container) {
		$this->container = $container;
	}

	public function getContainer() {
		return $this->container;
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

	public function setParent($parent) {
		$this->parent = $parent;
	}

	public function getParent() {
		return $this->parent;
	}

	public function setCandidate($candidate) {
		$this->candidate = $candidate;
	}

	public function getCandidate() {
		return $this->candidate;
	}

	public function setSession($session) {
		$this->session = $session;
	}

	public function getSession() {
		return $this->session;
	}

	public function setUpdateTime($updatetime) {
		$this->updatetime = $updatetime;
	}

	public function getUpdateTime() {
		return $this->updatetime;
	}

	public function setCreationTime($creationtime) {
		$this->creationtime = $creationtime;
	}

	public function getCreationTime() {
		return $this->creationtime;
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
	function hasEqualMapping($specimenObject) {
		if ($specimenObject->getId() != $this->id) {
			return(false);
		}
		if ($specimenObject->getContainer() != $this->container) {
			return(false);
		}
		if ($specimenObject->getType() != $this->type) {
			return(false);
		}
		if ($specimenObject->getQuantity() != $this->quantity) {
			return(false);
		}
		if ($specimenObject->getParent() != $this->parent) {
			return(false);
		}
		if ($specimenObject->getCandidate() != $this->candidate) {
			return(false);
		}
		if ($specimenObject->getSession() != $this->session) {
			return(false);
		}
		if ($specimenObject->getUpdateTime() != $this->updatetime) {
			return(false);
		}
		if ($secimenObject->getCreationTime() != $this->creationtime) {
			return(false);
		}
		if ($specimenObject->getNotes() != $this->Notes) {
			return(false);
		}
	
		return true;
	}		

	// toString will return String object representing the state of this valueObject.
	// This is useful during application development, and possibly when application
	// is writing object states in textlog.
    	function toString() {
        	$out  = "";
		$out .= "\nclass Specimen, mapping to table biobank_specimen_entity\n";
      		$out .= "Persistent attributes: \n"; 
        	$out .= "id = ".$this->id."\n"; 
        	$out .= "container = ".$this->container."\n"; 
        	$out .= "type = ".$this->type."\n"; 
        	$out .= "quantity = ".$this->quantity."\n"; 
        	$out .= "parent = ".$this->parent."\n"; 
        	$out .= "candidate = ".$this->candidate."\n"; 
       		$out .= "session = ".$this->session."\n"; 
        	$out .= "updatetime = ".$this->updatetime."\n"; 
        	$out .= "creationtime = ".$this->creationtime."\n"; 
        	$out .= "notes = ".$this->notes."\n"; 
        	
		return $out;
    	}

	// toArray will return an Array 
	function toArray() {
		$specimenData = array();
		$specimenData['id'] = $this->id ??;
		$specimenData['container_id'] = $this->container ??;
		$specimenData['type_id'] = $this->type ??;
		$specimenData['quantity'] = $this->quantity ??;
		$specimenData['parent_specimen_id'] = $this->parent ??;
		$specimenData['candidate_id'] = $this->candidate ??;
		$specimenData['session_id'] = $this->session ??;
		$specimenData['updatetime'] = $this->updatetime ??;
		$specimenData['creationtime'] = $this->creationtime ??;
		$specimenData['notes'] = $this->notes ??;
		
		return $specimenData;
	}

	//DECIDE HOW 
	function fromArray($specimenData) {
 		$this->id = $specimenData['id']; 
 		$this->container = $specimenData['container_id']); 
 		$this->type($specimenData['type_id']); 
 		$this->quantity($specimenData['quantity']); 
 		$this->parent($specimenData['parent_specimen_id']); 
 		$this->candidate($specimenData['candidate_id']); 
 		$this->session($specimenData['session_id']); 
 		$this->updatetime($specimenData['updatetime']); 
 		$this->creationtime($specimenData['creationtime']); 
 		$this->setnotes($specimenData['notes']); 
	}

	// Clone will return an identical deep copy of this valueObject
    	function clone() {
        	$cloned = new Specimen();

        	$cloned->setId($this->id); 
        	$cloned->setContainer($this->container); 
        	$cloned->setType($this->type); 
       		$cloned->setQuantity($this->quantity); 
        	$cloned->setParent($this->parent); 
        	$cloned->setCandidate($this->candidate); 
        	$cloned->setSession($this->session); 
        	$cloned->setUpdatetime($this->updatetime); 
        	$cloned->setCreationtime($this->creationtime); 
        	$cloned->setNotes($this->notes); 

        	return $cloned;
   	 }
}
>
