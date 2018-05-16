<?php

/** 
 * Container Transfer Object (TO) Class
 * This class contains an instance of a database handling that is needed to
 * permanently store and retrieve Container Transfer Object instances.
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
 
class ContainerTO implements \JsonSerializable 
{
	
  /** 
   * Persistent Instance variables. 
   *
   * These variables are directly mapped to the fields of the database schema
   * that describe a container entity.
   */
	private $id;
	private $barcode;
	private $typeId;
  private $capacityId;
  private $dimensionId;
  private $temperature;
	private $statusId;
	private $originId;
	private $locationId;
	private $parentContainerId;
  private $childContainerIds;
  private $coordinate;
  private $dateTimeUpdate;
  private $dateTimeCreate;
  private $comments;

  /** 
   * Initiliazes a new instance of the ContainerTO Class
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

	public function setCapacityId(int $capacityId) 
	{
		$this->capacityId = $capacityId;
	}

	public function getCapacityId() 
	{
		return $this->capacityId;
	}

	public function setDimensionId(int $dimensionId) 
	{
		$this->dimensionId = $dimensionId;
	}

	public function getDimensionId() 
	{
		return $this->dimensionId;
	}

	public function setTemperature(float $temperature) 
	{
		$this->temperature = $temperature;
	}

	public function getTemperature() 
	{
		return $this->temperature;
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

	public function setParentContainerId(int $parentContainerId = null) 
	{
		$this->parentContainerId = $parentContainerId;
	}

	public function getParentContainerId() 
	{
		return $this->parentContainerId;
	}

	public function setChildContainerIds(array $childContainerIds) 
	{
		$this->childContainerIds = $childContainerIds;
	}

	public function getChildContainerIds() 
	{
		return $this->childContainerIds;
	}

	public function setCoordinate(int $coordinate = null) 
	{
		$this->coordinate = $coordinate;
	}

	public function getCoordinate() 
	{
		return $this->coordinate;
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

	public function setComments(string $comments) 
	{
		$this->comments = $comments;
	}
	
	public function getComments() 
	{
		return $this->comments;
	}

	/** 
     * toArray will return an Array representing the statof the ContainerTO.
     */
	public function jsonSerialize() 
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
		if (isset($this->capacityId)) {
			$containerData['capacityId']        = $this->capacityId;
		}
		if (isset($this->dimensionId)) {
			$containerData['dimensionId']       = $this->dimensionId;
		}
		if (isset($this->temperature)) {
			$containerData['temperature']       = $this->temperature;
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
		if (isset($this->childContainerIds)) {
			$containerData['childContainerIds'] = $this->childContainerIds;
		}
		if (isset($this->coordinate)) {
			$containerData['coordinate']        = $this->coordinate;
		}
		if (isset($this->dateTimeUpdate)) {
			$containerData['dateTimeUpdate']    = $this->dateTimeUpdate;
		}
		if (isset($this->dateTimeCreate)) {
			$containerData['dateTimeCreate']    = $this->dateTimeCreate;
		}
		if (isset($this->comments)) {
			$containerData['comments']          = $this->comments;
		}
		
		return $containerData;
	}

	/**
     * Not currently in use - May be useful down the line
     *
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
		if ($container->getCapacityId()       != $this->capacityId) {
			return(false);
		}
		if ($container->getDimensionId()      != $this->dimensionId) {
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
		if ($container->getParentContainerId() != $this->parentContainerId) {
			return(false);
		}
		if ($container->getChildContainerIds() != $this->childContainerIds) {
			return(false);
		}
		if ($container->getCoordinate()       != $this->coordinate) {
			return(false);
		}
		if ($container->getDateTimeUpdate()   != $this->dateTimeUpdate) {
			return(false);
		}
		if ($container->getDateTimeCreate()   != $this->dateTimeCreate) {
			return(false);
		}
		if ($container->getComments()         != $this->comments) {
			return(false);
		}
	
		return true;
	}		


    /**
     * Depricated - Not currently in use. 
	 * Clone will return an identical deep copy of the given ContainerTO.
     */
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
		$clone->setChildContainerIds($this->childContainerIds); 
		$clone->setDateTimeUpdate($this->dateTimeUpdate); 
		$clone->setDateTimeCreate($this->createDate); 
		$clone->setComments($this->comments); 

		return $clone;
	 }

    /**
     * Depricated - Not currently in use.
	 * toString will return String object representing the state of this container.
	 * This is useful during application development, and possibly when application
	 * is writing object states in textlog.
     */
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
		$out .= "childContainerIds = ".$this->childContainerIds."\n";
		$out .= "dateTimeUpdate = ".$this->dateTimeUpdate."\n"; 
		$out .= "createDate = ".$this->createDate."\n"; 
		$out .= "createTime = ".$this->createTime."\n"; 
		$out .= "comments = ".$this->comments."\n"; 
		
		return $out;
	}
}
?>
