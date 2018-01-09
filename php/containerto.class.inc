<?php

	/* Container Transfer Object (TO) Class
 	 * This class contains an instance of a database handling that is needed to
 	 * permanently store and retrieve Container Value Object instances
 	 */ 
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
 
 /**
  * Creates the form for NDB_Form_biobank
  *
  * @category Loris
  * @package  Biobank
  * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
  * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
  * @link     https://www.github.com/aces/CCNA/
  */
 
class ContainerTO {
	
	// Persistent Instance variables. This data is directly mapped to the 
	// columns of the database table.
	protected $id;
	protected $barcode;
	protected $typeId;
	protected $statusId;
	protected $locusId;
	protected $parentContainerId;
	protected $timeUpdate;
	protected $timeCreate;
	protected $notes;

	//Constructor.
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

	public function setBarcode(string $barcode) 
	{
		$this->barcode = $barcode;
	}

	public function getBarcode() 
	{
		return $this->barcode;
	}

	public function setTypeId(int $typeId) 
	{
		$this->typeId = $typeId;
	}

	public function getTypeId() 
	{
		return $this->typeId;
	}

	public function setStatusId(int $statusId) 
	{
		$this->statusId = $statusId;
	}

	public function getStatusId() 
	{
		return $this->statusId;
	}

	public function setLocusId(int $locusId) 
	{
		$this->locusId = $locusId;
	}

	public function getLocusId() 
	{
		return $this->locusId;
	}

	public function setParentContainerId(int $parentContainerId) 
	{
		$this->parentContainerId = $parentContainerId;
	}

	public function getParentContainerId() 
	{
		return $this->parentContainerId;
	}

	public function setTimeUpdate(string $timeUpdate) 
	{
		$this->timeUpdate = $timeUpdate;
	}

	public function getTimeUpdate() 
	{
		return $this->timeUpdate;
	}

	public function setTimeCreate(string $timeCreate) 
	{
		$this->timeCreate = $timeCreate;
	}

	public function getTimeCreate() 
	{
		return $this->timeCreate;
	}

	public function setNotes(string $notes) 
	{
		$this->notes = $notes;
	}
	
	public function getNotes() 
	{
		return $this->notes;
	}

	/**
	 * hasEqualMapping-method will compare two Container instances and return true
	 * if they contain same values in all persistent instance variables.
	 */
	function hasEqualMapping($container) 
	{
		if ($container->getId() 		      != $this->id) {
			return(false);
		}
		if ($container->getBarcode() 		  != $this->barcode) {
			return(false);
		}
		if ($container->getTypeId() 		  != $this->typeId) {
			return(false);
		}
		if ($container->getStatusId() 	      != $this->statusId) {
			return(false);
		}
		if ($container->getLocusId()		  != $this->locusId) {
			return(false);
		}
		if ($container->getParentContainerId()!= $this->parentContainerId) {
			return(false);
		}
		if ($container->getTimeUpdate() 	  != $this->timeUpdate) {
			return(false);
		}
		if ($container->getTimeCreate() 	  != $this->timeCreate) {
			return(false);
		}
		if ($container->getNotes() 		      != $this->notes) {
			return(false);
		}
	
		return true;
	}		

	// toArray will return an Array representing the statof the Container.
	function toArray() 
	{
		$containerData = array();
		if (isset($this->id)) {
			$containerData['id'] 			= $this->id;
		}
		if (isset($this->barcode)) {
			$containerData['barcode'] 		= $this->barcode;
		}
		if (isset($this->typeId)) {
			$containerData['typeId'] 		= $this->typeId;
		}
		if (isset($this->statusId)) {
			$containerData['statusId'] 		= $this->statusId;
		}
		if (isset($this->locusId)) {
			$containerData['locusId'] 		= $this->locusId;
		}
		if (isset($this->parentContainerId)) {
			$containerData['parentContainerId'] 	= $this->parentContainerId;
		}
		if (isset($this->timeUpdate)) {
			$containerData['timeUpdate'] 		= $this->timeUpdate;
		}
		if (isset($this->timeCreate)) {
			$containerData['timeCreate'] 	= $this->timeCreate;
		}
		if (isset($this->notes)) {
			$containerData['notes'] 		= $this->notes;
		}
		
		return $containerData;
	}

	// Clone will return an identical deep copy of this valueObject
	function cloneContainer()
	{
		$clone = new ContainerTO();
		$clone->setId($this->id); 
		$clone->setBarcode($this->barcode); 
		$clone->setTypeId($this->typeId); 
		$clone->setStatusId($this->statusId); 
		$clone->setLocusId($this->locusId); 
		$clone->setParentContainerId($this->parentContainerId); 
		$clone->setTimeUpdate($this->timeUpdate); 
		$clone->setTimeUpdate($this->timeUpdate); 
		$clone->setNotes($this->notes); 

		return $clone;
	 }

	// toString will return String object representing the state of this container.
	// This is useful during application development, and possibly when application
	// is writing object states in textlog.
	function toString() 
	{
		$out  = "";
		$out .= "\nclass Container, mapping to table biobank_container\n";
		$out .= "Persistent attributes: \n"; 
		$out .= "id = ".$this->id."\n"; 
		$out .= "barcode = ".$this->barcode."\n"; 
		$out .= "typeId = ".$this->typeId."\n"; 
		$out .= "statusId = ".$this->statusId."\n"; 
		$out .= "locusId = ".$this->locusId."\n"; 
		$out .= "parentContainerId = ".$this->parentContainerId."\n";
		$out .= "timeUpdate = ".$this->timeUpdate."\n"; 
		$out .= "timeCreate = ".$this->timeCreate."\n"; 
		$out .= "notes = ".$this->notes."\n"; 
		
		return $out;
	}

}
?>
