<?php

class SpecimenVO {
	
	// Persistent Instance variables. This data is directly mapped to the columns of the database table.
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
	function Specimen() {
	}
	
	function Specimen($id) {
		$this->id = $id
	}

	
	//Get- and Set-methods for persistent variables. The default behaviour does not make any checks against malformed data, so these might required some manual additions.
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


	//setAll allows to set all persistent variables in one method call.
	function setAll($id, $container, $type, $quantity, $parent, $candidate, $session, $updatetime, $creationtime, $notes) {
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

	//hasEqualMapping-method will compare two Specimen instances and return true if they contain same values in all persistent instance variables.
	function hasEqualMapping($valueObject) {
		if ($valueObject->getId() != $this->id) {
			return(false);
		}
		if ($valueObject->getContainer() != $this->container) {
			return(false);
		}
		if ($valueObject->getType() != $this->type) {
			return(false);
		}
		if ($valueObject->getQuantity() != $this->quantity) {
			return(false);
		}
		if ($valueObject->getParent() != $this->parent) {
			return(false);
		}
		if ($valueObject->getCandidate() != $this->candidate) {
			return(false);
		}
		if ($valueObject->getSession() != $this->session) {
			return(false);
		}
		if ($valueObject->getUpdateTime() != $this->updatetime) {
			return(false);
		}
		if ($valueObject->getCreationTime() != $this->creationtime) {
			return(false);
		}
		if ($valueObject->getNotes() != $this->Notes) {
			return(false);
		}
	
		return true;
	}		

	// toString will return String object representing the state of this valueObject. This is useful during application development, and possibly when application is writing object states in textlog.
    	function toString() {
        	$out = $out."\nclass Specimen, mapping to table biobank_specimen_entity\n";
      		$out = $out."Persistent attributes: \n"; 
        	$out = $out."id = ".$this->id."\n"; 
        	$out = $out."container = ".$this->container."\n"; 
        	$out = $out."type = ".$this->type."\n"; 
        	$out = $out."quantity = ".$this->quantity."\n"; 
        	$out = $out."parent = ".$this->parent."\n"; 
        	$out = $out."candidate = ".$this->candidate."\n"; 
       		$out = $out."session = ".$this->session."\n"; 
        	$out = $out."updatetime = ".$this->updatetime."\n"; 
        	$out = $out."creationtime = ".$this->creationtime."\n"; 
        	$out = $out."notes = ".$this->notes."\n"; 
        	return $out;
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
