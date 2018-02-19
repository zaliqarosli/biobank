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
	protected $originId;
	protected $locationId;
	protected $parentContainerId;
	protected $dateTimeUpdate;
	protected $dateTimeCreateDate;
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

	public function setOriginId(int $originId) 
	{
		$this->originId = $originId;
	}

	public function getOriginId() 
	{
		return $this->originId;
	}

	public function setLocationId(int $locationId) 
	{
		$this->locationId = $locationId;
	}

	public function getLocationId() 
	{
		return $this->locationId;
	}

	public function setParentContainerId(int $parentContainerId) 
	{
		$this->parentContainerId = $parentContainerId;
	}

	public function getParentContainerId() 
	{
		return $this->parentContainerId;
	}

	public function setDateTimeUpdate(string $dateTimeUpdate) 
	{
		$this->dateTimeUpdate = $dateTimeUpdate;
	}

	public function getDateTimeUpdate() 
	{
		return $this->dateTimeUpdate;
	}

	public function setDateTimeCreate(string $dateTimeCreate) 
	{
		$this->dateTimeCreate = $dateTimeCreate;
	}

	public function getDateTimeCreate() 
	{
		return $this->dateTimeCreate;
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
		if ($container->getOriginId()		  != $this->originId) {
			return(false);
		}
		if ($container->getLocationId()		  != $this->locationId) {
			return(false);
		}
		if ($container->getParentContainerId()!= $this->parentContainerId) {
			return(false);
		}
		if ($container->getDateTimeUpdate()   != $this->dateTimeUpdate) {
			return(false);
		}
		if ($container->getDateTimeCreate()   != $this->dateTimeCreate) {
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
			$containerData['id']                = $this->id;
		}
		if (isset($this->barcode)) {
			$containerData['barcode']           = $this->barcode;
		}
		if (isset($this->typeId)) {
			$containerData['typeId']            = $this->typeId;
		}
		if (isset($this->statusId)) {
			$containerData['statusId'] 	        = $this->statusId;
		}
		if (isset($this->originId)) {
			$containerData['originId']          = $this->originId;
		}
		if (isset($this->locationId)) {
			$containerData['locationId']        = $this->locationId;
		}
		if (isset($this->parentContainerId)) {
			$containerData['parentContainerId'] = $this->parentContainerId;
		}
		if (isset($this->dateTimeUpdate)) {
			$containerData['dateTimeUpdate']    = $this->dateTimeUpdate;
		}
		if (isset($this->dateTimeCreate)) {
			$containerData['dateTimeCreate']    = $this->dateTimeCreate;
		}
		if (isset($this->notes)) {
			$containerData['notes']             = $this->notes;
		}
		
		return $containerData;
	}

    //DEPRICATED - NOT IN USE
	// Clone will return an identical deep copy of this valueObject
	function cloneContainer()
	{
		$clone = new ContainerTO();
		$clone->setId($this->id); 
		$clone->setBarcode($this->barcode); 
		$clone->setTypeId($this->typeId); 
		$clone->setStatusId($this->statusId); 
		$clone->setOriginId($this->originId); 
		$clone->setLocationId($this->locationId); 
		$clone->setParentContainerId($this->parentContainerId); 
		$clone->setDateTimeUpdate($this->dateTimeUpdate); 
		$clone->setCreateDate($this->createDate); 
		$clone->setCreateTime($this->createTime); 
		$clone->setNotes($this->notes); 

		return $clone;
	 }

    // DEPRICATED - NOT IN USE
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
		$out .= "originId = ".$this->originId."\n"; 
		$out .= "locationId = ".$this->locationId."\n"; 
		$out .= "parentContainerId = ".$this->parentContainerId."\n";
		$out .= "dateTimeUpdate = ".$this->dateTimeUpdate."\n"; 
		$out .= "createDate = ".$this->createDate."\n"; 
		$out .= "createTime = ".$this->createTime."\n"; 
		$out .= "notes = ".$this->notes."\n"; 
		
		return $out;
	}

}
?>
